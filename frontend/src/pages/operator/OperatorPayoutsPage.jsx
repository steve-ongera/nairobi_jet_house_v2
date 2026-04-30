import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

export function OperatorPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    operatorAPI.opBookings({ status: 'completed' })
      .then(r => setPayouts(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = payouts.reduce((sum, b) => sum + Number(b.operator_payout_usd || 0), 0);

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>Payout History</h1>

      {/* ── Summary Cards ── */}
      <div style={statsGrid}>
        <div style={statCard}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Total Earned
          </p>
          <p style={{ color: 'var(--gold,#C9A84C)', fontSize: '1.8rem', fontFamily: 'var(--font-display,Georgia,serif)', margin: '0.3rem 0 0' }}>
            ${totalEarned.toLocaleString()} USD
          </p>
        </div>
        <div style={statCard}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Completed Bookings
          </p>
          <p style={{ color: '#81c784', fontSize: '1.8rem', fontFamily: 'var(--font-display,Georgia,serif)', margin: '0.3rem 0 0' }}>
            {payouts.length}
          </p>
        </div>
      </div>

      {/* ── Payout List ── */}
      {loading ? (
        <p style={muted}>Loading...</p>
      ) : payouts.length === 0 ? (
        <p style={muted}>No completed bookings / payouts yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {payouts.map(p => (
            <div key={p.id} style={rowCard}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                  Booking {String(p.reference).slice(0, 8).toUpperCase()}
                </p>
                <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                  {p.asset_label || p.asset_type} · Completed {p.updated_at?.slice(0, 10)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: 'var(--gold,#C9A84C)', fontWeight: '600' }}>
                  ${Number(p.operator_payout_usd || 0).toLocaleString()} USD
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        Payouts are processed within your agreed payment terms (typically 7 days after trip completion).
        Contact <a href="mailto:ops@nairobijethouse.com" style={{ color: 'rgba(255,255,255,0.4)' }}>ops@nairobijethouse.com</a> for payout queries.
      </p>
    </div>
  );
}

/* ── Styles ── */
const pageStyle = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted     = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' };
const statCard  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.25rem' };
const rowCard   = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' };

export default OperatorPayoutsPage;