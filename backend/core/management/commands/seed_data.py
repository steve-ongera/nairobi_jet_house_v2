"""
core/management/commands/seed_data.py
──────────────────────────────────────────────────────────────────────────────
NairobiJetHouse V2 — Full Seed Data
Covers ~6 months of realistic data across ALL V1 + V2 models.
Password for all seeded users: password123
Run: python manage.py seed_data
──────────────────────────────────────────────────────────────────────────────
"""

import random
import uuid
from datetime import date, timedelta, time, datetime
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import (
    Airport, Aircraft, Yacht,
    CharterOperator, OperatorAircraft, OperatorYacht,
    AvailabilityBlock, NJHCommissionRule,
    FlightBooking, FlightLeg, RFQBid,
    YachtCharter, OperatorBooking, OperatorPayoutLog,
    OperatorReview, DocumentUpload, ClientNotification,
    WebhookLog,
    LeaseInquiry, FlightInquiry, ContactInquiry,
    GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog, MarketplaceBooking,
    CommissionSetting, PaymentRecord, SavedRoute, Dispute,
    EmailLog, JobPosting, JobApplication,
)

User = get_user_model()

# ── Helpers ──────────────────────────────────────────────────────────────────

def days_ago(n):
    return (timezone.now() - timedelta(days=n)).date()

def future_date(n):
    return (timezone.now() + timedelta(days=n)).date()

def rand_dt(start_days_ago, end_days_ago=0):
    diff = start_days_ago - end_days_ago
    d = days_ago(random.randint(end_days_ago, start_days_ago))
    t = time(random.randint(5, 22), random.choice([0, 15, 30, 45]))
    return timezone.make_aware(datetime.combine(d, t))

def pick(lst):
    return random.choice(lst)

def usd(lo, hi):
    return Decimal(str(round(random.uniform(lo, hi), 2)))


# ── Image Banks ──────────────────────────────────────────────────────────────

