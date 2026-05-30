// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';

// ── Public pages
import HomePage             from './pages/normal/HomePage';
import BookFlightPage       from './pages/normal/BookFlightPage';
import BookYachtPage        from './pages/normal/BookYachtPage';
import FleetPage            from './pages/normal/FleetPage';
import YachtsPage           from './pages/normal/YachtsPage';
import ServicesPage         from './pages/normal/ServicesPage';
import AboutPage            from './pages/normal/AboutPage';
import ContactPage          from './pages/normal/ContactPage';
import TrackBookingPage     from './pages/normal/TrackBookingPage';
import MembershipPublicPage from './pages/normal/MembershipPublicPage';
import CareersPage          from './pages/normal/CareersPage';
import CareersApplyPage     from './pages/normal/CareersApplyPage';
import LoginPage            from './pages/normal/LoginPage';
import RegisterPage         from './pages/normal/RegisterPage';
import NotFoundPage         from './pages/normal/NotFoundPage';
import AirCargoPage         from './pages/normal/AirCargoPage';
import LeasePage             from './pages/normal/LeasePage';

// ── Admin
import AdminLayout               from './components/admin/AdminLayout';
import AdminDashboardPage        from './pages/admin/AdminDashboardPage';
import AdminFlightBookingsPage   from './pages/admin/AdminFlightBookingsPage';
import AdminYachtChartersPage    from './pages/admin/AdminYachtChartersPage';
import AdminInquiriesPage        from './pages/admin/AdminInquiriesPage';
import AdminMarketplacePage      from './pages/admin/AdminMarketplacePage';
import AdminUsersPage            from './pages/admin/AdminUsersPage';
import AdminEmailLogsPage        from './pages/admin/AdminEmailLogsPage';
import AdminCareersPage          from './pages/admin/AdminCareersPage';
import AdminSettingsPage         from './pages/admin/AdminSettingsPage';
import AdminOperatorsPage        from './pages/admin/AdminOperatorsPage';
import AdminOperatorDetailPage   from './pages/admin/AdminOperatorDetailPage';
import AdminRFQPage              from './pages/admin/AdminRFQPage';
import AdminOperatorAircraftPage from './pages/admin/AdminOperatorAircraftPage';
import AdminPayoutsPage          from './pages/admin/AdminPayoutsPage';
import AdminCommissionRulesPage  from './pages/admin/AdminCommissionRulesPage';
// V2 NEW — confirmed booking management
import AdminCargoBookingsPage    from './pages/admin/AdminCargoBookingsPage';
import AdminLeaseBookingsPage    from './pages/admin/AdminLeaseBookingsPage';

// ── Staff
import StaffLayout        from './components/staff/StaffLayout';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffBookingsPage  from './pages/staff/StaffBookingsPage';
import StaffInquiriesPage from './pages/staff/StaffInquiriesPage';
import StaffEmailPage     from './pages/staff/StaffEmailPage';

// ── Membership
import MemberLayout        from './components/membership/MemberLayout';
import MemberDashboardPage from './pages/membership/MemberDashboardPage';
import MemberBookPage      from './pages/membership/MemberBookPage';
import MemberFleetPage     from './pages/membership/MemberFleetPage';
import MemberPaymentsPage  from './pages/membership/MemberPaymentsPage';
import MemberProfilePage   from './pages/membership/MemberProfilePage';
import MemberRoutesPage    from './pages/membership/MemberRoutesPage';

// ── Owner
import OwnerLayout          from './components/owner/OwnerLayout';
import OwnerDashboardPage   from './pages/owner/OwnerDashboardPage';
import OwnerAircraftPage    from './pages/owner/OwnerAircraftPage';
import OwnerMaintenancePage from './pages/owner/OwnerMaintenancePage';
import OwnerRevenuePage     from './pages/owner/OwnerRevenuePage';

