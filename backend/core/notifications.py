"""
NairobiJetHouse V2 — notifications.py
──────────────────────────────────────────────────────────────────────────────
Central notification dispatcher for all booking and inquiry types.

Public surface
--------------
notify_flight_booking_created(booking, triggered_by=None)
notify_yacht_charter_created(charter, triggered_by=None)
notify_air_cargo_created(booking, triggered_by=None)
notify_lease_inquiry_created(inquiry, triggered_by=None)
notify_group_charter_created(inquiry, triggered_by=None)
notify_contact_inquiry_created(inquiry, triggered_by=None)

All functions
  - Create in-app ClientNotification for the relevant user (if registered)
  - Send a professional plain black-and-white HTML email to the client/contact
  - Send an internal ops alert email to settings.BOOKING_ALERT_EMAIL
  - Write an EmailLog row for every send attempt
  - NEVER raise — notification failure must never crash the calling view
"""

from __future__ import annotations
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)

_OPS_EMAIL  = lambda: getattr(settings, 'BOOKING_ALERT_EMAIL', None) or settings.DEFAULT_FROM_EMAIL
_ADMIN_URL  = lambda path='': getattr(settings, 'ADMIN_BASE_URL', 'https://admin.nairobijethouse.com') + path
_BRAND_NAME = 'NairobiJetHouse'
_BRAND_SUB  = 'Private Aviation & Yacht Charters'


# ═════════════════════════════════════════════════════════════════════════════
# 1. FLIGHT BOOKING
# ═════════════════════════════════════════════════════════════════════════════

