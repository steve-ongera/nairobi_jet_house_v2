import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operatorAPI } from '../../services/api';

export function OperatorDashboardPage() {
  const [bids, setBids] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      operatorAPI.rfqBids({ status: 'submitted' }),
      operatorAPI.opBookings({ status: 'sent' }),
      operatorAPI.myAircraft(),
    ])
      .then(([b, bk, ac]) => {
        setBids(b.data.results || b.data);
        setBookings(bk.data.results || bk.data);
        setAircraft(ac.data.results || ac.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingAircraft = aircraft.filter(a => !a.is_approved).length;
  const activeAircraft = aircraft.filter(a => a.status === 'available').length;

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>Operator Dashboard</h1>

      {loading ? (
        <p style={muted}>Loading...</p>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div style={statsGrid}>
            <StatCard label="Open RFQs to Bid"          value={bids.length}      color="var(--gold,#C9A84C)" to="/operator/rfq"      />
            <StatCard label="Bookings Awaiting Accept"   value={bookings.length}  color="#81c784"             to="/operator/bookings" />
            <StatCard label="Active Aircraft"            value={activeAircraft}   color="#64b5f6"             to="/operator/aircraft" />
            <StatCard label="Pending NJH Approval"      value={pendingAircraft}  color="#ffb74d"             to="/operator/aircraft" />
          </div>

          {/* ── Open RFQs ── */}
          {bids.length > 0 && (
            <Section title="Open RFQs — Action Required">
              {bids.slice(0, 5).map(bid => (
                <div key={bid.id} style={rowCard}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                      Booking #{String(bid.booking).slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                      Status: {bid.status} · Valid until: {bid.valid_until?.slice(0, 10) || 'N/A'}
                    </p>
                  </div>
                  <Link to="/operator/rfq" style={goldBtn}>Respond</Link>
                </div>
              ))}
            </Section>
          )}

          {/* ── Pending Bookings ── */}
          {bookings.length > 0 && (
            <Section title="Dispatched Bookings — Awaiting Confirmation">
              {bookings.slice(0, 5).map(bk => (
                <div key={bk.id} style={rowCard}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                      Booking {String(bk.reference).slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                      Payout: ${Number(bk.operator_payout_usd || 0).toLocaleString()} USD
                    </p>
                  </div>
                  <Link to="/operator/bookings" style={goldBtn}>Review</Link>
                </div>
              ))}
            </Section>
          )}

          {bids.length === 0 && bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
              <p>No pending actions. You're all caught up! ✅</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Sub-components ── */
function StatCard({ label, value, color = 'var(--gold,#C9A84C)', to }) {
  return (
    <div style={statCard}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </p>
      <p style={{ color, fontSize: '2rem', fontFamily: 'var(--font-display,Georgia,serif)', margin: '0.3rem 0 0.5rem' }}>
        {value}
      </p>
      {to && (
        <Link to={to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', textDecoration: 'none' }}>
          View →
        </Link>
      )}
    </div>
  );
}

/* ── Shared styles (local) ── */
const pageStyle  = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle  = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted      = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const statsGrid  = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' };
const statCard   = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.25rem' };
const rowCard    = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' };
const goldBtn    = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default OperatorDashboardPage;