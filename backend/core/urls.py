# ═══════════════════════════════════════════════════════════════════════════════
# NairobiJetHouse V2 — core/urls.py
# ═══════════════════════════════════════════════════════════════════════════════
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Auth
    RegisterView, LoginView, ProfileView,

    # Public catalog
    AirportViewSet, AircraftViewSet, YachtViewSet,

    # Public bookings & inquiries
    FlightBookingViewSet, YachtCharterViewSet,
    LeaseInquiryViewSet, FlightInquiryViewSet,
    ContactInquiryViewSet, GroupCharterInquiryViewSet,
    AirCargoInquiryViewSet, AircraftSalesInquiryViewSet,

    # Public jobs
    JobPostingViewSet, JobApplicationViewSet,

    # Public operator listings (V2)
    PublicOperatorAircraftViewSet, PublicOperatorYachtViewSet,

    # Operator portal (V2)
    OperatorAircraftViewSet, OperatorYachtViewSet,
    AvailabilityBlockViewSet, RFQBidViewSet,
    OperatorBookingViewSet, OperatorReviewViewSet,

    # Membership & marketplace
    MembershipTierViewSet, MembershipViewSet,
    MarketplaceAircraftViewSet, MaintenanceLogViewSet,
    MarketplaceBookingViewSet, SavedRouteViewSet,
    PaymentRecordViewSet, DisputeViewSet,

    # Client notifications & documents
    ClientNotificationViewSet, DocumentUploadViewSet,

    # Dashboard views
    ClientDashboardView, OwnerDashboardView,

    # Admin — core
    AdminOverviewView,
    AdminFlightBookingViewSet, AdminYachtCharterViewSet,
    AdminInquiryViewSet,
    AdminLeaseInquiryViewSet, AdminContactInquiryViewSet,
    AdminGroupCharterViewSet, AdminAirCargoViewSet, AdminAircraftSalesViewSet,
    AdminUserViewSet, AdminMarketplaceBookingViewSet,
    AdminEmailLogViewSet, AdminSendEmailView,
    AdminCommissionSettingViewSet,
    AdminJobPostingViewSet, AdminJobApplicationViewSet,
    AdminPriceCalculatorView,

    # Admin — V2 operator network
    AdminCharterOperatorViewSet,
    AdminNJHCommissionRuleViewSet,
    AdminOperatorPayoutLogViewSet,
    AdminWebhookLogViewSet,
    AdminDocumentUploadViewSet,
)

# ─── Router ──────────────────────────────────────────────────────────────────
router = DefaultRouter()

# ── Public catalog
router.register(r'airports',   AirportViewSet,  basename='airport')
router.register(r'aircraft',   AircraftViewSet, basename='aircraft')
router.register(r'yachts',     YachtViewSet,    basename='yacht')

# ── Public bookings & inquiries
router.register(r'bookings',        FlightBookingViewSet,         basename='booking')
router.register(r'charters',        YachtCharterViewSet,          basename='charter')
router.register(r'leases',          LeaseInquiryViewSet,          basename='lease')
router.register(r'flight-inquiries',FlightInquiryViewSet,         basename='flight-inquiry')
router.register(r'contacts',        ContactInquiryViewSet,        basename='contact')
router.register(r'group-charters',  GroupCharterInquiryViewSet,   basename='group-charter')
router.register(r'cargo',           AirCargoInquiryViewSet,       basename='cargo')
router.register(r'aircraft-sales',  AircraftSalesInquiryViewSet,  basename='aircraft-sales')

# ── Public jobs
router.register(r'jobs',             JobPostingViewSet,    basename='job')
router.register(r'job-applications', JobApplicationViewSet, basename='job-application')

# ── Public operator listings (V2)
router.register(r'operator-aircraft', PublicOperatorAircraftViewSet, basename='public-operator-aircraft')
router.register(r'operator-yachts',   PublicOperatorYachtViewSet,    basename='public-operator-yacht')

# ── Operator portal (V2)
router.register(r'my-aircraft',        OperatorAircraftViewSet,  basename='my-aircraft')
router.register(r'my-yachts',          OperatorYachtViewSet,     basename='my-yachts')
router.register(r'availability-blocks',AvailabilityBlockViewSet, basename='availability-block')
router.register(r'rfq-bids',           RFQBidViewSet,            basename='rfq-bid')
router.register(r'operator-bookings',  OperatorBookingViewSet,   basename='operator-booking')
router.register(r'operator-reviews',   OperatorReviewViewSet,    basename='operator-review')

