"""
NairobiJetHouse V2 — models.py
──────────────────────────────────────────────────────────────────────────────
Scale-up: Partner Charter Operator Network
  • CharterOperator     — partner companies who own/operate aircraft & yachts
  • OperatorAircraft    — aircraft listed by partner operators (replaces MarketplaceAircraft)
  • OperatorYacht       — yachts listed by partner operators
  • OperatorBooking     — confirmed bookings dispatched to an operator
  • OperatorPayoutLog   — tracks what NJH owes each operator after commission
  • AvailabilityBlock   — operators mark blackout / already-booked windows
  • OperatorReview      — client rates operator after completed booking
  • RFQBid              — operator responds to a FlightBooking inquiry with a bid
  • NJHCommissionRule   — tiered commission rules (by category, operator tier, etc.)
  • ClientNotification  — in-app + email notifications log
  • DocumentUpload      — any file attached to a booking / inquiry
  • WebhookLog          — tracks outbound webhook deliveries to operator systems
All legacy models from V1 are preserved. New models are clearly marked V2.
"""

import uuid
from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


# ═══════════════════════════════════════════════════════════════════════════════
# V1  USER (unchanged)
# ═══════════════════════════════════════════════════════════════════════════════
class User(AbstractUser):
    ROLE_CHOICES = [
        ('client',   'Membership Client'),
        ('owner',    'Fleet Owner'),        # legacy — kept for backward compat
        ('operator', 'Charter Operator'),   # V2 NEW — partner company staff
        ('staff',    'NJH Staff'),
        ('admin',    'Platform Admin'),
    ]
    role       = models.CharField(max_length=12, choices=ROLE_CHOICES, default='client')
    phone      = models.CharField(max_length=30, blank=True)
    company    = models.CharField(max_length=200, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ═══════════════════════════════════════════════════════════════════════════════
# V1  AIRPORT / AIRCRAFT CATALOG / YACHT CATALOG
# ═══════════════════════════════════════════════════════════════════════════════
class Airport(models.Model):
    code      = models.CharField(max_length=10, unique=True)
    name      = models.CharField(max_length=200)
    city      = models.CharField(max_length=100)
    country   = models.CharField(max_length=100)
    latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f"{self.code} – {self.city}, {self.country}"


class Aircraft(models.Model):
    """NJH catalog aircraft — reference models, not real registrations."""
    CATEGORY_CHOICES = [
        ('light', 'Light Jet'),
        ('midsize', 'Midsize Jet'),
        ('super_midsize', 'Super Midsize Jet'),
        ('heavy', 'Heavy Jet'),
        ('ultra_long', 'Ultra Long Range'),
        ('vip_airliner', 'VIP Airliner'),
        ('turboprop', 'Turboprop'),
        ('helicopter', 'Helicopter'),
    ]
    name               = models.CharField(max_length=100)
    model              = models.CharField(max_length=100)
    category           = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    passenger_capacity = models.PositiveIntegerField()
    range_km           = models.PositiveIntegerField()
    cruise_speed_kmh   = models.PositiveIntegerField()
    description        = models.TextField(blank=True)
    amenities          = models.JSONField(default=list, blank=True)
    image_url          = models.URLField(blank=True)
    hourly_rate_usd    = models.DecimalField(max_digits=10, decimal_places=2)
    is_available       = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Yacht(models.Model):
    SIZE_CHOICES = [
        ('small',      'Small (under 30m)'),
        ('medium',     'Medium (30–50m)'),
        ('large',      'Large (50–80m)'),
        ('superyacht', 'Superyacht (80m+)'),
    ]
    name            = models.CharField(max_length=100)
    size_category   = models.CharField(max_length=20, choices=SIZE_CHOICES)
    length_meters   = models.DecimalField(max_digits=6, decimal_places=2)
    guest_capacity  = models.PositiveIntegerField()
    crew_count      = models.PositiveIntegerField()
    description     = models.TextField(blank=True)
    amenities       = models.JSONField(default=list, blank=True)
    image_url       = models.URLField(blank=True)
    daily_rate_usd  = models.DecimalField(max_digits=12, decimal_places=2)
    home_port       = models.CharField(max_length=200)
    is_available    = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_size_category_display()})"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  CHARTER OPERATOR — partner companies
# ═══════════════════════════════════════════════════════════════════════════════
class CharterOperator(models.Model):
    """
    A partner airline / charter company that supplies aircraft/yachts to NJH.
    Each operator has one or more User accounts with role='operator'.
    """
    TIER_CHOICES = [
        ('standard',  'Standard Partner'),
        ('preferred', 'Preferred Partner'),
        ('exclusive', 'Exclusive Partner'),
    ]
    STATUS_CHOICES = [
        ('pending',    'Pending Onboarding'),
        ('active',     'Active'),
        ('suspended',  'Suspended'),
        ('terminated', 'Terminated'),
    ]

    reference        = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name             = models.CharField(max_length=200)
    trading_name     = models.CharField(max_length=200, blank=True)
    registration_no  = models.CharField(max_length=100, blank=True, help_text='Company registration / AOC number')
    country          = models.CharField(max_length=100)
    city             = models.CharField(max_length=100, blank=True)
    address          = models.TextField(blank=True)
    primary_contact  = models.CharField(max_length=200, blank=True)
    contact_email    = models.EmailField()
    contact_phone    = models.CharField(max_length=30, blank=True)
    website          = models.URLField(blank=True)
    logo_url         = models.URLField(blank=True)
    tier             = models.CharField(max_length=12, choices=TIER_CHOICES, default='standard')
    status           = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')

    # Commission override — if set, overrides NJHCommissionRule
    commission_override_pct = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text='Leave blank to use platform commission rules'
    )

    # Linked user accounts (operator staff)
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='charter_operators',
        limit_choices_to={'role': 'operator'},
    )

    # Financials
    bank_name          = models.CharField(max_length=200, blank=True)
    bank_account_no    = models.CharField(max_length=100, blank=True)
    bank_swift         = models.CharField(max_length=20, blank=True)
    payout_currency    = models.CharField(max_length=3, default='USD')
    payment_terms_days = models.PositiveIntegerField(default=7, help_text='Days after trip completion to release payout')

    # Safety & compliance
    aoc_number         = models.CharField(max_length=100, blank=True, help_text='Air Operator Certificate')
    insurance_provider = models.CharField(max_length=200, blank=True)
    insurance_expiry   = models.DateField(null=True, blank=True)
    argus_rating       = models.CharField(max_length=20, blank=True, help_text='ARGUS safety rating')
    wyvern_rating      = models.CharField(max_length=20, blank=True)

    # Operational
    base_airports      = models.ManyToManyField(Airport, blank=True, related_name='based_operators')
    operating_regions  = models.JSONField(default=list, help_text='List of IATA region codes, e.g. ["AF","EU"]')
    accepts_last_minute = models.BooleanField(default=True, help_text='Can confirm within 4 hrs')

    notes              = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} [{self.tier}] ({self.status})"

    @property
    def active_aircraft_count(self):
        return self.operator_aircraft.filter(status='available').count()

    @property
    def active_yacht_count(self):
        return self.operator_yachts.filter(status='available').count()


