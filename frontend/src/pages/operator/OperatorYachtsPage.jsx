import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

export function OperatorYachtsPage() {
  const [yachts, setYachts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    name: '', yacht_type: 'motor', length_meters: '', guest_capacity: '',
    crew_count: '', daily_rate_usd: '', home_port: '', description: '',
  });

  const load = () => {
    setLoading(true);
    operatorAPI.myYachts()
      .then(r => setYachts(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await operatorAPI.createYacht(form);
      setShowForm(false);
      setForm({ name: '', yacht_type: 'motor', length_meters: '', guest_capacity: '', crew_count: '', daily_rate_usd: '', home_port: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add yacht.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = patch => setForm(f => ({ ...f, ...patch }));

  return (
    <div style={pageStyle}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...pageTitle, marginBottom: 0 }}>My Yachts</h1>
        <button onClick={() => setShowForm(v => !v)} style={goldBtn}>
          {showForm ? 'Cancel' : '+ Add Yacht'}
        </button>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div style={formBox}>
          <h3 style={formTitle}>Add New Yacht</h3>
          {error && <div style={errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <F label="Yacht Name"       name="name"           value={form.name}           onChange={e => set({ name: e.target.value })}           required />
              <div>
                <label style={lbl}>Yacht Type</label>
                <select value={form.yacht_type} onChange={e => set({ yacht_type: e.target.value })} style={inp}>
                  {['sailing','motor','catamaran','gulet','superyacht','mega'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <F label="Length (m)"       name="length_meters"  type="number" value={form.length_meters}  onChange={e => set({ length_meters: e.target.value })}  required />
              <F label="Guest Capacity"   name="guest_capacity"  type="number" value={form.guest_capacity}  onChange={e => set({ guest_capacity: e.target.value })}  required />
              <F label="Crew Count"       name="crew_count"      type="number" value={form.crew_count}      onChange={e => set({ crew_count: e.target.value })}      required />
              <F label="Daily Rate (USD)" name="daily_rate_usd"  type="number" value={form.daily_rate_usd}  onChange={e => set({ daily_rate_usd: e.target.value })}  required />
              <F label="Home Port"        name="home_port"       value={form.home_port}       onChange={e => set({ home_port: e.target.value })}       required />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => set({ description: e.target.value })} style={{ ...inp, resize: 'vertical' }} />
            </div>

            <button type="submit" disabled={submitting} style={goldBtn}>
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      )}

      {/* ── Yacht List ── */}
      {loading ? (
        <p style={muted}>Loading yachts...</p>
      ) : yachts.length === 0 ? (
        <p style={muted}>No yachts listed yet. Click "+ Add Yacht" to list your first yacht.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {yachts.map(y => (
            <div key={y.id} style={rowCard}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{y.name}</p>
                <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                  {y.yacht_type} · {y.length_meters}m · {y.guest_capacity} guests · ${Number(y.daily_rate_usd).toLocaleString()}/day · {y.home_port}
                </p>
                {!y.is_approved && (
                  <p style={{ margin: '0.2rem 0 0', color: '#ffb74d', fontSize: '0.78rem' }}>Pending NJH approval</p>
                )}
              </div>
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
const rowCard   = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' };
const goldBtn   = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const lbl       = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.35rem' };
const inp       = { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const grid2     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', marginBottom: '1rem' };
const errorBox  = { background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem', color: '#ff6b7a', fontSize: '0.875rem' };