# ── Membership & marketplace
router.register(r'membership-tiers',    MembershipTierViewSet,        basename='membership-tier')
router.register(r'memberships',         MembershipViewSet,            basename='membership')
router.register(r'marketplace-aircraft',MarketplaceAircraftViewSet,   basename='marketplace-aircraft')
router.register(r'maintenance-logs',    MaintenanceLogViewSet,        basename='maintenance-log')
router.register(r'marketplace-bookings',MarketplaceBookingViewSet,    basename='marketplace-booking')
router.register(r'saved-routes',        SavedRouteViewSet,            basename='saved-route')
router.register(r'payments',            PaymentRecordViewSet,         basename='payment')
router.register(r'disputes',            DisputeViewSet,               basename='dispute')

# ── Notifications & documents
router.register(r'notifications', ClientNotificationViewSet, basename='notification')
router.register(r'documents',     DocumentUploadViewSet,     basename='document')

# ── Admin — core
router.register(r'admin/flight-bookings',   AdminFlightBookingViewSet,   basename='admin-booking')
router.register(r'admin/yacht-charters',    AdminYachtCharterViewSet,    basename='admin-charter')
router.register(r'admin/inquiries',         AdminInquiryViewSet,         basename='admin-inquiry')
router.register(r'admin/leases',            AdminLeaseInquiryViewSet,    basename='admin-lease')
router.register(r'admin/contacts',          AdminContactInquiryViewSet,  basename='admin-contact')
router.register(r'admin/group-charters',    AdminGroupCharterViewSet,    basename='admin-group')
router.register(r'admin/cargo',             AdminAirCargoViewSet,        basename='admin-cargo')
router.register(r'admin/aircraft-sales',    AdminAircraftSalesViewSet,   basename='admin-sales')
router.register(r'admin/users',             AdminUserViewSet,            basename='admin-user')
router.register(r'admin/marketplace',       AdminMarketplaceBookingViewSet, basename='admin-marketplace')
router.register(r'admin/email-logs',        AdminEmailLogViewSet,        basename='admin-email-log')
router.register(r'admin/commission',        AdminCommissionSettingViewSet,basename='admin-commission')
router.register(r'admin/jobs',              AdminJobPostingViewSet,      basename='admin-job')
router.register(r'admin/job-applications',  AdminJobApplicationViewSet,  basename='admin-job-app')
router.register(r'admin/documents',         AdminDocumentUploadViewSet,  basename='admin-document')

# ── Admin — V2 operator network
router.register(r'admin/operators',         AdminCharterOperatorViewSet,    basename='admin-operator')
router.register(r'admin/commission-rules',  AdminNJHCommissionRuleViewSet,  basename='admin-commission-rule')
router.register(r'admin/payouts',           AdminOperatorPayoutLogViewSet,  basename='admin-payout')
router.register(r'admin/webhooks',          AdminWebhookLogViewSet,         basename='admin-webhook')

# ─── URL Patterns ─────────────────────────────────────────────────────────────
urlpatterns = [

    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/register/', RegisterView.as_view(),      name='auth-register'),
    path('auth/login/',    LoginView.as_view(),          name='auth-login'),
    path('auth/refresh/',  TokenRefreshView.as_view(),  name='auth-refresh'),
    path('auth/profile/',  ProfileView.as_view(),        name='auth-profile'),

    # ── Dashboards ────────────────────────────────────────────────────────────
    path('dashboard/client/', ClientDashboardView.as_view(), name='client-dashboard'),
    path('dashboard/owner/',  OwnerDashboardView.as_view(),  name='owner-dashboard'),

    # ── Admin standalone views ─────────────────────────────────────────────
    path('admin/overview/',        AdminOverviewView.as_view(),     name='admin-overview'),
    path('admin/send-email/',      AdminSendEmailView.as_view(),    name='admin-send-email'),
    path('admin/price-calculator/',AdminPriceCalculatorView.as_view(), name='admin-price-calc'),

    # ── Router URLs ────────────────────────────────────────────────────────
    path('', include(router.urls)),
]