# ═══════════════════════════════════════════════════════════════════════════════
# V2  OPERATOR AIRCRAFT  (real, registered aircraft owned by operators)
# ═══════════════════════════════════════════════════════════════════════════════
class OperatorAircraft(models.Model):
    STATUS_CHOICES = [
        ('available',   'Available'),
        ('booked',      'Booked'),
        ('maintenance', 'Under Maintenance'),
        ('inactive',    'Inactive'),
        ('pending',     'Pending NJH Approval'),
    ]
    CATEGORY_CHOICES = [
        ('light',         'Light Jet'),
        ('midsize',       'Midsize Jet'),
        ('super_midsize', 'Super Midsize'),
        ('heavy',         'Heavy Jet'),
        ('ultra_long',    'Ultra Long Range'),
        ('vip_airliner',  'VIP Airliner'),
        ('turboprop',     'Turboprop'),
        ('helicopter',    'Helicopter'),
    ]

    reference           = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operator            = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='operator_aircraft')
    catalog_aircraft    = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True,
                                             related_name='operator_instances',
                                             help_text='Link to NJH catalog model for specs')

    # Identity
    name                = models.CharField(max_length=200)
    model               = models.CharField(max_length=200)
    category            = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    registration_number = models.CharField(max_length=50, unique=True)
    year_of_manufacture = models.PositiveIntegerField(null=True, blank=True)
    base_airport        = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True, blank=True,
                                             related_name='based_aircraft')

    # Specs
    passenger_capacity  = models.IntegerField()
    range_km            = models.IntegerField()
    cruise_speed_kmh    = models.IntegerField(null=True, blank=True)
    max_baggage_kg      = models.IntegerField(null=True, blank=True)
    wifi_available      = models.BooleanField(default=False)
    pets_allowed        = models.BooleanField(default=False)
    smoking_allowed     = models.BooleanField(default=False)

    # Pricing
    hourly_rate_usd     = models.DecimalField(max_digits=10, decimal_places=2,
                                               help_text="Operator's base rate — NJH adds commission on top")
    min_hours           = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal('1.0'))
    positioning_fee_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'),
                                               help_text='Ferry/positioning cost if aircraft not at origin')
    overnight_fee_usd   = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0'))

    # Status & approval
    status              = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    is_approved         = models.BooleanField(default=False, help_text='NJH admin must approve before listing')
    is_featured         = models.BooleanField(default=False)

    # Maintenance
    total_flight_hours        = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    maintenance_interval_hours = models.IntegerField(default=100)
    last_maintenance_hours    = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    next_maintenance_date     = models.DateField(null=True, blank=True)

    # Documents
    airworthiness_expiry = models.DateField(null=True, blank=True)
    insurance_expiry     = models.DateField(null=True, blank=True)

    # Presentation
    description         = models.TextField(blank=True)
    amenities           = models.JSONField(default=list)
    images              = models.JSONField(default=list, help_text='List of image URLs')
    image_url           = models.URLField(blank=True, help_text='Primary thumbnail')

    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['operator', 'category', 'name']

    @property
    def hours_until_maintenance(self):
        return self.maintenance_interval_hours - (self.total_flight_hours - self.last_maintenance_hours)

    @property
    def maintenance_due(self):
        return self.hours_until_maintenance <= 0

    @property
    def display_hourly_rate(self):
        """Rate shown to clients — operator rate + default commission markup."""
        from core.models import NJHCommissionRule  # avoid circular import
        rule = NJHCommissionRule.objects.filter(is_active=True).order_by('-priority').first()
        pct  = rule.markup_pct if rule else Decimal('20')
        return (self.hourly_rate_usd * (1 + pct / 100)).quantize(Decimal('0.01'), ROUND_HALF_UP)

    def __str__(self):
        return f"{self.name} ({self.registration_number}) — {self.operator.name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  OPERATOR YACHT
# ═══════════════════════════════════════════════════════════════════════════════
class OperatorYacht(models.Model):
    STATUS_CHOICES = [
        ('available',   'Available'),
        ('chartered',   'On Charter'),
        ('maintenance', 'Under Maintenance'),
        ('inactive',    'Inactive'),
        ('pending',     'Pending Approval'),
    ]
    SIZE_CHOICES = [
        ('sailing',     'Sailing Yacht'),
        ('motor',       'Motor Yacht'),
        ('catamaran',   'Catamaran'),
        ('gulet',       'Gulet'),
        ('superyacht',  'Superyacht'),
        ('mega',        'Megayacht (80m+)'),
    ]

    reference        = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operator         = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='operator_yachts')
    catalog_yacht    = models.ForeignKey(Yacht, on_delete=models.SET_NULL, null=True, blank=True,
                                          related_name='operator_instances')

    # Identity
    name             = models.CharField(max_length=200)
    yacht_type       = models.CharField(max_length=15, choices=SIZE_CHOICES)
    flag_state       = models.CharField(max_length=100, blank=True, help_text='Flag / registry country')
    year_built       = models.PositiveIntegerField(null=True, blank=True)
    length_meters    = models.DecimalField(max_digits=6, decimal_places=2)
    beam_meters      = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    draft_meters     = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    home_port        = models.CharField(max_length=200)

    # Capacity
    guest_capacity   = models.PositiveIntegerField()
    cabin_count      = models.PositiveIntegerField(null=True, blank=True)
    crew_count       = models.PositiveIntegerField()

    # Pricing
    daily_rate_usd   = models.DecimalField(max_digits=12, decimal_places=2)
    weekly_rate_usd  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    min_charter_days = models.PositiveIntegerField(default=1)
    apa_percentage   = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('30'),
                                            help_text='APA (Advance Provisioning Allowance) % on top of base rate')

    # Status
    status           = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    is_approved      = models.BooleanField(default=False)
    is_featured      = models.BooleanField(default=False)

    # Presentation
    description      = models.TextField(blank=True)
    amenities        = models.JSONField(default=list)
    images           = models.JSONField(default=list)
    image_url        = models.URLField(blank=True)

    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['operator', 'name']

    def __str__(self):
        return f"{self.name} — {self.operator.name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  AVAILABILITY BLOCK — operators mark blocked dates
