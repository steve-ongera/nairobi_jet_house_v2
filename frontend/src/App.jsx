import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// ── Public pages
import HomePage            from './pages/normal/HomePage';
import BookFlightPage      from './pages/normal/BookFlightPage';
import BookYachtPage       from './pages/normal/BookYachtPage';
import FleetPage           from './pages/normal/FleetPage';
import YachtsPage          from './pages/normal/YachtsPage';
import ServicesPage        from './pages/normal/ServicesPage';
import AboutPage           from './pages/normal/AboutPage';
import ContactPage         from './pages/normal/ContactPage';
import TrackBookingPage    from './pages/normal/TrackBookingPage';
import MembershipPublicPage from './pages/normal/MembershipPublicPage';
import CareersPage         from './pages/normal/CareersPage';
import CareersApplyPage    from './pages/normal/CareersApplyPage';
import LoginPage           from './pages/normal/LoginPage';
import RegisterPage        from './pages/normal/RegisterPage';
import NotFoundPage        from './pages/normal/NotFoundPage';

// ── Admin
import AdminLayout              from './components/admin/AdminLayout';
import AdminDashboardPage       from './pages/admin/AdminDashboardPage';
import AdminFlightBookingsPage  from './pages/admin/AdminFlightBookingsPage';
import AdminYachtChartersPage   from './pages/admin/AdminYachtChartersPage';
import AdminInquiriesPage       from './pages/admin/AdminInquiriesPage';
import AdminMarketplacePage     from './pages/admin/AdminMarketplacePage';
import AdminUsersPage           from './pages/admin/AdminUsersPage';
import AdminEmailLogsPage       from './pages/admin/AdminEmailLogsPage';
import AdminCareersPage         from './pages/admin/AdminCareersPage';
import AdminSettingsPage        from './pages/admin/AdminSettingsPage';
import AdminOperatorsPage       from './pages/admin/AdminOperatorsPage';
import AdminOperatorDetailPage  from './pages/admin/AdminOperatorDetailPage';
import AdminRFQPage             from './pages/admin/AdminRFQPage';
import AdminOperatorAircraftPage from './pages/admin/AdminOperatorAircraftPage';
import AdminPayoutsPage         from './pages/admin/AdminPayoutsPage';
import AdminCommissionRulesPage from './pages/admin/AdminCommissionRulesPage';

// ── Staff
import StaffLayout        from './components/staff/StaffLayout';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffBookingsPage  from './pages/staff/StaffBookingsPage';
import StaffInquiriesPage from './pages/staff/StaffInquiriesPage';
import StaffEmailPage     from './pages/staff/StaffEmailPage';

// ── Membership
import MemberLayout       from './components/membership/MemberLayout';
import MemberDashboardPage from './pages/membership/MemberDashboardPage';
import MemberBookPage     from './pages/membership/MemberBookPage';
import MemberFleetPage    from './pages/membership/MemberFleetPage';
import MemberPaymentsPage from './pages/membership/MemberPaymentsPage';
import MemberProfilePage  from './pages/membership/MemberProfilePage';
import MemberRoutesPage   from './pages/membership/MemberRoutesPage';

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

// ── Guards ─────────────────────────────────────────────────────────────────
function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><span className="spinner"/></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/book-flight"   element={<BookFlightPage />} />
          <Route path="/book-yacht"    element={<BookYachtPage />} />
          <Route path="/fleet"         element={<FleetPage />} />
          <Route path="/yachts"        element={<YachtsPage />} />
          <Route path="/services"      element={<ServicesPage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/contact"       element={<ContactPage />} />
          <Route path="/track"         element={<TrackBookingPage />} />
          <Route path="/membership"    element={<MembershipPublicPage />} />
          <Route path="/careers"       element={<CareersPage />} />
          <Route path="/careers/apply/:id" element={<CareersApplyPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />

          {/* ── Admin ──────────────────────────────────────────── */}
          <Route path="/admin" element={
            <RequireRole roles={['admin','staff']}>
              <AdminLayout />
            </RequireRole>
          }>
            <Route index                  element={<AdminDashboardPage />} />
            <Route path="bookings"        element={<AdminFlightBookingsPage />} />
            <Route path="charters"        element={<AdminYachtChartersPage />} />
            <Route path="inquiries"       element={<AdminInquiriesPage />} />
            <Route path="marketplace"     element={<AdminMarketplacePage />} />
            <Route path="users"           element={<AdminUsersPage />} />
            <Route path="email-logs"      element={<AdminEmailLogsPage />} />
            <Route path="careers"         element={<AdminCareersPage />} />
            <Route path="settings"        element={<AdminSettingsPage />} />
            <Route path="operators"       element={<AdminOperatorsPage />} />
            <Route path="operators/:id"   element={<AdminOperatorDetailPage />} />
            <Route path="rfq"             element={<AdminRFQPage />} />
            <Route path="fleet"           element={<AdminOperatorAircraftPage />} />
            <Route path="payouts"         element={<AdminPayoutsPage />} />
            <Route path="commission-rules" element={<AdminCommissionRulesPage />} />
          </Route>

          {/* ── Staff ──────────────────────────────────────────── */}
          <Route path="/staff" element={
            <RequireRole roles={['staff','admin']}>
              <StaffLayout />
            </RequireRole>
          }>
            <Route index              element={<StaffDashboardPage />} />
            <Route path="bookings"    element={<StaffBookingsPage />} />
            <Route path="inquiries"   element={<StaffInquiriesPage />} />
            <Route path="email"       element={<StaffEmailPage />} />
          </Route>

          {/* ── Member ─────────────────────────────────────────── */}
          <Route path="/member" element={
            <RequireRole roles={['client']}>
              <MemberLayout />
            </RequireRole>
          }>
            <Route index            element={<MemberDashboardPage />} />
            <Route path="book"      element={<MemberBookPage />} />
            <Route path="fleet"     element={<MemberFleetPage />} />
            <Route path="payments"  element={<MemberPaymentsPage />} />
            <Route path="profile"   element={<MemberProfilePage />} />
            <Route path="routes"    element={<MemberRoutesPage />} />
          </Route>

          {/* ── Owner ──────────────────────────────────────────── */}
          <Route path="/owner" element={
            <RequireRole roles={['owner','admin']}>
              <OwnerLayout />
            </RequireRole>
          }>
            <Route index                element={<OwnerDashboardPage />} />
            <Route path="aircraft"      element={<OwnerAircraftPage />} />
            <Route path="maintenance"   element={<OwnerMaintenancePage />} />
            <Route path="revenue"       element={<OwnerRevenuePage />} />
          </Route>

          {/* ── Operator ───────────────────────────────────────── */}
          <Route path="/operator" element={
            <RequireRole roles={['operator','admin']}>
              <OperatorLayout />
            </RequireRole>
          }>
            <Route index                  element={<OperatorDashboardPage />} />
            <Route path="aircraft"        element={<OperatorAircraftPage />} />
            <Route path="yachts"          element={<OperatorYachtsPage />} />
            <Route path="availability"    element={<OperatorAvailabilityPage />} />
            <Route path="rfq"             element={<OperatorRFQPage />} />
            <Route path="bookings"        element={<OperatorBookingsPage />} />
            <Route path="payouts"         element={<OperatorPayoutsPage />} />
            <Route path="profile"         element={<OperatorProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}