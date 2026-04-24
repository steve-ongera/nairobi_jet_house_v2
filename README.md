# NairobiJetHouse V2 — Private Aviation & Yacht Charter Platform

> **Scale-up release.** V2 introduces a full Partner Charter Operator Network on top of the V1 foundation — operators can list real registered aircraft and yachts, respond to RFQs with competitive bids, manage their own availability, and receive automated payouts tracked to the cent. All V1 models, APIs, and frontend pages are fully preserved.

---

## Table of Contents

1. [What's New in V2](#whats-new-in-v2)
2. [Tech Stack](#tech-stack)
3. [Project Directory Structure](#project-directory-structure)
4. [Backend Setup](#backend-setup)
5. [Environment Variables Reference](#environment-variables-reference)
6. [API Reference](#api-reference)
7. [Role System](#role-system)
8. [V2 Data Models](#v2-data-models)
9. [Frontend Setup](#frontend-setup)
10. [Design System](#design-system)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

---

## What's New in V2

### Partner Charter Operator Network

| Model | Purpose |
|---|---|
| `CharterOperator` | Partner airline / charter company. Tiered: Standard → Preferred → Exclusive. Holds AOC, insurance, ARGUS/Wyvern ratings, bank details. |
| `OperatorAircraft` | Real registered aircraft listed by partner operators. Pending NJH admin approval before going live. Includes maintenance tracking and dynamic client pricing. |
| `OperatorYacht` | Yachts listed by partner operators. Full APA (Advance Provisioning Allowance) support. |
| `AvailabilityBlock` | Operators mark blackout / already-booked windows per aircraft or yacht. |
| `RFQBid` | Operator responds to a client `FlightBooking` inquiry with a price. Admin selects the winning bid. |
| `OperatorBooking` | Internal dispatch record created when NJH confirms a booking with a specific operator. Tracks acceptance / rejection / completion. |
| `OperatorPayoutLog` | Tracks what NJH owes each operator after commission. Supports multi-currency with exchange rate. |
| `OperatorReview` | Client rates an operator after a completed booking. Moderated before publishing. |
| `NJHCommissionRule` | Tiered, priority-based commission engine — match by operator tier, asset category, and booking value range. |
| `ClientNotification` | In-app + email notification log per user. |
| `DocumentUpload` | File attachments (passports, AOC, insurance, invoices) linked to any booking or operator. |
| `WebhookLog` | Outbound webhook delivery log to operator systems. Includes retry tracking. |

### V1 Enhancements
- `FlightBooking` — adds `operator_cost_usd`, `net_revenue_usd`, `assigned_operator`, `operator_aircraft`, and `rfq_sent` status
- `YachtCharter` — adds `operator_yacht`, `assigned_operator`, `operator_cost_usd`, `net_revenue_usd`
- `EmailLog` — adds `operator`, `rfq`, and `payout` inquiry types
- `JobPosting` — adds `partnerships` department
- `User` — adds `operator` role

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django 5.x + Django REST Framework 3.15 |
| Authentication | SimpleJWT (access + refresh + token blacklist) |
| Database | PostgreSQL 15 (SQLite for local dev) |
| Task queue | Celery + Redis (webhook retries, email queuing) |
| Cache | Redis (optional — falls back to dummy) |
| Static files | WhiteNoise (production) |
| File storage | Local media or AWS S3 (via django-storages) |
| Payments | Stripe (payment intent flow) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP client | Axios with auto token refresh interceptor |
| Styling | Pure CSS custom design system (no UI framework) |
| Fonts | Google Fonts — Cormorant Garamond + Outfit |

---

## Project Directory Structure

```
NairobiJetHouse/
│
├── .env                                # Environment variables (never commit)
├── .env.example                        # Environment variable template
├── .gitignore
├── README.md
├── requirements.txt                    # Python dependencies
├── manage.py
├── db.sqlite3                          # Dev database (ignored in prod)
│
├── logs/                               # Auto-created on first run
│   └── njh.log
│
├── media/                              # User-uploaded files (dev)
│
├── static/                             # Static source files
│
├── staticfiles/                        # Collected static (production)
│
├── templates/                          # Django HTML templates (admin email etc.)
│   └── emails/
│       ├── booking_confirmed.html
│       ├── quote_received.html
│       └── operator_rfq.html
│
├── backend/                            # Django project configuration
│   ├── __init__.py
│   ├── asgi.py                         # ASGI entry point (Daphne / Uvicorn)
│   ├── wsgi.py                         # WSGI entry point (Gunicorn)
│   ├── urls.py                         # ← ROOT URL CONF (all routes start here)
│   ├── settings.py                     # ← MAIN SETTINGS (this file)
│   └── celery.py                       # Celery app config
│
└── core/                               # Main Django application
    ├── __init__.py
    ├── apps.py
    ├── admin.py                        # Django admin registrations
    ├── models.py                       # ← ALL DATA MODELS (V1 + V2)
    ├── serializers.py                  # ← DRF serializers (V1 + V2)
    ├── views.py                        # ← ViewSets + API views (V1 + V2)
    ├── urls.py                         # ← APP URL ROUTER
    ├── permissions.py                  # Custom DRF permission classes
    ├── signals.py                      # Django signals (post-save hooks)
    ├── tasks.py                        # Celery async tasks
    ├── filters.py                      # django-filter FilterSets
    ├── tests.py                        # Test suite
    ├── utils.py                        # Shared helpers
    │
    ├── management/
    │   └── commands/
    │       ├── __init__.py
    │       ├── seed_airports.py        # Seeds IATA airport data
    │       ├── seed_data.py            # Full dev database seed
    │       └── seed_operators.py       # V2 — seeds sample operators
    │
    └── migrations/
        ├── __init__.py
        ├── 0001_initial.py             # V1 baseline
        └── 0002_v2_operator_network.py # V2 new models


frontend/                               # React + Vite application
├── index.html
├── package.json
├── vite.config.js
├── .env                                # VITE_API_URL
├── .env.example
│
└── src/
    ├── main.jsx                        # Entry point
    ├── App.jsx                         # Router + Auth context + route guards
    ├── App.css
    ├── index.css
    │
    ├── assets/
    │   ├── hero.png
    │   └── logo.svg
    │
    ├── styles/
    │   └── main.css                    # Full design system (tokens, components)
    │
    ├── services/
    │   └── api.js                      # All Axios API calls, auto token refresh
    │
    ├── hooks/
    │   ├── useAuth.js                  # Auth context consumer
    │   └── useNotifications.js         # Notification polling hook
    │
    ├── components/
    │   ├── common/
    │   │   ├── PublicNavbar.jsx        # Fixed navbar with scroll + dropdown
    │   │   └── PublicFooter.jsx        # Site-wide footer
    │   │
    │   ├── admin/
    │   │   ├── AdminLayout.jsx         # Admin shell with sidebar
    │   │   └── AdminSidebar.jsx        # Admin navigation
    │   │
    │   ├── staff/
    │   │   ├── StaffLayout.jsx
    │   │   └── StaffSidebar.jsx
    │   │
    │   ├── membership/
    │   │   ├── MemberLayout.jsx
    │   │   └── MemberSidebar.jsx
    │   │
    │   ├── operator/                   # V2 NEW
    │   │   ├── OperatorLayout.jsx      # Operator portal shell
    │   │   └── OperatorSidebar.jsx     # Operator navigation
    │   │
    │   └── owner/
    │       ├── OwnerLayout.jsx
    │       └── OwnerSidebar.jsx
    │
    └── pages/
        │
        ├── normal/                     # Public pages (no login required)
        │   ├── HomePage.jsx            # Landing page — hero, fleet, services
        │   ├── BookFlightPage.jsx      # Airport-to-airport booking form
        │   ├── BookYachtPage.jsx       # Yacht charter request form
        │   ├── FleetPage.jsx           # Browse all aircraft (catalog + operator)
        │   ├── YachtsPage.jsx          # Browse all yachts
        │   ├── ServicesPage.jsx
        │   ├── AboutPage.jsx
        │   ├── ContactPage.jsx
        │   ├── TrackBookingPage.jsx    # Track by UUID reference or email
        │   ├── MembershipPublicPage.jsx
        │   ├── CareersPage.jsx
        │   ├── CareersApplyPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── NotFoundPage.jsx
        │
        ├── admin/
        │   ├── AdminDashboardPage.jsx       # Overview stats + revenue chart
        │   ├── AdminFlightBookingsPage.jsx  # Booking management + pricing + RFQ
        │   ├── AdminYachtChartersPage.jsx   # Charter management + pricing
        │   ├── AdminInquiriesPage.jsx       # All inquiry types tabbed
        │   ├── AdminMarketplacePage.jsx     # Marketplace bookings
        │   ├── AdminUsersPage.jsx           # User + membership management
        │   ├── AdminEmailLogsPage.jsx       # Sent email history
        │   ├── AdminCareersPage.jsx         # Job postings + applications
        │   ├── AdminSettingsPage.jsx        # Commission rates + platform settings
        │   │
        │   ├── AdminOperatorsPage.jsx       # V2 — Charter operator list
        │   ├── AdminOperatorDetailPage.jsx  # V2 — Operator profile + assets + bids
        │   ├── AdminRFQPage.jsx             # V2 — Active RFQs + bid comparison
        │   ├── AdminOperatorAircraftPage.jsx# V2 — Pending approvals + fleet
        │   ├── AdminPayoutsPage.jsx         # V2 — Operator payout queue
        │   └── AdminCommissionRulesPage.jsx # V2 — NJH commission rules engine
        │
        ├── staff/
        │   ├── StaffDashboardPage.jsx
        │   ├── StaffBookingsPage.jsx
        │   ├── StaffInquiriesPage.jsx
        │   └── StaffEmailPage.jsx
        │
        ├── membership/
        │   ├── MemberDashboardPage.jsx
        │   ├── MemberBookPage.jsx
        │   ├── MemberFleetPage.jsx
        │   ├── MemberPaymentsPage.jsx
        │   ├── MemberProfilePage.jsx
        │   └── MemberRoutesPage.jsx
        │
        ├── owner/
        │   ├── OwnerDashboardPage.jsx
        │   ├── OwnerAircraftPage.jsx
        │   ├── OwnerMaintenancePage.jsx
        │   └── OwnerRevenuePage.jsx
        │
        └── operator/                        # V2 NEW — Operator Portal
            ├── OperatorDashboardPage.jsx    # Bids, bookings, earnings summary
            ├── OperatorAircraftPage.jsx     # Manage listed aircraft
            ├── OperatorYachtsPage.jsx       # Manage listed yachts
            ├── OperatorAvailabilityPage.jsx # Set blackout dates
            ├── OperatorRFQPage.jsx          # View & respond to RFQs
            ├── OperatorBookingsPage.jsx     # Accept / reject dispatched bookings
            ├── OperatorPayoutsPage.jsx      # Payout history
            └── OperatorProfilePage.jsx      # Company profile & documents
```

---

## Backend Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+ (or SQLite for local dev)
- Redis 7+ (optional — required for Celery / caching)

### Installation

```bash
# 1. Clone and enter project
git clone https://github.com/your-org/NairobiJetHouse.git
cd NairobiJetHouse

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
venv\Scripts\activate             # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure environment
cp .env.example .env
# → Edit .env with your database credentials, email settings, etc.

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Seed initial data
python manage.py seed_airports    # IATA airport data
python manage.py seed_data        # Aircraft catalog, yachts, tiers, sample users

# 7. Create superuser
python manage.py createsuperuser

# 8. Collect static files (for production)
python manage.py collectstatic --noinput

# 9. Start development server
python manage.py runserver
# → http://localhost:8000
# → Browsable API: http://localhost:8000/api/
```

### requirements.txt

```
django>=5.0,<6.0
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
django-filter>=23.5
python-dotenv>=1.0
whitenoise>=6.6
psycopg2-binary>=2.9          # PostgreSQL adapter
pillow>=10.2                  # Image processing
stripe>=8.0                   # Payments
celery>=5.3                   # Task queue
redis>=5.0                    # Celery broker + cache
django-redis>=5.4             # Django cache backend for Redis
django-storages>=1.14         # S3 file storage
boto3>=1.34                   # AWS SDK (for S3)
gunicorn>=21.2                # WSGI server (production)
uvicorn>=0.27                 # ASGI server (production)
```

---

## Environment Variables Reference

```bash
# ── Core ──────────────────────────────────────────────────────────────────────
SECRET_KEY=your-long-random-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# ── Database ──────────────────────────────────────────────────────────────────
DB_ENGINE=postgresql          # postgresql | sqlite
DB_NAME=NairobiJetHouse_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_CONN_MAX_AGE=60

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_ACCESS_HOURS=8
JWT_REFRESH_DAYS=30

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=NairobiJetHouse <noreply@nairobijethouse.com>
SUPPORT_EMAIL=ops@nairobijethouse.com
ADMIN_EMAIL=admin@nairobijethouse.com

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://app.nairobijethouse.com,https://www.nairobijethouse.com

# ── Cache / Celery ────────────────────────────────────────────────────────────
CACHE_BACKEND=redis             # redis | memcached | dummy
REDIS_URL=redis://127.0.0.1:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── AWS S3 ────────────────────────────────────────────────────────────────────
STORAGE_BACKEND=s3              # s3 | local
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=njh-assets
AWS_S3_REGION_NAME=eu-west-1

# ── Security (production) ─────────────────────────────────────────────────────
SECURE_SSL_REDIRECT=True
LOG_LEVEL=INFO
THROTTLE_ANON=200/hour
THROTTLE_USER=1000/hour
```

---

## API Reference

Base URL: `http://localhost:8000/api/`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `auth/register/` | Create account, returns JWT pair |
| POST | `auth/login/` | Login, returns JWT pair |
| POST | `auth/refresh/` | Refresh access token |
| GET / PATCH | `auth/profile/` | View or update own profile |

### Public Catalog

| Method | Endpoint | Description |
|---|---|---|
| GET | `airports/?search=jfk` | Search airports by code / city / country |
| GET | `aircraft/?category=heavy` | List catalog aircraft |
| GET | `yachts/?size_category=superyacht` | List catalog yachts |
| GET | `operator-aircraft/?category=midsize` | Approved operator aircraft (V2) |
| GET | `operator-yachts/` | Approved operator yachts (V2) |

### Bookings & Inquiries (Public — no login required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `bookings/` | Submit flight booking |
| GET | `bookings/track/{uuid}/` | Track flight booking by reference |
| GET | `bookings/by-email/?email=x` | Look up bookings by email |
| POST | `charters/` | Submit yacht charter request |
| GET | `charters/track/{uuid}/` | Track charter by reference |
| POST | `leases/` | Submit lease inquiry |
| POST | `flight-inquiries/` | Submit general flight inquiry |
| POST | `contacts/` | Submit contact form |
| POST | `group-charters/` | Submit group charter inquiry |
| POST | `cargo/` | Submit air cargo inquiry |
| POST | `aircraft-sales/` | Submit aircraft sales inquiry |
| GET | `jobs/` | List open job postings |
| POST | `job-applications/` | Submit job application |

### Operator Portal (role: `operator`)

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `my-aircraft/` | List / add own aircraft |
| PATCH | `my-aircraft/{id}/` | Update aircraft details |
| GET / POST | `my-yachts/` | List / add own yachts |
| GET / POST | `availability-blocks/` | Manage blackout windows |
| GET / POST | `rfq-bids/` | View RFQs / submit bids |
| POST | `operator-bookings/{id}/accept/` | Accept a dispatched booking |
| POST | `operator-bookings/{id}/reject/` | Reject a dispatched booking |
| GET | `operator-reviews/` | Reviews left by clients |

### Membership & Marketplace (role: `client`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `membership-tiers/` | List available tiers and pricing |
| POST | `memberships/create_membership/` | Sign up for a tier |
| GET | `memberships/my/` | View own membership |
| GET | `marketplace-aircraft/` | Browse available fleet |
| POST | `marketplace-bookings/` | Book from marketplace |
| GET | `saved-routes/` | Saved route shortcuts |
| GET | `payments/` | Payment history |
| GET / POST | `notifications/` | In-app notifications |
| POST | `notifications/mark_all_read/` | Mark all as read |

### Admin Endpoints (role: `admin` or `staff`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `admin/overview/` | Dashboard stats (V1 + V2) |
| GET | `admin/flight-bookings/` | All flight bookings |
| POST | `admin/flight-bookings/{id}/set_price/` | Quote + commission |
| POST | `admin/flight-bookings/{id}/send_rfq/` | Send RFQ to operators (V2) |
| POST | `admin/flight-bookings/{id}/assign_operator/` | Assign operator to booking (V2) |
| GET | `admin/flight-bookings/revenue/` | Monthly revenue time-series |
| GET | `admin/yacht-charters/` | All yacht charters |
| POST | `admin/yacht-charters/{id}/set_price/` | Quote charter |
| GET | `admin/inquiries/` | All inquiry types aggregated |
| GET | `admin/users/` | User management |
| POST | `admin/users/{id}/toggle_active/` | Activate / deactivate user |
| POST | `admin/users/{id}/change_role/` | Change user role |
| GET | `admin/email-logs/` | Sent email history |
| POST | `admin/send-email/` | Send a manual email |
| POST | `admin/price-calculator/` | Flight price breakdown tool |
| GET | `admin/commission/` | Commission settings |
| GET | `admin/jobs/` | Job posting management |
| GET | `admin/job-applications/` | All applications |

### Admin — V2 Operator Network

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `admin/operators/` | List / create charter operators |
| GET | `admin/operators/{id}/` | Full operator profile |
| POST | `admin/operators/{id}/activate/` | Activate an operator |
| POST | `admin/operators/{id}/suspend/` | Suspend an operator |
| POST | `admin/operators/{id}/change_tier/` | Update operator tier |
| GET | `admin/operators/{id}/aircraft/` | All operator's aircraft |
| GET | `admin/operators/{id}/yachts/` | All operator's yachts |
| GET | `admin/operators/{id}/bookings/` | All operator bookings |
| GET | `admin/operators/{id}/payouts/` | Payout history |
| GET | `admin/operators/{id}/reviews/` | Client reviews |
| GET | `admin/operators/{id}/webhooks/` | Webhook delivery logs |
| POST | `my-aircraft/{id}/approve/` | NJH approves operator aircraft |
| POST | `my-aircraft/{id}/reject/` | NJH rejects operator aircraft |
| POST | `rfq-bids/{id}/accept/` | Accept a bid, calculate client price |
| POST | `rfq-bids/{id}/shortlist/` | Shortlist a bid |
| GET / POST | `admin/commission-rules/` | NJH commission rule engine |
| GET | `admin/payouts/` | Operator payout queue |
| POST | `admin/payouts/{id}/mark_paid/` | Record payout sent |
| POST | `admin/payouts/{id}/mark_processing/` | Mark payout processing |
| GET | `admin/webhooks/` | All webhook delivery logs |
| POST | `admin/webhooks/{id}/retry/` | Queue a webhook retry |

---

## Role System

| Role | Portal Path | Key Capabilities |
|---|---|---|
| `client` | `/member` | Browse fleet, book from marketplace, manage membership |
| `owner` | `/owner` | List own aircraft, track maintenance, view revenue |
| `operator` | `/operator` | List aircraft/yachts, respond to RFQs, accept bookings, view payouts |
| `staff` | `/staff` | View and respond to all bookings and inquiries, send emails |
| `admin` | `/admin` | Full platform access — pricing, user management, operator network, commission rules |

---

## V2 Data Models

### CharterOperator
Represents a partner airline or charter company. Has a `tier` (Standard / Preferred / Exclusive), `status` (pending → active → suspended), linked `User` accounts with `role='operator'`, financial details for payouts, safety certifications (AOC, ARGUS, Wyvern), and operating regions.

### OperatorAircraft
A real registered aircraft owned by a `CharterOperator`. Goes through a `pending → available` approval workflow. Stores the operator's base hourly rate; the `display_hourly_rate` property applies the active `NJHCommissionRule` markup to derive the client-facing price automatically.

### NJHCommissionRule
A priority-ordered rules engine. Each rule can match on `operator_tier`, `asset_category`, and booking value range. Higher `priority` wins. Defines both the `markup_pct` (added to operator rate for client price) and `commission_pct` (NJH's retained share of client payment).

### RFQBid → OperatorBooking → OperatorPayoutLog
The full V2 booking lifecycle:
1. Client submits `FlightBooking` (status: `inquiry`)
2. Admin sends RFQ to selected operators (status: `rfq_sent`)
3. Operators submit `RFQBid` entries
4. Admin accepts winning bid → bid calculates `njh_client_price` and `njh_margin_usd`
5. `OperatorBooking` is created (status: `sent` → `accepted`)
6. After trip completion, `OperatorPayoutLog` is created and progresses `pending → processing → paid`

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Installation

```bash
cd frontend

npm install

# Configure API base URL
echo "VITE_API_URL=http://localhost:8000/api" > .env

npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output: frontend/dist/
```

### Key Frontend Routes

| Route | Component | Auth Required |
|---|---|---|
| `/` | `HomePage` | No |
| `/book-flight` | `BookFlightPage` | No |
| `/book-yacht` | `BookYachtPage` | No |
| `/fleet` | `FleetPage` | No |
| `/yachts` | `YachtsPage` | No |
| `/track` | `TrackBookingPage` | No |
| `/careers` | `CareersPage` | No |
| `/careers/apply/:id` | `CareersApplyPage` | No |
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/member/*` | `MemberLayout` | `client` |
| `/owner/*` | `OwnerLayout` | `owner` |
| `/operator/*` | `OperatorLayout` | `operator` |
| `/staff/*` | `StaffLayout` | `staff` |
| `/admin/*` | `AdminLayout` | `admin` |

---

## Design System

The frontend uses a **luxury dark-navy and champagne-gold** theme with zero UI framework dependency.

```css
/* Core palette */
--navy:      #0B1D3A;   /* Primary background, headings */
--gold:      #C9A84C;   /* Accent, CTAs, icons */
--white:     #FFFFFF;
--off-white: #FAFAF8;

/* Typography */
--font-display: 'Cormorant Garamond', Georgia, serif;  /* headings */
--font-body:    'Outfit', system-ui, sans-serif;       /* body text */
```

All tokens, component classes, grid utilities, responsive breakpoints, and animation keyframes live in `frontend/src/styles/main.css`.

---

## Deployment

### Gunicorn + Nginx (recommended)

```bash
# Start Gunicorn WSGI server
gunicorn backend.wsgi:application \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile logs/gunicorn-access.log \
  --error-logfile  logs/gunicorn-error.log

# Or Uvicorn for ASGI (WebSocket support)
uvicorn backend.asgi:application \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 4
```

### Celery Workers

```bash
# Main task worker
celery -A backend worker --loglevel=info --concurrency=4

# Beat scheduler (periodic tasks)
celery -A backend beat --loglevel=info
```

### Docker Compose (quick start)

```yaml
# docker-compose.yml
version: '3.9'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB:       NairobiJetHouse_db
      POSTGRES_USER:     postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  api:
    build: .
    command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
    env_file: .env
    volumes:
      - media_files:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  worker:
    build: .
    command: celery -A backend worker --loglevel=info
    env_file: .env
    depends_on:
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
  media_files:
```

### Pre-deployment Checklist

```bash
# 1. Set production environment variables
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# 2. Run checks
python manage.py check --deploy

# 3. Collect static
python manage.py collectstatic --noinput

# 4. Apply migrations
python manage.py migrate

# 5. Confirm email backend is SMTP not console
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

---

## Contributing

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, run tests
python manage.py test core

# Lint
flake8 core/ --max-line-length 120

# Commit with conventional commits
git commit -m "feat(operators): add webhook retry endpoint"

# Push and open PR against main
git push origin feature/your-feature-name
```

---

*NairobiJetHouse V2 — Elevating Every Journey*