# ═══════════════════════════════════════════════════════════════════════════════
class AvailabilityBlock(models.Model):
    BLOCK_TYPE_CHOICES = [
        ('maintenance',  'Maintenance'),
        ('private_use',  'Private Use'),
        ('other_booking','Other Booking'),
        ('seasonal_off', 'Seasonal Off'),
    ]
    ASSET_TYPE_CHOICES = [
        ('aircraft', 'Aircraft'),
        ('yacht',    'Yacht'),
    ]

    operator         = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='availability_blocks')
    asset_type       = models.CharField(max_length=10, choices=ASSET_TYPE_CHOICES)
    aircraft         = models.ForeignKey(OperatorAircraft, on_delete=models.CASCADE,
                                          null=True, blank=True, related_name='availability_blocks')
    yacht            = models.ForeignKey(OperatorYacht, on_delete=models.CASCADE,
                                          null=True, blank=True, related_name='availability_blocks')
    block_type       = models.CharField(max_length=15, choices=BLOCK_TYPE_CHOICES)
    start_date       = models.DateField()
    end_date         = models.DateField()
    notes            = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        asset = self.aircraft or self.yacht
        return f"{asset} blocked {self.start_date} → {self.end_date}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  NJH COMMISSION RULE — tiered / category-based
# ═══════════════════════════════════════════════════════════════════════════════
class NJHCommissionRule(models.Model):
    """
    Rules engine for how NJH earns on each booking.
    Priority: higher number wins. First matching rule applies.
    """
    name             = models.CharField(max_length=200)
    description      = models.TextField(blank=True)
    priority         = models.IntegerField(default=0, help_text='Higher = checked first')

    # Matching conditions (null = matches all)
    operator_tier    = models.CharField(max_length=12, blank=True,
                                         choices=CharterOperator.TIER_CHOICES,
                                         help_text='Leave blank to match any tier')
    asset_category   = models.CharField(max_length=20, blank=True,
                                         help_text='Aircraft category or blank for all')
    min_booking_usd  = models.DecimalField(max_digits=12, decimal_places=2,
                                            null=True, blank=True,
                                            help_text='Applies only if booking value ≥ this')
    max_booking_usd  = models.DecimalField(max_digits=12, decimal_places=2,
                                            null=True, blank=True)

    # What NJH charges the client on top of operator rate
    markup_pct       = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20'),
                                            help_text='% added to operator rate to derive client price')
    # What NJH keeps from the client payment (may differ from markup if we share some with operator)
    commission_pct   = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15'),
                                            help_text='% of client total that NJH retains')

    is_active        = models.BooleanField(default=True)
    effective_from   = models.DateField(default=timezone.now)
    effective_to     = models.DateField(null=True, blank=True)
    created_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                          null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', '-effective_from']

    def __str__(self):
        return f"{self.name} ({self.markup_pct}% markup / {self.commission_pct}% commission)"


# ═══════════════════════════════════════════════════════════════════════════════
# V1  FLIGHT BOOKING (enhanced with V2 operator link)
# ═══════════════════════════════════════════════════════════════════════════════
class FlightBooking(models.Model):
    STATUS_CHOICES = [
        ('inquiry',    'Inquiry'),
        ('rfq_sent',   'RFQ Sent to Operators'),   # V2 NEW
        ('quoted',     'Quoted'),
        ('confirmed',  'Confirmed'),
        ('in_flight',  'In Flight'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
    ]
    TRIP_TYPE_CHOICES = [
        ('one_way',    'One Way'),
        ('round_trip', 'Round Trip'),
        ('multi_leg',  'Multi-Leg'),
    ]

    reference       = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # Guest / client
    guest_name      = models.CharField(max_length=200)
    guest_email     = models.EmailField()
    guest_phone     = models.CharField(max_length=30, blank=True)
    company         = models.CharField(max_length=200, blank=True)
    client          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                         null=True, blank=True, related_name='flight_bookings',
                                         help_text='Linked if client is a registered member')

    # Route
    trip_type       = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default='one_way')
    origin          = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='departures')
    destination     = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='arrivals')
    departure_date  = models.DateField()
    departure_time  = models.TimeField(null=True, blank=True)
    return_date     = models.DateField(null=True, blank=True)
    passenger_count = models.PositiveIntegerField()

    # V1 catalog aircraft
    aircraft        = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True,
                                         related_name='flight_bookings')
    # V2 — assigned operator aircraft
    operator_aircraft = models.ForeignKey('OperatorAircraft', on_delete=models.SET_NULL,
                                           null=True, blank=True, related_name='flight_bookings')
    assigned_operator = models.ForeignKey('CharterOperator', on_delete=models.SET_NULL,
                                           null=True, blank=True, related_name='flight_bookings')

    # Preferences
    preferred_category         = models.CharField(max_length=30, blank=True)
    special_requests           = models.TextField(blank=True)
    catering_requested         = models.BooleanField(default=False)
    ground_transport_requested = models.BooleanField(default=False)
    concierge_requested        = models.BooleanField(default=False)

    # Pricing (V1 + V2 breakdown)
    operator_cost_usd   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                               help_text="What NJH pays the operator")
    quoted_price_usd    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                               help_text="Total price quoted to client (includes NJH margin)")
    commission_pct      = models.DecimalField(max_digits=5, decimal_places=2, default=15)
    commission_usd      = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    net_revenue_usd     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                               help_text="NJH net after paying operator")

    # Payment
    stripe_payment_id  = models.CharField(max_length=200, blank=True)
    payment_status     = models.CharField(max_length=20, default='unpaid')

    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inquiry')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.quoted_price_usd is not None and self.operator_cost_usd is not None:
            pct = Decimal(str(self.commission_pct or 15))
            price = Decimal(str(self.quoted_price_usd))
            cost  = Decimal(str(self.operator_cost_usd))
            self.commission_usd  = (price * pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            self.net_revenue_usd = (price - cost).quantize(Decimal('0.01'), ROUND_HALF_UP)
        elif self.quoted_price_usd is not None:
            pct = Decimal(str(self.commission_pct or 15))
            price = Decimal(str(self.quoted_price_usd))
            self.commission_usd  = (price * pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            self.net_revenue_usd = (price - self.commission_usd).quantize(Decimal('0.01'), ROUND_HALF_UP)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Flight {str(self.reference)[:8]} | {self.origin.code}→{self.destination.code} | {self.guest_name}"


class FlightLeg(models.Model):
    booking        = models.ForeignKey(FlightBooking, on_delete=models.CASCADE, related_name='legs')
    leg_number     = models.PositiveIntegerField()
    origin         = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='leg_departures')
    destination    = models.ForeignKey(Airport, on_delete=models.PROTECT, related_name='leg_arrivals')
    departure_date = models.DateField()
    departure_time = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ['leg_number']


# ═══════════════════════════════════════════════════════════════════════════════
# V2  RFQ BID — operator responds to a FlightBooking with a price
# ═══════════════════════════════════════════════════════════════════════════════
class RFQBid(models.Model):
    """
    When NJH sends an RFQ to multiple operators, each operator submits a bid.
    NJH admin selects the winning bid and uses it to create the quote for the client.
    """
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('shortlisted', 'Shortlisted'),
        ('accepted',  'Accepted'),
        ('rejected',  'Rejected'),
        ('expired',   'Expired'),
    ]

    booking          = models.ForeignKey(FlightBooking, on_delete=models.CASCADE, related_name='rfq_bids')
    operator         = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='rfq_bids')
    aircraft         = models.ForeignKey(OperatorAircraft, on_delete=models.SET_NULL,
                                          null=True, blank=True, related_name='rfq_bids')
    submitted_by     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                          null=True, blank=True)

    # Operator's bid details
    operator_price_usd  = models.DecimalField(max_digits=12, decimal_places=2,
                                               help_text="Price operator charges NJH")
    estimated_hours     = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    positioning_cost    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    catering_cost       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overnight_cost      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes               = models.TextField(blank=True)
    valid_until         = models.DateTimeField(null=True, blank=True)

    # NJH internal — client price after markup
    njh_client_price    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    njh_margin_usd      = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    status              = models.CharField(max_length=12, choices=STATUS_CHOICES, default='submitted')
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['operator_price_usd']

    def __str__(self):
        return f"Bid by {self.operator.name} on {self.booking} — ${self.operator_price_usd}"


