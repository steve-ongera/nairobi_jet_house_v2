// src/pages/admin/AdminCargoBookingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_META = {
  inquiry:    { label: 'Inquiry',     color: '#6b7280', bg: '#f3f4f6' },
  rfq_sent:   { label: 'RFQ Sent',   color: '#7c3aed', bg: '#ede9fe' },
  quoted:     { label: 'Quoted',      color: '#d97706', bg: '#fef3c7' },
  confirmed:  { label: 'Confirmed',   color: '#059669', bg: '#d1fae5' },
  in_transit: { label: 'In Transit',  color: '#2563eb', bg: '#dbeafe' },
  delivered:  { label: 'Delivered',   color: '#0891b2', bg: '#cffafe' },
  completed:  { label: 'Completed',   color: '#16a34a', bg: '#dcfce7' },
  cancelled:  { label: 'Cancelled',   color: '#dc2626', bg: '#fee2e2' },
  disputed:   { label: 'Disputed',    color: '#ea580c', bg: '#ffedd5' },
};

const URGENCY_META = {
  standard: { label: 'Standard',  color: '#6b7280' },
  express:  { label: 'Express',   color: '#d97706' },
  critical: { label: 'Critical',  color: '#dc2626' },
};

const CARGO_TYPE_LABELS = {
  general: 'General', perishables: 'Perishables', pharma: 'Pharma',
  dangerous_goods: 'DG', live_animals: 'Animals', artwork: 'Artwork',
  automotive: 'Automotive', oversized: 'Oversized',
  humanitarian: 'Humanitarian', gold_minerals: 'Gold/Minerals', other: 'Other',
};

