// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';

// ── Public pages
import HomePage             from './pages/normal/HomePage';
import BookFlightPage       from './pages/normal/BookFlightPage';
import BookYachtPage        from './pages/normal/BookYachtPage';
import FleetPage            from './pages/normal/FleetPage';
import FleetDetailPage      from './pages/normal/FleetDetailPage';
import YachtsPage           from './pages/normal/YachtsPage';
import YachtDetailPage from './pages/normal/YachtDetailPage';
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
import LeasePage            from './pages/normal/LeasePage';
import GroupCharterPage     from './pages/normal/GroupCharterPage'; 

import PrivacyPage from './pages/normal/PrivacyPage';
import TermsPage from './pages/normal/TermsPage';
import CookiesPage from './pages/normal/CookiesPage';
import EmergencyPage from './pages/normal/EmergencyPage';
import CorporatePage from './pages/normal/CorporatePage';

// ── Admin
import AdminLayout               from './components/admin/AdminLayout';
import AdminDashboardPage        from './pages/admin/AdminDashboardPage';
import AdminFlightBookingsPage   from './pages/admin/AdminFlightBookingsPage';
import AdminGroupCharterInquiryPage from './pages/admin/AdminGroupCharterInquiryPage';
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

// ── Floating WhatsApp Button Component ────────────────────────────────────
function WhatsAppButton() {
  const phoneNumber = '254112284093';
  
  // Auto-generate inquiry message based on current page
  const getInquiryMessage = () => {
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'Homepage' 
      : currentPath === '/book-flight' ? 'Flight Booking Page'
      : currentPath === '/book-yacht' ? 'Yacht Charter Page'
      : currentPath === '/fleet' ? 'Fleet Page'
      : currentPath === '/yachts' ? 'Yachts Page'
      : currentPath === '/services' ? 'Services Page'
      : currentPath === '/about' ? 'About Page'
      : currentPath === '/contact' ? 'Contact Page'
      : currentPath === '/air-cargo' ? 'Air Cargo Page'
      : currentPath === '/lease' ? 'Leasing Page'
      : currentPath === '/membership' ? 'Membership Page'
      : 'NairobiJetHouse Website';
    
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    
    return encodeURIComponent(
      `Hello NairobiJetHouse team \n\n` +
      `I'm reaching out from your ${pageName}.\n\n` +
      `I would like to inquire about:\n` +
      `─────────────────────\n` +
      `• Your private jet charter services\n` +
      `• Available aircraft and pricing\n` +
      `• Membership options\n` +
      `• Or any special offers\n\n` +
      `Could you please provide me with more information?\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      ` Device: ${userAgent.split(' ')[0]}\n` +
      ` Screen: ${screenSize}\n` +
      ` Time: ${timestamp}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Thank you and I look forward to your response! `
    );
  };

  const handleClick = () => {
    const message = getInquiryMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <style>{`
        .whatsapp-float {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: pulse 2s infinite;
        }
        
        .whatsapp-float:hover {
          transform: scale(1.1);
          background: #128C7E;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        
        .whatsapp-float:active {
          transform: scale(0.95);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
        
        /* Tooltip */
        .whatsapp-float::before {
          content: 'Chat with us on WhatsApp';
          position: absolute;
          right: 70px;
          background: #1f2937;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          pointer-events: none;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .whatsapp-float:hover::before {
          opacity: 1;
          visibility: visible;
          transform: translateX(-8px);
        }
        
        @media (max-width: 768px) {
          .whatsapp-float {
            bottom: 5rem;
            right: 1rem;
            width: 48px;
            height: 48px;
            font-size: 1.4rem;
          }
          .whatsapp-float::before {
            display: none;
          }
        }
      `}</style>
      <button 
        className="whatsapp-float"
        onClick={handleClick}
        aria-label="Chat with us on WhatsApp"
      >
        <i className="bi bi-whatsapp"></i>
      </button>
    </>
  );
}

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
          background: var(--color-navy, #0B1C36);
          color: var(--color-gold, #C8A45A);
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
          background: var(--color-gold, #C8A45A);
          color: var(--color-navy, #0B1C36);
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

// ── Guards ─────────────────────────────────────────────────────────────────
function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  
  // No loading spinner - just wait or redirect
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <BackToTopButton />
        <WhatsAppButton />
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/"                  element={<HomePage />} />
          <Route path="/book-flight"       element={<BookFlightPage />} />
          <Route path="/book-yacht"        element={<BookYachtPage />} />
          <Route path="/fleet"             element={<FleetPage />} />
          <Route path="/fleet/:id"         element={<FleetDetailPage />} /> 
          <Route path="/yachts"            element={<YachtsPage />} />
          <Route path="/yachts/:id"        element={<YachtDetailPage />} />  
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
          <Route path="/group-charter"     element={<GroupCharterPage />} />
          <Route path="/privacy"          element={<PrivacyPage />} />
          <Route path="/terms"            element={<TermsPage />} />
          <Route path="/cookies"          element={<CookiesPage />} />
          <Route path="/emergency"        element={<EmergencyPage />} />
          <Route path="/corporate"        element={<CorporatePage />} />

          {/* ── Admin ──────────────────────────────────────────── */}
          <Route path="/admin" element={
            <RequireRole roles={['admin', 'staff']}>
              <AdminLayout />
            </RequireRole>
          }>
            <Route index                      element={<AdminDashboardPage />} />
            <Route path="bookings"            element={<AdminFlightBookingsPage />} />
            <Route path="group-charter"       element={<AdminGroupCharterInquiryPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}