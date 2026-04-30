import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

const STATUS_COLOR = {
  available:   '#81c784',
  pending:     '#ffb74d',
  booked:      '#64b5f6',
  maintenance: '#ef9a9a',
  inactive:    '#888',
};

export function OperatorAircraftPage() {
  const [aircraft, setAircraft]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    name: '', model: '', category: 'midsize', registration_number: '',
    passenger_capacity: '', range_km: '', hourly_rate_usd: '',
    year_of_manufacture: '', wifi_available: false, pets_allowed: false, description: '',
  });

  const load = () => {
    setLoading(true);
    operatorAPI.myAircraft()
      .then(r => setAircraft(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await operatorAPI.createAircraft(form);
      setShowForm(false);
      setForm({
        name: '', model: '', category: 'midsize', registration_number: '',
        passenger_capacity: '', range_km: '', hourly_rate_usd: '',
        year_of_manufacture: '', wifi_available: false, pets_allowed: false, description: '',
      });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to add aircraft.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = patch => setForm(f => ({ ...f, ...patch }));

  return (
    <div style={pageStyle}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...pageTitle, marginBottom: 0 }}>My Aircraft</h1>
        <button onClick={() => setShowForm(v => !v)} style={goldBtn}>
          {showForm ? 'Cancel' : '+ Add Aircraft'}
        </button>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div style={formBox}>
          <h3 style={formTitle}>Add New Aircraft</h3>
          {error && <div style={errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <F label="Aircraft Name"       name="name"                value={form.name}                onChange={e => set({ name: e.target.value })}                required />
              <F label="Model"               name="model"               value={form.model}               onChange={e => set({ model: e.target.value })}               required />
              <div>
                <label style={lbl}>Category</label>
                <select value={form.category} onChange={e => set({ category: e.target.value })} style={inp}>
                  {['light','midsize','super_midsize','heavy','ultra_long','vip_airliner','turboprop','helicopter'].map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <F label="Registration Number" name="registration_number" value={form.registration_number} onChange={e => set({ registration_number: e.target.value })} required />
              <F label="Passenger Capacity"  name="passenger_capacity"  type="number" value={form.passenger_capacity}  onChange={e => set({ passenger_capacity: e.target.value })}  required />
              <F label="Range (km)"          name="range_km"            type="number" value={form.range_km}            onChange={e => set({ range_km: e.target.value })}            required />
              <F label="Hourly Rate (USD)"   name="hourly_rate_usd"     type="number" value={form.hourly_rate_usd}     onChange={e => set({ hourly_rate_usd: e.target.value })}     required />
              <F label="Year of Manufacture" name="year_of_manufacture"  type="number" value={form.year_of_manufacture} onChange={e => set({ year_of_manufacture: e.target.value })} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => set({ description: e.target.value })} style={{ ...inp, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
              {[['wifi_available', 'WiFi Available'], ['pets_allowed', 'Pets Allowed']].map(([k, label]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[k]} onChange={e => set({ [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>

            <button type="submit" disabled={submitting} style={goldBtn}>
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      )}

      {/* ── Aircraft List ── */}
      {loading ? (
        <p style={muted}>Loading aircraft...</p>
      ) : aircraft.length === 0 ? (
        <p style={muted}>No aircraft listed yet. Click "+ Add Aircraft" to list your first aircraft.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {aircraft.map(ac => (
            <div key={ac.id} style={rowCard}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{ac.name}</p>
                  <span style={{ ...badge, background: `${STATUS_COLOR[ac.status] || '#888'}22`, color: STATUS_COLOR[ac.status] || '#888', border: `1px solid ${STATUS_COLOR[ac.status] || '#888'}44` }}>
                    {ac.status}
                  </span>
                  {!ac.is_approved && (
                    <span style={{ ...badge, background: '#ffb74d22', color: '#ffb74d', border: '1px solid #ffb74d44' }}>
                      Awaiting Approval
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                  {ac.registration_number} · {ac.category} · {ac.passenger_capacity} pax · ${Number(ac.hourly_rate_usd).toLocaleString()}/hr
                </p>
                {ac.maintenance_due && (
                  <p style={{ margin: '0.25rem 0 0', color: '#ef9a9a', fontSize: '0.8rem' }}>⚠️ Maintenance due</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        Note: All newly listed aircraft require NJH admin approval before they appear publicly.
      </p>
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
const goldBtn   = { padding: '0.5rem 1.1rem', background: 'var(--gold,#C9A84C)', color: 'var(--navy,#0B1D3A)', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' };
const badge     = { display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' };
const lbl       = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.35rem' };
const inp       = { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const grid2     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', marginBottom: '1rem' };
const errorBox  = { background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem', color: '#ff6b7a', fontSize: '0.875rem' };