# ═══════════════════════════════════════════════════════════════════════════════
# V1  YACHT CHARTER (enhanced)
# ═══════════════════════════════════════════════════════════════════════════════
class YachtCharter(models.Model):
    STATUS_CHOICES = [
        ('inquiry',   'Inquiry'),
        ('rfq_sent',  'RFQ Sent to Operators'),
        ('quoted',    'Quoted'),
        ('confirmed', 'Confirmed'),
        ('active',    'Active Charter'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    reference           = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name          = models.CharField(max_length=200)
    guest_email         = models.EmailField()
    guest_phone         = models.CharField(max_length=30, blank=True)
    company             = models.CharField(max_length=200, blank=True)
    client              = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                             null=True, blank=True, related_name='yacht_charters')

    # V1 catalog yacht
    yacht               = models.ForeignKey(Yacht, on_delete=models.SET_NULL, null=True, blank=True)
    # V2 operator yacht
    operator_yacht      = models.ForeignKey(OperatorYacht, on_delete=models.SET_NULL,
                                             null=True, blank=True, related_name='charters')
    assigned_operator   = models.ForeignKey(CharterOperator, on_delete=models.SET_NULL,
                                             null=True, blank=True, related_name='yacht_charters')

    departure_port      = models.CharField(max_length=200)
    destination_port    = models.CharField(max_length=200, blank=True)
    charter_start       = models.DateField()
    charter_end         = models.DateField()
    guest_count         = models.PositiveIntegerField()
    itinerary_description = models.TextField(blank=True)
    special_requests    = models.TextField(blank=True)

    operator_cost_usd   = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    quoted_price_usd    = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    commission_pct      = models.DecimalField(max_digits=5, decimal_places=2, default=15)
    commission_usd      = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    net_revenue_usd     = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    apa_amount_usd      = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                               help_text='Advance Provisioning Allowance')

    stripe_payment_id   = models.CharField(max_length=200, blank=True)
    payment_status      = models.CharField(max_length=20, default='unpaid')

    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inquiry')
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.quoted_price_usd and self.operator_cost_usd:
            price = Decimal(str(self.quoted_price_usd))
            cost  = Decimal(str(self.operator_cost_usd))
            pct   = Decimal(str(self.commission_pct or 15))
            self.commission_usd  = (price * pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            self.net_revenue_usd = (price - cost).quantize(Decimal('0.01'), ROUND_HALF_UP)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Yacht {str(self.reference)[:8]} | {self.guest_name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  OPERATOR BOOKING — internal record once operator is confirmed
# ═══════════════════════════════════════════════════════════════════════════════
class OperatorBooking(models.Model):
    """
    Created when NJH confirms a flight/yacht booking with a specific operator.
    Tracks the operator-facing side of each booking.
    """
    ASSET_TYPE_CHOICES = [('aircraft', 'Aircraft'), ('yacht', 'Yacht')]
    STATUS_CHOICES = [
        ('sent',       'Sent to Operator'),
        ('accepted',   'Operator Accepted'),
        ('rejected',   'Operator Rejected'),
        ('in_service', 'In Service'),
        ('completed',  'Completed'),
        ('disputed',   'Disputed'),
    ]

    reference          = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operator           = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='operator_bookings')
    asset_type         = models.CharField(max_length=10, choices=ASSET_TYPE_CHOICES)
    operator_aircraft  = models.ForeignKey(OperatorAircraft, on_delete=models.SET_NULL,
                                            null=True, blank=True, related_name='operator_bookings')
    operator_yacht     = models.ForeignKey(OperatorYacht, on_delete=models.SET_NULL,
                                            null=True, blank=True, related_name='operator_bookings')

    # Link back to public booking
    flight_booking     = models.OneToOneField(FlightBooking, on_delete=models.SET_NULL,
                                               null=True, blank=True, related_name='operator_booking')
    yacht_charter      = models.OneToOneField(YachtCharter, on_delete=models.SET_NULL,
                                               null=True, blank=True, related_name='operator_booking')

    # Financials
    operator_payout_usd = models.DecimalField(max_digits=12, decimal_places=2,
                                               help_text="Amount NJH owes the operator")
    njh_margin_usd      = models.DecimalField(max_digits=12, decimal_places=2)
    total_client_usd    = models.DecimalField(max_digits=12, decimal_places=2)

    # Operator confirmation
    operator_reference  = models.CharField(max_length=200, blank=True,
                                            help_text="Operator's own booking reference")
    operator_notes      = models.TextField(blank=True)
    accepted_at         = models.DateTimeField(null=True, blank=True)
    rejected_at         = models.DateTimeField(null=True, blank=True)
    rejection_reason    = models.TextField(blank=True)

    status              = models.CharField(max_length=12, choices=STATUS_CHOICES, default='sent')
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OpBooking {str(self.reference)[:8]} — {self.operator.name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  OPERATOR PAYOUT LOG
# ═══════════════════════════════════════════════════════════════════════════════
class OperatorPayoutLog(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('processing', 'Processing'),
        ('paid',       'Paid'),
        ('failed',     'Failed'),
        ('disputed',   'Disputed'),
    ]

    reference          = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operator           = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='payouts')
    operator_booking   = models.ForeignKey(OperatorBooking, on_delete=models.CASCADE,
                                            related_name='payout_logs', null=True, blank=True)
    amount_usd         = models.DecimalField(max_digits=12, decimal_places=2)
    currency           = models.CharField(max_length=3, default='USD')
    exchange_rate      = models.DecimalField(max_digits=10, decimal_places=6, default=Decimal('1.0'))
    amount_local       = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    payment_method     = models.CharField(max_length=50, blank=True, help_text='Wire, SWIFT, M-Pesa, etc.')
    bank_reference     = models.CharField(max_length=200, blank=True)
    paid_at            = models.DateTimeField(null=True, blank=True)
    due_date           = models.DateField(null=True, blank=True)

    status             = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    notes              = models.TextField(blank=True)
    processed_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                            null=True, blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout {self.amount_usd} USD → {self.operator.name} [{self.status}]"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  OPERATOR REVIEW
# ═══════════════════════════════════════════════════════════════════════════════
class OperatorReview(models.Model):
    operator         = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='reviews')
    operator_booking = models.OneToOneField(OperatorBooking, on_delete=models.CASCADE, related_name='review')
    reviewer_name    = models.CharField(max_length=200)
    reviewer_email   = models.EmailField()
    client           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                          null=True, blank=True)

    rating_overall   = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    rating_punctuality = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    rating_cleanliness = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    rating_crew        = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    comment          = models.TextField(blank=True)
    is_published     = models.BooleanField(default=False, help_text='NJH must approve before showing')
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review: {self.rating_overall}★ for {self.operator.name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  DOCUMENT UPLOAD — attach files to bookings / operators
# ═══════════════════════════════════════════════════════════════════════════════
class DocumentUpload(models.Model):
    DOC_TYPE_CHOICES = [
        ('passport',         'Passport / ID'),
        ('insurance',        'Insurance Certificate'),
        ('airworthiness',    'Airworthiness Certificate'),
        ('aoc',              'AOC / License'),
        ('itinerary',        'Itinerary'),
        ('invoice',          'Invoice'),
        ('contract',         'Contract'),
        ('photo',            'Photo'),
        ('other',            'Other'),
    ]
    LINKED_TO_CHOICES = [
        ('flight_booking',   'Flight Booking'),
        ('yacht_charter',    'Yacht Charter'),
        ('operator',         'Charter Operator'),
        ('operator_aircraft','Operator Aircraft'),
        ('operator_yacht',   'Operator Yacht'),
        ('operator_booking', 'Operator Booking'),
    ]

    reference        = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    uploaded_by      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                          null=True, blank=True)
    doc_type         = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    linked_to        = models.CharField(max_length=20, choices=LINKED_TO_CHOICES)
    related_id       = models.IntegerField(help_text='PK of the linked object')
    file_name        = models.CharField(max_length=300)
    file_url         = models.URLField()
    file_size_kb     = models.IntegerField(null=True, blank=True)
    notes            = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.doc_type} — {self.file_name}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  CLIENT NOTIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
