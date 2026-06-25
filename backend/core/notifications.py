"""
NairobiJetHouse V2 — notifications.py
──────────────────────────────────────────────────────────────────────────────
Central notification dispatcher.

Usage
-----
from .notifications import notify_flight_booking_created

# Inside FlightBookingViewSet.create (or any signal/task):
notify_flight_booking_created(booking, request.user)

Public surface
--------------
notify_flight_booking_created(booking, triggered_by=None)
    Fires immediately after a FlightBooking is saved.
    • Client  → in-app ClientNotification  +  styled HTML email
    • Staff   → in-app ClientNotification  for every User with role in ('admin','staff')
               +  one summary email to settings.BOOKING_ALERT_EMAIL (or DEFAULT_FROM_EMAIL)

All email sending is wrapped in try/except and logged via EmailLog so a broken
SMTP config never crashes the booking creation response.
"""

from __future__ import annotations

import logging
from typing import Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Public entry-point
# ─────────────────────────────────────────────────────────────────────────────

def notify_flight_booking_created(booking, triggered_by=None):
    """
    Fire all notifications for a newly submitted FlightBooking.

    Parameters
    ----------
    booking      : FlightBooking instance (already saved)
    triggered_by : User who triggered the action (for EmailLog.sent_by)
    """
    _notify_client(booking, triggered_by)
    _notify_staff(booking, triggered_by)


# ─────────────────────────────────────────────────────────────────────────────
# Client notification
# ─────────────────────────────────────────────────────────────────────────────

