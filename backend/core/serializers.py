# ═══════════════════════════════════════════════════════════════════════════════
# NairobiJetHouse V2 — serializers.py
# ═══════════════════════════════════════════════════════════════════════════════
from decimal import Decimal, ROUND_HALF_UP
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg, YachtCharter,
    LeaseInquiry, FlightInquiry, ContactInquiry,
    GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog,
    MarketplaceBooking, CommissionSetting,
    PaymentRecord, SavedRoute, Dispute, EmailLog,
    JobPosting, JobApplication,
    # V2
    CharterOperator, OperatorAircraft, OperatorYacht,
    AvailabilityBlock, NJHCommissionRule,
    RFQBid, OperatorBooking, OperatorPayoutLog,
    OperatorReview, DocumentUpload, ClientNotification, WebhookLog, LeaseBooking , AirCargoBooking
)


# ═══════════════════════════════════════════════════════════════════════════════
# CORE CATALOG
# ═══════════════════════════════════════════════════════════════════════════════

class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'


class AircraftSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Aircraft
        fields = '__all__'


class YachtSerializer(serializers.ModelSerializer):
    size_display = serializers.CharField(source='get_size_category_display', read_only=True)

    class Meta:
        model = Yacht
        fields = '__all__'


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

class UserRegistrationSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'company', 'role', 'password', 'password2']
        extra_kwargs = {'role': {'required': False}}

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account disabled.')
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    membership_status = serializers.SerializerMethodField()
    membership_tier   = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'company', 'role', 'avatar_url', 'created_at',
                  'membership_status', 'membership_tier']
        read_only_fields = ['id', 'username', 'role', 'created_at']

    def get_membership_status(self, obj):
        try:
            return obj.membership.status
        except Exception:
            return None

    def get_membership_tier(self, obj):
        try:
            return obj.membership.tier.display_name
        except Exception:
            return None


class UserAdminSerializer(serializers.ModelSerializer):
    membership_status = serializers.SerializerMethodField()
    membership_tier   = serializers.SerializerMethodField()
    full_name         = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'phone', 'company', 'role', 'is_active', 'created_at',
                  'membership_status', 'membership_tier']

    def get_membership_status(self, obj):
        try:
            return obj.membership.status
        except Exception:
            return None

    def get_membership_tier(self, obj):
        try:
            return obj.membership.tier.display_name
        except Exception:
            return None

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ═══════════════════════════════════════════════════════════════════════════════
# MEMBERSHIP
# ═══════════════════════════════════════════════════════════════════════════════

class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MembershipTier
        fields = '__all__'


class MembershipSerializer(serializers.ModelSerializer):
    tier_detail    = MembershipTierSerializer(source='tier', read_only=True)
    tier_name      = serializers.CharField(source='tier.display_name', read_only=True)
    days_remaining = serializers.ReadOnlyField()
    is_active      = serializers.ReadOnlyField()
    user_name      = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email     = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = Membership
        fields = '__all__'
        read_only_fields = ['reference', 'user', 'created_at', 'updated_at']


class MembershipCreateSerializer(serializers.Serializer):
    tier_name     = serializers.ChoiceField(choices=['basic', 'premium', 'corporate'])
    billing_cycle = serializers.ChoiceField(choices=['monthly', 'annual'])
    auto_renew    = serializers.BooleanField(default=True)


# ═══════════════════════════════════════════════════════════════════════════════
# FLIGHT BOOKING (V1 + V2 fields)
# ═══════════════════════════════════════════════════════════════════════════════

class FlightLegSerializer(serializers.ModelSerializer):
    origin_detail      = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)

    class Meta:
        model  = FlightLeg
        fields = '__all__'


class FlightBookingSerializer(serializers.ModelSerializer):
    legs               = FlightLegSerializer(many=True, read_only=True)
    origin_detail      = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)
    aircraft_detail    = AircraftSerializer(source='aircraft', read_only=True)
    reference          = serializers.UUIDField(read_only=True)
    status_display     = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = FlightBooking
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'quoted_price_usd', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('trip_type') == 'round_trip' and not data.get('return_date'):
            raise serializers.ValidationError({'return_date': 'Return date required for round trips.'})
        if data.get('return_date') and data.get('departure_date'):
            if data['return_date'] < data['departure_date']:
                raise serializers.ValidationError({'return_date': 'Return date must be after departure date.'})
        return data


class FlightBookingCreateSerializer(serializers.ModelSerializer):
    legs_data = FlightLegSerializer(many=True, required=False, write_only=True)

    class Meta:
        model   = FlightBooking
        exclude = ['reference', 'status', 'quoted_price_usd',
                   'commission_usd', 'net_revenue_usd', 'created_at', 'updated_at']

    def create(self, validated_data):
        legs_data = validated_data.pop('legs_data', [])
        booking   = FlightBooking.objects.create(**validated_data)
        for i, leg in enumerate(legs_data, 1):
            FlightLeg.objects.create(booking=booking, leg_number=i, **leg)
        return booking