class ClientNotification(models.Model):
    TYPE_CHOICES = [
        ('booking_confirmed',  'Booking Confirmed'),
        ('quote_received',     'Quote Received'),
        ('status_update',      'Status Update'),
        ('payment_received',   'Payment Received'),
        ('document_ready',     'Document Ready'),
        ('reminder',           'Reminder'),
        ('general',            'General'),
    ]

    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                       related_name='notifications')
    notif_type    = models.CharField(max_length=25, choices=TYPE_CHOICES, default='general')
    title         = models.CharField(max_length=300)
    body          = models.TextField()
    link          = models.CharField(max_length=500, blank=True, help_text='Frontend route to open on click')
    is_read       = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notif_type}] {self.title} → {self.user.username}"


# ═══════════════════════════════════════════════════════════════════════════════
# V2  WEBHOOK LOG
# ═══════════════════════════════════════════════════════════════════════════════
class WebhookLog(models.Model):
    """Outbound webhook deliveries to operator systems."""
    EVENT_CHOICES = [
        ('booking_created',   'Booking Created'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('rfq_issued',        'RFQ Issued'),
        ('payout_initiated',  'Payout Initiated'),
    ]

    operator     = models.ForeignKey(CharterOperator, on_delete=models.CASCADE, related_name='webhook_logs')
    event        = models.CharField(max_length=25, choices=EVENT_CHOICES)
    payload      = models.JSONField()
    endpoint_url = models.URLField()
    http_status  = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    success      = models.BooleanField(default=False)
    attempts     = models.IntegerField(default=1)
    sent_at      = models.DateTimeField(auto_now_add=True)
    next_retry   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Webhook {self.event} → {self.operator.name} [{self.http_status}]"


# ═══════════════════════════════════════════════════════════════════════════════
# V1 MODELS — ALL PRESERVED EXACTLY AS-IS
# ═══════════════════════════════════════════════════════════════════════════════

class LeaseInquiry(models.Model):
    ASSET_TYPE_CHOICES = [('aircraft', 'Aircraft'), ('yacht', 'Yacht')]
    LEASE_DURATION_CHOICES = [
        ('monthly', 'Monthly'), ('quarterly', 'Quarterly'),
        ('annual', 'Annual'), ('multi_year', 'Multi-Year'),
    ]
    reference            = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name           = models.CharField(max_length=200)
    guest_email          = models.EmailField()
    guest_phone          = models.CharField(max_length=30, blank=True)
    company              = models.CharField(max_length=200, blank=True)
    asset_type           = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    aircraft             = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True)
    yacht                = models.ForeignKey(Yacht, on_delete=models.SET_NULL, null=True, blank=True)
    operator_aircraft    = models.ForeignKey(OperatorAircraft, on_delete=models.SET_NULL,
                                              null=True, blank=True, related_name='lease_inquiries')
    lease_duration       = models.CharField(max_length=20, choices=LEASE_DURATION_CHOICES)
    preferred_start_date = models.DateField()
    budget_range         = models.CharField(max_length=100, blank=True)
    usage_description    = models.TextField(blank=True)
    additional_notes     = models.TextField(blank=True)
    status               = models.CharField(max_length=20, default='pending')
    created_at           = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lease {str(self.reference)[:8]} | {self.asset_type} | {self.guest_name}"


