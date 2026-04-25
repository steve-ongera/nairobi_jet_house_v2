import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { authApi } from './services/api'

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try {
      const data = await authApi.profile()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = useCallback(async (username, password) => {
    const data = await authApi.login({ username, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(prev => ({ ...prev, ...updated }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Route Guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) {
    const portals = {
      admin:    '/admin',
      staff:    '/staff',
      client:   '/member',
      owner:    '/owner',
      operator: '/operator',
    }
    return <Navigate to={portals[user.role] || '/'} replace />
  }
  return children
}

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner-ring" />
    </div>
  )
}

// ─── Lazy page imports ────────────────────────────────────────────────────────
// Public
import HomePage              from './pages/normal/HomePage.jsx'
import BookFlightPage        from './pages/normal/BookFlightPage.jsx'
import BookYachtPage         from './pages/normal/BookYachtPage.jsx'
import FleetPage             from './pages/normal/FleetPage.jsx'
import YachtsPage            from './pages/normal/YachtsPage.jsx'
import ServicesPage          from './pages/normal/ServicesPage.jsx'
import AboutPage             from './pages/normal/AboutPage.jsx'
import ContactPage           from './pages/normal/ContactPage.jsx'
import TrackBookingPage      from './pages/normal/TrackBookingPage.jsx'
import MembershipPublicPage  from './pages/normal/MembershipPublicPage.jsx'
import CareersPage           from './pages/normal/CareersPage.jsx'
import CareersApplyPage      from './pages/normal/CareersApplyPage.jsx'
import LoginPage             from './pages/normal/LoginPage.jsx'
import RegisterPage          from './pages/normal/RegisterPage.jsx'
import NotFoundPage          from './pages/normal/NotFoundPage.jsx'

// Admin
import AdminLayout            from './components/admin/AdminLayout.jsx'
import AdminDashboardPage     from './pages/admin/AdminDashboardPage.jsx'
import AdminFlightBookingsPage from './pages/admin/AdminFlightBookingsPage.jsx'
import AdminYachtChartersPage from './pages/admin/AdminYachtChartersPage.jsx'
import AdminInquiriesPage     from './pages/admin/AdminInquiriesPage.jsx'
import AdminMarketplacePage   from './pages/admin/AdminMarketplacePage.jsx'
import AdminUsersPage         from './pages/admin/AdminUsersPage.jsx'
import AdminEmailLogsPage     from './pages/admin/AdminEmailLogsPage.jsx'
import AdminCareersPage       from './pages/admin/AdminCareersPage.jsx'
import AdminSettingsPage      from './pages/admin/AdminSettingsPage.jsx'
import AdminOperatorsPage     from './pages/admin/AdminOperatorsPage.jsx'
import AdminPayoutsPage       from './pages/admin/AdminPayoutsPage.jsx'

// Staff
import StaffLayout        from './components/staff/StaffLayout.jsx'
import StaffDashboardPage from './pages/staff/StaffDashboardPage.jsx'
import StaffBookingsPage  from './pages/staff/StaffBookingsPage.jsx'
import StaffInquiriesPage from './pages/staff/StaffInquiriesPage.jsx'
import StaffEmailPage     from './pages/staff/StaffEmailPage.jsx'

// Member
import MemberLayout       from './components/membership/MemberLayout.jsx'
import MemberDashboardPage from './pages/membership/MemberDashboardPage.jsx'
import MemberBookPage     from './pages/membership/MemberBookPage.jsx'
import MemberFleetPage    from './pages/membership/MemberFleetPage.jsx'
import MemberPaymentsPage from './pages/membership/MemberPaymentsPage.jsx'
import MemberProfilePage  from './pages/membership/MemberProfilePage.jsx'
import MemberRoutesPage   from './pages/membership/MemberRoutesPage.jsx'

// Owner
import OwnerLayout         from './components/owner/OwnerLayout.jsx'
import OwnerDashboardPage  from './pages/owner/OwnerDashboardPage.jsx'
import OwnerAircraftPage   from './pages/owner/OwnerAircraftPage.jsx'
import OwnerMaintenancePage from './pages/owner/OwnerMaintenancePage.jsx'
import OwnerRevenuePage    from './pages/owner/OwnerRevenuePage.jsx'

// Operator (V2)
import OperatorLayout          from './components/operator/OperatorLayout.jsx'
import OperatorDashboardPage   from './pages/operator/OperatorDashboardPage.jsx'
import OperatorAircraftPage    from './pages/operator/OperatorAircraftPage.jsx'
import OperatorYachtsPage      from './pages/operator/OperatorYachtsPage.jsx'
import OperatorAvailabilityPage from './pages/operator/OperatorAvailabilityPage.jsx'
import OperatorRFQPage         from './pages/operator/OperatorRFQPage.jsx'
import OperatorBookingsPage    from './pages/operator/OperatorBookingsPage.jsx'
import OperatorPayoutsPage     from './pages/operator/OperatorPayoutsPage.jsx'
import OperatorProfilePage     from './pages/operator/OperatorProfilePage.jsx'

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public ─────────────────────────────────────────────────── */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/book-flight"     element={<BookFlightPage />} />
          <Route path="/book-yacht"      element={<BookYachtPage />} />
          <Route path="/fleet"           element={<FleetPage />} />
          <Route path="/yachts"          element={<YachtsPage />} />
          <Route path="/services"        element={<ServicesPage />} />
          <Route path="/about"           element={<AboutPage />} />
          <Route path="/contact"         element={<ContactPage />} />
          <Route path="/track"           element={<TrackBookingPage />} />
          <Route path="/membership"      element={<MembershipPublicPage />} />
          <Route path="/careers"         element={<CareersPage />} />
          <Route path="/careers/:id"     element={<CareersApplyPage />} />

          {/* ── Auth (guest only) ───────────────────────────────────────── */}
          <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* ── Admin ──────────────────────────────────────────────────── */}
          <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>}>
            <Route index                element={<AdminDashboardPage />} />
            <Route path="bookings"      element={<AdminFlightBookingsPage />} />
            <Route path="charters"      element={<AdminYachtChartersPage />} />
            <Route path="inquiries"     element={<AdminInquiriesPage />} />
            <Route path="marketplace"   element={<AdminMarketplacePage />} />
            <Route path="users"         element={<AdminUsersPage />} />
            <Route path="email-logs"    element={<AdminEmailLogsPage />} />
            <Route path="careers"       element={<AdminCareersPage />} />
            <Route path="settings"      element={<AdminSettingsPage />} />
            <Route path="operators"     element={<AdminOperatorsPage />} />
            <Route path="payouts"       element={<AdminPayoutsPage />} />
          </Route>

          {/* ── Staff ──────────────────────────────────────────────────── */}
          <Route path="/staff" element={<RequireAuth roles={['admin','staff']}><StaffLayout /></RequireAuth>}>
            <Route index             element={<StaffDashboardPage />} />
            <Route path="bookings"   element={<StaffBookingsPage />} />
            <Route path="inquiries"  element={<StaffInquiriesPage />} />
            <Route path="email"      element={<StaffEmailPage />} />
          </Route>

          {/* ── Member ─────────────────────────────────────────────────── */}
          <Route path="/member" element={<RequireAuth roles={['client']}><MemberLayout /></RequireAuth>}>
            <Route index             element={<MemberDashboardPage />} />
            <Route path="book"       element={<MemberBookPage />} />
            <Route path="fleet"      element={<MemberFleetPage />} />
            <Route path="payments"   element={<MemberPaymentsPage />} />
            <Route path="profile"    element={<MemberProfilePage />} />
            <Route path="routes"     element={<MemberRoutesPage />} />
          </Route>

          {/* ── Owner ──────────────────────────────────────────────────── */}
          <Route path="/owner" element={<RequireAuth roles={['owner','admin']}><OwnerLayout /></RequireAuth>}>
            <Route index                 element={<OwnerDashboardPage />} />
            <Route path="aircraft"       element={<OwnerAircraftPage />} />
            <Route path="maintenance"    element={<OwnerMaintenancePage />} />
            <Route path="revenue"        element={<OwnerRevenuePage />} />
          </Route>

          {/* ── Operator (V2) ───────────────────────────────────────────── */}
          <Route path="/operator" element={<RequireAuth roles={['operator','admin']}><OperatorLayout /></RequireAuth>}>
            <Route index                  element={<OperatorDashboardPage />} />
            <Route path="aircraft"        element={<OperatorAircraftPage />} />
            <Route path="yachts"          element={<OperatorYachtsPage />} />
            <Route path="availability"    element={<OperatorAvailabilityPage />} />
            <Route path="rfq"             element={<OperatorRFQPage />} />
            <Route path="bookings"        element={<OperatorBookingsPage />} />
            <Route path="payouts"         element={<OperatorPayoutsPage />} />
            <Route path="profile"         element={<OperatorProfilePage />} />
          </Route>

          {/* ── 404 ────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}