def _notify_client(booking, triggered_by):
    """Create an in-app notification and send a confirmation email to the client."""
    from .models import ClientNotification, EmailLog  # local import avoids circular deps

    ref_short  = str(booking.reference)[:8].upper()
    route      = f"{booking.origin.code} → {booking.destination.code}"
    title      = f"Flight Booking Received — {route}"
    body_text  = (
        f"Hi {booking.guest_name}, we have received your flight booking request "
        f"({route}) on {booking.departure_date}. "
        f"Your reference is {ref_short}. "
        f"Our team will contact you within 2–4 hours with a personalised quote."
    )
    link       = f"/bookings/flight/{booking.reference}"

    # ── In-app notification (only if there is a linked registered user) ──────
    if booking.client_id:
        try:
            ClientNotification.objects.create(
                user        = booking.client,
                notif_type  = 'booking_confirmed',
                title       = title,
                body        = body_text,
                link        = link,
            )
        except Exception:
            logger.exception("Failed to create in-app notification for client (booking %s)", booking.reference)

    # ── Email notification ────────────────────────────────────────────────────
    if not booking.guest_email:
        return

    subject    = f"We've received your flight request — {route} | NairobiJetHouse"
    plain_body = (
        f"Dear {booking.guest_name},\n\n"
        f"Thank you for reaching out to NairobiJetHouse.\n\n"
        f"We have received your flight booking request:\n"
        f"  Route       : {route}\n"
        f"  Date        : {booking.departure_date}\n"
        f"  Passengers  : {booking.passenger_count}\n"
        f"  Reference   : {ref_short}\n\n"
        f"Our aviation team will review your request and contact you within 2–4 hours "
        f"with a tailored quote.\n\n"
        f"If you need to reach us urgently, please reply to this email.\n\n"
        f"Warm regards,\n"
        f"NairobiJetHouse Aviation Team"
    )
    html_body  = _build_client_confirmation_html(booking, ref_short, route)

    _send_and_log(
        sent_by      = triggered_by,
        to_email     = booking.guest_email,
        to_name      = booking.guest_name,
        subject      = subject,
        plain        = plain_body,
        html         = html_body,
        inquiry_type = 'flight_booking',
        related_id   = booking.pk,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Staff / company notification
# ─────────────────────────────────────────────────────────────────────────────

def _notify_staff(booking, triggered_by):
    """
    Create an in-app notification for every admin/staff user and send one
    summary alert email to the configured ops inbox.
    """
    from .models import User, ClientNotification, EmailLog  # local import

    ref_short  = str(booking.reference)[:8].upper()
    route      = f"{booking.origin.code} → {booking.destination.code}"
    title      = f"New Flight Booking — {route} ({ref_short})"
    body_text  = (
        f"A new flight booking has been submitted.\n"
        f"Client   : {booking.guest_name} <{booking.guest_email}>\n"
        f"Route    : {route}\n"
        f"Date     : {booking.departure_date}\n"
        f"Pax      : {booking.passenger_count}\n"
        f"Ref      : {ref_short}"
    )
    link       = f"/admin/flight-bookings/{booking.pk}"

    # ── In-app for all admin + staff users ───────────────────────────────────
    staff_users = User.objects.filter(
        role__in=('admin', 'staff'),
        is_active=True,
    ).exclude(pk=getattr(triggered_by, 'pk', None))   # don't double-notify the sender

    notifications = [
        ClientNotification(
            user        = u,
            notif_type  = 'booking_confirmed',
            title       = title,
            body        = body_text,
            link        = link,
        )
        for u in staff_users
    ]
    if notifications:
        try:
            ClientNotification.objects.bulk_create(notifications, ignore_conflicts=True)
        except Exception:
            logger.exception("Failed to bulk-create staff notifications for booking %s", booking.reference)

    # ── Single alert email to the ops inbox ──────────────────────────────────
    ops_email  = getattr(settings, 'BOOKING_ALERT_EMAIL', None) or settings.DEFAULT_FROM_EMAIL
    subject    = f"[NJH] New Flight Booking — {route} | {ref_short}"
    plain_body = (
        f"A new flight booking has been submitted on NairobiJetHouse.\n\n"
        f"  Reference    : {ref_short}\n"
        f"  Client Name  : {booking.guest_name}\n"
        f"  Client Email : {booking.guest_email}\n"
        f"  Client Phone : {booking.guest_phone or '—'}\n"
        f"  Company      : {booking.company or '—'}\n"
        f"  Route        : {route}\n"
        f"  Trip Type    : {booking.get_trip_type_display()}\n"
        f"  Departure    : {booking.departure_date}"
        + (f" at {booking.departure_time}" if booking.departure_time else "")
        + f"\n"
        f"  Passengers   : {booking.passenger_count}\n"
        f"  Category Pref: {booking.preferred_category or 'Not specified'}\n"
        f"  Catering     : {'Yes' if booking.catering_requested else 'No'}\n"
        f"  Ground Trans : {'Yes' if booking.ground_transport_requested else 'No'}\n"
        f"  Concierge    : {'Yes' if booking.concierge_requested else 'No'}\n"
        + (f"  Special Req  : {booking.special_requests}\n" if booking.special_requests else "")
        + f"\n"
        f"  Submitted At : {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}\n\n"
        f"Log in to the admin portal to review and assign an operator.\n"
        f"Admin URL: {getattr(settings, 'ADMIN_BASE_URL', 'https://admin.nairobijethouse.com')}"
        f"/admin/flight-bookings/{booking.pk}\n\n"
        f"— NairobiJetHouse Platform"
    )
    html_body  = _build_staff_alert_html(booking, ref_short, route)

    _send_and_log(
        sent_by      = triggered_by,
        to_email     = ops_email,
        to_name      = 'NJH Operations',
        subject      = subject,
        plain        = plain_body,
        html         = html_body,
        inquiry_type = 'flight_booking',
        related_id   = booking.pk,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Email send + log helper
# ─────────────────────────────────────────────────────────────────────────────

def _send_and_log(sent_by, to_email, to_name, subject, plain, html,
                  inquiry_type, related_id=None):
    """Send a multipart email and write an EmailLog row. Never raises."""
    from .models import EmailLog

    success = True
    err     = ''
    try:
        msg = EmailMultiAlternatives(
            subject    = subject,
            body       = plain,
            from_email = settings.DEFAULT_FROM_EMAIL,
            to         = [to_email],
        )
        if html:
            msg.attach_alternative(html, 'text/html')
        msg.send(fail_silently=False)
    except Exception as exc:
        success = False
        err     = str(exc)
        logger.exception("Email send failed to %s (booking %s)", to_email, related_id)

    try:
        EmailLog.objects.create(
            sent_by      = sent_by if (sent_by and getattr(sent_by, 'pk', None)) else None,
            to_email     = to_email,
            to_name      = to_name or '',
            subject      = subject,
            body         = plain,
            inquiry_type = inquiry_type,
            related_id   = related_id,
            success      = success,
            error_msg    = err,
        )
    except Exception:
        logger.exception("EmailLog.create failed for booking %s", related_id)

    return success


# ─────────────────────────────────────────────────────────────────────────────
# HTML email templates
# ─────────────────────────────────────────────────────────────────────────────

def _build_client_confirmation_html(booking, ref_short: str, route: str) -> str:
    """
    Branded HTML confirmation email for the client.
    Design matches the existing NJH quote email style (dark header, card body).
    """
    departure_time_str = (
        f" at {booking.departure_time.strftime('%H:%M')}"
        if booking.departure_time else ""
    )
    special_block = ""
    if booking.special_requests:
        special_block = f"""
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fefce8;border:1px solid #fde68a;
                          border-radius:8px;padding:16px;">
              <tr>
                <td>
                  <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
                    Special Requests
                  </p>
                  <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.5;">
                    {booking.special_requests}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        """

    extras = []
    if booking.catering_requested:
        extras.append("✓ Catering")
    if booking.ground_transport_requested:
        extras.append("✓ Ground Transport")
    if booking.concierge_requested:
        extras.append("✓ Concierge")
    extras_html = (
        f'<p style="margin:12px 0 0;font-size:13px;color:#64748b;">'
        f'Add-ons requested: {" &nbsp;·&nbsp; ".join(extras)}</p>'
        if extras else ""
    )

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;
             font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"
       style="background:#f1f5f9;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0"
           style="background:#ffffff;border-radius:12px;overflow:hidden;
                  box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- ── Header ── -->
      <tr>
        <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
                   padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                     letter-spacing:1px;">NAIROBIJETHOUSE</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;
                    letter-spacing:2px;">PRIVATE AVIATION</p>
        </td>
      </tr>

      <!-- ── Greeting ── -->
      <tr>
        <td style="padding:36px 40px 24px;">
          <h2 style="margin:0;color:#0f172a;font-size:20px;font-weight:600;">
            Booking Request Received ✓
          </h2>
          <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
            Dear {booking.guest_name}, thank you for choosing NairobiJetHouse.
            We have received your flight booking request and our aviation team will
            provide a personalised quote within <strong>2–4 hours</strong>.
          </p>
        </td>
      </tr>

      <!-- ── Route card ── -->
      <tr>
        <td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f8fafc;border:1px solid #e2e8f0;
                        border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:24px;text-align:center;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align:center;width:40%;">
                      <div style="font-size:30px;font-weight:700;color:#0f172a;">
                        {booking.origin.code}
                      </div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:4px;
                                  text-transform:uppercase;letter-spacing:1px;">
                        {booking.origin.city}
                      </div>
                    </td>
                    <td style="text-align:center;width:20%;">
                      <div style="font-size:24px;color:#94a3b8;">✈</div>
                    </td>
                    <td style="text-align:center;width:40%;">
                      <div style="font-size:30px;font-weight:700;color:#0f172a;">
                        {booking.destination.code}
                      </div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:4px;
                                  text-transform:uppercase;letter-spacing:1px;">
                        {booking.destination.city}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- details row -->
            <tr>
              <td style="border-top:1px solid #e2e8f0;padding:16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align:center;width:25%;">
                      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;
                                  letter-spacing:1px;">Date</div>
                      <div style="font-size:13px;font-weight:600;color:#334155;
                                  margin-top:4px;">
                        {booking.departure_date}{departure_time_str}
                      </div>
                    </td>
                    <td style="text-align:center;width:25%;
                               border-left:1px solid #e2e8f0;">
                      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;
                                  letter-spacing:1px;">Passengers</div>
                      <div style="font-size:13px;font-weight:600;color:#334155;
                                  margin-top:4px;">{booking.passenger_count}</div>
                    </td>
                    <td style="text-align:center;width:25%;
                               border-left:1px solid #e2e8f0;">
                      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;
                                  letter-spacing:1px;">Trip Type</div>
                      <div style="font-size:13px;font-weight:600;color:#334155;
                                  margin-top:4px;">{booking.get_trip_type_display()}</div>
                    </td>
                    <td style="text-align:center;width:25%;
                               border-left:1px solid #e2e8f0;">
                      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;
                                  letter-spacing:1px;">Reference</div>
                      <div style="font-size:13px;font-weight:600;color:#334155;
                                  margin-top:4px;">{ref_short}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          {extras_html}
        </td>
      </tr>

      <!-- ── Special requests (conditional) ── -->
      {special_block}

      <!-- ── What happens next ── -->
      <tr>
        <td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f0fdf4;border:1px solid #bbf7d0;
                        border-radius:10px;padding:20px;">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;font-weight:700;color:#166534;">
                  What happens next?
                </p>
                <ul style="margin:10px 0 0;padding-left:18px;
                           font-size:13px;color:#15803d;line-height:1.8;">
                  <li>Our team reviews your request</li>
                  <li>We source the best available aircraft for your route</li>
                  <li>You receive a detailed quote within <strong>2–4 hours</strong></li>
                  <li>Confirm to lock in your flight</li>
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ── CTA ── -->
      <tr>
        <td style="padding:0 40px 32px;text-align:center;">
          <p style="margin:0 0 16px;font-size:13px;color:#64748b;">
            Questions? Reply to this email or contact your aviation concierge directly.
          </p>
          <a href="mailto:bookings@nairobijethouse.com"
             style="display:inline-block;background:#0f172a;color:#ffffff;
                    padding:14px 32px;border-radius:8px;text-decoration:none;
                    font-size:14px;font-weight:600;letter-spacing:0.5px;">
            Contact Concierge
          </a>
        </td>
      </tr>

      <!-- ── Footer ── -->
      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;
                   padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            NairobiJetHouse · Private Aviation · Nairobi, Kenya
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">
            Booking reference: {ref_short} · {timezone.now().strftime('%d %b %Y')}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


def _build_staff_alert_html(booking, ref_short: str, route: str) -> str:
    """
    Internal ops alert email — dense information layout for NJH staff.
    """
    departure_time_str = (
        f" at {booking.departure_time.strftime('%H:%M')}"
        if booking.departure_time else ""
    )

    def row(label, value):
        if not value:
            return ""
        return f"""
        <tr>
          <td style="padding:8px 16px;font-size:13px;color:#64748b;
                     white-space:nowrap;width:160px;">{label}</td>
          <td style="padding:8px 16px;font-size:13px;color:#0f172a;
                     font-weight:500;">{value}</td>
        </tr>"""

    extras = []
    if booking.catering_requested:
        extras.append("Catering")
    if booking.ground_transport_requested:
        extras.append("Ground Transport")
    if booking.concierge_requested:
        extras.append("Concierge")
    extras_str = ", ".join(extras) if extras else "None"

    admin_url = (
        getattr(settings, 'ADMIN_BASE_URL', 'https://admin.nairobijethouse.com')
        + f"/admin/flight-bookings/{booking.pk}"
    )

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;
             font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"
       style="background:#f1f5f9;padding:32px 0;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0"
           style="background:#ffffff;border-radius:12px;overflow:hidden;
                  box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- ── Header ── -->
      <tr>
        <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
                   padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;color:#94a3b8;font-size:11px;
                          letter-spacing:2px;text-transform:uppercase;">
                  NairobiJetHouse — Internal Alert
                </p>
                <h1 style="margin:6px 0 0;color:#ffffff;font-size:18px;
                           font-weight:700;">New Flight Booking</h1>
              </td>
              <td style="text-align:right;">
                <span style="display:inline-block;background:#22c55e;
                             color:#ffffff;padding:6px 14px;border-radius:20px;
                             font-size:12px;font-weight:700;letter-spacing:1px;">
                  NEW
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ── Route banner ── -->
      <tr>
        <td style="background:#0f172a;padding:20px 32px;text-align:center;">
          <span style="font-size:26px;font-weight:700;color:#ffffff;
                       letter-spacing:2px;">{booking.origin.code}</span>
          <span style="font-size:20px;color:#475569;margin:0 16px;">→</span>
          <span style="font-size:26px;font-weight:700;color:#ffffff;
                       letter-spacing:2px;">{booking.destination.code}</span>
          <div style="margin-top:8px;font-size:12px;color:#64748b;">
            {booking.departure_date}{departure_time_str}
            &nbsp;·&nbsp; {booking.passenger_count} pax
            &nbsp;·&nbsp; Ref: <strong style="color:#94a3b8;">{ref_short}</strong>
          </div>
        </td>
      </tr>

      <!-- ── Client details ── -->
      <tr>
        <td style="padding:24px 32px 8px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#94a3b8;
                    text-transform:uppercase;letter-spacing:1px;">Client Details</p>
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            {row("Name", booking.guest_name)}
            {row("Email", booking.guest_email)}
            {row("Phone", booking.guest_phone or "—")}
            {row("Company", booking.company or "—")}
          </table>
        </td>
      </tr>

      <!-- ── Booking details ── -->
      <tr>
        <td style="padding:16px 32px 8px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#94a3b8;
                    text-transform:uppercase;letter-spacing:1px;">Booking Details</p>
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            {row("Trip Type", booking.get_trip_type_display())}
            {row("Return Date", str(booking.return_date) if booking.return_date else None)}
            {row("Preferred Category", booking.preferred_category or "Not specified")}
            {row("Add-ons", extras_str)}
            {row("Special Requests", booking.special_requests or None)}
          </table>
        </td>
      </tr>

      <!-- ── CTA ── -->
      <tr>
        <td style="padding:24px 32px 32px;text-align:center;">
          <a href="{admin_url}"
             style="display:inline-block;background:#0f172a;color:#ffffff;
                    padding:14px 36px;border-radius:8px;text-decoration:none;
                    font-size:14px;font-weight:600;letter-spacing:0.5px;">
            Open in Admin Portal →
          </a>
          <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">
            Submitted {timezone.now().strftime('%d %b %Y at %H:%M UTC')}
          </p>
        </td>
      </tr>

      <!-- ── Footer ── -->
      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;
                   padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#cbd5e1;">
            This is an automated internal alert from the NairobiJetHouse platform.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""