class FlightInquiry(models.Model):
    reference                    = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    guest_name                   = models.CharField(max_length=200)
    guest_email                  = models.EmailField()
    guest_phone                  = models.CharField(max_length=30, blank=True)
    origin_description           = models.CharField(max_length=300)
    destination_description      = models.CharField(max_length=300)
    approximate_date             = models.CharField(max_length=100, blank=True)
    passenger_count              = models.PositiveIntegerField(default=1)
    preferred_aircraft_category  = models.CharField(max_length=30, blank=True)
    message                      = models.TextField()
    created_at                   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry {str(self.reference)[:8]} | {self.origin_description}→{self.destination_description}"


class ContactInquiry(models.Model):
    SUBJECT_CHOICES = [
        ('general', 'General Inquiry'), ('support', 'Customer Support'),
        ('media', 'Media & Press'), ('partnership', 'Partnership'),
        ('careers', 'Careers'), ('other', 'Other'),
    ]
    reference  = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    full_name  = models.CharField(max_length=200)
    email      = models.EmailField()
    phone      = models.CharField(max_length=30, blank=True)
    company    = models.CharField(max_length=200, blank=True)
    subject    = models.CharField(max_length=30, choices=SUBJECT_CHOICES, default='general')
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contact {str(self.reference)[:8]} | {self.full_name}"


class GroupCharterInquiry(models.Model):
    GROUP_TYPE_CHOICES = [
        ('corporate', 'Corporate / Business'), ('sports_team', 'Sports Team'),
        ('entertainment', 'Entertainment / Film'), ('incentive', 'Incentive Group'),
        ('wedding', 'Wedding Party'), ('government', 'Government / Diplomatic'), ('other', 'Other'),
    ]
    reference                  = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name               = models.CharField(max_length=200)
    email                      = models.EmailField()
    phone                      = models.CharField(max_length=30, blank=True)
    company                    = models.CharField(max_length=200, blank=True)
    group_type                 = models.CharField(max_length=30, choices=GROUP_TYPE_CHOICES)
    group_size                 = models.PositiveIntegerField()
    origin_description         = models.CharField(max_length=300)
    destination_description    = models.CharField(max_length=300)
    departure_date             = models.DateField(null=True, blank=True)
    return_date                = models.DateField(null=True, blank=True)
    is_round_trip              = models.BooleanField(default=False)
    preferred_aircraft_category = models.CharField(max_length=30, blank=True)
    catering_required          = models.BooleanField(default=False)
    ground_transport_required  = models.BooleanField(default=False)
    budget_range               = models.CharField(max_length=100, blank=True)
    additional_notes           = models.TextField(blank=True)
    status                     = models.CharField(max_length=20, default='pending')
    created_at                 = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group {str(self.reference)[:8]} | {self.group_type} | {self.group_size} pax"


class AirCargoInquiry(models.Model):
    CARGO_TYPE_CHOICES = [
        ('general', 'General Cargo'), ('perishables', 'Perishables / Fresh Produce'),
        ('pharma', 'Pharmaceuticals / Medical'), ('dangerous_goods', 'Dangerous Goods (DG)'),
        ('live_animals', 'Live Animals'), ('artwork', 'Artwork / High Value'),
        ('automotive', 'Automotive / Vehicles'), ('oversized', 'Oversized / Heavy Lift'),
        ('humanitarian', 'Humanitarian / Aid'), ('gold_minerals', 'Gold / Precious Minerals'),
        ('other', 'Other'),
    ]
    URGENCY_CHOICES = [
        ('standard', 'Standard (3–5 days)'),
        ('express', 'Express (24–48 hrs)'),
        ('critical', 'Critical / AOG (same day)'),
    ]
    reference                  = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name               = models.CharField(max_length=200)
    email                      = models.EmailField()
    phone                      = models.CharField(max_length=30, blank=True)
    company                    = models.CharField(max_length=200, blank=True)
    cargo_type                 = models.CharField(max_length=30, choices=CARGO_TYPE_CHOICES)
    cargo_description          = models.TextField()
    weight_kg                  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    volume_m3                  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dimensions                 = models.CharField(max_length=200, blank=True)
    origin_description         = models.CharField(max_length=300)
    destination_description    = models.CharField(max_length=300)
    pickup_date                = models.DateField(null=True, blank=True)
    urgency                    = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='standard')
    is_hazardous               = models.BooleanField(default=False)
    requires_temperature_control = models.BooleanField(default=False)
    insurance_required         = models.BooleanField(default=False)
    customs_assistance_needed  = models.BooleanField(default=False)
    additional_notes           = models.TextField(blank=True)
    status                     = models.CharField(max_length=20, default='pending')
    created_at                 = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cargo {str(self.reference)[:8]} | {self.cargo_type} | {self.origin_description}→{self.destination_description}"


class AircraftSalesInquiry(models.Model):
    INQUIRY_TYPE_CHOICES = [
        ('buy', 'Looking to Buy'), ('sell', 'Looking to Sell'),
        ('trade', 'Trade / Part Exchange'), ('valuation', 'Valuation Only'),
    ]
    BUDGET_CHOICES = [
        ('under_2m', 'Under $2M'), ('2m_5m', '$2M–$5M'), ('5m_15m', '$5M–$15M'),
        ('15m_30m', '$15M–$30M'), ('30m_60m', '$30M–$60M'), ('over_60m', 'Over $60M'),
        ('not_disclosed', 'Prefer not to say'),
    ]
    reference             = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    contact_name          = models.CharField(max_length=200)
    email                 = models.EmailField()
    phone                 = models.CharField(max_length=30, blank=True)
    company               = models.CharField(max_length=200, blank=True)
    inquiry_type          = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES)
    preferred_category    = models.CharField(max_length=30, blank=True)
    preferred_make_model  = models.CharField(max_length=200, blank=True)
    budget_range          = models.CharField(max_length=20, choices=BUDGET_CHOICES, blank=True)
    new_or_pre_owned      = models.CharField(max_length=20, choices=[('new','New'),('pre_owned','Pre-Owned'),('either','Either')], default='either')
    aircraft_make         = models.CharField(max_length=100, blank=True)
    aircraft_model        = models.CharField(max_length=100, blank=True)
    year_of_manufacture   = models.PositiveIntegerField(null=True, blank=True)
    serial_number         = models.CharField(max_length=100, blank=True)
    total_flight_hours    = models.PositiveIntegerField(null=True, blank=True)
    asking_price_usd      = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    message               = models.TextField(blank=True)
    status                = models.CharField(max_length=20, default='pending')
    created_at            = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sales {str(self.reference)[:8]} | {self.inquiry_type} | {self.contact_name}"


