import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

const STATUS_COLORS = {
  submitted:   '#ffb74d',
  shortlisted: '#64b5f6',
  accepted:    '#81c784',
  rejected:    '#ef9a9a',
  expired:     '#888',
};

export function OperatorRFQPage() {
  const [bids, setBids]           = useState([]);
  const [myAircraft, setMyAircraft] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeBid, setActiveBid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({
    operator_price_usd: '', estimated_hours: '',
    positioning_cost: 0, catering_cost: 0, overnight_cost: 0,
    notes: '', aircraft: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      operatorAPI.rfqBids(),
      operatorAPI.myAircraft({ status: 'available', is_approved: true }),
    ])
      .then(([b, ac]) => {
        setBids(b.data.results || b.data);
        setMyAircraft(ac.data.results || ac.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openBid = bid => {
    setActiveBid(bid);
    setBidForm(f => ({ ...f, aircraft: myAircraft[0]?.id || '' }));
  };

  const handleSubmitBid = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await operatorAPI.submitBid({
        ...bidForm,
        booking:  activeBid.booking,
        operator: activeBid.operator_id,
      });
      setActiveBid(null);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  const setB = patch => setBidForm(f => ({ ...f, ...patch }));

  const openBids = bids.filter(b => b.status === 'submitted');
  const pastBids = bids.filter(b => b.status !== 'submitted');

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>RFQ Bids</h1>
      <p style={{ ...muted, marginBottom: '1.75rem' }}>
        View Request For Quote invitations from NJH and submit competitive bids for flight bookings.
      </p>

      {loading ? (
        <p style={muted}>Loading...</p>
      ) : (
        <>
          {/* ── Open RFQs ── */}
          <Section title={`Open RFQs (${openBids.length})`}>
            {openBids.length === 0 ? (
              <p style={muted}>No open RFQs at the moment.</p>
            ) : (
              openBids.map(bid => (
                <div key={bid.id} style={rowCard}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#fff' }}>
                      Booking: {String(bid.booking).slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                      Your bid: ${bid.operator_price_usd ? Number(bid.operator_price_usd).toLocaleString() : '—'}{' '}
                      · Status: {bid.status}
                      {bid.valid_until && ` · Valid until ${bid.valid_until.slice(0, 10)}`}
                    </p>
                  </div>
                  <button onClick={() => openBid(bid)} style={goldBtn}>
                    Submit / Update Bid
                  </button>
                </div>
              ))
            )}
          </Section>

          {/* ── Bid Modal ── */}
          {activeBid && (
            <div style={modalOverlay}>
              <div style={modalBox}>
                <h3 style={{ color: 'var(--gold,#C9A84C)', marginBottom: '1.25rem' }}>Submit Bid</h3>
                <form onSubmit={handleSubmitBid}>
                  <div style={grid2}>
                    <div>
                      <label style={lbl}>Assign Aircraft</label>
                      <select value={bidForm.aircraft} onChange={e => setB({ aircraft: e.target.value })} style={inp}>
                        <option value="">Select aircraft</option>
                        {myAircraft.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <F label="Your Price (USD)"       name="operator_price_usd" type="number" value={bidForm.operator_price_usd} onChange={e => setB({ operator_price_usd: e.target.value })} required />
                    <F label="Estimated Hours"        name="estimated_hours"    type="number" value={bidForm.estimated_hours}    onChange={e => setB({ estimated_hours: e.target.value })} />
                    <F label="Positioning Cost (USD)" name="positioning_cost"   type="number" value={bidForm.positioning_cost}   onChange={e => setB({ positioning_cost: e.target.value })} />
                    <F label="Catering Cost (USD)"    name="catering_cost"      type="number" value={bidForm.catering_cost}      onChange={e => setB({ catering_cost: e.target.value })} />
                    <F label="Overnight Cost (USD)"   name="overnight_cost"     type="number" value={bidForm.overnight_cost}     onChange={e => setB({ overnight_cost: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={lbl}>Notes</label>
                    <textarea rows={3} value={bidForm.notes} onChange={e => setB({ notes: e.target.value })} style={{ ...inp, resize: 'vertical' }} placeholder="Any notes for the NJH team..." />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" disabled={submitting} style={goldBtn}>
                      {submitting ? 'Submitting...' : 'Submit Bid'}
                    </button>
                    <button type="button" onClick={() => setActiveBid(null)} style={outlineBtn}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Previous Bids ── */}
          <Section title="Previous Bids">
            {pastBids.length === 0 ? (
              <p style={muted}>No previous bids.</p>
            ) : (
              pastBids.map(bid => (
                <div key={bid.id} style={rowCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                        Booking {String(bid.booking).slice(0, 8).toUpperCase()}
                      </p>
                      <span style={{ ...badge, color: STATUS_COLORS[bid.status], background: `${STATUS_COLORS[bid.status]}22` }}>
                        {bid.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                      Bid: ${Number(bid.operator_price_usd || 0).toLocaleString()} USD
                      {bid.njh_client_price && ` · Client price: $${Number(bid.njh_client_price).toLocaleString()}`}
                    </p>
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

function F({ label, name, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: 'var(--gold,#C9A84C)' }}> *</span>}</label>
      <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} style={inp} />
    </div>
  );
}

/* ── Styles ── */
const pageStyle    = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle    = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted        = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const rowCard      = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' };
const goldBtn      = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const outlineBtn   = { padding: '0.5rem 1.1rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' };
const badge        = { display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' };
const lbl          = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.35rem' };
const inp          = { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const grid2        = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', marginBottom: '1rem' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalBox     = { background: 'var(--navy,#0B1D3A)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' };

export default OperatorRFQPage;