class FlightBookingAdminSerializer(serializers.ModelSerializer):
    legs               = serializers.SerializerMethodField()
    origin_detail      = serializers.SerializerMethodField()
    destination_detail = serializers.SerializerMethodField()
    status_display     = serializers.CharField(source='get_status_display', read_only=True)
    trip_type_display  = serializers.CharField(source='get_trip_type_display', read_only=True)
    commission_pct_display = serializers.SerializerMethodField()

    class Meta:
        model  = FlightBooking
        fields = '__all__'
        read_only_fields = ['reference', 'commission_usd', 'net_revenue_usd', 'created_at', 'updated_at']

    def get_legs(self, obj):
        return FlightLegSerializer(obj.legs.all(), many=True).data

    def get_origin_detail(self, obj):
        if obj.origin:
            return {'id': obj.origin.id, 'code': obj.origin.code,
                    'name': obj.origin.name, 'city': obj.origin.city, 'country': obj.origin.country}
        return None

    def get_destination_detail(self, obj):
        if obj.destination:
            return {'id': obj.destination.id, 'code': obj.destination.code,
                    'name': obj.destination.name, 'city': obj.destination.city, 'country': obj.destination.country}
        return None

    def get_commission_pct_display(self, obj):
        return f"{obj.commission_pct}%"


class FlightBookingPriceSerializer(serializers.Serializer):
    quoted_price_usd  = serializers.DecimalField(max_digits=12, decimal_places=2)
    operator_cost_usd = serializers.DecimalField(
        max_digits=12, decimal_places=2, 
        required=False, 
        allow_null=True,
        default=None
    )
    commission_pct    = serializers.DecimalField(
        max_digits=5, decimal_places=2, 
        required=False, 
        allow_null=True,
        default=None
    )
    status            = serializers.ChoiceField(
        choices=['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled'],
        required=False,
        allow_null=True,
        default=None
    )
    send_email        = serializers.BooleanField(default=True)
    email_message     = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        # Coerce empty strings to None for decimal fields before validation
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in ('operator_cost_usd', 'commission_pct'):
            if mutable.get(field) == '':
                mutable[field] = None
        return super().to_internal_value(mutable)

    def validate(self, data):
        if not data.get('commission_pct'):
            setting = CommissionSetting.objects.order_by('-effective_from').first()
            data['commission_pct'] = setting.rate_pct if setting else Decimal('15')
        return data


class FlightBookingCreateAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model   = FlightBooking
        exclude = ['reference', 'created_at', 'updated_at']


class FlightRevenuePointSerializer(serializers.Serializer):
    month           = serializers.CharField()
    confirmed_count = serializers.IntegerField()
    gross_usd       = serializers.DecimalField(max_digits=14, decimal_places=2)
    commission_usd  = serializers.DecimalField(max_digits=14, decimal_places=2)
    net_usd         = serializers.DecimalField(max_digits=14, decimal_places=2)


# ═══════════════════════════════════════════════════════════════════════════════
# YACHT CHARTER
# ═══════════════════════════════════════════════════════════════════════════════

class YachtCharterSerializer(serializers.ModelSerializer):
    yacht_detail   = YachtSerializer(source='yacht', read_only=True)
    reference      = serializers.UUIDField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = YachtCharter
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'quoted_price_usd', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('charter_end') and data.get('charter_start'):
            if data['charter_end'] <= data['charter_start']:
                raise serializers.ValidationError({'charter_end': 'End date must be after start date.'})
        return data


class YachtCharterAdminSerializer(serializers.ModelSerializer):
    yacht_name     = serializers.CharField(source='yacht.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = YachtCharter
        fields = '__all__'
        read_only_fields = ['reference', 'created_at', 'updated_at']


class YachtCharterPriceSerializer(serializers.Serializer):
    quoted_price_usd  = serializers.DecimalField(max_digits=14, decimal_places=2)
    operator_cost_usd = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, allow_null=True)
    status            = serializers.ChoiceField(
        choices=['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'active', 'completed', 'cancelled'],
        required=False
    )
    send_email    = serializers.BooleanField(default=True)
    email_message = serializers.CharField(required=False, default='')


# ═══════════════════════════════════════════════════════════════════════════════
# INQUIRIES
# ═══════════════════════════════════════════════════════════════════════════════

class LeaseInquirySerializer(serializers.ModelSerializer):
    reference      = serializers.UUIDField(read_only=True)
    aircraft_detail = AircraftSerializer(source='aircraft', read_only=True)
    yacht_detail   = YachtSerializer(source='yacht', read_only=True)

    class Meta:
        model  = LeaseInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class LeaseInquiryAdminSerializer(serializers.ModelSerializer):
    aircraft_name          = serializers.CharField(source='aircraft.name', read_only=True)
    yacht_name             = serializers.CharField(source='yacht.name', read_only=True)
    asset_type_display     = serializers.CharField(source='get_asset_type_display', read_only=True)
    lease_duration_display = serializers.CharField(source='get_lease_duration_display', read_only=True)

    class Meta:
        model  = LeaseInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class FlightInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)

    class Meta:
        model  = FlightInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class ContactInquirySerializer(serializers.ModelSerializer):
    reference = serializers.UUIDField(read_only=True)

    class Meta:
        model  = ContactInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class ContactInquiryAdminSerializer(serializers.ModelSerializer):
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)

    class Meta:
        model  = ContactInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'created_at']