# ─── V1 Membership System ────────────────────────────────────────────────────
class MembershipTier(models.Model):
    TIER_CHOICES = [('basic', 'Basic'), ('premium', 'Premium'), ('corporate', 'Corporate')]
    name                 = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    display_name         = models.CharField(max_length=100)
    monthly_fee_usd      = models.DecimalField(max_digits=10, decimal_places=2)
    annual_fee_usd       = models.DecimalField(max_digits=10, decimal_places=2)
    hourly_discount_pct  = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    priority_booking     = models.BooleanField(default=False)
    dedicated_support    = models.BooleanField(default=False)
    exclusive_listings   = models.BooleanField(default=False)
    max_monthly_bookings = models.IntegerField(default=10)
    description          = models.TextField(blank=True)
    features_list        = models.JSONField(default=list)
    is_active            = models.BooleanField(default=True)

    def __str__(self):
        return self.display_name


class Membership(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'), ('expired', 'Expired'), ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'), ('pending', 'Pending Payment'),
    ]
    BILLING_CHOICES = [('monthly', 'Monthly'), ('annual', 'Annual')]

    reference      = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='membership')
    tier           = models.ForeignKey(MembershipTier, on_delete=models.PROTECT)
    status         = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    billing_cycle  = models.CharField(max_length=10, choices=BILLING_CHOICES, default='annual')
    start_date     = models.DateField(null=True, blank=True)
    end_date       = models.DateField(null=True, blank=True)
    auto_renew     = models.BooleanField(default=True)
    stripe_sub_id  = models.CharField(max_length=200, blank=True)
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    @property
    def is_active(self):
        return self.status == 'active' and (self.end_date is None or self.end_date >= timezone.now().date())

    @property
    def days_remaining(self):
        if self.end_date:
            return max((self.end_date - timezone.now().date()).days, 0)
        return None

    def __str__(self):
        return f"{self.user.username} – {self.tier.display_name} ({self.status})"


# ─── V1 MarketplaceAircraft / MaintenanceLog / MarketplaceBooking ────────────
class MarketplaceAircraft(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'), ('in_flight', 'In Flight'),
        ('maintenance', 'Under Maintenance'), ('inactive', 'Inactive'), ('pending', 'Pending Approval'),
    ]
    CATEGORY_CHOICES = [
        ('light', 'Light Jet'), ('midsize', 'Midsize Jet'), ('super_midsize', 'Super Midsize'),
        ('heavy', 'Heavy Jet'), ('ultra_long', 'Ultra Long Range'), ('vip_airliner', 'VIP Airliner'),
    ]
    reference                    = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    owner                        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                                      related_name='owned_aircraft', limit_choices_to={'role': 'owner'})
    name                         = models.CharField(max_length=200)
    model                        = models.CharField(max_length=200)
    category                     = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    registration_number          = models.CharField(max_length=50, unique=True)
    base_location                = models.CharField(max_length=200)
    passenger_capacity           = models.IntegerField()
    range_km                     = models.IntegerField()
    cruise_speed_kmh             = models.IntegerField(null=True, blank=True)
    hourly_rate_usd              = models.DecimalField(max_digits=10, decimal_places=2)
    status                       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    is_approved                  = models.BooleanField(default=False)
    exclusive_tiers              = models.ManyToManyField(MembershipTier, blank=True)
    total_flight_hours           = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    maintenance_interval_hours   = models.IntegerField(default=100)
    last_maintenance_hours       = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    insurance_expiry             = models.DateField(null=True, blank=True)
    airworthiness_expiry         = models.DateField(null=True, blank=True)
    description                  = models.TextField(blank=True)
    amenities                    = models.JSONField(default=list)
    image_url                    = models.URLField(blank=True)
    created_at                   = models.DateTimeField(auto_now_add=True)
    updated_at                   = models.DateTimeField(auto_now=True)

    @property
    def hours_until_maintenance(self):
        return self.maintenance_interval_hours - (self.total_flight_hours - self.last_maintenance_hours)

    @property
    def maintenance_due(self):
        return self.hours_until_maintenance <= 0

    def __str__(self):
        return f"{self.name} ({self.registration_number})"


class MaintenanceLog(models.Model):
    TYPE_CHOICES = [
        ('routine', 'Routine Service'), ('repair', 'Repair'),
        ('inspection', 'Inspection'), ('upgrade', 'Upgrade'), ('emergency', 'Emergency'),
    ]
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'), ('in_progress', 'In Progress'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]
    aircraft          = models.ForeignKey(MarketplaceAircraft, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_type  = models.CharField(max_length=15, choices=TYPE_CHOICES)
    status            = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date    = models.DateField()
    completed_date    = models.DateField(null=True, blank=True)
    flight_hours_at   = models.DecimalField(max_digits=10, decimal_places=1)
    description       = models.TextField()
    technician        = models.CharField(max_length=200, blank=True)
    cost_usd          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes             = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.aircraft.name} – {self.maintenance_type} on {self.scheduled_date}"


class MarketplaceBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'), ('confirmed', 'Confirmed'),
        ('in_flight', 'In Flight'), ('completed', 'Completed'),
        ('cancelled', 'Cancelled'), ('disputed', 'Disputed'),
    ]
    TRIP_CHOICES = [('one_way', 'One Way'), ('round_trip', 'Round Trip')]

    reference          = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    client             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    aircraft           = models.ForeignKey(MarketplaceAircraft, on_delete=models.PROTECT, related_name='bookings')
    membership         = models.ForeignKey(Membership, on_delete=models.SET_NULL, null=True, blank=True)
    trip_type          = models.CharField(max_length=12, choices=TRIP_CHOICES, default='one_way')
    origin             = models.CharField(max_length=200)
    destination        = models.CharField(max_length=200)
    departure_datetime = models.DateTimeField()
    return_datetime    = models.DateTimeField(null=True, blank=True)
    estimated_hours    = models.DecimalField(max_digits=6, decimal_places=1)
    passenger_count    = models.IntegerField()
    status             = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    special_requests   = models.TextField(blank=True)
    gross_amount_usd   = models.DecimalField(max_digits=12, decimal_places=2)
    commission_pct     = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    commission_usd     = models.DecimalField(max_digits=12, decimal_places=2)
    net_owner_usd      = models.DecimalField(max_digits=12, decimal_places=2)
    discount_applied   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    stripe_payment_id  = models.CharField(max_length=200, blank=True)
    payment_status     = models.CharField(max_length=20, default='unpaid')
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.commission_usd = round(self.gross_amount_usd * self.commission_pct / 100, 2)
        self.net_owner_usd  = round(self.gross_amount_usd - self.commission_usd, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"MktBooking {str(self.reference)[:8]} | {self.client.username}"


# ─── V1 Other Models ─────────────────────────────────────────────────────────
class CommissionSetting(models.Model):
    rate_pct       = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    effective_from = models.DateField(default=timezone.now)
    notes          = models.TextField(blank=True)
    set_by         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.rate_pct}% from {self.effective_from}"


class PaymentRecord(models.Model):
    TYPE_CHOICES   = [('membership', 'Membership Fee'), ('booking', 'Flight Booking'), ('refund', 'Refund')]
    STATUS_CHOICES = [('pending', 'Pending'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('refunded', 'Refunded')]

    reference          = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user               = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    payment_type       = models.CharField(max_length=12, choices=TYPE_CHOICES)
    booking            = models.ForeignKey(MarketplaceBooking, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_records')
    membership         = models.ForeignKey(Membership, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_records')
    amount_usd         = models.DecimalField(max_digits=12, decimal_places=2)
    currency           = models.CharField(max_length=3, default='USD')
    status             = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    stripe_payment_id  = models.CharField(max_length=200, blank=True)
    stripe_receipt_url = models.URLField(blank=True)
    description        = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_type} – ${self.amount_usd} – {self.status}"


class SavedRoute(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_routes')
    name        = models.CharField(max_length=200)
    origin      = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    notes       = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Dispute(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'), ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'), ('closed', 'Closed'),
    ]
    reference   = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    booking     = models.ForeignKey(MarketplaceBooking, on_delete=models.CASCADE, related_name='disputes')
    raised_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject     = models.CharField(max_length=300)
    description = models.TextField()
    status      = models.CharField(max_length=12, choices=STATUS_CHOICES, default='open')
    resolution  = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dispute {str(self.reference)[:8]} – {self.subject[:40]}"


class EmailLog(models.Model):
    INQUIRY_TYPE_CHOICES = [
        ('flight_booking', 'Flight Booking'), ('yacht_charter', 'Yacht Charter'),
        ('lease_inquiry', 'Lease Inquiry'), ('flight_inquiry', 'Flight Inquiry'),
        ('contact', 'Contact'), ('group_charter', 'Group Charter'),
        ('air_cargo', 'Air Cargo'), ('aircraft_sales', 'Aircraft Sales'),
        ('marketplace_booking', 'Marketplace Booking'),
        ('operator', 'Operator Communication'),   # V2 NEW
        ('rfq', 'RFQ Dispatch'),                  # V2 NEW
        ('payout', 'Payout Notification'),         # V2 NEW
        ('general', 'General'),
    ]
    reference    = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    sent_by      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_emails')
    to_email     = models.EmailField()
    to_name      = models.CharField(max_length=200, blank=True)
    subject      = models.CharField(max_length=500)
    body         = models.TextField()
    inquiry_type = models.CharField(max_length=30, choices=INQUIRY_TYPE_CHOICES, default='general')
    related_id   = models.IntegerField(null=True, blank=True)
    sent_at      = models.DateTimeField(auto_now_add=True)
    success      = models.BooleanField(default=True)
    error_msg    = models.TextField(blank=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Email to {self.to_email} re: {self.inquiry_type} [{self.sent_at:%Y-%m-%d}]"


class JobPosting(models.Model):
    DEPARTMENT_CHOICES = [
        ('operations', 'Flight Operations'), ('commercial', 'Commercial & Sales'),
        ('charter', 'Charter Services'), ('technical', 'Technical & Engineering'),
        ('concierge', 'Concierge & Guest Services'), ('finance', 'Finance & Compliance'),
        ('it', 'Technology'), ('hr', 'Human Resources'),
        ('marketing', 'Marketing & Communications'), ('management', 'Senior Management'),
        ('partnerships', 'Partnerships & Operators'),  # V2 NEW
    ]
    LOCATION_CHOICES = [
        ('nairobi', 'Nairobi, Kenya'), ('dubai', 'Dubai, UAE'), ('london', 'London, UK'),
        ('johannesburg', 'Johannesburg, South Africa'), ('lagos', 'Lagos, Nigeria'),
        ('new_york', 'New York, USA'), ('remote', 'Remote / Global'),
    ]
    TYPE_CHOICES = [
        ('full_time', 'Full Time'), ('part_time', 'Part Time'),
        ('contract', 'Contract'), ('internship', 'Internship'),
    ]
    title        = models.CharField(max_length=200)
    department   = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES)
    location     = models.CharField(max_length=30, choices=LOCATION_CHOICES)
    job_type     = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full_time')
    description  = models.TextField()
    requirements = models.TextField(blank=True)
    benefits     = models.TextField(blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    is_active    = models.BooleanField(default=True)
    is_featured  = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    deadline     = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.title} — {self.get_department_display()}"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('received', 'Received'), ('reviewing', 'Under Review'),
        ('shortlisted', 'Shortlisted'), ('interview', 'Interview Scheduled'),
        ('offered', 'Offer Extended'), ('hired', 'Hired'),
        ('rejected', 'Not Successful'), ('withdrawn', 'Withdrawn'),
    ]
    reference         = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    job               = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    full_name         = models.CharField(max_length=200)
    email             = models.EmailField()
    phone             = models.CharField(max_length=30, blank=True)
    nationality       = models.CharField(max_length=100, blank=True)
    current_role      = models.CharField(max_length=200, blank=True)
    linkedin_url      = models.URLField(blank=True)
    portfolio_url     = models.URLField(blank=True)
    cover_letter      = models.TextField()
    years_experience  = models.PositiveIntegerField(default=0)
    resume_url        = models.URLField(blank=True)
    status            = models.CharField(max_length=15, choices=STATUS_CHOICES, default='received')
    notes             = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-created_at']
        unique_together = [['job', 'email']]

    def __str__(self):
        return f"{self.full_name} → {self.job.title} [{self.status}]"