AIRCRAFT_IMAGES = {
    "light": [
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
        "https://images.unsplash.com/photo-1559628233-100c798642d3?w=800",
        "https://images.unsplash.com/photo-1474302771604-7a6e76ab2b6c?w=800",
    ],
    "midsize": [
        "https://images.unsplash.com/photo-1583221310009-2949e2b89f49?w=800",
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
        "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800",
    ],
    "super_midsize": [
        "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800",
        "https://images.unsplash.com/photo-1548116137-c9ac24e446b9?w=800",
    ],
    "heavy": [
        "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800",
        "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    ],
    "ultra_long": [
        "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800",
        "https://images.unsplash.com/photo-1601574061164-e00a6e6d6d49?w=800",
    ],
    "vip_airliner": [
        "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    ],
    "turboprop": [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        "https://images.unsplash.com/photo-1519453575327-9d0fde785a50?w=800",
    ],
    "helicopter": [
        "https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?w=800",
        "https://images.unsplash.com/photo-1569982175971-d92b01cf7694?w=800",
    ],
}

YACHT_IMAGES = [
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800",
    "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800",
    "https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800",
]

AVATAR_URLS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200",
]

LOGO_URLS = [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
]


class Command(BaseCommand):
    help = "Seed NairobiJetHouse V2 with ~6 months of realistic demo data."

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING("\n🛫  NairobiJetHouse V2 — Seeding Data\n"))

        self._seed_users()
        self._seed_commission_settings()
        self._seed_njh_commission_rules()
        self._seed_membership_tiers()
        self._seed_memberships()
        self._seed_aircraft_catalog()
        self._seed_yacht_catalog()
        self._seed_charter_operators()
        self._seed_operator_aircraft()
        self._seed_operator_yachts()
        self._seed_availability_blocks()
        self._seed_marketplace_aircraft()
        self._seed_maintenance_logs()
        self._seed_flight_bookings()
        self._seed_rfq_bids()
        self._seed_yacht_charters()
        self._seed_operator_bookings()
        self._seed_operator_payouts()
        self._seed_operator_reviews()
        self._seed_marketplace_bookings()
        self._seed_payment_records()
        self._seed_lease_inquiries()
        self._seed_flight_inquiries()
        self._seed_contact_inquiries()
        self._seed_group_charter_inquiries()
        self._seed_air_cargo_inquiries()
        self._seed_aircraft_sales_inquiries()
        self._seed_document_uploads()
        self._seed_client_notifications()
        self._seed_webhook_logs()
        self._seed_saved_routes()
        self._seed_disputes()
        self._seed_email_logs()
        self._seed_job_postings()
        self._seed_job_applications()

        self.stdout.write(self.style.SUCCESS("\n✅  Seed complete!\n"))

    # ─────────────────────────────────────────────────────────────────────────
    # USERS
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_users(self):
        self.stdout.write("  → Users")

        staff_data = [
            ("admin",       "admin@nairobijethouse.com",     "admin"),
            ("ops_manager", "ops@nairobijethouse.com",       "staff"),
            ("sales_lead",  "sales@nairobijethouse.com",     "staff"),
            ("finance",     "finance@nairobijethouse.com",   "staff"),
        ]
        self.staff_users = []
        for username, email, role in staff_data:
            u, created = User.objects.get_or_create(username=username, defaults=dict(
                email=email, role=role, first_name=username.capitalize(),
                last_name="NJH", phone="+254700000001",
                avatar_url=pick(AVATAR_URLS), is_staff=(role == "admin"),
                is_superuser=(role == "admin"),
            ))
            if created:
                u.set_password("password123")
                u.save()
            self.staff_users.append(u)

        client_data = [
            ("amani_kariuki",   "amani@gmail.com",       "James Amani",     "Kariuki",   "+254712345678",  "Kariuki Holdings"),
            ("sophia_waweru",   "sophia@waweru.co.ke",   "Sophia",          "Waweru",    "+254723456789",  "Waweru Ventures"),
            ("david_omondi",    "david@omondi.com",      "David",           "Omondi",    "+254734567890",  "Omondi Logistics"),
            ("fatuma_ali",      "fatuma@ali.co.ke",      "Fatuma",          "Ali",       "+254745678901",  "Ali Trading Co."),
            ("peter_ngugi",     "peter@ngugi.co.ke",     "Peter",           "Ngugi",     "+254756789012",  "Ngugi Properties"),
            ("grace_mutua",     "grace@mutua.com",       "Grace",           "Mutua",     "+254767890123",  ""),
            ("hassan_omar",     "hassan@omar.co.ke",     "Hassan",          "Omar",      "+254778901234",  "Omar Group"),
            ("esther_wanjiku",  "esther@wanjiku.com",    "Esther",          "Wanjiku",   "+254789012345",  "Wanjiku Safaris"),
            ("john_kamau",      "john@kamau.co.ke",      "John",            "Kamau",     "+254790123456",  "Kamau Corp"),
            ("linda_achieng",   "linda@achieng.com",     "Linda",           "Achieng",   "+254701234567",  ""),
            ("omar_farah",      "omar@farah.so",         "Omar",            "Farah",     "+252612345678",  "Farah Investments"),
            ("isabella_rosa",   "isabella@rosa.it",      "Isabella",        "Rosa",      "+393312345678",  "Rosa Capital"),
        ]
        self.clients = []
        for username, email, first, last, phone, company in client_data:
            u, created = User.objects.get_or_create(username=username, defaults=dict(
                email=email, role="client", first_name=first, last_name=last,
                phone=phone, company=company, avatar_url=pick(AVATAR_URLS),
            ))
            if created:
                u.set_password("password123")
                u.save()
            self.clients.append(u)

        operator_data = [
            ("op_afrijet",     "dispatch@afrijet.co.ke",   "AfriqJet Ops"),
            ("op_savanna",     "ops@savannair.com",        "Savanna Air"),
            ("op_coastair",    "fleet@coastair.ke",        "CoastAir"),
            ("op_kilijet",     "bookings@kilijet.tz",      "KiliJet"),
            ("op_riftvalley",  "ops@riftvalleyair.ke",     "Rift Valley Air"),
        ]
        self.operator_users = []
        for username, email, company in operator_data:
            u, created = User.objects.get_or_create(username=username, defaults=dict(
                email=email, role="operator", first_name=company.split()[0],
                last_name="Ops", phone="+254700000099", company=company,
            ))
            if created:
                u.set_password("password123")
                u.save()
            self.operator_users.append(u)

        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.clients)+len(self.staff_users)+len(self.operator_users)} users"))

    # ─────────────────────────────────────────────────────────────────────────
    # COMMISSION SETTINGS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_commission_settings(self):
        self.stdout.write("  → CommissionSettings")
        admin = User.objects.filter(role="admin").first()
        settings_data = [
            (Decimal("10.00"), days_ago(180)),
            (Decimal("12.00"), days_ago(120)),
            (Decimal("13.50"), days_ago(60)),
            (Decimal("15.00"), days_ago(0)),
        ]
        for rate, eff in settings_data:
            CommissionSetting.objects.get_or_create(effective_from=eff, defaults=dict(
                rate_pct=rate, notes=f"Rate updated {eff}", set_by=admin,
            ))
        self.stdout.write(self.style.SUCCESS("    ✓ 4 commission settings"))

    # ─────────────────────────────────────────────────────────────────────────
    # NJH COMMISSION RULES (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_njh_commission_rules(self):
        self.stdout.write("  → NJHCommissionRules")
        admin = User.objects.filter(role="admin").first()
        rules = [
            dict(name="Default Platform Rate", priority=0, markup_pct=Decimal("20"), commission_pct=Decimal("15"),
                 description="Baseline markup for all bookings"),
            dict(name="Exclusive Partner Discount", priority=10, operator_tier="exclusive",
                 markup_pct=Decimal("15"), commission_pct=Decimal("12"),
                 description="Reduced markup for exclusive partners"),
            dict(name="Preferred Partner Rate", priority=5, operator_tier="preferred",
                 markup_pct=Decimal("17"), commission_pct=Decimal("13"),
                 description="Preferred partner special rate"),
            dict(name="High Value Flight Discount", priority=8, min_booking_usd=Decimal("50000"),
                 markup_pct=Decimal("12"), commission_pct=Decimal("10"),
                 description="Reduced margin on mega-bookings over $50k"),
            dict(name="Helicopter Rate", priority=6, asset_category="helicopter",
                 markup_pct=Decimal("25"), commission_pct=Decimal("18"),
                 description="Higher margin on helicopter charters"),
        ]
        for r in rules:
            NJHCommissionRule.objects.get_or_create(name=r["name"], defaults={**r,
                "is_active": True, "effective_from": days_ago(180), "created_by": admin})
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(rules)} commission rules"))

    # ─────────────────────────────────────────────────────────────────────────
    # MEMBERSHIP TIERS
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_membership_tiers(self):
        self.stdout.write("  → MembershipTiers")
        tiers = [
            dict(name="basic", display_name="NJH Basic", monthly_fee_usd=Decimal("299"),
                 annual_fee_usd=Decimal("2999"), hourly_discount_pct=Decimal("0"),
                 priority_booking=False, dedicated_support=False, exclusive_listings=False,
                 max_monthly_bookings=3,
                 features_list=["Access to light & midsize jets", "Standard support", "Online booking portal"],
                 description="Entry-level membership for occasional flyers."),
            dict(name="premium", display_name="NJH Premium", monthly_fee_usd=Decimal("999"),
                 annual_fee_usd=Decimal("9999"), hourly_discount_pct=Decimal("5"),
                 priority_booking=True, dedicated_support=True, exclusive_listings=False,
                 max_monthly_bookings=10,
                 features_list=["All jet categories", "5% hourly discount", "Priority booking", "Dedicated concierge"],
                 description="Premium access with priority service."),
            dict(name="corporate", display_name="NJH Corporate", monthly_fee_usd=Decimal("2999"),
                 annual_fee_usd=Decimal("29999"), hourly_discount_pct=Decimal("10"),
                 priority_booking=True, dedicated_support=True, exclusive_listings=True,
                 max_monthly_bookings=50,
                 features_list=["Unlimited bookings", "10% discount", "Exclusive listings", "White-glove concierge",
                                 "Yacht charters included", "Multi-leg routing"],
                 description="Full corporate suite for high-frequency flyers."),
        ]
        self.tiers = {}
        for t in tiers:
            obj, _ = MembershipTier.objects.get_or_create(name=t["name"], defaults=t)
            self.tiers[t["name"]] = obj
        self.stdout.write(self.style.SUCCESS("    ✓ 3 membership tiers"))

    # ─────────────────────────────────────────────────────────────────────────
    # MEMBERSHIPS
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_memberships(self):
        self.stdout.write("  → Memberships")
        assignments = [
            (self.clients[0],  "corporate", "annual"),
            (self.clients[1],  "premium",   "annual"),
            (self.clients[2],  "premium",   "monthly"),
            (self.clients[3],  "basic",     "monthly"),
            (self.clients[4],  "corporate", "annual"),
            (self.clients[5],  "basic",     "annual"),
            (self.clients[6],  "premium",   "annual"),
            (self.clients[7],  "premium",   "annual"),
            (self.clients[8],  "corporate", "annual"),
            (self.clients[9],  "basic",     "monthly"),
            (self.clients[10], "premium",   "annual"),
            (self.clients[11], "corporate", "annual"),
        ]
        self.memberships = []
        for user, tier_name, billing in assignments:
            tier = self.tiers[tier_name]
            start = days_ago(random.randint(30, 180))
            end = start + timedelta(days=365 if billing == "annual" else 30)
            amount = tier.annual_fee_usd if billing == "annual" else tier.monthly_fee_usd
            m, _ = Membership.objects.get_or_create(user=user, defaults=dict(
                tier=tier, status="active", billing_cycle=billing,
                start_date=start, end_date=end, auto_renew=True,
                amount_paid=amount,
            ))
            self.memberships.append(m)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.memberships)} memberships"))

    # ─────────────────────────────────────────────────────────────────────────
    # AIRCRAFT CATALOG (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_aircraft_catalog(self):
        self.stdout.write("  → Aircraft Catalog")
        catalog = [
            dict(name="Cessna Citation CJ3+", model="Citation CJ3+", category="light",
                 passenger_capacity=7, range_km=3300, cruise_speed_kmh=778,
                 hourly_rate_usd=Decimal("3500"), amenities=["Wi-Fi", "Leather seats", "Refreshment bar"],
                 description="Ideal for short East African hops. Efficient and nimble.",
                 image_url=AIRCRAFT_IMAGES["light"][0]),
            dict(name="Embraer Phenom 300E", model="Phenom 300E", category="light",
                 passenger_capacity=8, range_km=3650, cruise_speed_kmh=834,
                 hourly_rate_usd=Decimal("4200"), amenities=["Wi-Fi", "Flat-screen", "Catering"],
                 description="Best-selling light jet, perfect for NBO–MBA runs.",
                 image_url=AIRCRAFT_IMAGES["light"][1]),
            dict(name="Hawker 900XP", model="Hawker 900XP", category="midsize",
                 passenger_capacity=9, range_km=5250, cruise_speed_kmh=842,
                 hourly_rate_usd=Decimal("6500"), amenities=["Stand-up cabin", "Wi-Fi", "Full galley"],
                 description="Proven midsize workhorse with transcon capability.",
                 image_url=AIRCRAFT_IMAGES["midsize"][0]),
            dict(name="Bombardier Learjet 75", model="Learjet 75", category="midsize",
                 passenger_capacity=8, range_km=4445, cruise_speed_kmh=860,
                 hourly_rate_usd=Decimal("5800"), amenities=["Bose noise-cancelling", "Wi-Fi", "Catering"],
                 description="Iconic performance. Nairobi to Johannesburg non-stop.",
                 image_url=AIRCRAFT_IMAGES["midsize"][1]),
            dict(name="Bombardier Challenger 350", model="Challenger 350", category="super_midsize",
                 passenger_capacity=10, range_km=5926, cruise_speed_kmh=870,
                 hourly_rate_usd=Decimal("8500"), amenities=["Full stand-up cabin", "Lie-flat seats", "Wi-Fi", "Entertainment system"],
                 description="Super-midsize comfort with intercontinental range.",
                 image_url=AIRCRAFT_IMAGES["super_midsize"][0]),
            dict(name="Gulfstream G550", model="G550", category="heavy",
                 passenger_capacity=16, range_km=12500, cruise_speed_kmh=901,
                 hourly_rate_usd=Decimal("13500"), amenities=["Sleeping quarters", "Shower", "Full galley", "Conference table"],
                 description="NBO–LHR non-stop. The executive flagship.",
                 image_url=AIRCRAFT_IMAGES["heavy"][0]),
            dict(name="Bombardier Global 6000", model="Global 6000", category="heavy",
                 passenger_capacity=14, range_km=11112, cruise_speed_kmh=904,
                 hourly_rate_usd=Decimal("15000"), amenities=["3-zone cabin", "King bed", "Full office", "Shower"],
                 description="Ultra-long range with Bombardier's finest interior.",
                 image_url=AIRCRAFT_IMAGES["heavy"][1]),
            dict(name="Gulfstream G700", model="G700", category="ultra_long",
                 passenger_capacity=19, range_km=13890, cruise_speed_kmh=956,
                 hourly_rate_usd=Decimal("22000"), amenities=["Master suite", "Shower", "Full-size galley", "Cinema lounge"],
                 description="The pinnacle of private aviation.",
                 image_url=AIRCRAFT_IMAGES["ultra_long"][0]),
            dict(name="Boeing BBJ 737", model="BBJ 737-700", category="vip_airliner",
                 passenger_capacity=50, range_km=11000, cruise_speed_kmh=850,
                 hourly_rate_usd=Decimal("35000"), amenities=["VIP cabin", "Boardroom", "Bedrooms", "Full kitchen"],
                 description="Head-of-state configured 737 for large delegations.",
                 image_url=AIRCRAFT_IMAGES["vip_airliner"][0]),
            dict(name="Pilatus PC-12 NGX", model="PC-12 NGX", category="turboprop",
                 passenger_capacity=9, range_km=1800, cruise_speed_kmh=528,
                 hourly_rate_usd=Decimal("2200"), amenities=["Cargo door", "Short-field capability"],
                 description="Workhorse for remote Kenyan airstrips.",
                 image_url=AIRCRAFT_IMAGES["turboprop"][0]),
            dict(name="Cessna Grand Caravan EX", model="Grand Caravan EX", category="turboprop",
                 passenger_capacity=13, range_km=1500, cruise_speed_kmh=341,
                 hourly_rate_usd=Decimal("1800"), amenities=["Bush-strip capable", "Scenic windows"],
                 description="The Mara safari workhorse — lands anywhere.",
                 image_url=AIRCRAFT_IMAGES["turboprop"][1]),
            dict(name="Airbus H145", model="H145", category="helicopter",
                 passenger_capacity=8, range_km=640, cruise_speed_kmh=268,
                 hourly_rate_usd=Decimal("4500"), amenities=["VIP interior", "Air-conditioning"],
                 description="Premium heli transfer for game reserves.",
                 image_url=AIRCRAFT_IMAGES["helicopter"][0]),
        ]
        self.catalog_aircraft = []
        for a in catalog:
            obj, _ = Aircraft.objects.get_or_create(name=a["name"], defaults=a)
            self.catalog_aircraft.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.catalog_aircraft)} catalog aircraft"))

    # ─────────────────────────────────────────────────────────────────────────
    # YACHT CATALOG (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_yacht_catalog(self):
        self.stdout.write("  → Yacht Catalog")
        yachts = [
            dict(name="Malaika", size_category="medium", length_meters=Decimal("38"),
                 guest_capacity=10, crew_count=5, daily_rate_usd=Decimal("8500"),
                 home_port="Mombasa, Kenya",
                 amenities=["Water toys", "Snorkelling gear", "Sundeck"],
                 description="Luxury motor yacht perfect for Kenyan Coast cruises.",
                 image_url=YACHT_IMAGES[0]),
            dict(name="Serengeti Dream", size_category="large", length_meters=Decimal("55"),
                 guest_capacity=14, crew_count=9, daily_rate_usd=Decimal("18000"),
                 home_port="Zanzibar, Tanzania",
                 amenities=["Jacuzzi", "Jet skis", "Dive centre", "Cinema"],
                 description="Flagship superyacht for Indian Ocean expeditions.",
                 image_url=YACHT_IMAGES[1]),
            dict(name="Diani Pearl", size_category="small", length_meters=Decimal("25"),
                 guest_capacity=6, crew_count=3, daily_rate_usd=Decimal("4500"),
                 home_port="Diani Beach, Kenya",
                 amenities=["Kayaks", "Snorkelling", "Barbecue"],
                 description="Intimate sailing catamaran for Diani getaways.",
                 image_url=YACHT_IMAGES[2]),
            dict(name="Victoria Queen", size_category="superyacht", length_meters=Decimal("82"),
                 guest_capacity=20, crew_count=16, daily_rate_usd=Decimal("55000"),
                 home_port="Dubai Marina, UAE",
                 amenities=["Helipad", "Cinema", "Spa", "Pool", "Submarine"],
                 description="Ultra-luxury superyacht; charters through Seychelles.",
                 image_url=YACHT_IMAGES[3]),
        ]
        self.catalog_yachts = []
        for y in yachts:
            obj, _ = Yacht.objects.get_or_create(name=y["name"], defaults=y)
            self.catalog_yachts.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.catalog_yachts)} catalog yachts"))

    # ─────────────────────────────────────────────────────────────────────────
    # CHARTER OPERATORS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_charter_operators(self):
        self.stdout.write("  → CharterOperators")
        nbo = Airport.objects.filter(code="NBO").first()
        mba = Airport.objects.filter(code="MBA").first()
        dar = Airport.objects.filter(code="DAR").first()
        jnb = Airport.objects.filter(code="JNB").first()
        dxb = Airport.objects.filter(code="DXB").first()

        ops_data = [
            dict(
                name="AfriqJet Aviation Ltd", trading_name="AfriqJet",
                registration_no="AOC/KE/2019/034", country="Kenya", city="Nairobi",
                contact_email="ops@afriqjet.co.ke", contact_phone="+254711000001",
                website="https://afriqjet.co.ke", tier="exclusive", status="active",
                commission_override_pct=None,
                bank_name="Equity Bank Kenya", bank_account_no="0011234567891",
                bank_swift="EQBLKENA", payout_currency="USD", payment_terms_days=7,
                aoc_number="AOC/KE/2019/034", insurance_provider="Allianz Aviation",
                insurance_expiry=future_date(180), argus_rating="Platinum", wyvern_rating="REGISTERED",
                operating_regions=["AF", "EU", "AS"],
                accepts_last_minute=True, logo_url=LOGO_URLS[0],
                notes="Primary exclusive partner — Nairobi-based, fleet of 8.",
                address="Hangar 4, Wilson Airport, Nairobi",
            ),
            dict(
                name="Savanna Air (EA) Ltd", trading_name="Savanna Air",
                registration_no="AOC/KE/2020/017", country="Kenya", city="Nairobi",
                contact_email="fleet@savannair.com", contact_phone="+254722000002",
                website="https://savannair.com", tier="preferred", status="active",
                commission_override_pct=None,
                bank_name="KCB Bank Kenya", bank_account_no="1234500078",
                bank_swift="KCBLKENX", payout_currency="USD", payment_terms_days=10,
                aoc_number="AOC/KE/2020/017", insurance_provider="AIG Aviation",
                insurance_expiry=future_date(90), argus_rating="Gold", wyvern_rating="",
                operating_regions=["AF"],
                accepts_last_minute=True, logo_url=LOGO_URLS[1],
                notes="Strong for Mara & Coast routes.",
                address="Hangar 7, JKIA, Nairobi",
            ),
            dict(
                name="CoastAir Kenya Ltd", trading_name="CoastAir",
                registration_no="AOC/KE/2018/009", country="Kenya", city="Mombasa",
                contact_email="ops@coastair.ke", contact_phone="+254733000003",
                website="https://coastair.ke", tier="standard", status="active",
                commission_override_pct=Decimal("18.00"),
                bank_name="Standard Chartered Kenya", bank_account_no="8877665544",
                bank_swift="SCBLKENX", payout_currency="USD", payment_terms_days=14,
                aoc_number="AOC/KE/2018/009", insurance_provider="Marsh Aviation",
                insurance_expiry=future_date(60), argus_rating="", wyvern_rating="",
                operating_regions=["AF"],
                accepts_last_minute=False, logo_url=LOGO_URLS[2],
                notes="Coastal specialist — Mombasa, Lamu, Zanzibar routes.",
                address="Moi International Airport, Mombasa",
            ),
            dict(
                name="KiliJet Tanzania Ltd", trading_name="KiliJet",
                registration_no="AOC/TZ/2021/005", country="Tanzania", city="Dar es Salaam",
                contact_email="bookings@kilijet.tz", contact_phone="+255754000004",
                website="https://kilijet.tz", tier="preferred", status="active",
                commission_override_pct=None,
                bank_name="CRDB Bank Tanzania", bank_account_no="0150144500000",
                bank_swift="CORUTZTZ", payout_currency="USD", payment_terms_days=7,
                aoc_number="AOC/TZ/2021/005", insurance_provider="Chartis Aviation",
                insurance_expiry=future_date(200), argus_rating="Silver", wyvern_rating="",
                operating_regions=["AF"],
                accepts_last_minute=True, logo_url=LOGO_URLS[3],
                notes="Tanzania + Southern Africa corridor.",
                address="Julius Nyerere Intl, Dar es Salaam",
            ),
            dict(
                name="Rift Valley Air (EA) Ltd", trading_name="Rift Valley Air",
                registration_no="AOC/KE/2017/022", country="Kenya", city="Nakuru",
                contact_email="ops@riftvalleyair.ke", contact_phone="+254744000005",
                website="https://riftvalleyair.ke", tier="standard", status="active",
                commission_override_pct=None,
                bank_name="Cooperative Bank Kenya", bank_account_no="01129837621000",
                bank_swift="KCOOKENA", payout_currency="KES", payment_terms_days=14,
                aoc_number="AOC/KE/2017/022", insurance_provider="CIC Insurance",
                insurance_expiry=future_date(120), argus_rating="", wyvern_rating="",
                operating_regions=["AF"],
                accepts_last_minute=True, logo_url=LOGO_URLS[0],
                notes="Rift Valley corridor specialist. Safari & cargo.",
                address="Nakuru Airport, Nakuru",
            ),
        ]

        airports_map = {
            "NBO": nbo, "MBA": mba, "DAR": dar, "JNB": jnb, "DXB": dxb,
        }
        base_map = [
            [nbo],
            [nbo, mba],
            [mba],
            [dar],
            [nbo],
        ]

        self.operators = []
        for i, data in enumerate(ops_data):
            op, _ = CharterOperator.objects.get_or_create(name=data["name"], defaults=data)
            user = self.operator_users[i]
            op.users.add(user)
            for airport in base_map[i]:
                if airport:
                    op.base_airports.add(airport)
            self.operators.append(op)

        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.operators)} charter operators"))

    # ─────────────────────────────────────────────────────────────────────────
    # OPERATOR AIRCRAFT (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_operator_aircraft(self):
        self.stdout.write("  → OperatorAircraft")
        nbo = Airport.objects.filter(code="NBO").first()
        mba = Airport.objects.filter(code="MBA").first()
        wil = Airport.objects.filter(code="WIL").first()
        dar = Airport.objects.filter(code="DAR").first()

        aircraft_data = [
            # AfriqJet — exclusive
            dict(operator=self.operators[0], catalog_aircraft=self.catalog_aircraft[5],
                 name="AfriqJet Gulfstream G550", model="Gulfstream G550", category="heavy",
                 registration_number="5Y-AJG", year_of_manufacture=2018, base_airport=nbo,
                 passenger_capacity=14, range_km=12500, cruise_speed_kmh=901,
                 max_baggage_kg=1800, wifi_available=True, pets_allowed=True, smoking_allowed=False,
                 hourly_rate_usd=Decimal("11500"), min_hours=Decimal("2.0"),
                 positioning_fee_usd=Decimal("0"), overnight_fee_usd=Decimal("2500"),
                 status="available", is_approved=True, is_featured=True,
                 total_flight_hours=Decimal("3420.5"), maintenance_interval_hours=500,
                 last_maintenance_hours=Decimal("3250.0"), next_maintenance_date=future_date(45),
                 airworthiness_expiry=future_date(300), insurance_expiry=future_date(180),
                 description="NJH's flagship — NBO to LHR non-stop. Full sleeping quarters.",
                 amenities=["Sleeping quarters", "Shower", "Full galley", "Conference table", "Sat phone"],
                 images=[AIRCRAFT_IMAGES["heavy"][0], AIRCRAFT_IMAGES["heavy"][1]],
                 image_url=AIRCRAFT_IMAGES["heavy"][0]),
            dict(operator=self.operators[0], catalog_aircraft=self.catalog_aircraft[4],
                 name="AfriqJet Challenger 350", model="Bombardier Challenger 350", category="super_midsize",
                 registration_number="5Y-AJC", year_of_manufacture=2020, base_airport=nbo,
                 passenger_capacity=10, range_km=5926, cruise_speed_kmh=870,
                 max_baggage_kg=1200, wifi_available=True, pets_allowed=True, smoking_allowed=False,
                 hourly_rate_usd=Decimal("7200"), min_hours=Decimal("2.0"),
                 positioning_fee_usd=Decimal("0"), overnight_fee_usd=Decimal("1800"),
                 status="available", is_approved=True, is_featured=True,
                 total_flight_hours=Decimal("1850.0"), maintenance_interval_hours=400,
                 last_maintenance_hours=Decimal("1800.0"), next_maintenance_date=future_date(90),
                 airworthiness_expiry=future_date(365), insurance_expiry=future_date(180),
                 description="Super-midsize comfort. NBO–JNB in style.",
                 amenities=["Wi-Fi", "Lie-flat seats", "Full galley", "Entertainment system"],
                 images=[AIRCRAFT_IMAGES["super_midsize"][0]],
                 image_url=AIRCRAFT_IMAGES["super_midsize"][0]),
            dict(operator=self.operators[0], catalog_aircraft=self.catalog_aircraft[11],
                 name="AfriqJet H145 Heli", model="Airbus H145", category="helicopter",
                 registration_number="5Y-AJH", year_of_manufacture=2021, base_airport=wil,
                 passenger_capacity=8, range_km=640, cruise_speed_kmh=268,
                 max_baggage_kg=300, wifi_available=False, pets_allowed=False, smoking_allowed=False,
                 hourly_rate_usd=Decimal("3800"), min_hours=Decimal("1.0"),
                 positioning_fee_usd=Decimal("500"), overnight_fee_usd=Decimal("800"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("720.0"), maintenance_interval_hours=200,
                 last_maintenance_hours=Decimal("700.0"), next_maintenance_date=future_date(30),
                 airworthiness_expiry=future_date(200), insurance_expiry=future_date(180),
                 description="VIP helicopter for Nairobi city transfers and Mara hops.",
                 amenities=["VIP interior", "Air-conditioning"],
                 images=[AIRCRAFT_IMAGES["helicopter"][0]],
                 image_url=AIRCRAFT_IMAGES["helicopter"][0]),
            # Savanna Air — preferred
            dict(operator=self.operators[1], catalog_aircraft=self.catalog_aircraft[2],
                 name="Savanna Hawker 900XP", model="Hawker 900XP", category="midsize",
                 registration_number="5Y-SAH", year_of_manufacture=2015, base_airport=nbo,
                 passenger_capacity=9, range_km=5250, cruise_speed_kmh=842,
                 max_baggage_kg=900, wifi_available=True, pets_allowed=False, smoking_allowed=False,
                 hourly_rate_usd=Decimal("5500"), min_hours=Decimal("2.0"),
                 positioning_fee_usd=Decimal("0"), overnight_fee_usd=Decimal("1200"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("5100.0"), maintenance_interval_hours=300,
                 last_maintenance_hours=Decimal("5000.0"), next_maintenance_date=future_date(15),
                 airworthiness_expiry=future_date(240), insurance_expiry=future_date(90),
                 description="Proven midsize. Ideal for East Africa routes.",
                 amenities=["Stand-up cabin", "Wi-Fi", "Full galley"],
                 images=[AIRCRAFT_IMAGES["midsize"][0]],
                 image_url=AIRCRAFT_IMAGES["midsize"][0]),
            dict(operator=self.operators[1], catalog_aircraft=self.catalog_aircraft[10],
                 name="Savanna Caravan", model="Cessna Grand Caravan EX", category="turboprop",
                 registration_number="5Y-SAC", year_of_manufacture=2019, base_airport=wil,
                 passenger_capacity=13, range_km=1500, cruise_speed_kmh=341,
                 max_baggage_kg=500, wifi_available=False, pets_allowed=True, smoking_allowed=False,
                 hourly_rate_usd=Decimal("1500"), min_hours=Decimal("1.0"),
                 positioning_fee_usd=Decimal("200"), overnight_fee_usd=Decimal("400"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("2200.0"), maintenance_interval_hours=200,
                 last_maintenance_hours=Decimal("2150.0"), next_maintenance_date=future_date(20),
                 airworthiness_expiry=future_date(180), insurance_expiry=future_date(90),
                 description="Safari workhorse — Mara, Amboseli, Samburu strips.",
                 amenities=["Bush-strip capable", "Scenic windows"],
                 images=[AIRCRAFT_IMAGES["turboprop"][1]],
                 image_url=AIRCRAFT_IMAGES["turboprop"][1]),
            # CoastAir — standard
            dict(operator=self.operators[2], catalog_aircraft=self.catalog_aircraft[1],
                 name="CoastAir Phenom 300E", model="Embraer Phenom 300E", category="light",
                 registration_number="5Y-CAP", year_of_manufacture=2022, base_airport=mba,
                 passenger_capacity=8, range_km=3650, cruise_speed_kmh=834,
                 max_baggage_km=600, wifi_available=True, pets_allowed=False, smoking_allowed=False,
                 hourly_rate_usd=Decimal("3600"), min_hours=Decimal("1.5"),
                 positioning_fee_usd=Decimal("0"), overnight_fee_usd=Decimal("900"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("580.0"), maintenance_interval_hours=300,
                 last_maintenance_hours=Decimal("500.0"), next_maintenance_date=future_date(120),
                 airworthiness_expiry=future_date(400), insurance_expiry=future_date(60),
                 description="Coast routes specialist — Mombasa to Lamu and Zanzibar.",
                 amenities=["Wi-Fi", "Flat-screen", "Catering"],
                 images=[AIRCRAFT_IMAGES["light"][1]],
                 image_url=AIRCRAFT_IMAGES["light"][1]),
            # KiliJet — preferred
            dict(operator=self.operators[3], catalog_aircraft=self.catalog_aircraft[3],
                 name="KiliJet Learjet 75", model="Bombardier Learjet 75", category="midsize",
                 registration_number="5H-KJL", year_of_manufacture=2017, base_airport=dar,
                 passenger_capacity=8, range_km=4445, cruise_speed_kmh=860,
                 max_baggage_kg=700, wifi_available=True, pets_allowed=False, smoking_allowed=False,
                 hourly_rate_usd=Decimal("4900"), min_hours=Decimal("2.0"),
                 positioning_fee_usd=Decimal("600"), overnight_fee_usd=Decimal("1100"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("3100.0"), maintenance_interval_hours=400,
                 last_maintenance_hours=Decimal("2900.0"), next_maintenance_date=future_date(60),
                 airworthiness_expiry=future_date(280), insurance_expiry=future_date(200),
                 description="Tanzania–Southern Africa corridor. DAR–JNB 3hr.",
                 amenities=["Bose noise-cancelling", "Wi-Fi", "Catering"],
                 images=[AIRCRAFT_IMAGES["midsize"][2]],
                 image_url=AIRCRAFT_IMAGES["midsize"][2]),
            # Rift Valley Air — standard
            dict(operator=self.operators[4], catalog_aircraft=self.catalog_aircraft[9],
                 name="Rift Valley PC-12", model="Pilatus PC-12 NGX", category="turboprop",
                 registration_number="5Y-RVP", year_of_manufacture=2020, base_airport=nbo,
                 passenger_capacity=9, range_km=1800, cruise_speed_kmh=528,
                 max_baggage_kg=400, wifi_available=False, pets_allowed=True, smoking_allowed=False,
                 hourly_rate_usd=Decimal("1900"), min_hours=Decimal("1.0"),
                 positioning_fee_usd=Decimal("300"), overnight_fee_usd=Decimal("500"),
                 status="available", is_approved=True, is_featured=False,
                 total_flight_hours=Decimal("1400.0"), maintenance_interval_hours=200,
                 last_maintenance_hours=Decimal("1350.0"), next_maintenance_date=future_date(25),
                 airworthiness_expiry=future_date(250), insurance_expiry=future_date(120),
                 description="Nakuru–Mara–Kisumu. Short-field master.",
                 amenities=["Cargo door", "Short-field capability"],
                 images=[AIRCRAFT_IMAGES["turboprop"][0]],
                 image_url=AIRCRAFT_IMAGES["turboprop"][0]),
        ]

        self.operator_aircraft = []
        for d in aircraft_data:
            # handle typo in test data (max_baggage_km instead of max_baggage_kg)
            d.pop("max_baggage_km", None)
            obj, _ = OperatorAircraft.objects.get_or_create(
                registration_number=d["registration_number"], defaults=d)
            self.operator_aircraft.append(obj)

        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.operator_aircraft)} operator aircraft"))

    # ─────────────────────────────────────────────────────────────────────────
    # OPERATOR YACHTS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_operator_yachts(self):
        self.stdout.write("  → OperatorYachts")
        yachts_data = [
            dict(operator=self.operators[0], catalog_yacht=self.catalog_yachts[1],
                 name="Serengeti Dream II", yacht_type="superyacht",
                 flag_state="Kenya", year_built=2019,
                 length_meters=Decimal("58"), beam_meters=Decimal("11.2"), draft_meters=Decimal("2.4"),
                 home_port="Mombasa, Kenya",
                 guest_capacity=14, cabin_count=7, crew_count=10,
                 daily_rate_usd=Decimal("15000"), weekly_rate_usd=Decimal("95000"),
                 min_charter_days=3, apa_percentage=Decimal("30"),
                 status="available", is_approved=True, is_featured=True,
                 description="Flagship superyacht for Indian Ocean expeditions. Mombasa–Seychelles.",
                 amenities=["Jacuzzi", "Jet skis", "Dive centre", "Cinema", "Tender"],
                 images=[YACHT_IMAGES[1], YACHT_IMAGES[4]],
                 image_url=YACHT_IMAGES[1]),
            dict(operator=self.operators[2], catalog_yacht=self.catalog_yachts[0],
                 name="Diani Star", yacht_type="motor",
                 flag_state="Kenya", year_built=2016,
                 length_meters=Decimal("42"), beam_meters=Decimal("8.5"), draft_meters=Decimal("1.9"),
                 home_port="Diani Beach, Kenya",
                 guest_capacity=10, cabin_count=5, crew_count=6,
                 daily_rate_usd=Decimal("7500"), weekly_rate_usd=Decimal("48000"),
                 min_charter_days=2, apa_percentage=Decimal("25"),
                 status="available", is_approved=True, is_featured=False,
                 description="Stunning motor yacht based in Diani. Great for Wasini Island day trips.",
                 amenities=["Water toys", "Snorkelling gear", "Sundeck", "Barbecue"],
                 images=[YACHT_IMAGES[0], YACHT_IMAGES[5]],
                 image_url=YACHT_IMAGES[0]),
            dict(operator=self.operators[3], catalog_yacht=self.catalog_yachts[2],
                 name="Zanzibar Breeze", yacht_type="catamaran",
                 flag_state="Tanzania", year_built=2020,
                 length_meters=Decimal("28"), beam_meters=Decimal("14.0"), draft_meters=Decimal("1.2"),
                 home_port="Zanzibar, Tanzania",
                 guest_capacity=8, cabin_count=4, crew_count=3,
                 daily_rate_usd=Decimal("4200"), weekly_rate_usd=Decimal("27000"),
                 min_charter_days=2, apa_percentage=Decimal("20"),
                 status="available", is_approved=True, is_featured=False,
                 description="Beautiful catamaran for Zanzibar archipelago exploration.",
                 amenities=["Kayaks", "Stand-up paddleboards", "Snorkelling", "Barbecue"],
                 images=[YACHT_IMAGES[2], YACHT_IMAGES[6]],
                 image_url=YACHT_IMAGES[2]),
        ]
        self.operator_yachts = []
        for d in yachts_data:
            obj, _ = OperatorYacht.objects.get_or_create(name=d["name"], operator=d["operator"], defaults=d)
            self.operator_yachts.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.operator_yachts)} operator yachts"))

    # ─────────────────────────────────────────────────────────────────────────
    # AVAILABILITY BLOCKS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_availability_blocks(self):
        self.stdout.write("  → AvailabilityBlocks")
        blocks = [
            dict(operator=self.operators[0], asset_type="aircraft",
                 aircraft=self.operator_aircraft[0], yacht=None,
                 block_type="maintenance", start_date=days_ago(60), end_date=days_ago(55),
                 notes="Annual C-check at JKIA hangar"),
            dict(operator=self.operators[0], asset_type="aircraft",
                 aircraft=self.operator_aircraft[1], yacht=None,
                 block_type="private_use", start_date=days_ago(20), end_date=days_ago(18),
                 notes="Operator private use"),
            dict(operator=self.operators[1], asset_type="aircraft",
                 aircraft=self.operator_aircraft[3], yacht=None,
                 block_type="maintenance", start_date=future_date(5), end_date=future_date(8),
                 notes="100-hour inspection"),
            dict(operator=self.operators[2], asset_type="yacht",
                 aircraft=None, yacht=self.operator_yachts[1],
                 block_type="seasonal_off", start_date=days_ago(45), end_date=days_ago(35),
                 notes="Monsoon season reduced ops"),
            dict(operator=self.operators[3], asset_type="yacht",
                 aircraft=None, yacht=self.operator_yachts[2],
                 block_type="other_booking", start_date=future_date(10), end_date=future_date(17),
                 notes="Direct booking via Zanzibar Tourism Board"),
        ]
        for b in blocks:
            AvailabilityBlock.objects.get_or_create(
                operator=b["operator"], start_date=b["start_date"],
                asset_type=b["asset_type"], defaults=b)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(blocks)} availability blocks"))

    # ─────────────────────────────────────────────────────────────────────────
    # MARKETPLACE AIRCRAFT (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_marketplace_aircraft(self):
        self.stdout.write("  → MarketplaceAircraft")
        owner_user, created = User.objects.get_or_create(username="fleet_owner_njh", defaults=dict(
            email="owner@njhfleet.com", role="owner", first_name="Fleet", last_name="Owner",
            phone="+254700777888", avatar_url=pick(AVATAR_URLS),
        ))
        if created:
            owner_user.set_password("password123")
            owner_user.save()

        self.marketplace_aircraft = []
        mkt_data = [
            dict(owner=owner_user, name="NJH Citation CJ3+", model="Citation CJ3+",
                 category="light", registration_number="5Y-NJH1",
                 base_location="Wilson Airport, Nairobi",
                 passenger_capacity=7, range_km=3300, cruise_speed_kmh=778,
                 hourly_rate_usd=Decimal("3800"), status="available", is_approved=True,
                 total_flight_hours=Decimal("2100.5"), maintenance_interval_hours=300,
                 last_maintenance_hours=Decimal("2050.0"),
                 airworthiness_expiry=future_date(200), insurance_expiry=future_date(120),
                 description="NJH-owned light jet for member bookings.",
                 amenities=["Wi-Fi", "Leather seats"],
                 image_url=AIRCRAFT_IMAGES["light"][0]),
            dict(owner=owner_user, name="NJH Global 6000", model="Bombardier Global 6000",
                 category="heavy", registration_number="5Y-NJH2",
                 base_location="JKIA, Nairobi",
                 passenger_capacity=14, range_km=11112, cruise_speed_kmh=904,
                 hourly_rate_usd=Decimal("13000"), status="available", is_approved=True,
                 total_flight_hours=Decimal("4500.0"), maintenance_interval_hours=500,
                 last_maintenance_hours=Decimal("4400.0"),
                 airworthiness_expiry=future_date(300), insurance_expiry=future_date(180),
                 description="NJH flagship — ultra-long range.",
                 amenities=["3-zone cabin", "King bed", "Full office", "Shower"],
                 image_url=AIRCRAFT_IMAGES["heavy"][1]),
        ]
        for d in mkt_data:
            tier = MembershipTier.objects.filter(name="corporate").first()
            obj, _ = MarketplaceAircraft.objects.get_or_create(
                registration_number=d["registration_number"], defaults=d)
            if tier:
                obj.exclusive_tiers.add(tier)
            self.marketplace_aircraft.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.marketplace_aircraft)} marketplace aircraft"))

    # ─────────────────────────────────────────────────────────────────────────
    # MAINTENANCE LOGS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_maintenance_logs(self):
        self.stdout.write("  → MaintenanceLogs")
        for aircraft in self.marketplace_aircraft:
            logs = [
                dict(aircraft=aircraft, maintenance_type="routine", status="completed",
                     scheduled_date=days_ago(120), completed_date=days_ago(119),
                     flight_hours_at=aircraft.total_flight_hours - 500,
                     description="100-hour routine service and oil change.",
                     technician="Wilson AMO, Nairobi", cost_usd=Decimal("8500")),
                dict(aircraft=aircraft, maintenance_type="inspection", status="completed",
                     scheduled_date=days_ago(60), completed_date=days_ago(59),
                     flight_hours_at=aircraft.total_flight_hours - 200,
                     description="Annual airworthiness inspection — CAA Kenya.",
                     technician="Kenya Airways Technical", cost_usd=Decimal("15000")),
                dict(aircraft=aircraft, maintenance_type="routine", status="scheduled",
                     scheduled_date=future_date(30), completed_date=None,
                     flight_hours_at=aircraft.total_flight_hours,
                     description="Upcoming 50-hour check.", technician="", cost_usd=None),
            ]
            for l in logs:
                MaintenanceLog.objects.get_or_create(
                    aircraft=aircraft, scheduled_date=l["scheduled_date"],
                    maintenance_type=l["maintenance_type"], defaults=l)
        self.stdout.write(self.style.SUCCESS("    ✓ Maintenance logs"))

    # ─────────────────────────────────────────────────────────────────────────
    # FLIGHT BOOKINGS (V1 + V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_flight_bookings(self):
        self.stdout.write("  → FlightBookings")

        airports = list(Airport.objects.filter(country__in=["Kenya", "Tanzania", "Uganda", "Rwanda",
                                                              "United Kingdom", "UAE", "South Africa"]))
        nbo = Airport.objects.filter(code="NBO").first()
        mba = Airport.objects.filter(code="MBA").first()
        lhr = Airport.objects.filter(code="LHR").first()
        jnb = Airport.objects.filter(code="JNB").first()
        dxb = Airport.objects.filter(code="DXB").first()
        znz = Airport.objects.filter(code="ZNZ").first()
        mre = Airport.objects.filter(code="MRE").first()

        route_airport_pairs = [
            (nbo, mba), (nbo, znz), (nbo, jnb), (nbo, lhr), (nbo, dxb),
            (mba, znz), (nbo, mre), (mba, mre), (jnb, nbo), (dxb, nbo),
        ]

        bookings_data = [
            # Completed bookings (past)
            dict(guest_name="James Amani Kariuki", guest_email="amani@gmail.com",
                 guest_phone="+254712345678", company="Kariuki Holdings",
                 client=self.clients[0], trip_type="round_trip",
                 origin=nbo, destination=lhr, departure_date=days_ago(150),
                 return_date=days_ago(140), passenger_count=4,
                 operator_aircraft=self.operator_aircraft[0],
                 assigned_operator=self.operators[0],
                 preferred_category="heavy", catering_requested=True,
                 concierge_requested=True,
                 operator_cost_usd=Decimal("88000"), quoted_price_usd=Decimal("108000"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(8, 0)),
            dict(guest_name="Sophia Waweru", guest_email="sophia@waweru.co.ke",
                 guest_phone="+254723456789", company="Waweru Ventures",
                 client=self.clients[1], trip_type="one_way",
                 origin=nbo, destination=jnb, departure_date=days_ago(120),
                 passenger_count=6, operator_aircraft=self.operator_aircraft[1],
                 assigned_operator=self.operators[0],
                 preferred_category="super_midsize", catering_requested=True,
                 operator_cost_usd=Decimal("24000"), quoted_price_usd=Decimal("29000"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(10, 30)),
            dict(guest_name="David Omondi", guest_email="david@omondi.com",
                 guest_phone="+254734567890", company="Omondi Logistics",
                 client=self.clients[2], trip_type="one_way",
                 origin=nbo, destination=mba, departure_date=days_ago(90),
                 passenger_count=3, operator_aircraft=self.operator_aircraft[5],
                 assigned_operator=self.operators[2],
                 preferred_category="light", catering_requested=False,
                 operator_cost_usd=Decimal("5500"), quoted_price_usd=Decimal("6800"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(7, 0)),
            dict(guest_name="Fatuma Ali", guest_email="fatuma@ali.co.ke",
                 guest_phone="+254745678901", company="Ali Trading Co.",
                 client=self.clients[3], trip_type="round_trip",
                 origin=mba, destination=znz, departure_date=days_ago(80),
                 return_date=days_ago(75), passenger_count=2,
                 operator_aircraft=self.operator_aircraft[5],
                 assigned_operator=self.operators[2],
                 preferred_category="light", catering_requested=True,
                 operator_cost_usd=Decimal("4200"), quoted_price_usd=Decimal("5200"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(9, 15)),
            dict(guest_name="Hassan Omar", guest_email="hassan@omar.co.ke",
                 guest_phone="+254778901234", company="Omar Group",
                 client=self.clients[6], trip_type="one_way",
                 origin=nbo, destination=dxb, departure_date=days_ago(60),
                 passenger_count=8, operator_aircraft=self.operator_aircraft[0],
                 assigned_operator=self.operators[0],
                 preferred_category="heavy", catering_requested=True,
                 ground_transport_requested=True, concierge_requested=True,
                 operator_cost_usd=Decimal("42000"), quoted_price_usd=Decimal("52000"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(23, 30)),
            dict(guest_name="Esther Wanjiku", guest_email="esther@wanjiku.com",
                 guest_phone="+254789012345", company="Wanjiku Safaris",
                 client=self.clients[7], trip_type="one_way",
                 origin=nbo, destination=mre, departure_date=days_ago(45),
                 passenger_count=6, operator_aircraft=self.operator_aircraft[4],
                 assigned_operator=self.operators[1],
                 preferred_category="turboprop", catering_requested=False,
                 operator_cost_usd=Decimal("2800"), quoted_price_usd=Decimal("3500"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="completed", departure_time=time(6, 30)),
            # Confirmed (upcoming)
            dict(guest_name="John Kamau", guest_email="john@kamau.co.ke",
                 guest_phone="+254790123456", company="Kamau Corp",
                 client=self.clients[8], trip_type="round_trip",
                 origin=nbo, destination=lhr, departure_date=future_date(10),
                 return_date=future_date(17), passenger_count=5,
                 operator_aircraft=self.operator_aircraft[0],
                 assigned_operator=self.operators[0],
                 preferred_category="heavy", catering_requested=True, concierge_requested=True,
                 operator_cost_usd=Decimal("95000"), quoted_price_usd=Decimal("116000"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="confirmed", departure_time=time(22, 0)),
            dict(guest_name="Isabella Rosa", guest_email="isabella@rosa.it",
                 guest_phone="+393312345678", company="Rosa Capital",
                 client=self.clients[11], trip_type="one_way",
                 origin=dxb, destination=nbo, departure_date=future_date(5),
                 passenger_count=3, operator_aircraft=self.operator_aircraft[1],
                 assigned_operator=self.operators[0],
                 preferred_category="super_midsize", catering_requested=True,
                 operator_cost_usd=Decimal("18000"), quoted_price_usd=Decimal("22000"),
                 commission_pct=Decimal("15"), payment_status="paid",
                 status="confirmed", departure_time=time(14, 0)),
            # Quoted
            dict(guest_name="Omar Farah", guest_email="omar@farah.so",
                 guest_phone="+252612345678", company="Farah Investments",
                 client=self.clients[10], trip_type="one_way",
                 origin=nbo, destination=jnb, departure_date=future_date(20),
                 passenger_count=7, operator_aircraft=self.operator_aircraft[6],
                 assigned_operator=self.operators[3],
                 preferred_category="midsize", catering_requested=True,
                 operator_cost_usd=Decimal("20000"), quoted_price_usd=Decimal("25000"),
                 commission_pct=Decimal("15"), payment_status="unpaid",
                 status="quoted", departure_time=time(11, 0)),
            # RFQ in progress
            dict(guest_name="Peter Ngugi", guest_email="peter@ngugi.co.ke",
                 guest_phone="+254756789012", company="Ngugi Properties",
                 client=self.clients[4], trip_type="one_way",
                 origin=nbo, destination=dxb, departure_date=future_date(30),
                 passenger_count=10, operator_aircraft=None, assigned_operator=None,
                 preferred_category="heavy", catering_requested=True,
                 concierge_requested=True,
                 operator_cost_usd=None, quoted_price_usd=None,
                 commission_pct=Decimal("15"), payment_status="unpaid",
                 status="rfq_sent", departure_time=time(18, 0)),
            # Inquiry
            dict(guest_name="Grace Mutua", guest_email="grace@mutua.com",
                 guest_phone="+254767890123", company="",
                 client=self.clients[5], trip_type="one_way",
                 origin=nbo, destination=znz, departure_date=future_date(45),
                 passenger_count=2, operator_aircraft=None, assigned_operator=None,
                 preferred_category="light", catering_requested=False,
                 operator_cost_usd=None, quoted_price_usd=None,
                 commission_pct=Decimal("15"), payment_status="unpaid",
                 status="inquiry", departure_time=time(9, 0)),
        ]

        self.flight_bookings = []
        for d in bookings_data:
            obj, _ = FlightBooking.objects.get_or_create(
                guest_email=d["guest_email"],
                departure_date=d["departure_date"],
                origin=d["origin"],
                defaults=d,
            )
            self.flight_bookings.append(obj)

        # Add some FlightLegs for multi-leg
        multi_leg_booking = self.flight_bookings[0]
        if not multi_leg_booking.legs.exists():
            for i, (orig, dest) in enumerate([(nbo, dxb), (dxb, lhr)], start=1):
                FlightLeg.objects.create(
                    booking=multi_leg_booking, leg_number=i,
                    origin=orig, destination=dest,
                    departure_date=days_ago(150 - i), departure_time=time(6 + i * 4, 0),
                )

        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.flight_bookings)} flight bookings"))

    # ─────────────────────────────────────────────────────────────────────────
    # RFQ BIDS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_rfq_bids(self):
        self.stdout.write("  → RFQBids")
        # RFQ booking is self.flight_bookings[9] (rfq_sent status)
        rfq_booking = next((b for b in self.flight_bookings if b.status == "rfq_sent"), None)
        if not rfq_booking:
            return

        bids = [
            dict(booking=rfq_booking, operator=self.operators[0],
                 aircraft=self.operator_aircraft[0],
                 submitted_by=self.operator_users[0],
                 operator_price_usd=Decimal("38000"), estimated_hours=Decimal("6.5"),
                 positioning_cost=Decimal("0"), catering_cost=Decimal("1500"),
                 overnight_cost=Decimal("0"),
                 notes="G550 available, can confirm within 2 hrs.",
                 valid_until=timezone.now() + timedelta(days=3),
                 njh_client_price=Decimal("47500"), njh_margin_usd=Decimal("9500"),
                 status="shortlisted"),
            dict(booking=rfq_booking, operator=self.operators[3],
                 aircraft=self.operator_aircraft[6],
                 submitted_by=self.operator_users[3],
                 operator_price_usd=Decimal("32000"), estimated_hours=Decimal("6.5"),
                 positioning_cost=Decimal("2000"), catering_cost=Decimal("1200"),
                 overnight_cost=Decimal("1100"),
                 notes="Learjet 75 — positioning from DAR, 4 hrs notice needed.",
                 valid_until=timezone.now() + timedelta(days=2),
                 njh_client_price=Decimal("40000"), njh_margin_usd=Decimal("8000"),
                 status="submitted"),
        ]
        self.rfq_bids = []
        for b in bids:
            obj, _ = RFQBid.objects.get_or_create(
                booking=b["booking"], operator=b["operator"], defaults=b)
            self.rfq_bids.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.rfq_bids)} RFQ bids"))

    # ─────────────────────────────────────────────────────────────────────────
    # YACHT CHARTERS
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_yacht_charters(self):
        self.stdout.write("  → YachtCharters")
        charters_data = [
            dict(guest_name="James Amani Kariuki", guest_email="amani@gmail.com",
                 guest_phone="+254712345678", company="Kariuki Holdings",
                 client=self.clients[0],
                 operator_yacht=self.operator_yachts[0], assigned_operator=self.operators[0],
                 departure_port="Mombasa, Kenya", destination_port="Lamu, Kenya",
                 charter_start=days_ago(130), charter_end=days_ago(123),
                 guest_count=10, itinerary_description="7-day Kenyan Coast cruise. Mombasa → Wasini → Lamu.",
                 special_requests="Halal catering, fishing gear.",
                 operator_cost_usd=Decimal("85000"), quoted_price_usd=Decimal("105000"),
                 commission_pct=Decimal("15"), apa_amount_usd=Decimal("31500"),
                 payment_status="paid", status="completed"),
            dict(guest_name="Sophia Waweru", guest_email="sophia@waweru.co.ke",
                 guest_phone="+254723456789", company="Waweru Ventures",
                 client=self.clients[1],
                 operator_yacht=self.operator_yachts[1], assigned_operator=self.operators[2],
                 departure_port="Diani Beach, Kenya", destination_port="Wasini Island, Kenya",
                 charter_start=days_ago(70), charter_end=days_ago(67),
                 guest_count=8, itinerary_description="3-night Diani getaway with snorkelling.",
                 special_requests="Vegetarian catering.",
                 operator_cost_usd=Decimal("18000"), quoted_price_usd=Decimal("22500"),
                 commission_pct=Decimal("15"), apa_amount_usd=Decimal("6750"),
                 payment_status="paid", status="completed"),
            dict(guest_name="Omar Farah", guest_email="omar@farah.so",
                 guest_phone="+252612345678", company="Farah Investments",
                 client=self.clients[10],
                 operator_yacht=self.operator_yachts[2], assigned_operator=self.operators[3],
                 departure_port="Zanzibar, Tanzania", destination_port="Pemba Island, Tanzania",
                 charter_start=future_date(15), charter_end=future_date(22),
                 guest_count=6, itinerary_description="7-day Zanzibar archipelago cruise.",
                 special_requests="Halal food, diving equipment.",
                 operator_cost_usd=Decimal("22000"), quoted_price_usd=Decimal("28000"),
                 commission_pct=Decimal("15"), apa_amount_usd=Decimal("8400"),
                 payment_status="paid", status="confirmed"),
            dict(guest_name="Isabella Rosa", guest_email="isabella@rosa.it",
                 guest_phone="+393312345678", company="Rosa Capital",
                 client=self.clients[11],
                 operator_yacht=self.operator_yachts[0], assigned_operator=self.operators[0],
                 departure_port="Mombasa, Kenya", destination_port="Seychelles",
                 charter_start=future_date(40), charter_end=future_date(50),
                 guest_count=12, itinerary_description="10-day Mombasa–Seychelles luxury cruise.",
                 special_requests="European cuisine, sommelier onboard.",
                 operator_cost_usd=None, quoted_price_usd=None,
                 commission_pct=Decimal("15"), apa_amount_usd=None,
                 payment_status="unpaid", status="inquiry"),
        ]
        self.yacht_charters = []
        for d in charters_data:
            obj, _ = YachtCharter.objects.get_or_create(
                guest_email=d["guest_email"], charter_start=d["charter_start"],
                defaults=d)
            self.yacht_charters.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.yacht_charters)} yacht charters"))

    # ─────────────────────────────────────────────────────────────────────────
    # OPERATOR BOOKINGS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_operator_bookings(self):
        self.stdout.write("  → OperatorBookings")
        completed_flights = [b for b in self.flight_bookings if b.status == "completed"]
        completed_charters = [c for c in self.yacht_charters if c.status == "completed"]
        confirmed_flights = [b for b in self.flight_bookings if b.status == "confirmed"]

        self.operator_bookings = []

        for fb in completed_flights[:4]:
            if not hasattr(fb, "operator_booking") or fb.operator_booking is None:
                op = fb.assigned_operator or self.operators[0]
                oa = fb.operator_aircraft
                payout = fb.operator_cost_usd or Decimal("10000")
                client_total = fb.quoted_price_usd or Decimal("12000")
                margin = client_total - payout
                ob = OperatorBooking.objects.create(
                    operator=op, asset_type="aircraft",
                    operator_aircraft=oa, flight_booking=fb,
                    operator_payout_usd=payout, njh_margin_usd=margin,
                    total_client_usd=client_total,
                    operator_reference=f"OP-{str(uuid.uuid4())[:8].upper()}",
                    operator_notes="Confirmed and flown. All passengers satisfied.",
                    accepted_at=timezone.now() - timedelta(days=random.randint(10, 140)),
                    status="completed",
                )
                self.operator_bookings.append(ob)

        for yc in completed_charters[:2]:
            if not hasattr(yc, "operator_booking") or yc.operator_booking is None:
                op = yc.assigned_operator or self.operators[2]
                oy = yc.operator_yacht
                payout = yc.operator_cost_usd or Decimal("18000")
                client_total = yc.quoted_price_usd or Decimal("22500")
                margin = client_total - payout
                ob = OperatorBooking.objects.create(
                    operator=op, asset_type="yacht",
                    operator_yacht=oy, yacht_charter=yc,
                    operator_payout_usd=payout, njh_margin_usd=margin,
                    total_client_usd=client_total,
                    operator_reference=f"YC-{str(uuid.uuid4())[:8].upper()}",
                    operator_notes="Charter completed. Crew performance excellent.",
                    accepted_at=timezone.now() - timedelta(days=random.randint(10, 120)),
                    status="completed",
                )
                self.operator_bookings.append(ob)

        for fb in confirmed_flights[:2]:
            if not hasattr(fb, "operator_booking") or fb.operator_booking is None:
                op = fb.assigned_operator or self.operators[0]
                oa = fb.operator_aircraft
                payout = fb.operator_cost_usd or Decimal("90000")
                client_total = fb.quoted_price_usd or Decimal("110000")
                margin = client_total - payout
                ob = OperatorBooking.objects.create(
                    operator=op, asset_type="aircraft",
                    operator_aircraft=oa, flight_booking=fb,
                    operator_payout_usd=payout, njh_margin_usd=margin,
                    total_client_usd=client_total,
                    operator_reference=f"OP-{str(uuid.uuid4())[:8].upper()}",
                    accepted_at=timezone.now() - timedelta(days=5),
                    status="accepted",
                )
                self.operator_bookings.append(ob)

        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.operator_bookings)} operator bookings"))

    # ─────────────────────────────────────────────────────────────────────────
    # OPERATOR PAYOUTS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_operator_payouts(self):
        self.stdout.write("  → OperatorPayouts")
        admin = User.objects.filter(role="admin").first()
        payout_statuses = ["paid", "paid", "paid", "processing", "pending"]

        for ob in self.operator_bookings:
            if ob.status == "completed":
                status = pick(["paid", "paid", "processing"])
                OperatorPayoutLog.objects.get_or_create(
                    operator_booking=ob,
                    defaults=dict(
                        operator=ob.operator,
                        amount_usd=ob.operator_payout_usd,
                        currency="USD",
                        exchange_rate=Decimal("1.0"),
                        payment_method=pick(["Wire Transfer", "SWIFT", "M-Pesa Business"]),
                        bank_reference=f"REF{str(uuid.uuid4())[:10].upper()}",
                        paid_at=timezone.now() - timedelta(days=random.randint(1, 30)) if status == "paid" else None,
                        due_date=days_ago(random.randint(1, 15)),
                        status=status,
                        processed_by=admin,
                        notes="Released after trip completion verification.",
                    )
                )
        self.stdout.write(self.style.SUCCESS("    ✓ Operator payouts"))

    # ─────────────────────────────────────────────────────────────────────────
    # OPERATOR REVIEWS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_operator_reviews(self):
        self.stdout.write("  → OperatorReviews")
        completed_obs = [ob for ob in self.operator_bookings if ob.status == "completed"]
        client_pairs = [
            (self.clients[0], "James Amani Kariuki", "amani@gmail.com"),
            (self.clients[1], "Sophia Waweru", "sophia@waweru.co.ke"),
            (self.clients[6], "Hassan Omar", "hassan@omar.co.ke"),
            (self.clients[7], "Esther Wanjiku", "esther@wanjiku.com"),
        ]
        comments = [
            "Absolutely flawless service. The crew was exceptional and the aircraft was immaculate.",
            "Great experience overall. Minor delay in departure but everything else perfect.",
            "The yacht exceeded all expectations. Highly recommended for Kenyan Coast charters.",
            "Professional team, comfortable aircraft. Will definitely use AfriqJet again.",
        ]
        for i, ob in enumerate(completed_obs[:4]):
            if hasattr(ob, "review"):
                continue
            client, name, email = client_pairs[i % len(client_pairs)]
            OperatorReview.objects.create(
                operator=ob.operator, operator_booking=ob,
                reviewer_name=name, reviewer_email=email, client=client,
                rating_overall=pick([4, 5, 5, 5]),
                rating_punctuality=pick([4, 5, 5]),
                rating_cleanliness=pick([5, 5, 4]),
                rating_crew=pick([5, 5, 4]),
                comment=comments[i % len(comments)],
                is_published=True,
            )
        self.stdout.write(self.style.SUCCESS("    ✓ Operator reviews"))

    # ─────────────────────────────────────────────────────────────────────────
    # MARKETPLACE BOOKINGS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_marketplace_bookings(self):
        self.stdout.write("  → MarketplaceBookings")
        self.marketplace_bookings = []
        mkt_data = [
            dict(client=self.clients[0], aircraft=self.marketplace_aircraft[1],
                 membership=self.memberships[0], trip_type="round_trip",
                 origin="Nairobi (NBO)", destination="London Heathrow (LHR)",
                 departure_datetime=rand_dt(160, 155),
                 return_datetime=rand_dt(150, 145),
                 estimated_hours=Decimal("8.5"), passenger_count=5,
                 status="completed", gross_amount_usd=Decimal("110500"),
                 commission_pct=Decimal("10"), discount_applied=Decimal("5"),
                 payment_status="paid", commission_usd=Decimal("11050"),
                 net_owner_usd=Decimal("99450"),
                 special_requests="Champagne on arrival, Dubai stopover catering."),
            dict(client=self.clients[4], aircraft=self.marketplace_aircraft[0],
                 membership=self.memberships[4], trip_type="one_way",
                 origin="Nairobi (NBO)", destination="Masai Mara (MRE)",
                 departure_datetime=rand_dt(90, 88),
                 estimated_hours=Decimal("1.2"), passenger_count=4,
                 status="completed", gross_amount_usd=Decimal("4560"),
                 commission_pct=Decimal("10"), discount_applied=Decimal("0"),
                 payment_status="paid", commission_usd=Decimal("456"),
                 net_owner_usd=Decimal("4104"),
                 special_requests="Game drive pickup at airstrip."),
            dict(client=self.clients[8], aircraft=self.marketplace_aircraft[1],
                 membership=self.memberships[8], trip_type="round_trip",
                 origin="Nairobi (NBO)", destination="Dubai (DXB)",
                 departure_datetime=rand_dt(50, 45),
                 return_datetime=rand_dt(40, 38),
                 estimated_hours=Decimal("5.5"), passenger_count=3,
                 status="completed", gross_amount_usd=Decimal("71500"),
                 commission_pct=Decimal("10"), discount_applied=Decimal("10"),
                 payment_status="paid", commission_usd=Decimal("7150"),
                 net_owner_usd=Decimal("64350"),
                 special_requests="In-flight Wi-Fi must be active."),
        ]
        for d in mkt_data:
            obj, created = MarketplaceBooking.objects.get_or_create(
                client=d["client"], aircraft=d["aircraft"],
                departure_datetime=d["departure_datetime"], defaults=d)
            self.marketplace_bookings.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.marketplace_bookings)} marketplace bookings"))

    # ─────────────────────────────────────────────────────────────────────────
    # PAYMENT RECORDS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_payment_records(self):
        self.stdout.write("  → PaymentRecords")
        for i, m in enumerate(self.memberships[:6]):
            PaymentRecord.objects.get_or_create(
                user=m.user, payment_type="membership", membership=m,
                defaults=dict(
                    amount_usd=m.amount_paid or Decimal("2999"),
                    currency="USD", status="succeeded",
                    stripe_payment_id=f"pi_{uuid.uuid4().hex[:24]}",
                    stripe_receipt_url=f"https://pay.stripe.com/receipts/{uuid.uuid4().hex}",
                    description=f"{m.tier.display_name} membership payment",
                ))
        for i, mb in enumerate(self.marketplace_bookings):
            PaymentRecord.objects.get_or_create(
                user=mb.client, payment_type="booking", booking=mb,
                defaults=dict(
                    amount_usd=mb.gross_amount_usd,
                    currency="USD", status="succeeded",
                    stripe_payment_id=f"pi_{uuid.uuid4().hex[:24]}",
                    stripe_receipt_url=f"https://pay.stripe.com/receipts/{uuid.uuid4().hex}",
                    description=f"Charter booking {mb.origin} → {mb.destination}",
                ))
        self.stdout.write(self.style.SUCCESS("    ✓ Payment records"))

    # ─────────────────────────────────────────────────────────────────────────
    # LEASE INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_lease_inquiries(self):
        self.stdout.write("  → LeaseInquiries")
        lease_data = [
            dict(guest_name="Mwangi Capital Ltd", guest_email="fleet@mwangicapital.co.ke",
                 guest_phone="+254711223344", company="Mwangi Capital Ltd",
                 asset_type="aircraft", aircraft=self.catalog_aircraft[6],
                 lease_duration="annual", preferred_start_date=future_date(30),
                 budget_range="$80,000–$120,000/month",
                 usage_description="Corporate shuttle between Nairobi, Johannesburg and Dubai.",
                 status="pending"),
            dict(guest_name="KE Tourism Board", guest_email="procurement@tourism.go.ke",
                 guest_phone="+254202229000", company="Kenya Tourism Board",
                 asset_type="aircraft", aircraft=self.catalog_aircraft[8],
                 lease_duration="quarterly", preferred_start_date=future_date(45),
                 budget_range="$200,000–$300,000/quarter",
                 usage_description="Government delegation transport for Q3 2025 tourism campaign.",
                 status="reviewing"),
            dict(guest_name="BlueSea Charters Ltd", guest_email="ops@blueseacharters.co.ke",
                 guest_phone="+254733445566", company="BlueSea Charters",
                 asset_type="yacht", yacht=self.catalog_yachts[3],
                 lease_duration="monthly", preferred_start_date=future_date(15),
                 budget_range="$150,000–$180,000/month",
                 usage_description="Corporate entertainment charter — Mombasa & Zanzibar.",
                 status="pending"),
        ]
        for d in lease_data:
            LeaseInquiry.objects.get_or_create(guest_email=d["guest_email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(lease_data)} lease inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # FLIGHT INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_flight_inquiries(self):
        self.stdout.write("  → FlightInquiries")
        inquiries = [
            dict(guest_name="Samuel Otieno", guest_email="s.otieno@gmail.com",
                 guest_phone="+254714567890",
                 origin_description="Nairobi (NBO)", destination_description="Cape Town (CPT)",
                 approximate_date="Mid-November 2025", passenger_count=4,
                 preferred_aircraft_category="super_midsize",
                 message="Looking for a super-midsize for a business trip to Cape Town. Flexible on dates."),
            dict(guest_name="Yasmin Al-Rashid", guest_email="y.alrashid@hotmail.com",
                 guest_phone="+971501234567",
                 origin_description="Dubai (DXB)", destination_description="Nairobi (NBO)",
                 approximate_date="December 20–28, 2025", passenger_count=6,
                 preferred_aircraft_category="heavy",
                 message="Family Christmas trip. Need heavy jet with sleeping capability."),
            dict(guest_name="Michael Oloo", guest_email="m.oloo@company.co.ke",
                 guest_phone="+254725678901",
                 origin_description="Nairobi (NBO)", destination_description="Masai Mara (MRE/OLX)",
                 approximate_date="This weekend", passenger_count=3,
                 preferred_aircraft_category="turboprop",
                 message="Quick safari hop for the weekend. Looking for something affordable."),
        ]
        for d in inquiries:
            FlightInquiry.objects.get_or_create(guest_email=d["guest_email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(inquiries)} flight inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # CONTACT INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_contact_inquiries(self):
        self.stdout.write("  → ContactInquiries")
        contacts = [
            dict(full_name="Catherine Mwenda", email="c.mwenda@media.co.ke",
                 phone="+254712000111", company="Nairobi Business Daily",
                 subject="media", message="Requesting an interview with NJH CEO for our luxury travel feature."),
            dict(full_name="Robert Kiprono", email="r.kiprono@fastairlines.com",
                 phone="+254711222333", company="FastAir Kenya",
                 subject="partnership", message="Interested in exploring a co-charter partnership arrangement with NJH."),
            dict(full_name="Aisha Kamau", email="aisha@gmail.com",
                 phone="+254799888777", company="",
                 subject="support", message="My booking reference NJH-2025-00123 — I need to change my return date."),
            dict(full_name="Tech Startup Ltd", email="ops@techstart.ke",
                 phone="+254711999000", company="Tech Startup Ltd",
                 subject="general", message="Can you provide a quote for monthly shuttle service between NBO and MBA?"),
        ]
        for d in contacts:
            ContactInquiry.objects.get_or_create(email=d["email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(contacts)} contact inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # GROUP CHARTER INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_group_charter_inquiries(self):
        self.stdout.write("  → GroupCharterInquiries")
        groups = [
            dict(contact_name="Amos Makori", email="a.makori@kcb.co.ke",
                 phone="+254711000222", company="KCB Group",
                 group_type="corporate", group_size=45,
                 origin_description="Nairobi (NBO)", destination_description="Victoria Falls (VFA), Zambia",
                 departure_date=future_date(60), return_date=future_date(63),
                 is_round_trip=True, preferred_aircraft_category="vip_airliner",
                 catering_required=True, ground_transport_required=True,
                 budget_range="$250,000–$350,000",
                 additional_notes="Executive team retreat. Need premium catering and ground transfers.",
                 status="pending"),
            dict(contact_name="AFC Leopards FC", email="travel@afcleopards.co.ke",
                 phone="+254722111333", company="AFC Leopards FC",
                 group_type="sports_team", group_size=32,
                 origin_description="Nairobi (NBO)", destination_description="Accra (ACC), Ghana",
                 departure_date=future_date(14), return_date=future_date(21),
                 is_round_trip=True, preferred_aircraft_category="vip_airliner",
                 catering_required=True, ground_transport_required=True,
                 budget_range="$150,000–$200,000",
                 additional_notes="Squad + technical staff for CAF Champions League away match.",
                 status="pending"),
            dict(contact_name="Vivienne Oduya", email="v.oduya@weddingco.ke",
                 phone="+254733444555", company="Celebrations Kenya",
                 group_type="wedding", group_size=28,
                 origin_description="Nairobi (NBO)", destination_description="Zanzibar (ZNZ), Tanzania",
                 departure_date=future_date(90), return_date=future_date(93),
                 is_round_trip=True, preferred_aircraft_category="super_midsize",
                 catering_required=True, ground_transport_required=True,
                 budget_range="$80,000–$120,000",
                 additional_notes="Destination wedding party. Champagne on arrival, décor coordination needed.",
                 status="pending"),
        ]
        for d in groups:
            GroupCharterInquiry.objects.get_or_create(email=d["email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(groups)} group charter inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # AIR CARGO INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_air_cargo_inquiries(self):
        self.stdout.write("  → AirCargoInquiries")
        cargos = [
            dict(contact_name="MedSupply Africa", email="logistics@medsupply.co.ke",
                 phone="+254711555666", company="MedSupply Africa Ltd",
                 cargo_type="pharma", cargo_description="COVID-19 vaccines and cold-chain medical supplies.",
                 weight_kg=Decimal("850"), volume_m3=Decimal("4.5"),
                 dimensions="120x80x100cm (pallets)",
                 origin_description="Nairobi (NBO)", destination_description="Juba (JUB), South Sudan",
                 pickup_date=future_date(2), urgency="express",
                 is_hazardous=False, requires_temperature_control=True,
                 insurance_required=True, customs_assistance_needed=True,
                 additional_notes="WHO-approved vaccine consignment. Time-critical.", status="pending"),
            dict(contact_name="Nairobi Gem Exchange", email="gems@nbo-gems.co.ke",
                 phone="+254722666777", company="Nairobi Gem Exchange",
                 cargo_type="artwork", cargo_description="Precious gemstones and certified diamonds.",
                 weight_kg=Decimal("12"), volume_m3=Decimal("0.1"),
                 dimensions="Secure cases",
                 origin_description="Nairobi (NBO)", destination_description="Antwerp, Belgium",
                 pickup_date=future_date(7), urgency="express",
                 is_hazardous=False, requires_temperature_control=False,
                 insurance_required=True, customs_assistance_needed=True,
                 additional_notes="Full security escort required.", status="pending"),
            dict(contact_name="Safari Motors Kenya", email="imports@safarimotors.co.ke",
                 phone="+254733777888", company="Safari Motors Kenya",
                 cargo_type="automotive", cargo_description="3x Range Rover SVR vehicles.",
                 weight_kg=Decimal("7200"), volume_m3=Decimal("42"),
                 dimensions="Standard vehicle dimensions",
                 origin_description="Dubai (DXB)", destination_description="Nairobi (NBO)",
                 pickup_date=future_date(14), urgency="standard",
                 is_hazardous=False, requires_temperature_control=False,
                 insurance_required=True, customs_assistance_needed=True,
                 additional_notes="RORO or freighter — dealer plate required on delivery.", status="pending"),
        ]
        for d in cargos:
            AirCargoInquiry.objects.get_or_create(email=d["email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(cargos)} air cargo inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # AIRCRAFT SALES INQUIRIES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_aircraft_sales_inquiries(self):
        self.stdout.write("  → AircraftSalesInquiries")
        sales = [
            dict(contact_name="James Amani Kariuki", email="amani.sales@gmail.com",
                 phone="+254712345678", company="Kariuki Holdings",
                 inquiry_type="buy", preferred_category="heavy",
                 preferred_make_model="Gulfstream G650 or Global 7500",
                 budget_range="over_60m", new_or_pre_owned="new",
                 message="Looking to acquire a flagship ultra-long-range jet. Prefer 2022+.",
                 status="pending"),
            dict(contact_name="East Africa Air Ltd", email="ceo@eaairl.co.ke",
                 phone="+254700100200", company="East Africa Air Ltd",
                 inquiry_type="sell", preferred_category="midsize",
                 aircraft_make="Bombardier", aircraft_model="Learjet 45XR",
                 year_of_manufacture=2008, serial_number="45-382",
                 total_flight_hours=6500, asking_price_usd=Decimal("3200000"),
                 message="Selling our Learjet 45XR. CAMP maintenance tracking. Log books available.",
                 status="pending"),
            dict(contact_name="Safari Connect Ltd", email="fleet@safariconnect.co.ke",
                 phone="+254733200300", company="Safari Connect Ltd",
                 inquiry_type="buy", preferred_category="turboprop",
                 preferred_make_model="Pilatus PC-12 NG or PC-24",
                 budget_range="2m_5m", new_or_pre_owned="pre_owned",
                 message="Expanding our safari air network. Need a versatile turboprop.",
                 status="reviewing"),
        ]
        for d in sales:
            AircraftSalesInquiry.objects.get_or_create(email=d["email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(sales)} aircraft sales inquiries"))

    # ─────────────────────────────────────────────────────────────────────────
    # DOCUMENT UPLOADS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_document_uploads(self):
        self.stdout.write("  → DocumentUploads")
        admin = User.objects.filter(role="admin").first()
        docs = [
            dict(uploaded_by=admin, doc_type="aoc", linked_to="operator",
                 related_id=self.operators[0].id,
                 file_name="AfriqJet_AOC_2024.pdf",
                 file_url="https://storage.nairobijethouse.com/docs/afriqjet_aoc_2024.pdf",
                 file_size_kb=1250, notes="Valid AOC — expires 2026-03-15"),
            dict(uploaded_by=admin, doc_type="insurance", linked_to="operator",
                 related_id=self.operators[0].id,
                 file_name="AfriqJet_Insurance_Cert.pdf",
                 file_url="https://storage.nairobijethouse.com/docs/afriqjet_insurance.pdf",
                 file_size_kb=890, notes="Allianz Aviation — hull and liability."),
            dict(uploaded_by=admin, doc_type="airworthiness", linked_to="operator_aircraft",
                 related_id=self.operator_aircraft[0].id,
                 file_name="5Y-AJG_Airworthiness_Cert.pdf",
                 file_url="https://storage.nairobijethouse.com/docs/5y-ajg_airworthiness.pdf",
                 file_size_kb=450, notes="CAA Kenya airworthiness certificate."),
            dict(uploaded_by=self.clients[0], doc_type="passport", linked_to="flight_booking",
                 related_id=self.flight_bookings[0].id,
                 file_name="Kariuki_Passport.pdf",
                 file_url="https://storage.nairobijethouse.com/docs/kariuki_passport.pdf",
                 file_size_kb=320, notes="Primary traveller passport scan."),
            dict(uploaded_by=admin, doc_type="invoice", linked_to="operator_booking",
                 related_id=self.operator_bookings[0].id,
                 file_name="AfriqJet_Invoice_OB001.pdf",
                 file_url="https://storage.nairobijethouse.com/docs/afriqjet_inv_ob001.pdf",
                 file_size_kb=180, notes="Operator invoice for NBO–LHR booking."),
        ]
        for d in docs:
            DocumentUpload.objects.get_or_create(file_name=d["file_name"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(docs)} document uploads"))

    # ─────────────────────────────────────────────────────────────────────────
    # CLIENT NOTIFICATIONS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_client_notifications(self):
        self.stdout.write("  → ClientNotifications")
        notifs = [
            dict(user=self.clients[0], notif_type="booking_confirmed",
                 title="Your NBO → LHR flight is confirmed!",
                 body="Your Gulfstream G550 charter from Nairobi to London has been confirmed. Departure: Nov 1 at 08:00.",
                 link="/bookings/flights/", is_read=True),
            dict(user=self.clients[8], notif_type="booking_confirmed",
                 title="Your NBO → LHR flight is confirmed!",
                 body="Your Gulfstream G550 charter from Nairobi to London Heathrow is confirmed. Departure in 10 days.",
                 link="/bookings/flights/", is_read=False),
            dict(user=self.clients[1], notif_type="payment_received",
                 title="Payment received — Diani Star Charter",
                 body="We've received your payment of $22,500 for the Diani Star yacht charter. Confirmation sent to your email.",
                 link="/bookings/yachts/", is_read=True),
            dict(user=self.clients[4], notif_type="quote_received",
                 title="Your NBO → DXB quote is ready",
                 body="We've received 2 bids for your heavy jet request to Dubai. View your personalised quote now.",
                 link="/quotes/", is_read=False),
            dict(user=self.clients[10], notif_type="booking_confirmed",
                 title="Zanzibar Breeze charter confirmed",
                 body="Your 7-night Zanzibar Breeze catamaran charter is confirmed. Charter starts in 15 days.",
                 link="/bookings/yachts/", is_read=False),
            dict(user=self.clients[0], notif_type="reminder",
                 title="Upcoming flight in 48 hours",
                 body="Your Nairobi → Dubai flight departs in 48 hours. Ground transport arranged.",
                 link="/bookings/flights/", is_read=True),
        ]
        for d in notifs:
            ClientNotification.objects.create(**d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(notifs)} notifications"))

    # ─────────────────────────────────────────────────────────────────────────
    # WEBHOOK LOGS (V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_webhook_logs(self):
        self.stdout.write("  → WebhookLogs")
        for op in self.operators[:3]:
            for event, success, status in [
                ("booking_created",   True,  200),
                ("booking_confirmed", True,  200),
                ("rfq_issued",        True,  200),
                ("payout_initiated",  False, 500),
            ]:
                WebhookLog.objects.create(
                    operator=op, event=event,
                    payload={"booking_ref": str(uuid.uuid4())[:8], "operator": op.name},
                    endpoint_url=f"https://webhook.{op.contact_email.split('@')[1]}/njh-hook",
                    http_status=status, success=success, attempts=1 if success else 3,
                    response_body='{"status":"ok"}' if success else '{"error":"Internal Server Error"}',
                    next_retry=timezone.now() + timedelta(hours=1) if not success else None,
                )
        self.stdout.write(self.style.SUCCESS("    ✓ Webhook logs"))

    # ─────────────────────────────────────────────────────────────────────────
    # SAVED ROUTES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_saved_routes(self):
        self.stdout.write("  → SavedRoutes")
        routes = [
            (self.clients[0], "Nairobi–London", "Nairobi (NBO)", "London Heathrow (LHR)", "Monthly board meeting route"),
            (self.clients[0], "Nairobi–Dubai",  "Nairobi (NBO)", "Dubai (DXB)", "Quarterly investor meetings"),
            (self.clients[1], "Nairobi–Mara",   "Nairobi (NBO)", "Masai Mara (MRE)", "Weekend safari"),
            (self.clients[4], "Nairobi–Jo'burg","Nairobi (NBO)", "Johannesburg (JNB)", "Monthly corporate route"),
            (self.clients[8], "Nairobi–Mumbai", "Nairobi (NBO)", "Mumbai (BOM)", "Trade route"),
        ]
        for user, name, origin, dest, notes in routes:
            SavedRoute.objects.get_or_create(user=user, name=name, defaults=dict(
                origin=origin, destination=dest, notes=notes))
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(routes)} saved routes"))

    # ─────────────────────────────────────────────────────────────────────────
    # DISPUTES (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_disputes(self):
        self.stdout.write("  → Disputes")
        if self.marketplace_bookings:
            Dispute.objects.get_or_create(
                booking=self.marketplace_bookings[0],
                raised_by=self.clients[0],
                defaults=dict(
                    subject="In-flight Wi-Fi not working — NBO–LHR",
                    description="The satellite Wi-Fi was non-functional for the entire 8.5-hour flight. This was a key requirement for our board call.",
                    status="resolved",
                    resolution="NJH applied a 5% credit ($5,525) to client's account as goodwill gesture. Operator notified to rectify avionics.",
                    resolved_at=timezone.now() - timedelta(days=140),
                )
            )
        self.stdout.write(self.style.SUCCESS("    ✓ Disputes"))

    # ─────────────────────────────────────────────────────────────────────────
    # EMAIL LOGS (V1 + V2)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_email_logs(self):
        self.stdout.write("  → EmailLogs")
        admin = User.objects.filter(role="admin").first()
        emails = [
            dict(sent_by=admin, to_email="amani@gmail.com", to_name="James Amani Kariuki",
                 subject="Your NJH Flight Booking Confirmation — NBO → LHR",
                 body="Dear James, your Gulfstream G550 charter has been confirmed...",
                 inquiry_type="flight_booking", success=True),
            dict(sent_by=admin, to_email="ops@afriqjet.co.ke", to_name="AfriqJet Ops",
                 subject="RFQ — Heavy Jet NBO → DXB, 10 pax, 30 days",
                 body="Dear AfriqJet team, we have a new RFQ requiring a heavy jet...",
                 inquiry_type="rfq", success=True),
            dict(sent_by=admin, to_email="finance@afriqjet.co.ke", to_name="AfriqJet Finance",
                 subject="Payout Initiated — $88,000 USD for Booking NBO-LHR",
                 body="Dear AfriqJet, your payout of $88,000 has been initiated via SWIFT...",
                 inquiry_type="payout", success=True),
            dict(sent_by=admin, to_email="sophia@waweru.co.ke", to_name="Sophia Waweru",
                 subject="Your NJH Yacht Charter Confirmation — Diani Star",
                 body="Dear Sophia, your Diani Star yacht charter has been confirmed...",
                 inquiry_type="yacht_charter", success=True),
            dict(sent_by=admin, to_email="dispatch@afriqjet.co.ke", to_name="AfriqJet Dispatch",
                 subject="New Operator Booking — NBO → LHR, G550, Nov 10",
                 body="Dear AfriqJet, a new booking has been dispatched to your fleet...",
                 inquiry_type="operator", success=True),
        ]
        for d in emails:
            EmailLog.objects.create(**d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(emails)} email logs"))

    # ─────────────────────────────────────────────────────────────────────────
    # JOB POSTINGS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_job_postings(self):
        self.stdout.write("  → JobPostings")
        jobs = [
            dict(title="Charter Sales Manager", department="charter", location="nairobi",
                 job_type="full_time", is_active=True, is_featured=True,
                 deadline=future_date(30),
                 description="Lead our charter sales team. Own the client pipeline from inquiry to confirmed booking.",
                 requirements="5+ years aviation sales. Network in East African HNW market. Strong negotiation skills.",
                 benefits="Competitive base + uncapped commission. Medical, car allowance.",
                 salary_range="KES 350,000–500,000/month + commission"),
            dict(title="Partner Relations Manager — Operators", department="partnerships", location="nairobi",
                 job_type="full_time", is_active=True, is_featured=True,
                 deadline=future_date(21),
                 description="Manage and grow NJH's charter operator network across Africa, Middle East and Europe.",
                 requirements="Aviation operations background. Knowledge of AOC regulations. 4+ years in B2B partnerships.",
                 benefits="Competitive salary, travel allowance, medical insurance.",
                 salary_range="KES 280,000–400,000/month"),
            dict(title="Senior Concierge Executive", department="concierge", location="nairobi",
                 job_type="full_time", is_active=True, is_featured=False,
                 deadline=future_date(14),
                 description="Deliver white-glove service to NJH's premium members from booking to touchdown.",
                 requirements="Luxury hospitality or airline experience. Impeccable communication. Available 24/7.",
                 benefits="Medical, performance bonus, travel perks.",
                 salary_range="KES 150,000–220,000/month"),
            dict(title="Full-Stack Engineer (Django/React)", department="it", location="nairobi",
                 job_type="full_time", is_active=True, is_featured=True,
                 deadline=future_date(45),
                 description="Build and scale the NJH platform — bookings, operator portal, payments.",
                 requirements="Django REST, React, Postgres. AWS experience. 3+ years.",
                 benefits="Competitive salary, remote flexibility, equity options.",
                 salary_range="KES 200,000–350,000/month"),
            dict(title="Finance & Compliance Analyst", department="finance", location="nairobi",
                 job_type="full_time", is_active=True, is_featured=False,
                 deadline=future_date(28),
                 description="Own the financial controls, operator payout reconciliation and CAA compliance reporting.",
                 requirements="CPA/ACCA. Aviation finance experience a plus. Excel expert.",
                 benefits="Medical, pension, performance bonus.",
                 salary_range="KES 180,000–260,000/month"),
            dict(title="Marketing & Content Specialist", department="marketing", location="remote",
                 job_type="full_time", is_active=True, is_featured=False,
                 deadline=future_date(35),
                 description="Own NJH's brand voice across digital channels — content, social, email campaigns.",
                 requirements="3+ years luxury brand or travel marketing. Portfolio required.",
                 benefits="Remote work, creative freedom, travel perks.",
                 salary_range="KES 120,000–180,000/month"),
        ]
        self.job_postings = []
        for d in jobs:
            obj, _ = JobPosting.objects.get_or_create(title=d["title"], defaults=d)
            self.job_postings.append(obj)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(self.job_postings)} job postings"))

    # ─────────────────────────────────────────────────────────────────────────
    # JOB APPLICATIONS (V1)
    # ─────────────────────────────────────────────────────────────────────────
    def _seed_job_applications(self):
        self.stdout.write("  → JobApplications")
        if not self.job_postings:
            return

        applications = [
            dict(job=self.job_postings[0], full_name="Kevin Mwangi",
                 email="k.mwangi@gmail.com", phone="+254711888999",
                 nationality="Kenyan", current_role="Senior Charter Broker, Jetlink Express",
                 linkedin_url="https://linkedin.com/in/kevinmwangi",
                 cover_letter="I have 7 years in East African charter sales and have closed over $5M in bookings...",
                 years_experience=7, resume_url="https://storage.nairobijethouse.com/cvs/kevin_mwangi_cv.pdf",
                 status="shortlisted"),
            dict(job=self.job_postings[0], full_name="Amina Sheikh",
                 email="a.sheikh@aviation.ae", phone="+971554321987",
                 nationality="Kenyan/UAE", current_role="Charter Sales Executive, VistaJet Dubai",
                 linkedin_url="https://linkedin.com/in/aminasheikh",
                 cover_letter="My 5 years with VistaJet in the Middle East and Africa has equipped me...",
                 years_experience=5, resume_url="https://storage.nairobijethouse.com/cvs/amina_sheikh_cv.pdf",
                 status="interview"),
            dict(job=self.job_postings[1], full_name="Brian Ochieng",
                 email="b.ochieng@operators.co.ke", phone="+254722777888",
                 nationality="Kenyan", current_role="AOC Compliance Manager, Kenya Airways",
                 linkedin_url="https://linkedin.com/in/brianochieng",
                 cover_letter="Having managed operator compliance at KQ for 6 years, I understand the unique...",
                 years_experience=6, resume_url="https://storage.nairobijethouse.com/cvs/brian_ochieng_cv.pdf",
                 status="reviewing"),
            dict(job=self.job_postings[3], full_name="Sylvia Aluoch",
                 email="s.aluoch@techke.co.ke", phone="+254733666555",
                 nationality="Kenyan", current_role="Senior Django Developer, Andela",
                 linkedin_url="https://linkedin.com/in/sylviaaluoch",
                 portfolio_url="https://github.com/sylviaaluoch",
                 cover_letter="I'm a full-stack Django/React engineer with 4 years at Andela...",
                 years_experience=4, resume_url="https://storage.nairobijethouse.com/cvs/sylvia_aluoch_cv.pdf",
                 status="shortlisted"),
            dict(job=self.job_postings[2], full_name="Monica Njoroge",
                 email="m.njoroge@luxury.ke", phone="+254744555444",
                 nationality="Kenyan", current_role="VIP Concierge, Fairmont Nairobi",
                 linkedin_url="https://linkedin.com/in/monicanjoroge",
                 cover_letter="Five years delivering ultra-luxury hospitality at Fairmont has prepared me...",
                 years_experience=5, resume_url="https://storage.nairobijethouse.com/cvs/monica_njoroge_cv.pdf",
                 status="offered"),
            dict(job=self.job_postings[5], full_name="Daniel Kimani",
                 email="d.kimani@creativeke.co", phone="+254755444333",
                 nationality="Kenyan", current_role="Content Lead, Jumia Kenya",
                 portfolio_url="https://danielkimani.com",
                 cover_letter="I've led digital content for Jumia's luxury vertical for 3 years...",
                 years_experience=3, resume_url="https://storage.nairobijethouse.com/cvs/daniel_kimani_cv.pdf",
                 status="received"),
        ]
        for d in applications:
            JobApplication.objects.get_or_create(
                job=d["job"], email=d["email"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"    ✓ {len(applications)} job applications"))