def notify_flight_booking_created(booking, triggered_by=None):
    ref     = str(booking.reference)[:8].upper()
    route   = f"{booking.origin.code} - {booking.destination.code}"
    dep_str = str(booking.departure_date) + (f" at {booking.departure_time}" if booking.departure_time else "")

    extras = [x for x, f in [
        ("Catering",         booking.catering_requested),
        ("Ground Transport", booking.ground_transport_requested),
        ("Concierge",        booking.concierge_requested),
    ] if f]

    client_rows = [
        ("Route",           route),
        ("Departure",       dep_str),
        ("Trip Type",       booking.get_trip_type_display()),
        ("Passengers",      str(booking.passenger_count)),
        ("Reference",       ref),
    ]
    if booking.preferred_category:
        client_rows.append(("Aircraft Category", booking.preferred_category))
    if extras:
        client_rows.append(("Add-ons Requested", ", ".join(extras)))
    if booking.special_requests:
        client_rows.append(("Special Requests",  booking.special_requests))

    staff_rows = [
        ("Reference",        ref),
        ("Client Name",      booking.guest_name),
        ("Client Email",     booking.guest_email),
        ("Client Phone",     booking.guest_phone or "-"),
        ("Company",          booking.company or "-"),
        ("Route",            route),
        ("Departure",        dep_str),
        ("Trip Type",        booking.get_trip_type_display()),
        ("Return Date",      str(booking.return_date) if booking.return_date else "-"),
        ("Passengers",       str(booking.passenger_count)),
        ("Category Pref",    booking.preferred_category or "Not specified"),
        ("Add-ons",          ", ".join(extras) if extras else "None"),
        ("Special Requests", booking.special_requests or "-"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=getattr(booking, 'client', None),
        client_email=booking.guest_email,
        client_name=booking.guest_name,
        client_subject=f"Flight Booking Received - {route} | {_BRAND_NAME}",
        client_heading="Flight Booking Request Received",
        client_intro=(
            f"Dear {booking.guest_name}, we have received your flight booking request. "
            f"Our aviation team will review your request and provide a personalised quote "
            f"within 2-4 hours."
        ),
        client_rows=client_rows,
        client_footer="If you need to reach us urgently, please reply to this email or contact your dedicated aviation concierge.",
        client_notif_title=f"Flight Booking Received - {route}",
        client_notif_body=f"We received your flight request ({route}) on {booking.departure_date}. Reference: {ref}.",
        client_notif_link=f"/bookings/flight/{booking.reference}",
        staff_subject=f"[NJH] New Flight Booking - {route} | {ref}",
        staff_heading="New Flight Booking",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/flight-bookings/{booking.pk}",
        staff_notif_title=f"New Flight Booking - {route} ({ref})",
        staff_notif_body=f"Client: {booking.guest_name} | Route: {route} | Date: {booking.departure_date}",
        staff_notif_link=f"/admin/flight-bookings/{booking.pk}",
        inquiry_type='flight_booking',
        related_id=booking.pk,
    )


# ═════════════════════════════════════════════════════════════════════════════
# 2. YACHT CHARTER
# ═════════════════════════════════════════════════════════════════════════════

def notify_yacht_charter_created(charter, triggered_by=None):
    ref      = str(charter.reference)[:8].upper()
    duration = f"{charter.charter_start} to {charter.charter_end}"
    route    = charter.departure_port + (f" to {charter.destination_port}" if charter.destination_port else "")

    client_rows = [
        ("Departure Port",  charter.departure_port),
        ("Destination",     charter.destination_port or "To be confirmed"),
        ("Charter Period",  duration),
        ("Guests",          str(charter.guest_count)),
        ("Reference",       ref),
    ]
    if charter.itinerary_description:
        client_rows.append(("Itinerary Notes",  charter.itinerary_description))
    if charter.special_requests:
        client_rows.append(("Special Requests", charter.special_requests))

    staff_rows = [
        ("Reference",        ref),
        ("Client Name",      charter.guest_name),
        ("Client Email",     charter.guest_email),
        ("Client Phone",     charter.guest_phone or "-"),
        ("Company",          charter.company or "-"),
        ("Departure Port",   charter.departure_port),
        ("Destination",      charter.destination_port or "-"),
        ("Charter Start",    str(charter.charter_start)),
        ("Charter End",      str(charter.charter_end)),
        ("Guests",           str(charter.guest_count)),
        ("Itinerary",        charter.itinerary_description or "-"),
        ("Special Requests", charter.special_requests or "-"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=getattr(charter, 'client', None),
        client_email=charter.guest_email,
        client_name=charter.guest_name,
        client_subject=f"Yacht Charter Request Received - {route} | {_BRAND_NAME}",
        client_heading="Yacht Charter Request Received",
        client_intro=(
            f"Dear {charter.guest_name}, we have received your yacht charter enquiry. "
            f"Our specialist charter team will review your request and respond within 4 hours "
            f"with available options and pricing."
        ),
        client_rows=client_rows,
        client_footer="For urgent enquiries please reply to this email directly.",
        client_notif_title=f"Yacht Charter Received - {route}",
        client_notif_body=f"Your charter request ({duration}) has been received. Reference: {ref}.",
        client_notif_link=f"/bookings/yacht/{charter.reference}",
        staff_subject=f"[NJH] New Yacht Charter - {route} | {ref}",
        staff_heading="New Yacht Charter Enquiry",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/yacht-charters/{charter.pk}",
        staff_notif_title=f"New Yacht Charter - {route} ({ref})",
        staff_notif_body=f"Client: {charter.guest_name} | {duration} | {charter.guest_count} guests",
        staff_notif_link=f"/admin/yacht-charters/{charter.pk}",
        inquiry_type='yacht_charter',
        related_id=charter.pk,
    )


# ═════════════════════════════════════════════════════════════════════════════
# 3. AIR CARGO BOOKING
# ═════════════════════════════════════════════════════════════════════════════

def notify_air_cargo_created(booking, triggered_by=None):
    ref   = str(booking.reference)[:8].upper()
    route = booking.origin_description + (f" to {booking.destination_description}" if booking.destination_description else "")

    flags = [x for x, f in [
        ("Hazardous Goods",     booking.is_hazardous),
        ("Temperature Control", booking.requires_temperature_control),
        ("Insurance Required",  booking.insurance_required),
        ("Customs Assistance",  booking.customs_assistance_needed),
    ] if f]

    client_rows = [
        ("Cargo Type",  booking.get_cargo_type_display()),
        ("Origin",      booking.origin_description),
        ("Destination", booking.destination_description or "To be confirmed"),
        ("Urgency",     booking.get_urgency_display()),
        ("Reference",   ref),
    ]
    if booking.weight_kg:
        client_rows.append(("Weight",      f"{booking.weight_kg} kg"))
    if booking.volume_m3:
        client_rows.append(("Volume",      f"{booking.volume_m3} m3"))
    if booking.pickup_date:
        client_rows.append(("Pickup Date", str(booking.pickup_date)))
    if flags:
        client_rows.append(("Special Requirements", ", ".join(flags)))

    staff_rows = [
        ("Reference",        ref),
        ("Contact Name",     booking.contact_name),
        ("Contact Email",    booking.contact_email),
        ("Contact Phone",    booking.contact_phone or "-"),
        ("Company",          booking.company or "-"),
        ("Cargo Type",       booking.get_cargo_type_display()),
        ("Description",      booking.cargo_description),
        ("Origin",           booking.origin_description),
        ("Destination",      booking.destination_description or "-"),
        ("Pickup Date",      str(booking.pickup_date) if booking.pickup_date else "-"),
        ("Urgency",          booking.get_urgency_display()),
        ("Weight (kg)",      str(booking.weight_kg) if booking.weight_kg else "-"),
        ("Volume (m3)",      str(booking.volume_m3) if booking.volume_m3 else "-"),
        ("Hazardous",        "Yes" if booking.is_hazardous else "No"),
        ("Temp Control",     "Yes" if booking.requires_temperature_control else "No"),
        ("Insurance",        "Yes" if booking.insurance_required else "No"),
        ("Customs Help",     "Yes" if booking.customs_assistance_needed else "No"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=getattr(booking, 'client', None),
        client_email=booking.contact_email,
        client_name=booking.contact_name,
        client_subject=f"Cargo Booking Received - {route} | {_BRAND_NAME}",
        client_heading="Air Cargo Request Received",
        client_intro=(
            f"Dear {booking.contact_name}, we have received your air cargo booking request. "
            f"Our logistics team will review the details and respond with a quote and "
            f"flight options shortly."
        ),
        client_rows=client_rows,
        client_footer="For time-critical or AOG shipments please call us directly.",
        client_notif_title=f"Cargo Booking Received - {route}",
        client_notif_body=f"Your cargo request has been received. Reference: {ref}.",
        client_notif_link=f"/bookings/cargo/{booking.reference}",
        staff_subject=f"[NJH] New Air Cargo Booking - {ref}",
        staff_heading="New Air Cargo Booking",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/cargo-bookings/{booking.pk}",
        staff_notif_title=f"New Air Cargo - {booking.get_cargo_type_display()} ({ref})",
        staff_notif_body=f"Client: {booking.contact_name} | {route} | {booking.get_urgency_display()}",
        staff_notif_link=f"/admin/cargo-bookings/{booking.pk}",
        inquiry_type='air_cargo',
        related_id=booking.pk,
    )

def notify_air_cargo_inquiry_created(inquiry, triggered_by=None):
    """Called when an AirCargoInquiry (not a booking) is submitted."""
    ref   = str(inquiry.reference)[:8].upper()
    route = inquiry.origin_description + (
        f" to {inquiry.destination_description}" if inquiry.destination_description else ""
    )

    flags = [x for x, f in [
        ("Hazardous Goods",     inquiry.is_hazardous),
        ("Temperature Control", inquiry.requires_temperature_control),
        ("Insurance Required",  inquiry.insurance_required),
        ("Customs Assistance",  inquiry.customs_assistance_needed),
    ] if f]

    client_rows = [
        ("Cargo Type",  inquiry.get_cargo_type_display()),
        ("Origin",      inquiry.origin_description),
        ("Destination", inquiry.destination_description or "To be confirmed"),
        ("Urgency",     inquiry.get_urgency_display()),
        ("Reference",   ref),
    ]
    if inquiry.weight_kg:
        client_rows.append(("Weight",      f"{inquiry.weight_kg} kg"))
    if inquiry.volume_m3:
        client_rows.append(("Volume",      f"{inquiry.volume_m3} m³"))
    if inquiry.pickup_date:
        client_rows.append(("Pickup Date", str(inquiry.pickup_date)))
    if flags:
        client_rows.append(("Special Requirements", ", ".join(flags)))

    staff_rows = [
        ("Reference",        ref),
        ("Contact Name",     inquiry.contact_name),
        ("Contact Email",    inquiry.email),          # AirCargoInquiry uses .email
        ("Contact Phone",    inquiry.phone or "-"),
        ("Company",          inquiry.company or "-"),
        ("Cargo Type",       inquiry.get_cargo_type_display()),
        ("Description",      inquiry.cargo_description),
        ("Origin",           inquiry.origin_description),
        ("Destination",      inquiry.destination_description or "-"),
        ("Pickup Date",      str(inquiry.pickup_date) if inquiry.pickup_date else "-"),
        ("Urgency",          inquiry.get_urgency_display()),
        ("Weight (kg)",      str(inquiry.weight_kg) if inquiry.weight_kg else "-"),
        ("Volume (m³)",      str(inquiry.volume_m3) if inquiry.volume_m3 else "-"),
        ("Hazardous",        "Yes" if inquiry.is_hazardous else "No"),
        ("Temp Control",     "Yes" if inquiry.requires_temperature_control else "No"),
        ("Insurance",        "Yes" if inquiry.insurance_required else "No"),
        ("Customs Help",     "Yes" if inquiry.customs_assistance_needed else "No"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=None,
        client_email=inquiry.email,               # .email, not .contact_email
        client_name=inquiry.contact_name,
        client_subject=f"Cargo Enquiry Received - {route} | {_BRAND_NAME}",
        client_heading="Air Cargo Enquiry Received",
        client_intro=(
            f"Dear {inquiry.contact_name}, we have received your air cargo enquiry. "
            f"Our logistics team will review the details and respond with a quote and "
            f"flight options shortly."
        ),
        client_rows=client_rows,
        client_footer="For time-critical or AOG shipments please call us directly.",
        client_notif_title=f"Cargo Enquiry Received - {route}",
        client_notif_body=f"Your cargo enquiry has been received. Reference: {ref}.",
        client_notif_link=f"/inquiries/cargo/{inquiry.reference}",
        staff_subject=f"[NJH] New Air Cargo Enquiry - {ref}",
        staff_heading="New Air Cargo Enquiry",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/cargo-inquiries/{inquiry.pk}",
        staff_notif_title=f"New Air Cargo Enquiry - {inquiry.get_cargo_type_display()} ({ref})",
        staff_notif_body=f"Client: {inquiry.contact_name} | {route} | {inquiry.get_urgency_display()}",
        staff_notif_link=f"/admin/cargo-inquiries/{inquiry.pk}",
        inquiry_type='air_cargo',
        related_id=inquiry.pk,
    )
# ═════════════════════════════════════════════════════════════════════════════
# 4. LEASE INQUIRY
# ═════════════════════════════════════════════════════════════════════════════

def notify_lease_inquiry_created(inquiry, triggered_by=None):
    ref        = str(inquiry.reference)[:8].upper()
    asset_type = inquiry.get_asset_type_display()
    duration   = inquiry.get_lease_duration_display()

    client_rows = [
        ("Asset Type",      asset_type),
        ("Lease Duration",  duration),
        ("Preferred Start", str(inquiry.preferred_start_date)),
        ("Reference",       ref),
    ]
    if inquiry.budget_range:
        client_rows.append(("Budget Range",      inquiry.budget_range))
    if inquiry.usage_description:
        client_rows.append(("Usage Description", inquiry.usage_description))

    staff_rows = [
        ("Reference",        ref),
        ("Contact Name",     inquiry.guest_name),
        ("Contact Email",    inquiry.guest_email),
        ("Contact Phone",    inquiry.guest_phone or "-"),
        ("Company",          inquiry.company or "-"),
        ("Asset Type",       asset_type),
        ("Lease Duration",   duration),
        ("Preferred Start",  str(inquiry.preferred_start_date)),
        ("Budget Range",     inquiry.budget_range or "-"),
        ("Usage",            inquiry.usage_description or "-"),
        ("Additional Notes", inquiry.additional_notes or "-"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=None,
        client_email=inquiry.guest_email,
        client_name=inquiry.guest_name,
        client_subject=f"Lease Enquiry Received - {asset_type} | {_BRAND_NAME}",
        client_heading="Lease Enquiry Received",
        client_intro=(
            f"Dear {inquiry.guest_name}, thank you for your lease enquiry. "
            f"Our leasing specialists will review your requirements and respond "
            f"within 24 hours with tailored options."
        ),
        client_rows=client_rows,
        client_footer="For questions about leasing terms or fleet availability please reply to this email.",
        client_notif_title=f"Lease Enquiry Received - {asset_type}",
        client_notif_body=f"Your {asset_type} lease enquiry has been received. Reference: {ref}.",
        client_notif_link=f"/inquiries/lease/{inquiry.reference}",
        staff_subject=f"[NJH] New Lease Enquiry - {asset_type} | {ref}",
        staff_heading="New Lease Enquiry",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/lease-inquiries/{inquiry.pk}",
        staff_notif_title=f"New Lease Enquiry - {asset_type} ({ref})",
        staff_notif_body=f"Client: {inquiry.guest_name} | {asset_type} | {duration}",
        staff_notif_link=f"/admin/lease-inquiries/{inquiry.pk}",
        inquiry_type='lease_inquiry',
        related_id=inquiry.pk,
    )


# ═════════════════════════════════════════════════════════════════════════════
# 5. GROUP CHARTER INQUIRY
# ═════════════════════════════════════════════════════════════════════════════

def notify_group_charter_created(inquiry, triggered_by=None):
    ref   = str(inquiry.reference)[:8].upper()
    route = f"{inquiry.origin_description} to {inquiry.destination_description}"

    extras = [x for x, f in [
        ("Catering",         inquiry.catering_required),
        ("Ground Transport", inquiry.ground_transport_required),
    ] if f]

    client_rows = [
        ("Group Type",  inquiry.get_group_type_display()),
        ("Group Size",  str(inquiry.group_size)),
        ("Route",       route),
        ("Reference",   ref),
    ]
    if inquiry.departure_date:
        client_rows.append(("Departure Date", str(inquiry.departure_date)))
    if inquiry.return_date:
        client_rows.append(("Return Date",    str(inquiry.return_date)))
    if inquiry.budget_range:
        client_rows.append(("Budget Range",   inquiry.budget_range))
    if extras:
        client_rows.append(("Services Required", ", ".join(extras)))

    staff_rows = [
        ("Reference",        ref),
        ("Contact Name",     inquiry.contact_name),
        ("Contact Email",    inquiry.email),
        ("Contact Phone",    inquiry.phone or "-"),
        ("Company",          inquiry.company or "-"),
        ("Group Type",       inquiry.get_group_type_display()),
        ("Group Size",       str(inquiry.group_size)),
        ("Origin",           inquiry.origin_description),
        ("Destination",      inquiry.destination_description),
        ("Departure Date",   str(inquiry.departure_date) if inquiry.departure_date else "-"),
        ("Return Date",      str(inquiry.return_date) if inquiry.return_date else "-"),
        ("Round Trip",       "Yes" if inquiry.is_round_trip else "No"),
        ("Category Pref",    inquiry.preferred_aircraft_category or "Not specified"),
        ("Catering",         "Yes" if inquiry.catering_required else "No"),
        ("Ground Transport", "Yes" if inquiry.ground_transport_required else "No"),
        ("Budget Range",     inquiry.budget_range or "-"),
        ("Additional Notes", inquiry.additional_notes or "-"),
        ("Submitted",        timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=None,
        client_email=inquiry.email,
        client_name=inquiry.contact_name,
        client_subject=f"Group Charter Enquiry Received | {_BRAND_NAME}",
        client_heading="Group Charter Enquiry Received",
        client_intro=(
            f"Dear {inquiry.contact_name}, we have received your group charter enquiry "
            f"for {inquiry.group_size} passengers. Our group charter specialists will "
            f"review your requirements and respond within 4 hours."
        ),
        client_rows=client_rows,
        client_footer="For large group movements or tight timelines please call us directly.",
        client_notif_title=f"Group Charter Received - {route}",
        client_notif_body=f"Your group charter enquiry ({inquiry.group_size} pax) has been received. Reference: {ref}.",
        client_notif_link=f"/inquiries/group/{inquiry.reference}",
        staff_subject=f"[NJH] New Group Charter - {inquiry.group_size} pax | {ref}",
        staff_heading="New Group Charter Enquiry",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/group-charters/{inquiry.pk}",
        staff_notif_title=f"New Group Charter - {inquiry.group_size} pax ({ref})",
        staff_notif_body=f"Client: {inquiry.contact_name} | {route} | {inquiry.get_group_type_display()}",
        staff_notif_link=f"/admin/group-charters/{inquiry.pk}",
        inquiry_type='group_charter',
        related_id=inquiry.pk,
    )


# ═════════════════════════════════════════════════════════════════════════════
# 6. CONTACT INQUIRY
# ═════════════════════════════════════════════════════════════════════════════

def notify_contact_inquiry_created(inquiry, triggered_by=None):
    ref = str(inquiry.reference)[:8].upper()

    client_rows = [
        ("Subject",   inquiry.get_subject_display()),
        ("Reference", ref),
    ]

    staff_rows = [
        ("Reference",   ref),
        ("Name",        inquiry.full_name),
        ("Email",       inquiry.email),
        ("Phone",       inquiry.phone or "-"),
        ("Company",     inquiry.company or "-"),
        ("Subject",     inquiry.get_subject_display()),
        ("Message",     inquiry.message),
        ("Submitted",   timezone.now().strftime('%d %b %Y %H:%M UTC')),
    ]

    _dispatch(
        triggered_by=triggered_by,
        client_user=None,
        client_email=inquiry.email,
        client_name=inquiry.full_name,
        client_subject=f"Message Received | {_BRAND_NAME}",
        client_heading="We Have Received Your Message",
        client_intro=(
            f"Dear {inquiry.full_name}, thank you for contacting NairobiJetHouse. "
            f"We have received your message and a member of our team will respond "
            f"within one business day."
        ),
        client_rows=client_rows,
        client_footer="For urgent matters please call our main line directly.",
        client_notif_title="Message Received",
        client_notif_body=f"Your message has been received. Reference: {ref}.",
        client_notif_link="/contact",
        staff_subject=f"[NJH] New Contact Message - {inquiry.get_subject_display()} | {ref}",
        staff_heading="New Contact Enquiry",
        staff_rows=staff_rows,
        staff_admin_path=f"/admin/contact-inquiries/{inquiry.pk}",
        staff_notif_title=f"New Contact Message - {inquiry.get_subject_display()} ({ref})",
        staff_notif_body=f"From: {inquiry.full_name} | Subject: {inquiry.get_subject_display()}",
        staff_notif_link=f"/admin/contact-inquiries/{inquiry.pk}",
        inquiry_type='contact',
        related_id=inquiry.pk,
    )


# ═════════════════════════════════════════════════════════════════════════════
# CORE DISPATCHER
# ═════════════════════════════════════════════════════════════════════════════

def _dispatch(
    triggered_by,
    client_user, client_email, client_name,
    client_subject, client_heading, client_intro,
    client_rows, client_footer,
    client_notif_title, client_notif_body, client_notif_link,
    staff_subject, staff_heading, staff_rows,
    staff_admin_path,
    staff_notif_title, staff_notif_body, staff_notif_link,
    inquiry_type, related_id,
):
    if client_user and getattr(client_user, 'pk', None):
        _create_notification(client_user, client_notif_title, client_notif_body, client_notif_link)

    if client_email:
        _send_and_log(
            sent_by=triggered_by,
            to_email=client_email,
            to_name=client_name,
            subject=client_subject,
            plain=_plain(client_name, client_heading, client_intro, client_rows, client_footer),
            html=_html_client(client_name, client_heading, client_intro, client_rows, client_footer),
            inquiry_type=inquiry_type,
            related_id=related_id,
        )

    _create_staff_notifications(staff_notif_title, staff_notif_body, staff_notif_link, exclude_user=triggered_by)

    _send_and_log(
        sent_by=triggered_by,
        to_email=_OPS_EMAIL(),
        to_name='NJH Operations',
        subject=staff_subject,
        plain=_plain('Operations Team', staff_heading, None, staff_rows, None),
        html=_html_staff(staff_heading, staff_rows, staff_admin_path),
        inquiry_type=inquiry_type,
        related_id=related_id,
    )


# ─────────────────────────────────────────────────────────────────────────────
# In-app notification helpers
# ─────────────────────────────────────────────────────────────────────────────

def _create_notification(user, title, body, link):
    from .models import ClientNotification
    try:
        ClientNotification.objects.create(
            user=user, notif_type='booking_confirmed',
            title=title, body=body, link=link,
        )
    except Exception:
        logger.exception("Failed to create in-app notification for user %s", getattr(user, 'pk', '?'))


def _create_staff_notifications(title, body, link, exclude_user=None):
    from .models import User, ClientNotification
    try:
        qs = User.objects.filter(role__in=('admin', 'staff'), is_active=True)
        if exclude_user and getattr(exclude_user, 'pk', None):
            qs = qs.exclude(pk=exclude_user.pk)
        objs = [
            ClientNotification(user=u, notif_type='booking_confirmed', title=title, body=body, link=link)
            for u in qs
        ]
        if objs:
            ClientNotification.objects.bulk_create(objs, ignore_conflicts=True)
    except Exception:
        logger.exception("Failed to bulk-create staff notifications")


# ─────────────────────────────────────────────────────────────────────────────
# Email send + log
# ─────────────────────────────────────────────────────────────────────────────

def _send_and_log(sent_by, to_email, to_name, subject, plain, html, inquiry_type, related_id=None):
    from .models import EmailLog
    success, err = True, ''
    try:
        msg = EmailMultiAlternatives(subject=subject, body=plain,
                                     from_email=settings.DEFAULT_FROM_EMAIL, to=[to_email])
        if html:
            msg.attach_alternative(html, 'text/html')
        msg.send(fail_silently=False)
    except Exception as exc:
        success, err = False, str(exc)
        logger.exception("Email send failed to %s", to_email)
    try:
        EmailLog.objects.create(
            sent_by=sent_by if (sent_by and getattr(sent_by, 'pk', None)) else None,
            to_email=to_email, to_name=to_name or '',
            subject=subject, body=plain,
            inquiry_type=inquiry_type, related_id=related_id,
            success=success, error_msg=err,
        )
    except Exception:
        logger.exception("EmailLog.create failed for %s id=%s", inquiry_type, related_id)
    return success


# ─────────────────────────────────────────────────────────────────────────────
# Plain-text fallback
# ─────────────────────────────────────────────────────────────────────────────

def _plain(name, heading, intro, rows, footer):
    lines = [_BRAND_NAME, '=' * 50, '', heading, '-' * len(heading), '']
    if intro:
        lines += [intro, '']
    for label, value in rows:
        lines.append(f"  {label:<24}: {value}")
    lines.append('')
    if footer:
        lines += [footer, '']
    lines += ['-' * 50, f"{_BRAND_NAME}  |  {_BRAND_SUB}", 'Nairobi, Kenya']
    return '\n'.join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# HTML builders — black and white, no colour
# ─────────────────────────────────────────────────────────────────────────────

_CSS = (
    "body{margin:0;padding:0;background:#f2f2f2;"
    "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}"
    "table{border-collapse:collapse;}"
)


def _rows_html(rows):
    out = ''
    for i, (label, value) in enumerate(rows):
        bg = '#ffffff' if i % 2 == 0 else '#f9f9f9'
        out += (
            f'<tr style="background:{bg};">'
            f'<td style="padding:10px 16px;font-size:13px;color:#666666;'
            f'white-space:nowrap;width:180px;border-bottom:1px solid #e8e8e8;">{label}</td>'
            f'<td style="padding:10px 16px;font-size:13px;color:#111111;'
            f'border-bottom:1px solid #e8e8e8;">{value}</td>'
            f'</tr>'
        )
    return out


def _header_html():
    return (
        '<tr><td style="background:#000000;padding:26px 40px;">'
        f'<p style="margin:0;color:#ffffff;font-size:17px;font-weight:700;'
        f'letter-spacing:2px;text-transform:uppercase;">{_BRAND_NAME}</p>'
        f'<p style="margin:4px 0 0;color:#888888;font-size:10px;'
        f'letter-spacing:1px;text-transform:uppercase;">{_BRAND_SUB}</p>'
        '</td></tr>'
    )


def _footer_html():
    return (
        '<tr><td style="background:#f2f2f2;border-top:1px solid #dddddd;'
        'padding:18px 40px;text-align:center;">'
        f'<p style="margin:0;font-size:11px;color:#aaaaaa;">'
        f'{_BRAND_NAME} &nbsp;|&nbsp; Nairobi, Kenya &nbsp;|&nbsp; '
        f'{timezone.now().strftime("%d %b %Y")}</p>'
        '</td></tr>'
    )


def _html_client(name, heading, intro, rows, footer):
    footer_block = (
        f'<tr><td style="padding:0 40px 28px;">'
        f'<p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">{footer}</p>'
        f'</td></tr>'
    ) if footer else ''

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{_CSS}</style></head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0"
       style="background:#ffffff;border:1px solid #dddddd;">
{_header_html()}
<tr><td style="padding:30px 40px 20px;border-bottom:2px solid #000000;">
  <h1 style="margin:0;font-size:19px;font-weight:700;color:#000000;">{heading}</h1>
</td></tr>
<tr><td style="padding:24px 40px 20px;">
  <p style="margin:0;font-size:14px;color:#333333;line-height:1.7;">{intro}</p>
</td></tr>
<tr><td style="padding:0 40px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #dddddd;">{_rows_html(rows)}</table>
</td></tr>
{footer_block}
{_footer_html()}
</table>
</td></tr>
</table>
</body></html>"""


def _html_staff(heading, rows, admin_path):
    admin_url = _ADMIN_URL(admin_path)
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{_CSS}</style></head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0"
       style="background:#ffffff;border:1px solid #dddddd;">
{_header_html()}
<tr><td style="padding:28px 40px 20px;border-bottom:2px solid #000000;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <h1 style="margin:0;font-size:18px;font-weight:700;color:#000000;">{heading}</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#888888;">Internal Operations Alert</p>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <span style="display:inline-block;border:1px solid #000000;padding:4px 12px;
                     font-size:11px;font-weight:700;letter-spacing:1px;
                     text-transform:uppercase;">NEW</span>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 8px;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border:1px solid #dddddd;">{_rows_html(rows)}</table>
</td></tr>
<tr><td style="padding:20px 40px 32px;">
  <a href="{admin_url}"
     style="display:inline-block;background:#000000;color:#ffffff;
            padding:12px 28px;text-decoration:none;font-size:13px;
            font-weight:700;letter-spacing:0.5px;">
    Open in Admin Portal
  </a>
</td></tr>
{_footer_html()}
</table>
</td></tr>
</table>
</body></html>"""