const STATUS_OPTIONS = ['inquiry','rfq_sent','quoted','confirmed','in_transit','delivered','completed','cancelled','disputed'];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const m = URGENCY_META[urgency] || { label: urgency, color: '#6b7280' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: m.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {m.label}
    </span>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total Shipments', value: stats.totals?.total_count ?? 0, accent: '#0ea5e9' },
    { label: 'Total Revenue',   value: fmt(stats.totals?.total_revenue_usd), accent: '#10b981' },
    { label: 'NJH Commission',  value: fmt(stats.totals?.total_commission), accent: '#8b5cf6' },
    { label: 'Operator Cost',   value: fmt(stats.totals?.total_cost), accent: '#f59e0b' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
          padding: '18px 20px', borderTop: `3px solid ${c.accent}`,
        }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Price / Quote Modal ───────────────────────────────────────────────────────
function PriceModal({ booking, onClose, onSaved }) {
  const [form, setForm] = useState({
    quoted_price_usd:    booking?.quoted_price_usd  || '',
    operator_cost_usd:   booking?.operator_cost_usd || '',
    commission_pct:      booking?.commission_pct    || '15',
    insurance_premium_usd: booking?.insurance_premium_usd || '',
    customs_fee_usd:     booking?.customs_fee_usd   || '',
    status:              booking?.status            || '',
    send_email:          true,
    email_message:       '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setSaving(true); setErr('');
    try {
      await adminAPI.setCargoPrice(booking.id, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Quote — ${str8(booking.reference)}`} onClose={onClose} width={540}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Quoted Price (USD) *" value={form.quoted_price_usd} onChange={v => setForm(p => ({ ...p, quoted_price_usd: v }))} type="number" />
          <Field label="Operator Cost (USD)"  value={form.operator_cost_usd} onChange={v => setForm(p => ({ ...p, operator_cost_usd: v }))} type="number" />
          <Field label="Commission %"         value={form.commission_pct} onChange={v => setForm(p => ({ ...p, commission_pct: v }))} type="number" />
          <Field label="Insurance Premium"    value={form.insurance_premium_usd} onChange={v => setForm(p => ({ ...p, insurance_premium_usd: v }))} type="number" />
          <Field label="Customs Fee"          value={form.customs_fee_usd} onChange={v => setForm(p => ({ ...p, customs_fee_usd: v }))} type="number" />
          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="">— unchanged —</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.send_email} onChange={e => setForm(p => ({ ...p, send_email: e.target.checked }))} />
            Send quote email to client
          </label>
        </div>
        {form.send_email && (
          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>Custom Email Message (optional)</label>
            <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              value={form.email_message}
              onChange={e => setForm(p => ({ ...p, email_message: e.target.value }))}
              placeholder="Leave blank to use default message…" />
          </div>
        )}
        {err && <div style={errStyle}>{err}</div>}
        <ModalFooter onClose={onClose} onSave={save} saving={saving} saveLabel="Save Quote" />
      </ModalBox>
    </Overlay>
  );
}

// ── Tracking Modal ────────────────────────────────────────────────────────────
function TrackingModal({ booking, onClose, onSaved }) {
  const [form, setForm] = useState({
    airway_bill_number:    booking?.airway_bill_number    || '',
    actual_pickup_at:      booking?.actual_pickup_at      ? booking.actual_pickup_at.slice(0, 16) : '',
    actual_delivery_at:    booking?.actual_delivery_at    ? booking.actual_delivery_at.slice(0, 16) : '',
    proof_of_delivery_url: booking?.proof_of_delivery_url || '',
    status:                booking?.status || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setSaving(true); setErr('');
    try {
      await adminAPI.updateCargoTracking(booking.id, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Tracking — ${str8(booking.reference)}`} onClose={onClose} width={500}>
        <Field label="Airway Bill Number (AWB)" value={form.airway_bill_number} onChange={v => setForm(p => ({ ...p, airway_bill_number: v }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <Field label="Actual Pickup" value={form.actual_pickup_at} onChange={v => setForm(p => ({ ...p, actual_pickup_at: v }))} type="datetime-local" />
          <Field label="Actual Delivery" value={form.actual_delivery_at} onChange={v => setForm(p => ({ ...p, actual_delivery_at: v }))} type="datetime-local" />
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Proof of Delivery URL" value={form.proof_of_delivery_url} onChange={v => setForm(p => ({ ...p, proof_of_delivery_url: v }))} placeholder="https://…" />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Update Status</label>
          <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="">— unchanged —</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
        </div>
        {err && <div style={errStyle}>{err}</div>}
        <ModalFooter onClose={onClose} onSave={save} saving={saving} saveLabel="Update Tracking" />
      </ModalBox>
    </Overlay>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ booking, onClose, onOpenPrice, onOpenTracking, onRefresh }) {
  if (!booking) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end',
    }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{
        width: 520, background: '#fff', overflowY: 'auto',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cargo Booking</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 2 }}>{str8(booking.reference).toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={booking.status} />
            <button onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {/* Route */}
          <Section title="Route">
            <Row label="Origin"      value={booking.origin_description} />
            <Row label="Destination" value={booking.destination_description} />
            <Row label="Pickup Date" value={fmtDate(booking.pickup_date)} />
            <Row label="Urgency"     value={<UrgencyBadge urgency={booking.urgency} />} />
            {booking.estimated_transit_hours && <Row label="Est. Transit" value={`${booking.estimated_transit_hours} hrs`} />}
          </Section>

          {/* Cargo */}
          <Section title="Cargo Details">
            <Row label="Type"        value={CARGO_TYPE_LABELS[booking.cargo_type] || booking.cargo_type} />
            <Row label="Description" value={booking.cargo_description} />
            {booking.weight_kg   && <Row label="Weight"    value={`${booking.weight_kg} kg`} />}
            {booking.volume_m3   && <Row label="Volume"    value={`${booking.volume_m3} m³`} />}
            {booking.piece_count && <Row label="Pieces"    value={booking.piece_count} />}
            {booking.dimensions  && <Row label="Dimensions" value={booking.dimensions} />}
            <Row label="Hazardous"    value={booking.is_hazardous ? '⚠ Yes' : 'No'} />
            <Row label="Temperature Control" value={booking.requires_temperature_control ? `Yes — ${booking.temperature_range || 'range not set'}` : 'No'} />
            <Row label="Insurance"    value={booking.insurance_required ? 'Required' : 'Not required'} />
            <Row label="Customs"      value={booking.customs_assistance_needed ? 'Assistance needed' : 'N/A'} />
          </Section>

          {/* Client */}
          <Section title="Client">
            <Row label="Name"    value={booking.contact_name} />
            <Row label="Email"   value={booking.contact_email} />
            <Row label="Phone"   value={booking.contact_phone || '—'} />
            <Row label="Company" value={booking.company || '—'} />
          </Section>

          {/* Operator */}
          <Section title="Operator Assignment">
            <Row label="Operator" value={booking.operator_name || '—'} />
            <Row label="Aircraft" value={booking.aircraft_name ? `${booking.aircraft_name} (${booking.aircraft_reg})` : '—'} />
          </Section>

          {/* Financials */}
          <Section title="Financials">
            <Row label="Quoted to Client" value={fmt(booking.quoted_price_usd)} bold />
            <Row label="Operator Cost"    value={fmt(booking.operator_cost_usd)} />
            <Row label="Commission"       value={`${booking.commission_pct}% = ${fmt(booking.commission_usd)}`} />
            <Row label="NJH Net Revenue"  value={fmt(booking.net_revenue_usd)} />
            {booking.insurance_premium_usd && <Row label="Insurance Premium" value={fmt(booking.insurance_premium_usd)} />}
            {booking.customs_fee_usd && <Row label="Customs Fee" value={fmt(booking.customs_fee_usd)} />}
            <Row label="Payment Status"   value={booking.payment_status} />
          </Section>

          {/* Tracking */}
          <Section title="Tracking">
            <Row label="AWB Number" value={booking.airway_bill_number || '—'} />
            <Row label="Picked Up"  value={fmtDateTime(booking.actual_pickup_at)} />
            <Row label="Delivered"  value={fmtDateTime(booking.actual_delivery_at)} />
            {booking.proof_of_delivery_url && (
              <Row label="POD" value={<a href={booking.proof_of_delivery_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>View Document</a>} />
            )}
          </Section>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
          <button style={btnPrimary} onClick={onOpenPrice}>Set Price / Quote</button>
          <button style={btnSecondary} onClick={onOpenTracking}>Update Tracking</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCargoBookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [filterStatus, setStatus] = useState('');
  const [filterUrgency, setUrgency] = useState('');

  // Modals
  const [selected, setSelected]   = useState(null);   // drawer
  const [priceTarget, setPrice]   = useState(null);   // price modal
  const [trackTarget, setTrack]   = useState(null);   // tracking modal

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const params = {};
      if (filterStatus)  params.status  = filterStatus;
      if (filterUrgency) params.urgency = filterUrgency;
      if (search)        params.search  = search;
      const [bRes, sRes] = await Promise.all([
        adminAPI.cargoBookings(params),
        adminAPI.cargoBookingStats(),
      ]);
      setBookings(bRes.data.results || bRes.data);
      setStats(sRes.data);
    } catch (e) {
      setErr('Failed to load cargo bookings');
    } finally { setLoading(false); }
  }, [filterStatus, filterUrgency, search]);

  useEffect(() => { load(); }, [load]);

  const afterSave = () => { setPrice(null); setTrack(null); setSelected(null); load(); };

  const openDetail = async id => {
    try {
      const r = await adminAPI.getCargoBooking(id);
      setSelected(r.data);
    } catch { setErr('Could not load booking detail'); }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Air Cargo Bookings
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Confirmed shipments — pricing, operator assignment & tracking
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 220px', margin: 0 }}
          placeholder="Search by name, company, email, AWB…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inputStyle, width: 160, margin: 0 }} value={filterStatus} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 140, margin: 0 }} value={filterUrgency} onChange={e => setUrgency(e.target.value)}>
          <option value="">All urgencies</option>
          {Object.entries(URGENCY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button style={btnSecondary} onClick={load}>Refresh</button>
      </div>

      {err && <div style={{ ...errStyle, marginBottom: 16 }}>{err}</div>}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No cargo bookings found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Ref', 'Client / Company', 'Route', 'Cargo Type', 'Urgency', 'Quoted', 'Operator', 'AWB', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id}
                  style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                  onClick={() => openDetail(b.id)}
                >
                  <td style={td}><code style={{ fontSize: 11, color: '#6b7280' }}>{str8(b.reference)}</code></td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{b.contact_name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.company || b.contact_email}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{truncate(b.origin_description, 18)}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>→ {truncate(b.destination_description, 18)}</div>
                  </td>
                  <td style={td}><span style={{ fontSize: 11, color: '#374151' }}>{CARGO_TYPE_LABELS[b.cargo_type] || b.cargo_type}</span></td>
                  <td style={td}><UrgencyBadge urgency={b.urgency} /></td>
                  <td style={td}><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(b.quoted_price_usd)}</span></td>
                  <td style={td}><span style={{ color: '#374151' }}>{b.operator_name || <span style={{ color: '#d1d5db' }}>Unassigned</span>}</span></td>
                  <td style={td}><code style={{ fontSize: 11 }}>{b.airway_bill_number || '—'}</code></td>
                  <td style={td}><StatusBadge status={b.status} /></td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btnXS} onClick={() => { openDetail(b.id).then(() => setPrice(b)); }}>Quote</button>
                      <button style={{ ...btnXS, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }} onClick={() => setTrack(b)}>Track</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onOpenPrice={() => setPrice(selected)}
          onOpenTracking={() => setTrack(selected)}
          onRefresh={load}
        />
      )}

      {/* Price modal */}
      {priceTarget && (
        <PriceModal booking={priceTarget} onClose={() => setPrice(null)} onSaved={afterSave} />
      )}

      {/* Tracking modal */}
      {trackTarget && (
        <TrackingModal booking={trackTarget} onClose={() => setTrack(null)} onSaved={afterSave} />
      )}
    </div>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f3f4f6' }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', gap: 16 }}>
      <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: bold ? 700 : 400, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}
function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function Overlay({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function ModalBox({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{title}</span>
        <button onClick={onClose} style={{ ...btnGhost, padding: '4px 9px' }}>✕</button>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  );
}
function ModalFooter({ onClose, onSave, saving, saveLabel = 'Save' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
      <button style={btnGhost} onClick={onClose}>Cancel</button>
      <button style={btnPrimary} onClick={onSave} disabled={saving}>{saving ? 'Saving…' : saveLabel}</button>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const str8  = s => s ? String(s).slice(0, 8).toUpperCase() : '—';
const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + '…' : s;
const td    = { padding: '12px 14px', verticalAlign: 'middle' };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '8px 11px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none' };
const errStyle   = { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13 };
const btnPrimary   = { background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnSecondary = { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const btnGhost     = { background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' };
const btnXS        = { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' };