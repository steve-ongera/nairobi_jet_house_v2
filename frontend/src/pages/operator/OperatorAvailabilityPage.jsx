import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

export function OperatorAvailabilityPage() {
  const [blocks, setBlocks]         = useState([]);
  const [aircraft, setAircraft]     = useState([]);
  const [yachts, setYachts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    asset_type: 'aircraft', aircraft: '', yacht: '',
    block_type: 'maintenance', start_date: '', end_date: '', notes: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      operatorAPI.blocks(),
      operatorAPI.myAircraft({ status: 'available' }),
      operatorAPI.myYachts({ status: 'available' }),
    ])
      .then(([bl, ac, ya]) => {
        setBlocks(bl.data.results || bl.data);
        setAircraft(ac.data.results || ac.data);
        setYachts(ya.data.results || ya.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await operatorAPI.createBlock(form);
      setForm({ asset_type: 'aircraft', aircraft: '', yacht: '', block_type: 'maintenance', start_date: '', end_date: '', notes: '' });
      load();
    } catch {
      alert('Failed to create availability block.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this availability block?')) return;
    await operatorAPI.deleteBlock(id);
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const set = patch => setForm(f => ({ ...f, ...patch }));

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>Availability Management</h1>
      <p style={{ ...muted, marginBottom: '2rem' }}>
        Mark blackout windows — dates when your aircraft or yacht are unavailable for NJH charters.
      </p>

      {/* ── Block Form ── */}
      <div style={formBox}>
        <h3 style={formTitle}>Block Dates</h3>
        <form onSubmit={handleSubmit}>
          <div style={grid2}>
            {/* Asset type */}
            <div>
              <label style={lbl}>Asset Type</label>
              <select value={form.asset_type} onChange={e => set({ asset_type: e.target.value, aircraft: '', yacht: '' })} style={inp}>
                <option value="aircraft">Aircraft</option>
                <option value="yacht">Yacht</option>
              </select>
            </div>

            {/* Asset selector */}
            {form.asset_type === 'aircraft' ? (
              <div>
                <label style={lbl}>Select Aircraft</label>
                <select value={form.aircraft} onChange={e => set({ aircraft: e.target.value })} style={inp} required>
                  <option value="">Choose aircraft</option>
                  {aircraft.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.registration_number})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={lbl}>Select Yacht</label>
                <select value={form.yacht} onChange={e => set({ yacht: e.target.value })} style={inp} required>
                  <option value="">Choose yacht</option>
                  {yachts.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Block type */}
            <div>
              <label style={lbl}>Block Type</label>
              <select value={form.block_type} onChange={e => set({ block_type: e.target.value })} style={inp}>
                <option value="maintenance">Maintenance</option>
                <option value="private_use">Private Use</option>
                <option value="other_booking">Other Booking</option>
                <option value="seasonal_off">Seasonal Off</option>
              </select>
            </div>

            <div /> {/* spacer */}

            <F label="Start Date" name="start_date" type="date" value={form.start_date} onChange={e => set({ start_date: e.target.value })} required />
            <F label="End Date"   name="end_date"   type="date" value={form.end_date}   onChange={e => set({ end_date: e.target.value })}   required />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={lbl}>Notes (optional)</label>
            <input value={form.notes} onChange={e => set({ notes: e.target.value })} style={inp} placeholder="Reason for block..." />
          </div>

          <button type="submit" disabled={submitting} style={goldBtn}>
            {submitting ? 'Adding...' : 'Add Block'}
          </button>
        </form>
      </div>

      {/* ── Existing Blocks ── */}
      <h2 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Current Blocked Periods</h2>
      {loading ? (
        <p style={muted}>Loading...</p>
      ) : blocks.length === 0 ? (
        <p style={muted}>No availability blocks set.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {blocks.map(b => (
            <div key={b.id} style={{ ...rowCard, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                  {b.aircraft_name || b.yacht_name || '—'}{' '}
                  · <span style={{ color: '#ffb74d' }}>{b.block_type_display || b.block_type}</span>
                </p>
                <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  {b.start_date} → {b.end_date}{b.notes && ` · ${b.notes}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                style={{ background: 'none', border: '1px solid rgba(239,154,154,0.4)', color: '#ef9a9a', borderRadius: '4px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Field helper ── */
function F({ label, name, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: 'var(--gold,#C9A84C)' }}> *</span>}</label>
      <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} style={inp} />
    </div>
  );
}

/* ── Styles ── */
const pageStyle = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted     = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const formBox   = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' };
const formTitle = { color: 'var(--gold,#C9A84C)', marginBottom: '1.25rem', fontSize: '1rem' };
const rowCard   = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', gap: '1rem' };
const goldBtn   = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const lbl       = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.35rem' };
const inp       = { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const grid2     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', marginBottom: '1rem' };