// ── Operator (V2)
import OperatorLayout           from './components/operator/OperatorLayout';
import OperatorDashboardPage    from './pages/operator/OperatorDashboardPage';
import OperatorAircraftPage     from './pages/operator/OperatorAircraftPage';
import OperatorYachtsPage       from './pages/operator/OperatorYachtsPage';
import OperatorAvailabilityPage from './pages/operator/OperatorAvailabilityPage';
import OperatorRFQPage          from './pages/operator/OperatorRFQPage';
import OperatorBookingsPage     from './pages/operator/OperatorBookingsPage';
import OperatorPayoutsPage      from './pages/operator/OperatorPayoutsPage';
import OperatorProfilePage      from './pages/operator/OperatorProfilePage';

// ── Floating Back to Top Button Component ─────────────────────────────────
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          background: var(--navy, #0B1C36);
          color: var(--gold, #C8A45A);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(4px);
        }
        
        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
        }
        
        .back-to-top:hover {
          background: var(--gold, #C8A45A);
          color: var(--navy, #0B1C36);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .back-to-top:active {
          transform: translateY(0);
        }
        
        /* Ripple effect */
        .back-to-top::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(200, 164, 90, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.4s, height 0.4s;
        }
        
        .back-to-top:active::before {
          width: 100%;
          height: 100%;
        }
        
        @media (max-width: 768px) {
          .back-to-top {
            bottom: 1.25rem;
            right: 1.25rem;
            width: 42px;
            height: 42px;
            font-size: 1rem;
          }
        }
      `}</style>
      <button 
        className={`back-to-top ${isVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up-short" style={{ fontSize: '1.75rem', fontWeight: 'bold' }} />
      </button>
    </>
  );
}

// ── Page Loader Component ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="page-loader">
      <style>{`
        .page-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeOut 0.3s ease-out forwards;
          animation-delay: 0.5s;
          pointer-events: none;
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        
        .loader-container {
          text-align: center;
          animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .loader-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid var(--gray-200, #e2e8f0);
          border-top-color: var(--gold, #C8A45A);
          border-right-color: var(--navy, #0B1C36);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div className="page-loader">
        <div className="loader-container">
          <div className="loader-spinner" />
        </div>
      </div>
    </div>
  );
}

// ── Scroll to Top on Route Change ─────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

// ── Route Change Handler with Scroll to Top ───────────────────────────────
function RouteChangeHandler({ children }) {
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState('');
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (prevPath !== currentPath) {
      setLoading(true);
      setPrevPath(currentPath);
      
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Hide loader after page renders
      const timer = setTimeout(() => {
        setLoading(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPath]);

  return (
    <>
      {loading && <PageLoader />}
      {children}
    </>
  );
}

// ── Guards ─────────────────────────────────────────────────────────────────
function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="auth-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--white)'
      }}>
        <style>{`
          .auth-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-200);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="auth-spinner" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteChangeHandler>
          <ScrollToTop />
          <BackToTopButton />
          <Routes>
            {/* ── Public ─────────────────────────────────────────── */}
            <Route path="/"                  element={<HomePage />} />
            <Route path="/book-flight"       element={<BookFlightPage />} />
            <Route path="/book-yacht"        element={<BookYachtPage />} />
            <Route path="/fleet"             element={<FleetPage />} />
            <Route path="/yachts"            element={<YachtsPage />} />
            <Route path="/services"          element={<ServicesPage />} />
            <Route path="/about"             element={<AboutPage />} />
            <Route path="/contact"           element={<ContactPage />} />
            <Route path="/track"             element={<TrackBookingPage />} />
            <Route path="/membership"        element={<MembershipPublicPage />} />
            <Route path="/careers"           element={<CareersPage />} />
            <Route path="/careers/apply/:id" element={<CareersApplyPage />} />
            <Route path="/login"             element={<LoginPage />} />
            <Route path="/register"          element={<RegisterPage />} />
            <Route path="/air-cargo"         element={<AirCargoPage />} />
            <Route path="/lease"             element={<LeasePage />} />

            {/* ── Admin ──────────────────────────────────────────── */}
            <Route path="/admin" element={
              <RequireRole roles={['admin', 'staff']}>
                <AdminLayout />
              </RequireRole>
            }>
              <Route index                      element={<AdminDashboardPage />} />
              <Route path="bookings"            element={<AdminFlightBookingsPage />} />
              <Route path="charters"            element={<AdminYachtChartersPage />} />
              <Route path="inquiries"           element={<AdminInquiriesPage />} />
              <Route path="marketplace"         element={<AdminMarketplacePage />} />
              <Route path="users"               element={<AdminUsersPage />} />
              <Route path="email-logs"          element={<AdminEmailLogsPage />} />
              <Route path="careers"             element={<AdminCareersPage />} />
              <Route path="settings"            element={<AdminSettingsPage />} />
              <Route path="operators"           element={<AdminOperatorsPage />} />
              <Route path="operators/:id"       element={<AdminOperatorDetailPage />} />
              <Route path="rfq"                 element={<AdminRFQPage />} />
              <Route path="fleet"               element={<AdminOperatorAircraftPage />} />
              <Route path="payouts"             element={<AdminPayoutsPage />} />
              <Route path="commission-rules"    element={<AdminCommissionRulesPage />} />
              {/* V2 — Confirmed booking management */}
              <Route path="cargo-bookings"      element={<AdminCargoBookingsPage />} />
              <Route path="lease-bookings"      element={<AdminLeaseBookingsPage />} />
            </Route>

            {/* ── Staff ──────────────────────────────────────────── */}
            <Route path="/staff" element={
              <RequireRole roles={['staff', 'admin']}>
                <StaffLayout />
              </RequireRole>
            }>
              <Route index            element={<StaffDashboardPage />} />
              <Route path="bookings"  element={<StaffBookingsPage />} />
              <Route path="inquiries" element={<StaffInquiriesPage />} />
              <Route path="email"     element={<StaffEmailPage />} />
            </Route>

            {/* ── Member ─────────────────────────────────────────── */}
            <Route path="/member" element={
              <RequireRole roles={['client']}>
                <MemberLayout />
              </RequireRole>
            }>
              <Route index           element={<MemberDashboardPage />} />
              <Route path="book"     element={<MemberBookPage />} />
              <Route path="fleet"    element={<MemberFleetPage />} />
              <Route path="payments" element={<MemberPaymentsPage />} />
              <Route path="profile"  element={<MemberProfilePage />} />
              <Route path="routes"   element={<MemberRoutesPage />} />
            </Route>

            {/* ── Owner ──────────────────────────────────────────── */}
            <Route path="/owner" element={
              <RequireRole roles={['owner', 'admin']}>
                <OwnerLayout />
              </RequireRole>
            }>
              <Route index              element={<OwnerDashboardPage />} />
              <Route path="aircraft"    element={<OwnerAircraftPage />} />
              <Route path="maintenance" element={<OwnerMaintenancePage />} />
              <Route path="revenue"     element={<OwnerRevenuePage />} />
            </Route>

            {/* ── Operator ───────────────────────────────────────── */}
            <Route path="/operator" element={
              <RequireRole roles={['operator', 'admin']}>
                <OperatorLayout />
              </RequireRole>
            }>
              <Route index               element={<OperatorDashboardPage />} />
              <Route path="aircraft"     element={<OperatorAircraftPage />} />
              <Route path="yachts"       element={<OperatorYachtsPage />} />
              <Route path="availability" element={<OperatorAvailabilityPage />} />
              <Route path="rfq"          element={<OperatorRFQPage />} />
              <Route path="bookings"     element={<OperatorBookingsPage />} />
              <Route path="payouts"      element={<OperatorPayoutsPage />} />
              <Route path="profile"      element={<OperatorProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RouteChangeHandler>
      </BrowserRouter>
    </AuthProvider>
  );
}