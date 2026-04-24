# ═══════════════════════════════════════════════════════════════════════════════
# NairobiJetHouse V2 — views.py
# ═══════════════════════════════════════════════════════════════════════════════
from decimal import Decimal, ROUND_HALF_UP
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
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
    OperatorReview, DocumentUpload, ClientNotification, WebhookLog,
)
from .serializers import (
    AirportSerializer, AircraftSerializer, YachtSerializer,
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, UserAdminSerializer,
    MembershipTierSerializer, MembershipSerializer, MembershipCreateSerializer,
    FlightLegSerializer, FlightBookingSerializer,
    FlightBookingCreateSerializer, FlightBookingAdminSerializer,
    FlightBookingPriceSerializer, FlightBookingCreateAdminSerializer,
    YachtCharterSerializer, YachtCharterAdminSerializer, YachtCharterPriceSerializer,
    LeaseInquirySerializer, LeaseInquiryAdminSerializer,
    FlightInquirySerializer,
    ContactInquirySerializer, ContactInquiryAdminSerializer,
    GroupCharterInquirySerializer, GroupCharterInquiryAdminSerializer,
    AirCargoInquirySerializer, AirCargoInquiryAdminSerializer,
    AircraftSalesInquirySerializer, AircraftSalesInquiryAdminSerializer,
    InquiryReplySerializer,
    MarketplaceAircraftSerializer, MaintenanceLogSerializer,
    MarketplaceBookingSerializer, MarketplaceBookingCreateSerializer,
    MarketplaceBookingAdminSerializer, MarketplaceBookingCreateAdminSerializer,
    CommissionSettingSerializer, PaymentRecordSerializer,
    SavedRouteSerializer, DisputeSerializer,
    EmailLogSerializer, SendEmailSerializer,
    PriceCalculatorSerializer,
    JobPostingSerializer, JobApplicationSerializer,
    # V2
    CharterOperatorListSerializer, CharterOperatorDetailSerializer,
    CharterOperatorCreateSerializer,
    OperatorAircraftListSerializer, OperatorAircraftDetailSerializer,
    OperatorAircraftCreateSerializer,
    OperatorYachtListSerializer, OperatorYachtDetailSerializer,
    OperatorYachtCreateSerializer,
    AvailabilityBlockSerializer,
    NJHCommissionRuleSerializer,
    RFQBidSerializer, RFQBidCreateSerializer,
    OperatorBookingSerializer, OperatorBookingCreateSerializer,
    OperatorPayoutLogSerializer,
    OperatorReviewSerializer, OperatorReviewCreateSerializer,
    DocumentUploadSerializer,
    ClientNotificationSerializer,
    WebhookLogSerializer,
)


# ═══════════════════════════════════════════════════════════════════════════════
# PERMISSION HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ('admin',)


class IsStaffOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ('admin', 'staff')


class IsOperatorOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ('admin', 'operator')


class IsOwnerOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ('admin', 'owner')


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = UserRegistrationSerializer(data=request.data)
        if ser.is_valid():
            user    = ser.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user':    UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = UserLoginSerializer(data=request.data)
        if ser.is_valid():
            user    = ser.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user':    UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            })
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = UserProfileSerializer

    def get_object(self):
        return self.request.user


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC CATALOG
# ═══════════════════════════════════════════════════════════════════════════════

class AirportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes   = [AllowAny]
    serializer_class     = AirportSerializer
    filter_backends      = [filters.SearchFilter]
    search_fields        = ['code', 'name', 'city', 'country']
    queryset             = Airport.objects.all().order_by('code')


class AircraftViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = AircraftSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['name', 'model', 'category']

    def get_queryset(self):
        qs = Aircraft.objects.filter(is_available=True)
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return qs.order_by('category', 'name')


class YachtViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = YachtSerializer

    def get_queryset(self):
        qs  = Yacht.objects.filter(is_available=True)
        cat = self.request.query_params.get('size_category')
        if cat:
            qs = qs.filter(size_category=cat)
        return qs.order_by('size_category', 'name')


# ═══════════════════════════════════════════════════════════════════════════════
# FLIGHT BOOKING (PUBLIC)
# ═══════════════════════════════════════════════════════════════════════════════

class FlightBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return FlightBookingCreateSerializer
        return FlightBookingSerializer

    def get_queryset(self):
        return FlightBooking.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = FlightBookingCreateSerializer(data=request.data)
        if ser.is_valid():
            booking = ser.save()
            return Response({
                'message': 'Flight booking submitted. Our team will contact you within 2–4 hours.',
                'booking': FlightBookingSerializer(booking).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='track/(?P<ref>[^/.]+)')
    def track(self, request, ref=None):
        try:
            booking = FlightBooking.objects.get(reference=ref)
            return Response(FlightBookingSerializer(booking).data)
        except FlightBooking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='by-email')
    def by_email(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'detail': 'Email required.'}, status=status.HTTP_400_BAD_REQUEST)
        bookings = FlightBooking.objects.filter(guest_email__iexact=email).order_by('-created_at')
        return Response(FlightBookingSerializer(bookings, many=True).data)


# ═══════════════════════════════════════════════════════════════════════════════
# YACHT CHARTER (PUBLIC)
# ═══════════════════════════════════════════════════════════════════════════════

class YachtCharterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = YachtCharterSerializer
    queryset           = YachtCharter.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = YachtCharterSerializer(data=request.data)
        if ser.is_valid():
            charter = ser.save()
            return Response({
                'message': 'Yacht charter request received. Our specialists will respond within 4 hours.',
                'charter': YachtCharterSerializer(charter).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='track/(?P<ref>[^/.]+)')
    def track(self, request, ref=None):
        try:
            charter = YachtCharter.objects.get(reference=ref)
            return Response(YachtCharterSerializer(charter).data)
        except YachtCharter.DoesNotExist:
            return Response({'detail': 'Charter not found.'}, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC INQUIRY VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class LeaseInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = LeaseInquirySerializer
    queryset           = LeaseInquiry.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        if ser.is_valid():
            inquiry = ser.save()
            return Response({
                'message': 'Lease inquiry submitted. Our leasing team will respond within 24 hours.',
                'inquiry': LeaseInquirySerializer(inquiry).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class FlightInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = FlightInquirySerializer
    queryset           = FlightInquiry.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        if ser.is_valid():
            inquiry = ser.save()
            return Response({
                'message': 'Inquiry received. A specialist will be in touch shortly.',
                'inquiry': FlightInquirySerializer(inquiry).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = ContactInquirySerializer
    queryset           = ContactInquiry.objects.all().order_by('-created_at')


class GroupCharterInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = GroupCharterInquirySerializer
    queryset           = GroupCharterInquiry.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        if ser.is_valid():
            inquiry = ser.save()
            return Response({
                'message': 'Group charter request received.',
                'inquiry': GroupCharterInquirySerializer(inquiry).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class AirCargoInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = AirCargoInquirySerializer
    queryset           = AirCargoInquiry.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        if ser.is_valid():
            inquiry = ser.save()
            return Response({
                'message': 'Cargo inquiry received. Our logistics team will respond shortly.',
                'inquiry': AirCargoInquirySerializer(inquiry).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class AircraftSalesInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = AircraftSalesInquirySerializer
    queryset           = AircraftSalesInquiry.objects.all().order_by('-created_at')


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC JOBS
# ═══════════════════════════════════════════════════════════════════════════════

class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = JobPostingSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['title', 'department', 'location']

    def get_queryset(self):
        qs   = JobPosting.objects.filter(is_active=True)
        dept = self.request.query_params.get('department')
        if dept:
            qs = qs.filter(department=dept)
        return qs.order_by('-is_featured', '-created_at')


class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = JobApplicationSerializer
    queryset           = JobApplication.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        if ser.is_valid():
            application = ser.save()
            return Response({
                'message': 'Application received. We will be in touch if your profile is a match.',
                'application': JobApplicationSerializer(application).data,
            }, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC OPERATOR AIRCRAFT / YACHT (approved listings only)
# ═══════════════════════════════════════════════════════════════════════════════

class PublicOperatorAircraftViewSet(viewsets.ReadOnlyModelViewSet):
    """Approved operator aircraft visible to the public."""
    permission_classes = [AllowAny]
    serializer_class   = OperatorAircraftListSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['name', 'model', 'category', 'operator__name']

    def get_queryset(self):
        qs  = OperatorAircraft.objects.filter(is_approved=True, status='available')
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return qs.select_related('operator').order_by('-is_featured', 'category', 'name')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(OperatorAircraftDetailSerializer(instance).data)


class PublicOperatorYachtViewSet(viewsets.ReadOnlyModelViewSet):
    """Approved operator yachts visible to the public."""
    permission_classes = [AllowAny]
    serializer_class   = OperatorYachtListSerializer

    def get_queryset(self):
        qs = OperatorYacht.objects.filter(is_approved=True, status='available')
        return qs.select_related('operator').order_by('-is_featured', 'name')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(OperatorYachtDetailSerializer(instance).data)


# ═══════════════════════════════════════════════════════════════════════════════
# OPERATOR PORTAL (role = operator)
# ═══════════════════════════════════════════════════════════════════════════════

class OperatorAircraftViewSet(viewsets.ModelViewSet):
    """Operator manages their own aircraft."""
    permission_classes = [IsOperatorOrAdmin]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OperatorAircraftCreateSerializer
        if self.action == 'retrieve':
            return OperatorAircraftDetailSerializer
        return OperatorAircraftListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return OperatorAircraft.objects.all().select_related('operator')
        # Operator sees only their company's aircraft
        operator_ids = user.charter_operators.values_list('id', flat=True)
        return OperatorAircraft.objects.filter(operator_id__in=operator_ids).select_related('operator')

    def perform_create(self, serializer):
        serializer.save(status='pending', is_approved=False)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        aircraft = self.get_object()
        aircraft.is_approved = True
        aircraft.status      = 'available'
        aircraft.save()
        return Response({'detail': f'{aircraft.name} approved and listed.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        aircraft = self.get_object()
        aircraft.is_approved = False
        aircraft.status      = 'inactive'
        aircraft.save()
        return Response({'detail': f'{aircraft.name} rejected.'})


class OperatorYachtViewSet(viewsets.ModelViewSet):
    """Operator manages their own yachts."""
    permission_classes = [IsOperatorOrAdmin]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OperatorYachtCreateSerializer
        if self.action == 'retrieve':
            return OperatorYachtDetailSerializer
        return OperatorYachtListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return OperatorYacht.objects.all().select_related('operator')
        operator_ids = user.charter_operators.values_list('id', flat=True)
        return OperatorYacht.objects.filter(operator_id__in=operator_ids).select_related('operator')

    def perform_create(self, serializer):
        serializer.save(status='pending', is_approved=False)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        yacht = self.get_object()
        yacht.is_approved = True
        yacht.status      = 'available'
        yacht.save()
        return Response({'detail': f'{yacht.name} approved and listed.'})


class AvailabilityBlockViewSet(viewsets.ModelViewSet):
    """Operator marks blackout dates on their assets."""
    permission_classes = [IsOperatorOrAdmin]
    serializer_class   = AvailabilityBlockSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return AvailabilityBlock.objects.all().order_by('start_date')
        operator_ids = user.charter_operators.values_list('id', flat=True)
        return AvailabilityBlock.objects.filter(operator_id__in=operator_ids).order_by('start_date')


class RFQBidViewSet(viewsets.ModelViewSet):
    """Operator submits bids on RFQs."""
    permission_classes = [IsOperatorOrAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return RFQBidCreateSerializer
        return RFQBidSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return RFQBid.objects.all().select_related('operator', 'aircraft', 'booking')
        operator_ids = user.charter_operators.values_list('id', flat=True)
        return RFQBid.objects.filter(operator_id__in=operator_ids).select_related('operator', 'aircraft', 'booking')

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def accept(self, request, pk=None):
        bid = self.get_object()
        bid.status = 'accepted'
        # Calculate client price using commission rule
        rule = NJHCommissionRule.objects.filter(is_active=True).order_by('-priority').first()
        markup = rule.markup_pct if rule else Decimal('20')
        bid.njh_client_price = (bid.operator_price_usd * (1 + markup / 100)).quantize(Decimal('0.01'), ROUND_HALF_UP)
        bid.njh_margin_usd   = (bid.njh_client_price - bid.operator_price_usd).quantize(Decimal('0.01'), ROUND_HALF_UP)
        bid.save()
        # Mark other bids on same booking as rejected
        RFQBid.objects.filter(booking=bid.booking).exclude(pk=bid.pk).update(status='rejected')
        return Response(RFQBidSerializer(bid).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def shortlist(self, request, pk=None):
        bid = self.get_object()
        bid.status = 'shortlisted'
        bid.save()
        return Response(RFQBidSerializer(bid).data)


class OperatorBookingViewSet(viewsets.ModelViewSet):
    """Operator-side booking dispatch records."""
    permission_classes = [IsOperatorOrAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return OperatorBookingCreateSerializer
        return OperatorBookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return OperatorBooking.objects.all().select_related('operator')
        operator_ids = user.charter_operators.values_list('id', flat=True)
        return OperatorBooking.objects.filter(operator_id__in=operator_ids).select_related('operator')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        ob = self.get_object()
        if ob.status not in ('sent',):
            return Response({'detail': 'Only sent bookings can be accepted.'}, status=400)
        ob.status      = 'accepted'
        ob.accepted_at = timezone.now()
        ob.operator_reference = request.data.get('operator_reference', '')
        ob.operator_notes     = request.data.get('operator_notes', '')
        ob.save()
        return Response(OperatorBookingSerializer(ob).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ob = self.get_object()
        ob.status           = 'rejected'
        ob.rejected_at      = timezone.now()
        ob.rejection_reason = request.data.get('rejection_reason', '')
        ob.save()
        return Response(OperatorBookingSerializer(ob).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def complete(self, request, pk=None):
        ob = self.get_object()
        ob.status = 'completed'
        ob.save()
        return Response(OperatorBookingSerializer(ob).data)


class OperatorReviewViewSet(viewsets.ModelViewSet):
    """Client reviews of operators."""
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return OperatorReviewCreateSerializer
        return OperatorReviewSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return OperatorReview.objects.all().select_related('operator')
        return OperatorReview.objects.filter(is_published=True).select_related('operator')

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def publish(self, request, pk=None):
        review = self.get_object()
        review.is_published = True
        review.save()
        return Response({'detail': 'Review published.'})


# ═══════════════════════════════════════════════════════════════════════════════
# MEMBERSHIP (CLIENT)
# ═══════════════════════════════════════════════════════════════════════════════

class MembershipTierViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class   = MembershipTierSerializer
    queryset           = MembershipTier.objects.filter(is_active=True)


class MembershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = MembershipSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'staff'):
            return Membership.objects.all().select_related('user', 'tier')
        return Membership.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my(self, request):
        try:
            m = request.user.membership
            return Response(MembershipSerializer(m).data)
        except Membership.DoesNotExist:
            return Response({'detail': 'No membership found.'}, status=404)

    @action(detail=False, methods=['post'])
    def create_membership(self, request):
        ser = MembershipCreateSerializer(data=request.data)
        if ser.is_valid():
            data = ser.validated_data
            try:
                tier = MembershipTier.objects.get(name=data['tier_name'])
            except MembershipTier.DoesNotExist:
                return Response({'detail': 'Tier not found.'}, status=400)
            if hasattr(request.user, 'membership'):
                return Response({'detail': 'You already have a membership.'}, status=400)
            m = Membership.objects.create(
                user=request.user, tier=tier,
                billing_cycle=data['billing_cycle'],
                auto_renew=data['auto_renew'],
                status='pending',
            )
            return Response(MembershipSerializer(m).data, status=201)
        return Response(ser.errors, status=400)


# ═══════════════════════════════════════════════════════════════════════════════
# MARKETPLACE (OWNER + MEMBER)
# ═══════════════════════════════════════════════════════════════════════════════

class MarketplaceAircraftViewSet(viewsets.ModelViewSet):
    serializer_class = MarketplaceAircraftSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['name', 'model', 'category', 'registration_number']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ('admin', 'staff'):
            return MarketplaceAircraft.objects.all()
        if user.is_authenticated and user.role == 'owner':
            return MarketplaceAircraft.objects.filter(owner=user)
        return MarketplaceAircraft.objects.filter(is_approved=True, status='available')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_approved=False)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        ac = self.get_object()
        ac.is_approved = True
        ac.status      = 'available'
        ac.save()
        return Response({'detail': f'{ac.name} approved.'})


class MaintenanceLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrAdmin]
    serializer_class   = MaintenanceLogSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return MaintenanceLog.objects.all().select_related('aircraft')
        aircraft_ids = MarketplaceAircraft.objects.filter(owner=user).values_list('id', flat=True)
        return MaintenanceLog.objects.filter(aircraft_id__in=aircraft_ids)


class MarketplaceBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MarketplaceBookingCreateSerializer
        return MarketplaceBookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'staff'):
            return MarketplaceBooking.objects.all().select_related('client', 'aircraft', 'membership')
        if user.role == 'owner':
            aircraft_ids = MarketplaceAircraft.objects.filter(owner=user).values_list('id', flat=True)
            return MarketplaceBooking.objects.filter(aircraft_id__in=aircraft_ids)
        return MarketplaceBooking.objects.filter(client=user)

    def perform_create(self, serializer):
        user = self.request.user
        try:
            membership = user.membership
        except Membership.DoesNotExist:
            membership = None

        aircraft      = serializer.validated_data['aircraft']
        est_hours     = serializer.validated_data['estimated_hours']
        discount      = getattr(membership, 'tier', None)
        discount_pct  = discount.hourly_discount_pct if discount else Decimal('0')
        hourly        = aircraft.hourly_rate_usd
        gross         = (hourly * est_hours * (1 - discount_pct / 100)).quantize(Decimal('0.01'), ROUND_HALF_UP)
        setting       = CommissionSetting.objects.order_by('-effective_from').first()
        comm_pct      = setting.rate_pct if setting else Decimal('10')
        comm_usd      = (gross * comm_pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)

        serializer.save(
            client=user, membership=membership,
            gross_amount_usd=gross, commission_pct=comm_pct,
            commission_usd=comm_usd,
            net_owner_usd=(gross - comm_usd).quantize(Decimal('0.01'), ROUND_HALF_UP),
            discount_applied=discount_pct,
        )


class SavedRouteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = SavedRouteSerializer

    def get_queryset(self):
        return SavedRoute.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentRecordViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = PaymentRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'staff'):
            return PaymentRecord.objects.all()
        return PaymentRecord.objects.filter(user=user).order_by('-created_at')


class DisputeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = DisputeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'staff'):
            return Dispute.objects.all()
        return Dispute.objects.filter(raised_by=user)

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)


# ═══════════════════════════════════════════════════════════════════════════════
# CLIENT NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class ClientNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = ClientNotificationSerializer

    def get_queryset(self):
        return ClientNotification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        ClientNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'detail': 'Marked as read.'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = ClientNotification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread': count})


# ═══════════════════════════════════════════════════════════════════════════════
# DOCUMENT UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

class DocumentUploadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = DocumentUploadSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'staff'):
            return DocumentUpload.objects.all().order_by('-created_at')
        return DocumentUpload.objects.filter(uploaded_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class AdminOverviewView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        from datetime import date, timedelta

        today    = date.today()
        month_start = today.replace(day=1)

        total_revenue = FlightBooking.objects.filter(
            status__in=['confirmed', 'completed']
        ).aggregate(t=Sum('quoted_price_usd'))['t'] or 0

        total_commission = FlightBooking.objects.filter(
            status__in=['confirmed', 'completed']
        ).aggregate(t=Sum('commission_usd'))['t'] or 0

        pending_payouts = OperatorPayoutLog.objects.filter(
            status='pending'
        ).aggregate(t=Sum('amount_usd'))['t'] or 0

        data = {
            'total_platform_revenue':  total_revenue,
            'total_commissions':       total_commission,
            'total_members':           Membership.objects.filter(status='active').count(),
            'total_aircraft':          MarketplaceAircraft.objects.filter(is_approved=True).count(),
            'pending_approvals':       MarketplaceAircraft.objects.filter(is_approved=False).count() +
                                       OperatorAircraft.objects.filter(is_approved=False).count(),
            'open_disputes':           Dispute.objects.filter(status='open').count(),
            'commission_rate':         CommissionSetting.objects.order_by('-effective_from').first().rate_pct
                                       if CommissionSetting.objects.exists() else 10,
            # V2
            'total_operators':         CharterOperator.objects.filter(status='active').count(),
            'pending_operator_aircraft': OperatorAircraft.objects.filter(is_approved=False).count(),
            'open_rfq_bids':           RFQBid.objects.filter(status='submitted').count(),
            'pending_payouts_usd':     pending_payouts,
        }
        return Response(data)


class AdminFlightBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['guest_name', 'guest_email', 'reference']

    def get_serializer_class(self):
        if self.action == 'create':
            return FlightBookingCreateAdminSerializer
        return FlightBookingAdminSerializer

    def get_queryset(self):
        qs = FlightBooking.objects.all().select_related(
            'origin', 'destination', 'aircraft', 'operator_aircraft', 'assigned_operator'
        ).order_by('-created_at')
        st = self.request.query_params.get('status')
        if st:
            qs = qs.filter(status=st)
        return qs

    @action(detail=True, methods=['post'])
    def set_price(self, request, pk=None):
        booking = self.get_object()
        ser     = FlightBookingPriceSerializer(data=request.data)
        if ser.is_valid():
            data = ser.validated_data
            booking.quoted_price_usd  = data['quoted_price_usd']
            booking.operator_cost_usd = data.get('operator_cost_usd')
            booking.commission_pct    = data['commission_pct']
            if data.get('status'):
                booking.status = data['status']
            booking.save()

            if data.get('send_email') and booking.guest_email:
                body = data.get('email_message') or (
                    f"Dear {booking.guest_name},\n\n"
                    f"Your flight from {booking.origin.code} to {booking.destination.code} "
                    f"has been quoted at USD {booking.quoted_price_usd:,.2f}.\n\n"
                    f"Reference: {booking.reference}\n\nNairobiJetHouse Team"
                )
                _send_and_log(request.user, booking.guest_email, booking.guest_name,
                              'Flight Booking Quote — NairobiJetHouse', body,
                              'flight_booking', booking.id)

            return Response(FlightBookingAdminSerializer(booking).data)
        return Response(ser.errors, status=400)

    @action(detail=True, methods=['post'])
    def assign_operator(self, request, pk=None):
        booking = self.get_object()
        operator_id = request.data.get('operator_id')
        aircraft_id = request.data.get('operator_aircraft_id')
        try:
            operator = CharterOperator.objects.get(pk=operator_id)
            booking.assigned_operator = operator
            if aircraft_id:
                aircraft = OperatorAircraft.objects.get(pk=aircraft_id, operator=operator)
                booking.operator_aircraft = aircraft
            booking.status = 'rfq_sent'
            booking.save()
            return Response(FlightBookingAdminSerializer(booking).data)
        except (CharterOperator.DoesNotExist, OperatorAircraft.DoesNotExist) as e:
            return Response({'detail': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    def send_rfq(self, request, pk=None):
        """Send RFQ to selected operators (creates stub bids or emails)."""
        booking      = self.get_object()
        operator_ids = request.data.get('operator_ids', [])
        if not operator_ids:
            return Response({'detail': 'operator_ids required.'}, status=400)

        operators = CharterOperator.objects.filter(id__in=operator_ids, status='active')
        sent      = []
        for op in operators:
            body = (
                f"Dear {op.primary_contact or op.name},\n\n"
                f"NairobiJetHouse is requesting a quote for the following flight:\n"
                f"Route: {booking.origin.code} → {booking.destination.code}\n"
                f"Date: {booking.departure_date}\n"
                f"Passengers: {booking.passenger_count}\n"
                f"Category: {booking.preferred_category or 'Open'}\n\n"
                f"Please submit your bid via the operator portal. Booking ref: {booking.reference}\n\n"
                f"NairobiJetHouse Operations"
            )
            _send_and_log(request.user, op.contact_email, op.name,
                          f'RFQ — {booking.origin.code}→{booking.destination.code} [{booking.reference}]',
                          body, 'rfq', booking.id)
            sent.append(op.name)

        booking.status = 'rfq_sent'
        booking.save()
        return Response({'detail': f'RFQ sent to: {", ".join(sent)}'})

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        from django.db.models.functions import TruncMonth
        data = (
            FlightBooking.objects
            .filter(status__in=['confirmed', 'completed'])
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                confirmed_count=Count('id'),
                gross_usd=Sum('quoted_price_usd'),
                commission_usd=Sum('commission_usd'),
                net_usd=Sum('net_revenue_usd'),
            )
            .order_by('month')
        )
        result = [
            {
                'month':           d['month'].strftime('%Y-%m'),
                'confirmed_count': d['confirmed_count'],
                'gross_usd':       d['gross_usd'] or 0,
                'commission_usd':  d['commission_usd'] or 0,
                'net_usd':         d['net_usd'] or 0,
            }
            for d in data
        ]
        return Response(result)


class AdminYachtCharterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = YachtCharterAdminSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['guest_name', 'guest_email', 'reference']

    def get_queryset(self):
        qs = YachtCharter.objects.all().select_related('yacht', 'operator_yacht', 'assigned_operator').order_by('-created_at')
        st = self.request.query_params.get('status')
        if st:
            qs = qs.filter(status=st)
        return qs

    @action(detail=True, methods=['post'])
    def set_price(self, request, pk=None):
        charter = self.get_object()
        ser     = YachtCharterPriceSerializer(data=request.data)
        if ser.is_valid():
            data = ser.validated_data
            charter.quoted_price_usd  = data['quoted_price_usd']
            charter.operator_cost_usd = data.get('operator_cost_usd')
            if data.get('status'):
                charter.status = data['status']
            charter.save()

            if data.get('send_email') and charter.guest_email:
                body = data.get('email_message') or (
                    f"Dear {charter.guest_name},\n\n"
                    f"Your yacht charter has been quoted at USD {charter.quoted_price_usd:,.2f}.\n\n"
                    f"Reference: {charter.reference}\n\nNairobiJetHouse Team"
                )
                _send_and_log(request.user, charter.guest_email, charter.guest_name,
                              'Yacht Charter Quote — NairobiJetHouse', body,
                              'yacht_charter', charter.id)

            return Response(YachtCharterAdminSerializer(charter).data)
        return Response(ser.errors, status=400)


class AdminInquiryViewSet(viewsets.ViewSet):
    """Aggregated view of all inquiry types."""
    permission_classes = [IsStaffOrAdmin]

    def list(self, request):
        leases  = LeaseInquiryAdminSerializer(LeaseInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        flights = FlightInquirySerializer(FlightInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        contacts = ContactInquiryAdminSerializer(ContactInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        groups  = GroupCharterInquiryAdminSerializer(GroupCharterInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        cargo   = AirCargoInquiryAdminSerializer(AirCargoInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        sales   = AircraftSalesInquiryAdminSerializer(AircraftSalesInquiry.objects.all().order_by('-created_at')[:10], many=True).data
        return Response({
            'leases': leases, 'flights': flights, 'contacts': contacts,
            'groups': groups, 'cargo': cargo, 'sales': sales,
        })


class AdminLeaseInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = LeaseInquiryAdminSerializer
    queryset           = LeaseInquiry.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        inquiry = self.get_object()
        ser     = InquiryReplySerializer(data=request.data)
        if ser.is_valid():
            data = ser.validated_data
            if data.get('new_status'):
                inquiry.status = data['new_status']
                inquiry.save()
            _send_and_log(request.user, inquiry.guest_email, inquiry.guest_name,
                          data['subject'], data['message'], 'lease_inquiry', inquiry.id)
            return Response({'detail': 'Reply sent.'})
        return Response(ser.errors, status=400)


class AdminContactInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = ContactInquiryAdminSerializer
    queryset           = ContactInquiry.objects.all().order_by('-created_at')


class AdminGroupCharterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = GroupCharterInquiryAdminSerializer
    queryset           = GroupCharterInquiry.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        inquiry = self.get_object()
        ser     = InquiryReplySerializer(data=request.data)
        if ser.is_valid():
            data = ser.validated_data
            if data.get('new_status'):
                inquiry.status = data['new_status']
                inquiry.save()
            _send_and_log(request.user, inquiry.email, inquiry.contact_name,
                          data['subject'], data['message'], 'group_charter', inquiry.id)
            return Response({'detail': 'Reply sent.'})
        return Response(ser.errors, status=400)


class AdminAirCargoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = AirCargoInquiryAdminSerializer
    queryset           = AirCargoInquiry.objects.all().order_by('-created_at')


class AdminAircraftSalesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = AircraftSalesInquiryAdminSerializer
    queryset           = AircraftSalesInquiry.objects.all().order_by('-created_at')


class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = UserAdminSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['username', 'email', 'first_name', 'last_name', 'company']
    queryset           = User.objects.all().order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'detail': f"User {'activated' if user.is_active else 'deactivated'}."})

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        valid_roles = [r[0] for r in User.ROLE_CHOICES]
        if new_role not in valid_roles:
            return Response({'detail': f'Invalid role. Choose from {valid_roles}.'}, status=400)
        user.role = new_role
        user.save()
        return Response({'detail': f'Role updated to {new_role}.'})


class AdminMarketplaceBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['client__username', 'client__email', 'aircraft__name', 'reference']
    queryset           = MarketplaceBooking.objects.all().select_related(
                             'client', 'aircraft', 'membership'
                         ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return MarketplaceBookingCreateAdminSerializer
        return MarketplaceBookingAdminSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        booking    = self.get_object()
        new_status = request.data.get('status')
        valid      = [s[0] for s in MarketplaceBooking.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'detail': f'Invalid status. Choose from {valid}.'}, status=400)
        booking.status = new_status
        booking.save()
        return Response(MarketplaceBookingAdminSerializer(booking).data)


class AdminEmailLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = EmailLogSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['to_email', 'subject', 'inquiry_type']
    queryset           = EmailLog.objects.all().order_by('-sent_at')


class AdminSendEmailView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        ser = SendEmailSerializer(data=request.data)
        if ser.is_valid():
            data    = ser.validated_data
            success = True
            err     = ''
            try:
                send_mail(
                    subject      = data['subject'],
                    message      = data['body'],
                    from_email   = settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[data['to_email']],
                    fail_silently=False,
                )
            except Exception as e:
                success = False
                err     = str(e)

            log = EmailLog.objects.create(
                sent_by      = request.user,
                to_email     = data['to_email'],
                to_name      = data.get('to_name', ''),
                subject      = data['subject'],
                body         = data['body'],
                inquiry_type = data.get('inquiry_type', 'general'),
                related_id   = data.get('related_id'),
                success      = success,
                error_msg    = err,
            )
            return Response(EmailLogSerializer(log).data, status=201 if success else 500)
        return Response(ser.errors, status=400)


class AdminCommissionSettingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = CommissionSettingSerializer
    queryset           = CommissionSetting.objects.all().order_by('-effective_from')

    def perform_create(self, serializer):
        serializer.save(set_by=self.request.user)


class AdminJobPostingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = JobPostingSerializer
    queryset           = JobPosting.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        job = self.get_object()
        job.is_active = not job.is_active
        job.save()
        return Response({'detail': f"Job {'activated' if job.is_active else 'deactivated'}."})

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        job = self.get_object()
        job.is_featured = not job.is_featured
        job.save()
        return Response({'detail': f"Job {'featured' if job.is_featured else 'unfeatured'}."})


class AdminJobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = JobApplicationSerializer
    queryset           = JobApplication.objects.all().select_related('job').order_by('-created_at')
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['full_name', 'email', 'job__title']

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        app        = self.get_object()
        new_status = request.data.get('status')
        valid      = [s[0] for s in JobApplication.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'detail': f'Invalid status. Choose from {valid}.'}, status=400)
        app.status = new_status
        notes      = request.data.get('notes', '')
        if notes:
            app.notes = notes
        app.save()
        return Response(JobApplicationSerializer(app).data)


class AdminPriceCalculatorView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        ser = PriceCalculatorSerializer(data=request.data)
        if ser.is_valid():
            data       = ser.validated_data
            hourly     = data.get('hourly_rate_usd')
            if not hourly and data.get('aircraft_id'):
                try:
                    ac = Aircraft.objects.get(pk=data['aircraft_id'])
                    hourly = ac.hourly_rate_usd
                except Aircraft.DoesNotExist:
                    return Response({'detail': 'Aircraft not found.'}, status=400)
            if not hourly:
                return Response({'detail': 'Provide hourly_rate_usd or aircraft_id.'}, status=400)

            hours          = Decimal(str(data['estimated_hours']))
            base           = (hourly * hours).quantize(Decimal('0.01'), ROUND_HALF_UP)
            catering       = Decimal('500') * data['passenger_count'] if data.get('catering') else Decimal('0')
            transport      = Decimal('300') if data.get('ground_transport') else Decimal('0')
            concierge      = Decimal('400') if data.get('concierge') else Decimal('0')
            subtotal       = base + catering + transport + concierge
            discount_pct   = Decimal(str(data.get('discount_pct', 0)))
            discount_amt   = (subtotal * discount_pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            after_discount = subtotal - discount_amt

            setting        = CommissionSetting.objects.order_by('-effective_from').first()
            comm_pct       = Decimal(str(data.get('commission_pct') or (setting.rate_pct if setting else 15)))
            commission     = (after_discount * comm_pct / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            total          = after_discount

            return Response({
                'hourly_rate_usd':   hourly,
                'estimated_hours':   hours,
                'base_flight_cost':  base,
                'catering':          catering,
                'ground_transport':  transport,
                'concierge':         concierge,
                'subtotal':          subtotal,
                'discount_pct':      discount_pct,
                'discount_amount':   discount_amt,
                'after_discount':    after_discount,
                'commission_pct':    comm_pct,
                'commission_amount': commission,
                'total_client_price': total,
                'njh_net':           commission,
                'operator_payout':   total - commission,
            })
        return Response(ser.errors, status=400)


# ═══════════════════════════════════════════════════════════════════════════════
# V2 ADMIN — CHARTER OPERATOR MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

class AdminCharterOperatorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['name', 'trading_name', 'country', 'contact_email']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CharterOperatorCreateSerializer
        if self.action == 'retrieve':
            return CharterOperatorDetailSerializer
        return CharterOperatorListSerializer

    def get_queryset(self):
        qs   = CharterOperator.objects.all().order_by('name')
        tier = self.request.query_params.get('tier')
        st   = self.request.query_params.get('status')
        if tier:
            qs = qs.filter(tier=tier)
        if st:
            qs = qs.filter(status=st)
        return qs

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        op = self.get_object()
        op.status = 'active'
        op.save()
        return Response({'detail': f'{op.name} activated.'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        op = self.get_object()
        op.status = 'suspended'
        op.save()
        return Response({'detail': f'{op.name} suspended.'})

    @action(detail=True, methods=['post'])
    def change_tier(self, request, pk=None):
        op       = self.get_object()
        new_tier = request.data.get('tier')
        valid    = [t[0] for t in CharterOperator.TIER_CHOICES]
        if new_tier not in valid:
            return Response({'detail': f'Invalid tier. Choose from {valid}.'}, status=400)
        op.tier = new_tier
        op.save()
        return Response({'detail': f'{op.name} tier updated to {new_tier}.'})

    @action(detail=True, methods=['get'])
    def aircraft(self, request, pk=None):
        op       = self.get_object()
        aircraft = OperatorAircraft.objects.filter(operator=op).order_by('name')
        return Response(OperatorAircraftListSerializer(aircraft, many=True).data)

    @action(detail=True, methods=['get'])
    def yachts(self, request, pk=None):
        op    = self.get_object()
        yachts = OperatorYacht.objects.filter(operator=op).order_by('name')
        return Response(OperatorYachtListSerializer(yachts, many=True).data)

    @action(detail=True, methods=['get'])
    def bookings(self, request, pk=None):
        op       = self.get_object()
        bookings = OperatorBooking.objects.filter(operator=op).order_by('-created_at')
        return Response(OperatorBookingSerializer(bookings, many=True).data)

    @action(detail=True, methods=['get'])
    def payouts(self, request, pk=None):
        op      = self.get_object()
        payouts = OperatorPayoutLog.objects.filter(operator=op).order_by('-created_at')
        return Response(OperatorPayoutLogSerializer(payouts, many=True).data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        op      = self.get_object()
        reviews = OperatorReview.objects.filter(operator=op).order_by('-created_at')
        return Response(OperatorReviewSerializer(reviews, many=True).data)

    @action(detail=True, methods=['get'])
    def webhooks(self, request, pk=None):
        op   = self.get_object()
        logs = WebhookLog.objects.filter(operator=op).order_by('-sent_at')[:50]
        return Response(WebhookLogSerializer(logs, many=True).data)


class AdminNJHCommissionRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = NJHCommissionRuleSerializer
    queryset           = NJHCommissionRule.objects.all().order_by('-priority', '-effective_from')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        rule = self.get_object()
        rule.is_active = not rule.is_active
        rule.save()
        return Response({'detail': f"Rule {'activated' if rule.is_active else 'deactivated'}."})


class AdminOperatorPayoutLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = OperatorPayoutLogSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['operator__name', 'bank_reference', 'reference']

    def get_queryset(self):
        qs = OperatorPayoutLog.objects.all().select_related('operator').order_by('-created_at')
        st = self.request.query_params.get('status')
        if st:
            qs = qs.filter(status=st)
        return qs

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        payout = self.get_object()
        payout.status             = 'paid'
        payout.paid_at            = timezone.now()
        payout.bank_reference     = request.data.get('bank_reference', payout.bank_reference)
        payout.processed_by       = request.user
        payout.save()
        return Response(OperatorPayoutLogSerializer(payout).data)

    @action(detail=True, methods=['post'])
    def mark_processing(self, request, pk=None):
        payout = self.get_object()
        payout.status = 'processing'
        payout.save()
        return Response(OperatorPayoutLogSerializer(payout).data)


class AdminWebhookLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class   = WebhookLogSerializer
    queryset           = WebhookLog.objects.all().select_related('operator').order_by('-sent_at')

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        log          = self.get_object()
        log.attempts += 1
        log.next_retry = None
        log.save()
        # Actual webhook retry would be handled by Celery / background task
        return Response({'detail': 'Retry queued.'})


class AdminDocumentUploadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffOrAdmin]
    serializer_class   = DocumentUploadSerializer
    queryset           = DocumentUpload.objects.all().order_by('-created_at')
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['file_name', 'doc_type', 'linked_to']


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class ClientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            membership = user.membership
        except Membership.DoesNotExist:
            membership = None

        bookings = MarketplaceBooking.objects.filter(
            client=user, status__in=['confirmed', 'in_flight']
        ).select_related('aircraft').order_by('departure_datetime')

        total_spent = MarketplaceBooking.objects.filter(
            client=user, status__in=['confirmed', 'completed']
        ).aggregate(t=Sum('gross_amount_usd'))['t'] or 0

        return Response({
            'membership':         MembershipSerializer(membership).data if membership else None,
            'upcoming_bookings':  MarketplaceBookingSerializer(bookings, many=True).data,
            'total_flights':      MarketplaceBooking.objects.filter(client=user).count(),
            'total_spent_usd':    total_spent,
            'renewal_alert':      membership.days_remaining is not None and membership.days_remaining <= 30 if membership else False,
            'days_remaining':     membership.days_remaining if membership else None,
        })


class OwnerDashboardView(APIView):
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request):
        user         = request.user
        aircraft_ids = MarketplaceAircraft.objects.filter(owner=user).values_list('id', flat=True)

        total_rev = MarketplaceBooking.objects.filter(
            aircraft_id__in=aircraft_ids, status__in=['confirmed', 'completed']
        ).aggregate(t=Sum('net_owner_usd'))['t'] or 0

        from datetime import date
        month_start = date.today().replace(day=1)
        monthly_rev = MarketplaceBooking.objects.filter(
            aircraft_id__in=aircraft_ids,
            status__in=['confirmed', 'completed'],
            created_at__date__gte=month_start,
        ).aggregate(t=Sum('net_owner_usd'))['t'] or 0

        maintenance_alerts = MaintenanceLog.objects.filter(
            aircraft_id__in=aircraft_ids, status='scheduled'
        ).select_related('aircraft').order_by('scheduled_date')

        return Response({
            'total_revenue_usd':      total_rev,
            'monthly_revenue_usd':    monthly_rev,
            'total_flight_hours':     MarketplaceAircraft.objects.filter(
                                         owner=user
                                      ).aggregate(t=Sum('total_flight_hours'))['t'] or 0,
            'upcoming_flights_count': MarketplaceBooking.objects.filter(
                                         aircraft_id__in=aircraft_ids, status='confirmed'
                                      ).count(),
            'maintenance_alerts':     MaintenanceLogSerializer(maintenance_alerts, many=True).data,
            'aircraft_count':         len(aircraft_ids),
        })


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _send_and_log(sent_by, to_email, to_name, subject, body, inquiry_type, related_id=None):
    success = True
    err     = ''
    try:
        send_mail(
            subject=subject, message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email], fail_silently=False,
        )
    except Exception as e:
        success = False
        err     = str(e)

    EmailLog.objects.create(
        sent_by=sent_by, to_email=to_email, to_name=to_name or '',
        subject=subject, body=body, inquiry_type=inquiry_type,
        related_id=related_id, success=success, error_msg=err,
    )
    return success