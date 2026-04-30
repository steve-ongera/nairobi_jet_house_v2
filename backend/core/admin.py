"""
NairobiJetHouse — admin.py
──────────────────────────────────────────────────────────────────────────────
Fully customised Django admin for all V1 + V2 models.
Highlights:
  • NJH-branded header / site title
  • Rich list displays, filters, search, and inline editing everywhere
  • Colour-coded status badges via custom display methods
  • Calculated fields (commission, net revenue, maintenance due) shown inline
  • Bulk actions: approve, reject, send RFQ, mark paid, etc.
  • Operator portal grouping with custom ModelAdmin sections
  • All readonly computed fields clearly labelled
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count
from decimal import Decimal

from .models import (
    # Catalog
    User, Airport, Aircraft, Yacht,
    # V2 Operators
    CharterOperator, OperatorAircraft, OperatorYacht,
    AvailabilityBlock, NJHCommissionRule,
    RFQBid, OperatorBooking, OperatorPayoutLog, OperatorReview,
    # Core bookings
    FlightBooking, FlightLeg, YachtCharter,
    # Inquiries
    LeaseInquiry, FlightInquiry, ContactInquiry,
    GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    # Membership
    MembershipTier, Membership,
    # Marketplace (V1)
    MarketplaceAircraft, MaintenanceLog, MarketplaceBooking,
    # Other
    CommissionSetting, PaymentRecord, SavedRoute, Dispute,
    EmailLog, JobPosting, JobApplication,
    # V2 extras
    DocumentUpload, ClientNotification, WebhookLog,
)

# ─────────────────────────────────────────────────────────────────────────────
# SITE BRANDING
# ─────────────────────────────────────────────────────────────────────────────
admin.site.site_header  = "✈  NairobiJetHouse Admin"
admin.site.site_title   = "NJH Admin"
admin.site.index_title  = "Operations Dashboard"


# ─────────────────────────────────────────────────────────────────────────────
# SHARED HELPERS
# ─────────────────────────────────────────────────────────────────────────────
STATUS_COLORS = {
    # greens
    "active": "#16a34a", "confirmed": "#16a34a", "completed": "#16a34a",
    "paid": "#16a34a", "accepted": "#16a34a", "hired": "#16a34a",
    "published": "#16a34a", "succeeded": "#16a34a", "available": "#16a34a",
    # yellows / oranges
    "pending": "#d97706", "inquiry": "#d97706", "quoted": "#d97706",
    "rfq_sent": "#d97706", "submitted": "#d97706", "shortlisted": "#d97706",
    "reviewing": "#d97706", "processing": "#d97706", "in_flight": "#d97706",
    "sent": "#d97706", "in_service": "#2563eb", "active charter": "#2563eb",
    # reds
    "cancelled": "#dc2626", "rejected": "#dc2626", "suspended": "#dc2626",
    "terminated": "#dc2626", "failed": "#dc2626", "disputed": "#dc2626",
    "expired": "#dc2626", "maintenance": "#7c3aed",
    # greys
    "inactive": "#6b7280", "pending onboarding": "#6b7280",
}


def badge(value, label=None):
    """Return a coloured HTML badge for a status string."""
    color = STATUS_COLORS.get(str(value).lower(), "#6b7280")
    text  = label or str(value).replace("_", " ").title()
    return format_html(
        '<span style="background:{};color:#fff;padding:2px 8px;'
        'border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
        color, text
    )


def money(value, currency="$"):
    if value is None:
        return "—"
    return f"{currency}{value:,.2f}"


def tick(value):
    return format_html('<span style="color:#16a34a;font-size:16px;">✓</span>') if value \
        else format_html('<span style="color:#dc2626;font-size:16px;">✗</span>')


# ─────────────────────────────────────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ("username", "email", "full_name", "role_badge", "is_active", "date_joined")
    list_filter   = ("role", "is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name", "company")
    ordering      = ("-date_joined",)
    fieldsets     = BaseUserAdmin.fieldsets + (
        ("NJH Profile", {"fields": ("role", "phone", "company", "avatar_url")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("NJH Profile", {"fields": ("role", "phone", "company")}),
    )

    @admin.display(description="Name")
    def full_name(self, obj):
        return obj.get_full_name() or "—"

    @admin.display(description="Role")
    def role_badge(self, obj):
        colors = {
            "admin": "#7c3aed", "staff": "#2563eb", "operator": "#d97706",
            "owner": "#16a34a", "client": "#6b7280",
        }
        color = colors.get(obj.role, "#6b7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_role_display()
        )


# ─────────────────────────────────────────────────────────────────────────────
# CATALOG
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display  = ("code", "name", "city", "country", "latitude", "longitude")
    search_fields = ("code", "name", "city", "country")
    list_filter   = ("country",)
    ordering      = ("code",)


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display  = ("name", "model", "category", "passenger_capacity",
                     "range_km", "hourly_rate_usd", "is_available")
    list_filter   = ("category", "is_available")
    search_fields = ("name", "model")
    list_editable = ("is_available",)


@admin.register(Yacht)
class YachtAdmin(admin.ModelAdmin):
    list_display  = ("name", "size_category", "length_meters",
                     "guest_capacity", "daily_rate_usd", "home_port", "is_available")
    list_filter   = ("size_category", "is_available")
    search_fields = ("name", "home_port")
    list_editable = ("is_available",)


# ─────────────────────────────────────────────────────────────────────────────
# V2 — CHARTER OPERATORS
# ─────────────────────────────────────────────────────────────────────────────
class OperatorAircraftInline(admin.TabularInline):
    model      = OperatorAircraft
    extra      = 0
    fields     = ("name", "registration_number", "category", "passenger_capacity",
                  "hourly_rate_usd", "status", "is_approved")
    readonly_fields = ("status",)
    show_change_link = True


class OperatorYachtInline(admin.TabularInline):
    model      = OperatorYacht
    extra      = 0
    fields     = ("name", "yacht_type", "length_meters", "guest_capacity",
                  "daily_rate_usd", "status", "is_approved")
    show_change_link = True


def activate_operators(modeladmin, request, queryset):
    queryset.update(status="active")
activate_operators.short_description = "✅  Activate selected operators"

def suspend_operators(modeladmin, request, queryset):
    queryset.update(status="suspended")
suspend_operators.short_description = "🚫  Suspend selected operators"


@admin.register(CharterOperator)
class CharterOperatorAdmin(admin.ModelAdmin):
    list_display  = ("name", "country", "tier_badge", "status_badge",
                     "contact_email", "aircraft_count", "yacht_count",
                     "commission_override_pct", "created_at")
    list_filter   = ("tier", "status", "country", "accepts_last_minute")
    search_fields = ("name", "trading_name", "contact_email", "registration_no")
    ordering      = ("name",)
    actions       = [activate_operators, suspend_operators]
    inlines       = [OperatorAircraftInline, OperatorYachtInline]
    readonly_fields = ("reference", "created_at", "updated_at",
                       "active_aircraft_count", "active_yacht_count")
    filter_horizontal = ("users", "base_airports")

    fieldsets = (
        ("Identity", {
            "fields": ("reference", "name", "trading_name", "registration_no",
                       "logo_url", "website")
        }),
        ("Contact", {
            "fields": ("country", "city", "address", "primary_contact",
                       "contact_email", "contact_phone")
        }),
        ("Partnership", {
            "fields": ("tier", "status", "commission_override_pct",
                       "accepts_last_minute", "operating_regions")
        }),
        ("Safety & Compliance", {
            "fields": ("aoc_number", "argus_rating", "wyvern_rating",
                       "insurance_provider", "insurance_expiry"),
            "classes": ("collapse",),
        }),
        ("Financials", {
            "fields": ("bank_name", "bank_account_no", "bank_swift",
                       "payout_currency", "payment_terms_days"),
            "classes": ("collapse",),
        }),
        ("Linked Accounts & Airports", {
            "fields": ("users", "base_airports"),
            "classes": ("collapse",),
        }),
        ("Stats (read-only)", {
            "fields": ("active_aircraft_count", "active_yacht_count",
                       "created_at", "updated_at"),
        }),
        ("Notes", {"fields": ("notes",)}),
    )

    @admin.display(description="Tier")
    def tier_badge(self, obj):
        colors = {"exclusive": "#7c3aed", "preferred": "#2563eb", "standard": "#6b7280"}
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            colors.get(obj.tier, "#6b7280"), obj.get_tier_display()
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Aircraft")
    def aircraft_count(self, obj):
        return obj.operator_aircraft.filter(is_approved=True).count()

    @admin.display(description="Yachts")
    def yacht_count(self, obj):
        return obj.operator_yachts.filter(is_approved=True).count()


# ─────────────────────────────────────────────────────────────────────────────
# V2 — OPERATOR AIRCRAFT
# ─────────────────────────────────────────────────────────────────────────────
def approve_aircraft(modeladmin, request, queryset):
    queryset.update(is_approved=True, status="available")
approve_aircraft.short_description = "✅  Approve selected aircraft"

def reject_aircraft(modeladmin, request, queryset):
    queryset.update(is_approved=False, status="inactive")
reject_aircraft.short_description = "🚫  Reject selected aircraft"


class AvailabilityBlockInline(admin.TabularInline):
    model  = AvailabilityBlock
    extra  = 0
    fields = ("block_type", "start_date", "end_date", "notes")


@admin.register(OperatorAircraft)
class OperatorAircraftAdmin(admin.ModelAdmin):
    list_display  = ("name", "registration_number", "operator", "category",
                     "passenger_capacity", "hourly_rate_display",
                     "status_badge", "approved_badge", "maintenance_badge", "created_at")
    list_filter   = ("category", "status", "is_approved", "is_featured",
                     "wifi_available", "pets_allowed")
    search_fields = ("name", "model", "registration_number", "operator__name")
    ordering      = ("operator", "category", "name")
    actions       = [approve_aircraft, reject_aircraft]
    inlines       = [AvailabilityBlockInline]
    readonly_fields = ("reference", "hours_until_maintenance", "maintenance_due",
                       "display_hourly_rate", "created_at", "updated_at")

    fieldsets = (
        ("Identity", {
            "fields": ("reference", "operator", "catalog_aircraft",
                       "name", "model", "category", "registration_number",
                       "year_of_manufacture", "base_airport")
        }),
        ("Specifications", {
            "fields": ("passenger_capacity", "range_km", "cruise_speed_kmh",
                       "max_baggage_kg", "wifi_available", "pets_allowed", "smoking_allowed")
        }),
        ("Pricing", {
            "fields": ("hourly_rate_usd", "display_hourly_rate", "min_hours",
                       "positioning_fee_usd", "overnight_fee_usd")
        }),
        ("Status & Approval", {
            "fields": ("status", "is_approved", "is_featured")
        }),
        ("Maintenance", {
            "fields": ("total_flight_hours", "maintenance_interval_hours",
                       "last_maintenance_hours", "hours_until_maintenance",
                       "maintenance_due", "next_maintenance_date")
        }),
        ("Documents", {
            "fields": ("airworthiness_expiry", "insurance_expiry"),
        }),
        ("Presentation", {
            "fields": ("description", "amenities", "images", "image_url"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Approved")
    def approved_badge(self, obj):
        return tick(obj.is_approved)

    @admin.display(description="Maint. Due")
    def maintenance_badge(self, obj):
        if obj.maintenance_due:
            return format_html('<span style="color:#dc2626;font-weight:700;">OVERDUE</span>')
        hrs = obj.hours_until_maintenance
        color = "#d97706" if hrs < 10 else "#16a34a"
        return format_html('<span style="color:{};">{:.0f} hrs</span>', color, hrs)

    @admin.display(description="Client Rate")
    def hourly_rate_display(self, obj):
        try:
            return f"${obj.display_hourly_rate:,.2f}/hr"
        except Exception:
            return f"${obj.hourly_rate_usd:,.2f}/hr"


# ─────────────────────────────────────────────────────────────────────────────
# V2 — OPERATOR YACHT
# ─────────────────────────────────────────────────────────────────────────────
def approve_yacht(modeladmin, request, queryset):
    queryset.update(is_approved=True, status="available")
approve_yacht.short_description = "✅  Approve selected yachts"


@admin.register(OperatorYacht)
class OperatorYachtAdmin(admin.ModelAdmin):
    list_display  = ("name", "operator", "yacht_type", "length_meters",
                     "guest_capacity", "daily_rate_usd", "status_badge",
                     "approved_badge", "home_port")
    list_filter   = ("yacht_type", "status", "is_approved", "is_featured")
    search_fields = ("name", "operator__name", "home_port", "flag_state")
    ordering      = ("operator", "name")
    actions       = [approve_yacht]
    readonly_fields = ("reference", "created_at", "updated_at")

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Approved")
    def approved_badge(self, obj):
        return tick(obj.is_approved)


# ─────────────────────────────────────────────────────────────────────────────
# V2 — AVAILABILITY BLOCK
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(AvailabilityBlock)
class AvailabilityBlockAdmin(admin.ModelAdmin):
    list_display  = ("operator", "asset_type", "asset_name", "block_type",
                     "start_date", "end_date", "created_at")
    list_filter   = ("asset_type", "block_type", "operator")
    search_fields = ("operator__name", "aircraft__name", "yacht__name")
    date_hierarchy = "start_date"

    @admin.display(description="Asset")
    def asset_name(self, obj):
        return str(obj.aircraft or obj.yacht or "—")


# ─────────────────────────────────────────────────────────────────────────────
# V2 — NJH COMMISSION RULES
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(NJHCommissionRule)
class NJHCommissionRuleAdmin(admin.ModelAdmin):
    list_display  = ("name", "priority", "operator_tier", "asset_category",
                     "markup_pct", "commission_pct", "is_active",
                     "effective_from", "effective_to")
    list_filter   = ("is_active", "operator_tier")
    list_editable = ("priority", "is_active")
    search_fields = ("name",)
    ordering      = ("-priority",)


# ─────────────────────────────────────────────────────────────────────────────
# FLIGHT BOOKINGS
# ─────────────────────────────────────────────────────────────────────────────
class FlightLegInline(admin.TabularInline):
    model  = FlightLeg
    extra  = 0
    fields = ("leg_number", "origin", "destination", "departure_date", "departure_time")


class RFQBidInline(admin.TabularInline):
    model        = RFQBid
    extra        = 0
    fields       = ("operator", "aircraft", "operator_price_usd",
                    "njh_client_price", "status", "valid_until")
    readonly_fields = ("njh_margin_usd",)
    show_change_link = True


def send_rfq(modeladmin, request, queryset):
    queryset.update(status="rfq_sent")
send_rfq.short_description = "📨  Mark as RFQ Sent"

def confirm_bookings(modeladmin, request, queryset):
    queryset.update(status="confirmed")
confirm_bookings.short_description = "✅  Confirm selected bookings"

def cancel_bookings(modeladmin, request, queryset):
    queryset.update(status="cancelled")
cancel_bookings.short_description = "🚫  Cancel selected bookings"


@admin.register(FlightBooking)
class FlightBookingAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "guest_name", "guest_email",
                     "route", "departure_date", "passenger_count",
                     "status_badge", "quoted_price_display",
                     "operator_display", "created_at")
    list_filter   = ("status", "trip_type", "catering_requested",
                     "ground_transport_requested", "concierge_requested",
                     "payment_status")
    search_fields = ("guest_name", "guest_email", "guest_phone",
                     "reference", "company")
    date_hierarchy = "departure_date"
    ordering      = ("-created_at",)
    actions       = [send_rfq, confirm_bookings, cancel_bookings]
    inlines       = [FlightLegInline, RFQBidInline]
    readonly_fields = ("reference", "commission_usd", "net_revenue_usd",
                       "created_at", "updated_at")

    fieldsets = (
        ("Reference", {"fields": ("reference", "status", "client")}),
        ("Guest Details", {
            "fields": ("guest_name", "guest_email", "guest_phone", "company")
        }),
        ("Route", {
            "fields": ("trip_type", "origin", "destination",
                       "departure_date", "departure_time", "return_date",
                       "passenger_count", "preferred_category")
        }),
        ("Aircraft Assignment", {
            "fields": ("aircraft", "operator_aircraft", "assigned_operator")
        }),
        ("Pricing", {
            "fields": ("operator_cost_usd", "quoted_price_usd",
                       "commission_pct", "commission_usd", "net_revenue_usd",
                       "payment_status", "stripe_payment_id")
        }),
        ("Add-ons & Requests", {
            "fields": ("catering_requested", "ground_transport_requested",
                       "concierge_requested", "special_requests"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Route")
    def route(self, obj):
        return f"{obj.origin.code} → {obj.destination.code}"

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Quoted")
    def quoted_price_display(self, obj):
        return money(obj.quoted_price_usd) if obj.quoted_price_usd else "—"

    @admin.display(description="Operator")
    def operator_display(self, obj):
        return obj.assigned_operator.name if obj.assigned_operator else "—"


# ─────────────────────────────────────────────────────────────────────────────
# V2 — RFQ BIDS
# ─────────────────────────────────────────────────────────────────────────────
def accept_bid(modeladmin, request, queryset):
    queryset.update(status="accepted")
accept_bid.short_description = "✅  Accept selected bids"

def shortlist_bid(modeladmin, request, queryset):
    queryset.update(status="shortlisted")
shortlist_bid.short_description = "⭐  Shortlist selected bids"


@admin.register(RFQBid)
class RFQBidAdmin(admin.ModelAdmin):
    list_display  = ("booking_ref", "operator", "aircraft",
                     "operator_price_usd", "njh_client_price", "margin_display",
                     "status_badge", "valid_until", "created_at")
    list_filter   = ("status", "operator")
    search_fields = ("booking__guest_name", "operator__name")
    ordering      = ("operator_price_usd",)
    actions       = [accept_bid, shortlist_bid]
    readonly_fields = ("njh_margin_usd", "created_at", "updated_at")

    @admin.display(description="Booking")
    def booking_ref(self, obj):
        return str(obj.booking.reference)[:8].upper()

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="NJH Margin")
    def margin_display(self, obj):
        if obj.njh_margin_usd:
            return format_html(
                '<span style="color:#16a34a;font-weight:600;">${:,.2f}</span>',
                obj.njh_margin_usd
            )
        return "—"


# ─────────────────────────────────────────────────────────────────────────────
# V2 — OPERATOR BOOKINGS
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(OperatorBooking)
class OperatorBookingAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "operator", "asset_type",
                     "asset_display", "status_badge",
                     "operator_payout_usd", "njh_margin_usd",
                     "total_client_usd", "created_at")
    list_filter   = ("status", "asset_type", "operator")
    search_fields = ("operator__name", "operator_reference", "reference")
    ordering      = ("-created_at",)
    readonly_fields = ("reference", "accepted_at", "rejected_at", "created_at", "updated_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Asset")
    def asset_display(self, obj):
        return str(obj.operator_aircraft or obj.operator_yacht or "—")

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# V2 — OPERATOR PAYOUTS
# ─────────────────────────────────────────────────────────────────────────────
def mark_paid(modeladmin, request, queryset):
    queryset.update(status="paid", paid_at=timezone.now())
mark_paid.short_description = "💵  Mark selected payouts as Paid"

def mark_processing(modeladmin, request, queryset):
    queryset.update(status="processing")
mark_processing.short_description = "⏳  Mark selected payouts as Processing"


@admin.register(OperatorPayoutLog)
class OperatorPayoutLogAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "operator", "amount_display",
                     "currency", "payment_method", "status_badge",
                     "due_date", "paid_at", "created_at")
    list_filter   = ("status", "currency", "payment_method")
    search_fields = ("operator__name", "bank_reference", "reference")
    ordering      = ("-created_at",)
    actions       = [mark_paid, mark_processing]
    readonly_fields = ("reference", "created_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Amount")
    def amount_display(self, obj):
        return format_html(
            '<strong>${:,.2f}</strong>',
            obj.amount_usd
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# V2 — OPERATOR REVIEWS
# ─────────────────────────────────────────────────────────────────────────────
def publish_reviews(modeladmin, request, queryset):
    queryset.update(is_published=True)
publish_reviews.short_description = "🌐  Publish selected reviews"


@admin.register(OperatorReview)
class OperatorReviewAdmin(admin.ModelAdmin):
    list_display  = ("operator", "reviewer_name", "stars_display",
                     "rating_punctuality", "rating_cleanliness", "rating_crew",
                     "is_published", "created_at")
    list_filter   = ("is_published", "rating_overall", "operator")
    search_fields = ("reviewer_name", "reviewer_email", "operator__name")
    ordering      = ("-created_at",)
    actions       = [publish_reviews]

    @admin.display(description="Rating")
    def stars_display(self, obj):
        stars = "★" * obj.rating_overall + "☆" * (5 - obj.rating_overall)
        color = "#16a34a" if obj.rating_overall >= 4 else (
            "#d97706" if obj.rating_overall == 3 else "#dc2626"
        )
        return format_html('<span style="color:{};">{}</span>', color, stars)


# ─────────────────────────────────────────────────────────────────────────────
# YACHT CHARTERS
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(YachtCharter)
class YachtCharterAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "guest_name", "guest_email",
                     "departure_port", "charter_start", "charter_end",
                     "guest_count", "status_badge", "quoted_price_display",
                     "operator_display", "created_at")
    list_filter   = ("status", "payment_status")
    search_fields = ("guest_name", "guest_email", "departure_port", "reference")
    date_hierarchy = "charter_start"
    ordering      = ("-created_at",)
    readonly_fields = ("reference", "commission_usd", "net_revenue_usd",
                       "created_at", "updated_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Quoted")
    def quoted_price_display(self, obj):
        return money(obj.quoted_price_usd) if obj.quoted_price_usd else "—"

    @admin.display(description="Operator")
    def operator_display(self, obj):
        return obj.assigned_operator.name if obj.assigned_operator else "—"


# ─────────────────────────────────────────────────────────────────────────────
# INQUIRIES
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(LeaseInquiry)
class LeaseInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "guest_name", "guest_email", "asset_type",
                     "lease_duration", "preferred_start_date", "status", "created_at")
    list_filter   = ("asset_type", "lease_duration", "status")
    search_fields = ("guest_name", "guest_email", "company")
    date_hierarchy = "preferred_start_date"

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(FlightInquiry)
class FlightInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "guest_name", "guest_email",
                     "origin_description", "destination_description",
                     "passenger_count", "created_at")
    search_fields = ("guest_name", "guest_email", "origin_description", "destination_description")
    date_hierarchy = "created_at"

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "full_name", "email", "subject", "created_at")
    list_filter   = ("subject",)
    search_fields = ("full_name", "email", "company")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(GroupCharterInquiry)
class GroupCharterInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "contact_name", "email", "group_type",
                     "group_size", "origin_description", "departure_date",
                     "status", "created_at")
    list_filter   = ("group_type", "status", "catering_required",
                     "ground_transport_required")
    search_fields = ("contact_name", "email", "company")
    date_hierarchy = "created_at"

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(AirCargoInquiry)
class AirCargoInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "contact_name", "email", "cargo_type",
                     "weight_kg", "origin_description", "destination_description",
                     "urgency", "status", "created_at")
    list_filter   = ("cargo_type", "urgency", "status",
                     "is_hazardous", "requires_temperature_control")
    search_fields = ("contact_name", "email", "company")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(AircraftSalesInquiry)
class AircraftSalesInquiryAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "contact_name", "email", "inquiry_type",
                     "preferred_category", "budget_range", "status", "created_at")
    list_filter   = ("inquiry_type", "budget_range", "status", "new_or_pre_owned")
    search_fields = ("contact_name", "email", "company",
                     "aircraft_make", "aircraft_model")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


# ─────────────────────────────────────────────────────────────────────────────
# MEMBERSHIP
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display  = ("display_name", "name", "monthly_fee_usd", "annual_fee_usd",
                     "hourly_discount_pct", "priority_booking",
                     "dedicated_support", "exclusive_listings", "is_active")
    list_editable = ("is_active",)


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display  = ("user", "tier", "status_badge", "billing_cycle",
                     "start_date", "end_date", "days_remaining_display",
                     "auto_renew", "amount_paid")
    list_filter   = ("status", "billing_cycle", "tier", "auto_renew")
    search_fields = ("user__username", "user__email", "stripe_sub_id")
    readonly_fields = ("reference", "days_remaining", "is_active", "created_at", "updated_at")

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Days Left")
    def days_remaining_display(self, obj):
        days = obj.days_remaining
        if days is None:
            return "∞"
        color = "#16a34a" if days > 30 else ("#d97706" if days > 7 else "#dc2626")
        return format_html('<span style="color:{};">{} days</span>', color, days)


# ─────────────────────────────────────────────────────────────────────────────
# MARKETPLACE (V1)
# ─────────────────────────────────────────────────────────────────────────────
class MaintenanceLogInline(admin.TabularInline):
    model  = MaintenanceLog
    extra  = 0
    fields = ("maintenance_type", "status", "scheduled_date",
              "completed_date", "flight_hours_at", "cost_usd")
    show_change_link = True


def approve_marketplace(modeladmin, request, queryset):
    queryset.update(is_approved=True, status="available")
approve_marketplace.short_description = "✅  Approve selected marketplace aircraft"


@admin.register(MarketplaceAircraft)
class MarketplaceAircraftAdmin(admin.ModelAdmin):
    list_display  = ("name", "registration_number", "owner", "category",
                     "passenger_capacity", "hourly_rate_usd",
                     "status_badge", "approved_badge",
                     "maintenance_badge", "created_at")
    list_filter   = ("category", "status", "is_approved")
    search_fields = ("name", "model", "registration_number", "owner__username")
    actions       = [approve_marketplace]
    inlines       = [MaintenanceLogInline]
    readonly_fields = ("hours_until_maintenance", "maintenance_due",
                       "created_at", "updated_at")

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)

    @admin.display(description="Approved")
    def approved_badge(self, obj):
        return tick(obj.is_approved)

    @admin.display(description="Maint.")
    def maintenance_badge(self, obj):
        if obj.maintenance_due:
            return format_html('<span style="color:#dc2626;font-weight:700;">OVERDUE</span>')
        color = "#d97706" if obj.hours_until_maintenance < 10 else "#16a34a"
        return format_html(
            '<span style="color:{};">{:.0f} hrs</span>',
            color, obj.hours_until_maintenance
        )


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display  = ("aircraft", "maintenance_type", "status",
                     "scheduled_date", "completed_date",
                     "flight_hours_at", "cost_usd", "technician")
    list_filter   = ("maintenance_type", "status")
    search_fields = ("aircraft__name", "technician", "description")
    date_hierarchy = "scheduled_date"


@admin.register(MarketplaceBooking)
class MarketplaceBookingAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "client", "aircraft", "trip_type",
                     "origin", "destination", "departure_datetime",
                     "passenger_count", "status_badge",
                     "gross_amount_usd", "commission_usd", "payment_status")
    list_filter   = ("status", "trip_type", "payment_status")
    search_fields = ("client__username", "client__email",
                     "aircraft__registration_number", "reference")
    date_hierarchy = "departure_datetime"
    readonly_fields = ("commission_usd", "net_owner_usd", "created_at", "updated_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# COMMISSION & PAYMENTS
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(CommissionSetting)
class CommissionSettingAdmin(admin.ModelAdmin):
    list_display = ("rate_pct", "effective_from", "set_by", "created_at")
    ordering     = ("-effective_from",)


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "user", "payment_type", "amount_usd",
                     "currency", "status_badge", "created_at")
    list_filter   = ("payment_type", "status", "currency")
    search_fields = ("user__username", "user__email", "stripe_payment_id")
    readonly_fields = ("reference", "created_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# SAVED ROUTES & DISPUTES
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(SavedRoute)
class SavedRouteAdmin(admin.ModelAdmin):
    list_display  = ("user", "name", "origin", "destination", "created_at")
    search_fields = ("user__username", "name", "origin", "destination")


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "booking", "raised_by", "subject",
                     "status_badge", "created_at", "resolved_at")
    list_filter   = ("status",)
    search_fields = ("subject", "raised_by__username")
    readonly_fields = ("reference", "created_at", "resolved_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# EMAIL LOG
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "to_email", "to_name", "subject",
                     "inquiry_type", "success_badge", "sent_at")
    list_filter   = ("inquiry_type", "success")
    search_fields = ("to_email", "to_name", "subject")
    date_hierarchy = "sent_at"
    readonly_fields = ("reference", "sent_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description="Sent")
    def success_badge(self, obj):
        return tick(obj.success)


# ─────────────────────────────────────────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────────────────────────────────────────
class JobApplicationInline(admin.TabularInline):
    model  = JobApplication
    extra  = 0
    fields = ("full_name", "email", "status", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


def toggle_job_active(modeladmin, request, queryset):
    for job in queryset:
        job.is_active = not job.is_active
        job.save()
toggle_job_active.short_description = "🔄  Toggle active/inactive"


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display  = ("title", "department", "location", "job_type",
                     "is_active", "is_featured", "application_count", "deadline", "created_at")
    list_filter   = ("department", "location", "job_type", "is_active", "is_featured")
    search_fields = ("title", "description")
    list_editable = ("is_active", "is_featured")
    actions       = [toggle_job_active]
    inlines       = [JobApplicationInline]

    @admin.display(description="Applications")
    def application_count(self, obj):
        return obj.applications.count()


def shortlist_applications(modeladmin, request, queryset):
    queryset.update(status="shortlisted")
shortlist_applications.short_description = "⭐  Shortlist selected applications"

def reject_applications(modeladmin, request, queryset):
    queryset.update(status="rejected")
reject_applications.short_description = "🚫  Reject selected applications"


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display  = ("full_name", "email", "job", "years_experience",
                     "status_badge", "created_at")
    list_filter   = ("status", "job__department")
    search_fields = ("full_name", "email", "job__title")
    ordering      = ("-created_at",)
    actions       = [shortlist_applications, reject_applications]
    readonly_fields = ("reference", "created_at", "updated_at")

    @admin.display(description="Status")
    def status_badge(self, obj):
        return badge(obj.status)


# ─────────────────────────────────────────────────────────────────────────────
# V2 — DOCUMENT UPLOADS
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(DocumentUpload)
class DocumentUploadAdmin(admin.ModelAdmin):
    list_display  = ("short_ref", "doc_type", "linked_to", "related_id",
                     "file_name", "file_size_kb", "uploaded_by", "created_at")
    list_filter   = ("doc_type", "linked_to")
    search_fields = ("file_name", "uploaded_by__username")
    readonly_fields = ("reference", "created_at")

    @admin.display(description="Ref")
    def short_ref(self, obj):
        return str(obj.reference)[:8].upper()


# ─────────────────────────────────────────────────────────────────────────────
# V2 — CLIENT NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────
def mark_notifications_read(modeladmin, request, queryset):
    queryset.update(is_read=True)
mark_notifications_read.short_description = "✅  Mark selected as read"


@admin.register(ClientNotification)
class ClientNotificationAdmin(admin.ModelAdmin):
    list_display  = ("user", "notif_type", "title", "is_read", "created_at")
    list_filter   = ("notif_type", "is_read")
    search_fields = ("user__username", "title", "body")
    date_hierarchy = "created_at"
    actions       = [mark_notifications_read]


# ─────────────────────────────────────────────────────────────────────────────
# V2 — WEBHOOK LOGS
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display  = ("operator", "event", "http_status", "success_badge",
                     "attempts", "endpoint_url", "sent_at", "next_retry")
    list_filter   = ("event", "success", "operator")
    search_fields = ("operator__name", "endpoint_url")
    date_hierarchy = "sent_at"
    readonly_fields = ("sent_at",)

    @admin.display(description="OK")
    def success_badge(self, obj):
        return tick(obj.success)