class GroupCharterInquirySerializer(serializers.ModelSerializer):
    reference          = serializers.UUIDField(read_only=True)
    group_type_display = serializers.CharField(source='get_group_type_display', read_only=True)

    class Meta:
        model  = GroupCharterInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']

    def validate(self, data):
        if data.get('is_round_trip') and not data.get('return_date'):
            raise serializers.ValidationError({'return_date': 'Return date required for round trip.'})
        if data.get('return_date') and data.get('departure_date'):
            if data['return_date'] < data['departure_date']:
                raise serializers.ValidationError({'return_date': 'Return date must be after departure date.'})
        return data


class GroupCharterInquiryAdminSerializer(serializers.ModelSerializer):
    group_type_display = serializers.CharField(source='get_group_type_display', read_only=True)

    class Meta:
        model  = GroupCharterInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class AirCargoInquirySerializer(serializers.ModelSerializer):
    reference          = serializers.UUIDField(read_only=True)
    cargo_type_display = serializers.CharField(source='get_cargo_type_display', read_only=True)
    urgency_display    = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model  = AirCargoInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class AirCargoInquiryAdminSerializer(serializers.ModelSerializer):
    cargo_type_display = serializers.CharField(source='get_cargo_type_display', read_only=True)
    urgency_display    = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model  = AirCargoInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class AircraftSalesInquirySerializer(serializers.ModelSerializer):
    reference            = serializers.UUIDField(read_only=True)
    inquiry_type_display = serializers.CharField(source='get_inquiry_type_display', read_only=True)
    budget_range_display = serializers.CharField(source='get_budget_range_display', read_only=True)

    class Meta:
        model  = AircraftSalesInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class AircraftSalesInquiryAdminSerializer(serializers.ModelSerializer):
    inquiry_type_display = serializers.CharField(source='get_inquiry_type_display', read_only=True)
    budget_range_display = serializers.CharField(source='get_budget_range_display', read_only=True)

    class Meta:
        model  = AircraftSalesInquiry
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'created_at']


class InquiryReplySerializer(serializers.Serializer):
    subject      = serializers.CharField(max_length=500)
    message      = serializers.CharField()
    new_status   = serializers.CharField(required=False, default='')
    quoted_price = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, allow_null=True)


# ═══════════════════════════════════════════════════════════════════════════════
# MARKETPLACE
# ═══════════════════════════════════════════════════════════════════════════════

class MarketplaceAircraftSerializer(serializers.ModelSerializer):
    owner_name              = serializers.CharField(source='owner.get_full_name', read_only=True)
    hours_until_maintenance = serializers.ReadOnlyField()
    maintenance_due         = serializers.ReadOnlyField()
    category_display        = serializers.CharField(source='get_category_display', read_only=True)
    status_display          = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = MarketplaceAircraft
        fields = '__all__'
        read_only_fields = ['reference', 'owner', 'is_approved', 'created_at', 'updated_at']


class MaintenanceLogSerializer(serializers.ModelSerializer):
    aircraft_name = serializers.CharField(source='aircraft.name', read_only=True)
    type_display  = serializers.CharField(source='get_maintenance_type_display', read_only=True)

    class Meta:
        model  = MaintenanceLog
        fields = '__all__'
        read_only_fields = ['created_at']


