import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

const STATUS_COLOR = {
  sent:      '#ffb74d',
  accepted:  '#81c784',
  rejected:  '#ef9a9a',
  in_service:'#64b5f6',
  completed: '#a5d6a7',
  disputed:  '#ff8a65',
};

export function OperatorBookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = () => {
    setLoading(true);
    operatorAPI.opBookings()
      .then(r => setBookings(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAccept = async id => {
    setProcessing(id);
    try {
      const ref = window.prompt('Enter your internal booking reference (optional):') || '';
      await operatorAPI.acceptBooking(id, { operator_reference: ref });
      load();
    } catch {
      alert('Failed to accept booking.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async id => {
    setProcessing(id);
    try {
      const reason = window.prompt('Reason for rejection (required):');
      if (!reason) { setProcessing(null); return; }
      await operatorAPI.rejectBooking(id, { rejection_reason: reason });
      load();
    } catch {
      alert('Failed to reject booking.');
    } finally {
      setProcessing(null);
    }
  };

  const pending = bookings.filter(b => b.status === 'sent');
  const others  = bookings.filter(b => b.status !== 'sent');

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>Operator Bookings</h1>

      {loading ? (
        <p style={muted}>Loading...</p>
      ) : (
        <>
          {/* ── Pending Confirmations ── */}
          {pending.length > 0 && (
            <Section title={`Awaiting Your Confirmation (${pending.length})`}>
              {pending.map(bk => (
                <div key={bk.id} style={{ ...rowCard, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>
                        Booking {String(bk.reference).slice(0, 8).toUpperCase()}
                      </p>
                      <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                        {bk.asset_label || bk.asset_type} · Payout:{' '}
                        <span style={{ color: 'var(--gold,#C9A84C)' }}>
                          ${Number(bk.operator_payout_usd || 0).toLocaleString()} USD
                        </span>
                      </p>
                      <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                        Created: {bk.created_at?.slice(0, 10)}
                      </p>
                    </div>
                    <span style={{ ...badge, color: STATUS_COLOR[bk.status], background: `${STATUS_COLOR[bk.status]}22` }}>
                      {bk.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleAccept(bk.id)}
                      disabled={processing === bk.id}
                      style={{ ...goldBtn, background: '#81c784', color: '#111' }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleReject(bk.id)}
                      disabled={processing === bk.id}
                      style={{ ...outlineBtn, borderColor: 'rgba(239,154,154,0.4)', color: '#ef9a9a' }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* ── All Bookings ── */}
          <Section title="All Bookings">
            {others.length === 0 && pending.length === 0 ? (
              <p style={muted}>No bookings assigned to you yet.</p>
            ) : others.length === 0 ? null : (
              others.map(bk => (
                <div key={bk.id} style={rowCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                      <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                        Booking {String(bk.reference).slice(0, 8).toUpperCase()}
                      </p>
                      <span style={{ ...badge, color: STATUS_COLOR[bk.status], background: `${STATUS_COLOR[bk.status]}22` }}>
                        {bk.status_display || bk.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                      {bk.asset_label || bk.asset_type} · ${Number(bk.operator_payout_usd || 0).toLocaleString()} USD · {bk.created_at?.slice(0, 10)}
                    </p>
                    {bk.operator_reference && (
                      <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
                        Ref: {bk.operator_reference}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </Section>
        </>
      )}
    </div>
  );
}

/* ── Sub-components ── */
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

/* ── Styles ── */
const pageStyle  = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle  = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted      = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const rowCard    = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' };
const goldBtn    = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const outlineBtn = { padding: '0.5rem 1.1rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' };
const badge      = { display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' };