class MarketplaceBookingSerializer(serializers.ModelSerializer):
    client_name    = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email   = serializers.EmailField(source='client.email', read_only=True)
    aircraft_name  = serializers.CharField(source='aircraft.name', read_only=True)
    aircraft_reg   = serializers.CharField(source='aircraft.registration_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tier_name      = serializers.SerializerMethodField()

    class Meta:
        model  = MarketplaceBooking
        fields = '__all__'
        read_only_fields = ['reference', 'client', 'membership',
                            'commission_usd', 'net_owner_usd', 'created_at', 'updated_at']

    def get_tier_name(self, obj):
        return obj.membership.tier.display_name if obj.membership else None

    def validate(self, data):
        user = self.context['request'].user
        try:
            m = user.membership
            if not m.is_active:
                raise serializers.ValidationError('Your membership is not active.')
        except Membership.DoesNotExist:
            raise serializers.ValidationError('You need an active membership to book.')
        return data


class MarketplaceBookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MarketplaceBooking
        fields = ['aircraft', 'trip_type', 'origin', 'destination',
                  'departure_datetime', 'return_datetime',
                  'estimated_hours', 'passenger_count', 'special_requests']


class MarketplaceBookingAdminSerializer(serializers.ModelSerializer):
    client_name    = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email   = serializers.EmailField(source='client.email', read_only=True)
    aircraft_name  = serializers.CharField(source='aircraft.name', read_only=True)
    aircraft_reg   = serializers.CharField(source='aircraft.registration_number', read_only=True)
    owner_name     = serializers.CharField(source='aircraft.owner.get_full_name', read_only=True)
    owner_email    = serializers.EmailField(source='aircraft.owner.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tier_name      = serializers.SerializerMethodField()

    class Meta:
        model  = MarketplaceBooking
        fields = '__all__'
        read_only_fields = ['reference', 'client', 'commission_usd', 'net_owner_usd', 'created_at', 'updated_at']

    def get_tier_name(self, obj):
        return obj.membership.tier.display_name if obj.membership else None


class MarketplaceBookingCreateAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MarketplaceBooking
        fields = ['client', 'aircraft', 'trip_type', 'origin', 'destination',
                  'departure_datetime', 'return_datetime', 'estimated_hours',
                  'passenger_count', 'special_requests', 'gross_amount_usd',
                  'commission_pct', 'discount_applied']


# ═══════════════════════════════════════════════════════════════════════════════
# COMMISSION / PAYMENT / MISC V1
# ═══════════════════════════════════════════════════════════════════════════════

class CommissionSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CommissionSetting
        fields = '__all__'
        read_only_fields = ['set_by', 'created_at']


class PaymentRecordSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = PaymentRecord
        fields = '__all__'
        read_only_fields = ['reference', 'user', 'created_at']


class SavedRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SavedRoute
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source='raised_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Dispute
        fields = '__all__'
        read_only_fields = ['reference', 'raised_by', 'created_at', 'resolved_at']


class EmailLogSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.CharField(source='sent_by.get_full_name', read_only=True)

    class Meta:
        model  = EmailLog
        fields = '__all__'
        read_only_fields = ['sent_by', 'sent_at', 'reference']


class SendEmailSerializer(serializers.Serializer):
    to_email     = serializers.EmailField()
    to_name      = serializers.CharField(max_length=200, required=False, default='')
    subject      = serializers.CharField(max_length=500)
    body         = serializers.CharField()
    inquiry_type = serializers.ChoiceField(
        choices=[c[0] for c in EmailLog.INQUIRY_TYPE_CHOICES],
        required=False, default='general'
    )
    related_id = serializers.IntegerField(required=False, allow_null=True)


class PriceCalculatorSerializer(serializers.Serializer):
    aircraft_id      = serializers.IntegerField(required=False, allow_null=True)
    hourly_rate_usd  = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    estimated_hours  = serializers.DecimalField(max_digits=6, decimal_places=1)
    passenger_count  = serializers.IntegerField(min_value=1)
    catering         = serializers.BooleanField(default=False)
    ground_transport = serializers.BooleanField(default=False)
    concierge        = serializers.BooleanField(default=False)
    discount_pct     = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    commission_pct   = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    notes            = serializers.CharField(required=False, default='')


# ═══════════════════════════════════════════════════════════════════════════════
# CAREERS
# ═══════════════════════════════════════════════════════════════════════════════

class JobPostingSerializer(serializers.ModelSerializer):
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    location_display   = serializers.CharField(source='get_location_display', read_only=True)
    job_type_display   = serializers.CharField(source='get_job_type_display', read_only=True)
    application_count  = serializers.SerializerMethodField()

    class Meta:
        model  = JobPosting
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_application_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'role') and request.user.role == 'admin':
            return obj.applications.count()
        return None


class JobApplicationSerializer(serializers.ModelSerializer):
    reference      = serializers.UUIDField(read_only=True)
    job_title      = serializers.CharField(source='job.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = JobApplication
        fields = '__all__'
        read_only_fields = ['reference', 'status', 'notes', 'created_at', 'updated_at']

    def validate(self, data):
        job = data.get('job')
        if job and not job.is_active:
            raise serializers.ValidationError({'job': 'This position is no longer accepting applications.'})
        return data


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — CHARTER OPERATOR
# ═══════════════════════════════════════════════════════════════════════════════

class CharterOperatorListSerializer(serializers.ModelSerializer):
    """Lightweight — used in dropdowns and lists."""
    tier_display   = serializers.CharField(source='get_tier_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    active_aircraft_count = serializers.ReadOnlyField()
    active_yacht_count    = serializers.ReadOnlyField()

    class Meta:
        model  = CharterOperator
        fields = ['id', 'reference', 'name', 'trading_name', 'country', 'city',
                  'tier', 'tier_display', 'status', 'status_display',
                  'contact_email', 'contact_phone', 'logo_url',
                  'active_aircraft_count', 'active_yacht_count', 'created_at']


class CharterOperatorDetailSerializer(serializers.ModelSerializer):
    """Full detail — used in admin operator profile."""
    tier_display   = serializers.CharField(source='get_tier_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    active_aircraft_count = serializers.ReadOnlyField()
    active_yacht_count    = serializers.ReadOnlyField()
    users_detail   = serializers.SerializerMethodField()

    class Meta:
        model  = CharterOperator
        fields = '__all__'
        read_only_fields = ['reference', 'created_at', 'updated_at']

    def get_users_detail(self, obj):
        return [{'id': u.id, 'username': u.username, 'email': u.email,
                 'full_name': u.get_full_name()} for u in obj.users.all()]


class CharterOperatorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model   = CharterOperator
        exclude = ['reference', 'created_at', 'updated_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — OPERATOR AIRCRAFT
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorAircraftListSerializer(serializers.ModelSerializer):
    operator_name           = serializers.CharField(source='operator.name', read_only=True)
    category_display        = serializers.CharField(source='get_category_display', read_only=True)
    status_display          = serializers.CharField(source='get_status_display', read_only=True)
    hours_until_maintenance = serializers.ReadOnlyField()
    maintenance_due         = serializers.ReadOnlyField()
    display_hourly_rate     = serializers.ReadOnlyField()

    class Meta:
        model  = OperatorAircraft
        fields = ['id', 'reference', 'operator', 'operator_name',
                  'name', 'model', 'category', 'category_display',
                  'registration_number', 'passenger_capacity', 'range_km',
                  'hourly_rate_usd', 'display_hourly_rate', 'status', 'status_display',
                  'is_approved', 'is_featured', 'image_url',
                  'hours_until_maintenance', 'maintenance_due', 'created_at']


class OperatorAircraftDetailSerializer(serializers.ModelSerializer):
    operator_name           = serializers.CharField(source='operator.name', read_only=True)
    category_display        = serializers.CharField(source='get_category_display', read_only=True)
    status_display          = serializers.CharField(source='get_status_display', read_only=True)
    hours_until_maintenance = serializers.ReadOnlyField()
    maintenance_due         = serializers.ReadOnlyField()
    display_hourly_rate     = serializers.ReadOnlyField()

    class Meta:
        model  = OperatorAircraft
        fields = '__all__'
        read_only_fields = ['reference', 'created_at', 'updated_at']


class OperatorAircraftCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model   = OperatorAircraft
        exclude = ['reference', 'is_approved', 'created_at', 'updated_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — OPERATOR YACHT
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorYachtListSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    type_display   = serializers.CharField(source='get_yacht_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = OperatorYacht
        fields = ['id', 'reference', 'operator', 'operator_name',
                  'name', 'yacht_type', 'type_display', 'length_meters',
                  'guest_capacity', 'crew_count', 'daily_rate_usd',
                  'status', 'status_display', 'is_approved', 'is_featured',
                  'image_url', 'home_port', 'created_at']


class OperatorYachtDetailSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    type_display   = serializers.CharField(source='get_yacht_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = OperatorYacht
        fields = '__all__'
        read_only_fields = ['reference', 'created_at', 'updated_at']


class OperatorYachtCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model   = OperatorYacht
        exclude = ['reference', 'is_approved', 'created_at', 'updated_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — AVAILABILITY BLOCK
# ═══════════════════════════════════════════════════════════════════════════════

class AvailabilityBlockSerializer(serializers.ModelSerializer):
    aircraft_name  = serializers.CharField(source='aircraft.name', read_only=True)
    yacht_name     = serializers.CharField(source='yacht.name', read_only=True)
    block_type_display = serializers.CharField(source='get_block_type_display', read_only=True)

    class Meta:
        model  = AvailabilityBlock
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        asset_type = data.get('asset_type')
        if asset_type == 'aircraft' and not data.get('aircraft'):
            raise serializers.ValidationError({'aircraft': 'Aircraft required for aircraft block.'})
        if asset_type == 'yacht' and not data.get('yacht'):
            raise serializers.ValidationError({'yacht': 'Yacht required for yacht block.'})
        return data


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — NJH COMMISSION RULE
# ═══════════════════════════════════════════════════════════════════════════════

class NJHCommissionRuleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model  = NJHCommissionRule
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — RFQ BID
# ═══════════════════════════════════════════════════════════════════════════════

class RFQBidSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    aircraft_name  = serializers.CharField(source='aircraft.name', read_only=True)
    aircraft_reg   = serializers.CharField(source='aircraft.registration_number', read_only=True)
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = RFQBid
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'njh_client_price', 'njh_margin_usd']


class RFQBidCreateSerializer(serializers.ModelSerializer):
    """Operator submits a bid."""
    class Meta:
        model  = RFQBid
        fields = ['booking', 'operator', 'aircraft', 'operator_price_usd',
                  'estimated_hours', 'positioning_cost', 'catering_cost',
                  'overnight_cost', 'notes', 'valid_until']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — OPERATOR BOOKING
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorBookingSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    asset_label    = serializers.SerializerMethodField()

    class Meta:
        model  = OperatorBooking
        fields = '__all__'
        read_only_fields = ['reference', 'created_at', 'updated_at']

    def get_asset_label(self, obj):
        if obj.operator_aircraft:
            return f"{obj.operator_aircraft.name} ({obj.operator_aircraft.registration_number})"
        if obj.operator_yacht:
            return obj.operator_yacht.name
        return None


class OperatorBookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model   = OperatorBooking
        exclude = ['reference', 'accepted_at', 'rejected_at', 'created_at', 'updated_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — OPERATOR PAYOUT LOG
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorPayoutLogSerializer(serializers.ModelSerializer):
    operator_name    = serializers.CharField(source='operator.name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = OperatorPayoutLog
        fields = '__all__'
        read_only_fields = ['reference', 'processed_by', 'created_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — OPERATOR REVIEW
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorReviewSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source='operator.name', read_only=True)

    class Meta:
        model  = OperatorReview
        fields = '__all__'
        read_only_fields = ['created_at', 'is_published']


class OperatorReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OperatorReview
        fields = ['operator', 'operator_booking', 'reviewer_name', 'reviewer_email',
                  'rating_overall', 'rating_punctuality', 'rating_cleanliness',
                  'rating_crew', 'comment']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — DOCUMENT UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

class DocumentUploadSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)

    class Meta:
        model  = DocumentUpload
        fields = '__all__'
        read_only_fields = ['reference', 'uploaded_by', 'created_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — CLIENT NOTIFICATION
# ═══════════════════════════════════════════════════════════════════════════════

class ClientNotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_notif_type_display', read_only=True)

    class Meta:
        model  = ClientNotification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — WEBHOOK LOG
# ═══════════════════════════════════════════════════════════════════════════════

class WebhookLogSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    event_display  = serializers.CharField(source='get_event_display', read_only=True)

    class Meta:
        model  = WebhookLog
        fields = '__all__'
        read_only_fields = ['sent_at']


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD SERIALIZERS
# ═══════════════════════════════════════════════════════════════════════════════

class ClientDashboardSerializer(serializers.Serializer):
    membership        = MembershipSerializer()
    upcoming_bookings = MarketplaceBookingSerializer(many=True)
    total_flights     = serializers.IntegerField()
    total_spent_usd   = serializers.DecimalField(max_digits=12, decimal_places=2)
    renewal_alert     = serializers.BooleanField()
    days_remaining    = serializers.IntegerField(allow_null=True)


class OwnerDashboardSerializer(serializers.Serializer):
    total_revenue_usd      = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_revenue_usd    = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_flight_hours     = serializers.DecimalField(max_digits=10, decimal_places=1)
    upcoming_flights_count = serializers.IntegerField()
    maintenance_alerts     = MaintenanceLogSerializer(many=True)
    aircraft_count         = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    total_platform_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_commissions      = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_members          = serializers.IntegerField()
    total_aircraft         = serializers.IntegerField()
    pending_approvals      = serializers.IntegerField()
    open_disputes          = serializers.IntegerField()
    commission_rate        = serializers.DecimalField(max_digits=5, decimal_places=2)
    # V2 additions
    total_operators        = serializers.IntegerField()
    pending_operator_aircraft = serializers.IntegerField()
    open_rfq_bids          = serializers.IntegerField()
    pending_payouts_usd    = serializers.DecimalField(max_digits=14, decimal_places=2)


class BookingStatusSerializer(serializers.Serializer):
    reference = serializers.UUIDField()
    
    
    
    
# ═══════════════════════════════════════════════════════════════════════════════
# V2 — AIR CARGO BOOKING
# ═══════════════════════════════════════════════════════════════════════════════

class AirCargoBookingListSerializer(serializers.ModelSerializer):
    """Lightweight — used in lists, dashboards and operator dropdowns."""
    cargo_type_display = serializers.CharField(source='get_cargo_type_display', read_only=True)
    urgency_display    = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display     = serializers.CharField(source='get_status_display', read_only=True)
    operator_name      = serializers.CharField(source='assigned_operator.name', read_only=True)
    aircraft_name      = serializers.CharField(source='assigned_aircraft.name', read_only=True)
    aircraft_reg       = serializers.CharField(
        source='assigned_aircraft.registration_number', read_only=True
    )

    class Meta:
        model  = AirCargoBooking
        fields = [
            'id', 'reference',
            'contact_name', 'contact_email', 'company',
            'cargo_type', 'cargo_type_display',
            'origin_description', 'destination_description',
            'pickup_date', 'urgency', 'urgency_display',
            'weight_kg', 'volume_m3',
            'quoted_price_usd', 'operator_cost_usd', 'net_revenue_usd',
            'payment_status',
            'operator_name', 'aircraft_name', 'aircraft_reg',
            'airway_bill_number',
            'status', 'status_display',
            'created_at',
        ]


class AirCargoBookingDetailSerializer(serializers.ModelSerializer):
    """Full detail — used in admin and operator booking view."""
    cargo_type_display   = serializers.CharField(source='get_cargo_type_display', read_only=True)
    urgency_display      = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display       = serializers.CharField(source='get_status_display', read_only=True)
    operator_name        = serializers.CharField(source='assigned_operator.name', read_only=True)
    aircraft_name        = serializers.CharField(source='assigned_aircraft.name', read_only=True)
    aircraft_reg         = serializers.CharField(
        source='assigned_aircraft.registration_number', read_only=True
    )
    origin_airport_detail      = AirportSerializer(source='origin_airport', read_only=True)
    destination_airport_detail = AirportSerializer(source='destination_airport', read_only=True)
    source_inquiry_reference   = serializers.UUIDField(
        source='source_inquiry.reference', read_only=True
    )
    client_name  = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)

    class Meta:
        model  = AirCargoBooking
        fields = '__all__'
        read_only_fields = [
            'reference',
            'commission_usd', 'net_revenue_usd',
            'created_at', 'updated_at',
        ]


class AirCargoBookingCreateSerializer(serializers.ModelSerializer):
    """
    Used by NJH staff to open a new confirmed cargo booking,
    optionally converting from an existing AirCargoInquiry.
    commission_usd and net_revenue_usd are calculated in model.save().
    """
    class Meta:
        model   = AirCargoBooking
        exclude = [
            'reference',
            'commission_usd', 'net_revenue_usd',
            'created_at', 'updated_at',
        ]

    def validate(self, data):
        # Ensure the right airport FK is set for the chosen asset type
        if data.get('assigned_aircraft') and data.get('assigned_operator'):
            aircraft = data['assigned_aircraft']
            operator = data['assigned_operator']
            if aircraft.operator_id != operator.pk:
                raise serializers.ValidationError(
                    {'assigned_aircraft': 'Aircraft does not belong to the assigned operator.'}
                )
        return data


class AirCargoBookingPriceSerializer(serializers.Serializer):
    """
    Patch serializer — NJH staff quotes or re-prices a cargo booking.
    Mirrors FlightBookingPriceSerializer for API consistency.
    """
    quoted_price_usd   = serializers.DecimalField(max_digits=14, decimal_places=2)
    operator_cost_usd  = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False, allow_null=True, default=None
    )
    commission_pct     = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True, default=None
    )
    insurance_premium_usd = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True, default=None
    )
    customs_fee_usd    = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True, default=None
    )
    status             = serializers.ChoiceField(
        choices=[
            'inquiry', 'rfq_sent', 'quoted', 'confirmed',
            'in_transit', 'delivered', 'completed', 'cancelled', 'disputed',
        ],
        required=False, allow_null=True, default=None
    )
    send_email         = serializers.BooleanField(default=True)
    email_message      = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in ('operator_cost_usd', 'commission_pct', 'insurance_premium_usd', 'customs_fee_usd'):
            if mutable.get(field) == '':
                mutable[field] = None
        return super().to_internal_value(mutable)

    def validate(self, data):
        if not data.get('commission_pct'):
            setting = CommissionSetting.objects.order_by('-effective_from').first()
            data['commission_pct'] = setting.rate_pct if setting else Decimal('15')
        return data


class AirCargoBookingTrackingSerializer(serializers.Serializer):
    """
    Patch serializer — update shipment tracking fields only.
    Keeps pricing and client data untouched.
    """
    airway_bill_number    = serializers.CharField(max_length=100, required=False, allow_blank=True)
    actual_pickup_at      = serializers.DateTimeField(required=False, allow_null=True)
    actual_delivery_at    = serializers.DateTimeField(required=False, allow_null=True)
    proof_of_delivery_url = serializers.URLField(required=False, allow_blank=True)
    status                = serializers.ChoiceField(
        choices=[
            'inquiry', 'rfq_sent', 'quoted', 'confirmed',
            'in_transit', 'delivered', 'completed', 'cancelled', 'disputed',
        ],
        required=False
    )


# ═══════════════════════════════════════════════════════════════════════════════
# V2 — LEASE BOOKING
# ═══════════════════════════════════════════════════════════════════════════════

class LeaseBookingListSerializer(serializers.ModelSerializer):
    """Lightweight — used in lists and dashboards."""
    asset_type_display     = serializers.CharField(source='get_asset_type_display', read_only=True)
    lease_duration_display = serializers.CharField(source='get_lease_duration_display', read_only=True)
    status_display         = serializers.CharField(source='get_status_display', read_only=True)
    operator_name          = serializers.CharField(source='assigned_operator.name', read_only=True)
    asset_label            = serializers.SerializerMethodField()

    class Meta:
        model  = LeaseBooking
        fields = [
            'id', 'reference',
            'guest_name', 'guest_email', 'company',
            'asset_type', 'asset_type_display', 'asset_label',
            'lease_duration', 'lease_duration_display',
            'lease_start_date', 'lease_end_date',
            'monthly_rate_usd', 'total_lease_value_usd',
            'payment_status', 'billing_frequency',
            'operator_name',
            'contract_reference', 'signed_at',
            'status', 'status_display',
            'created_at',
        ]

    def get_asset_label(self, obj):
        """Returns a human-readable asset name regardless of which FK is set."""
        if obj.asset_type == 'aircraft':
            ac = obj.operator_aircraft or obj.catalog_aircraft
            return str(ac) if ac else None
        else:
            yt = obj.operator_yacht or obj.catalog_yacht
            return str(yt) if yt else None


class LeaseBookingDetailSerializer(serializers.ModelSerializer):
    """Full detail — used in admin lease profile."""
    asset_type_display     = serializers.CharField(source='get_asset_type_display', read_only=True)
    lease_duration_display = serializers.CharField(source='get_lease_duration_display', read_only=True)
    status_display         = serializers.CharField(source='get_status_display', read_only=True)
    billing_frequency_display = serializers.SerializerMethodField()

    operator_name          = serializers.CharField(source='assigned_operator.name', read_only=True)
    asset_label            = serializers.SerializerMethodField()

    # Nested asset detail — only the active link is populated
    catalog_aircraft_detail  = AircraftSerializer(source='catalog_aircraft', read_only=True)
    catalog_yacht_detail     = YachtSerializer(source='catalog_yacht', read_only=True)
    operator_aircraft_detail = OperatorAircraftListSerializer(source='operator_aircraft', read_only=True)
    operator_yacht_detail    = OperatorYachtListSerializer(source='operator_yacht', read_only=True)

    source_inquiry_reference = serializers.UUIDField(
        source='source_inquiry.reference', read_only=True
    )
    client_name  = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)

    class Meta:
        model  = LeaseBooking
        fields = '__all__'
        read_only_fields = [
            'reference',
            'commission_usd', 'net_revenue_usd',
            'created_at', 'updated_at',
        ]

    def get_asset_label(self, obj):
        if obj.asset_type == 'aircraft':
            ac = obj.operator_aircraft or obj.catalog_aircraft
            return str(ac) if ac else None
        else:
            yt = obj.operator_yacht or obj.catalog_yacht
            return str(yt) if yt else None

    def get_billing_frequency_display(self, obj):
        mapping = {'monthly': 'Monthly', 'quarterly': 'Quarterly', 'upfront': 'Full Upfront'}
        return mapping.get(obj.billing_frequency, obj.billing_frequency)


class LeaseBookingCreateSerializer(serializers.ModelSerializer):
    """
    Used by NJH staff to open a new confirmed lease booking,
    optionally converting from an existing LeaseInquiry.
    commission_usd and net_revenue_usd are calculated in model.save().
    """
    class Meta:
        model   = LeaseBooking
        exclude = [
            'reference',
            'commission_usd', 'net_revenue_usd',
            'created_at', 'updated_at',
        ]

    def validate(self, data):
        asset_type = data.get('asset_type')

        # Ensure at least one asset FK is provided for the chosen type
        if asset_type == 'aircraft':
            if not data.get('operator_aircraft') and not data.get('catalog_aircraft'):
                raise serializers.ValidationError(
                    {'operator_aircraft': 'Provide operator_aircraft or catalog_aircraft for aircraft leases.'}
                )
        elif asset_type == 'yacht':
            if not data.get('operator_yacht') and not data.get('catalog_yacht'):
                raise serializers.ValidationError(
                    {'operator_yacht': 'Provide operator_yacht or catalog_yacht for yacht leases.'}
                )

        # If an operator asset is set, verify it belongs to the assigned operator
        if data.get('assigned_operator'):
            op = data['assigned_operator']
            if data.get('operator_aircraft') and data['operator_aircraft'].operator_id != op.pk:
                raise serializers.ValidationError(
                    {'operator_aircraft': 'Aircraft does not belong to the assigned operator.'}
                )
            if data.get('operator_yacht') and data['operator_yacht'].operator_id != op.pk:
                raise serializers.ValidationError(
                    {'operator_yacht': 'Yacht does not belong to the assigned operator.'}
                )

        # Date sanity check
        if data.get('lease_start_date') and data.get('lease_end_date'):
            if data['lease_end_date'] <= data['lease_start_date']:
                raise serializers.ValidationError(
                    {'lease_end_date': 'Lease end date must be after start date.'}
                )

        return data


class LeaseBookingPriceSerializer(serializers.Serializer):
    """
    Patch serializer — NJH staff updates financials or status on a lease booking.
    Mirrors the pattern of FlightBookingPriceSerializer / YachtCharterPriceSerializer.
    """
    monthly_rate_usd      = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False, allow_null=True, default=None
    )
    total_lease_value_usd = serializers.DecimalField(
        max_digits=16, decimal_places=2, required=False, allow_null=True, default=None
    )
    security_deposit_usd  = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False, allow_null=True, default=None
    )
    operator_cost_usd     = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False, allow_null=True, default=None
    )
    commission_pct        = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True, default=None
    )
    status                = serializers.ChoiceField(
        choices=[
            'inquiry', 'rfq_sent', 'negotiating', 'quoted', 'contract_sent',
            'confirmed', 'active', 'completed', 'terminated', 'cancelled',
        ],
        required=False, allow_null=True, default=None
    )
    send_email            = serializers.BooleanField(default=True)
    email_message         = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in (
            'monthly_rate_usd', 'total_lease_value_usd',
            'security_deposit_usd', 'operator_cost_usd', 'commission_pct',
        ):
            if mutable.get(field) == '':
                mutable[field] = None
        return super().to_internal_value(mutable)

    def validate(self, data):
        if not data.get('commission_pct'):
            setting = CommissionSetting.objects.order_by('-effective_from').first()
            data['commission_pct'] = setting.rate_pct if setting else Decimal('10')
        return data


class LeaseBookingContractSerializer(serializers.Serializer):
    """
    Patch serializer — records contract signing details.
    Designed to be called once the lease agreement is executed.
    """
    contract_reference = serializers.CharField(max_length=200, required=False, allow_blank=True)
    contract_url       = serializers.URLField(required=False, allow_blank=True)
    signed_at          = serializers.DateTimeField(required=False, allow_null=True)
    signed_by          = serializers.CharField(max_length=200, required=False, allow_blank=True)
    status             = serializers.ChoiceField(
        choices=['contract_sent', 'confirmed'],
        required=False
    )