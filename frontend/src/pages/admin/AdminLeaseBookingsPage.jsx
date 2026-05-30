// src/pages/admin/AdminLeaseBookingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_META = {
  inquiry:       { label: 'Inquiry',          color: '#6b7280', bg: '#f3f4f6' },
  rfq_sent:      { label: 'RFQ Sent',         color: '#7c3aed', bg: '#ede9fe' },
  negotiating:   { label: 'Negotiating',      color: '#d97706', bg: '#fef3c7' },
  quoted:        { label: 'Quoted',           color: '#b45309', bg: '#fef9c3' },
  contract_sent: { label: 'Contract Sent',    color: '#0891b2', bg: '#cffafe' },
  confirmed:     { label: 'Confirmed',        color: '#059669', bg: '#d1fae5' },
  active:        { label: 'Active',           color: '#16a34a', bg: '#dcfce7' },
  completed:     { label: 'Completed',        color: '#2563eb', bg: '#dbeafe' },
  terminated:    { label: 'Terminated',       color: '#ea580c', bg: '#ffedd5' },
  cancelled:     { label: 'Cancelled',        color: '#dc2626', bg: '#fee2e2' },
};

const ASSET_META = {
  aircraft: { label: 'Aircraft', icon: '✈' },
  yacht:    { label: 'Yacht',    icon: '⛵' },
};

const DURATION_LABELS = {
  monthly: 'Monthly', quarterly: 'Quarterly',
  annual: 'Annual', multi_year: 'Multi-Year',
};

const STATUS_OPTIONS = ['inquiry','rfq_sent','negotiating','quoted','contract_sent','confirmed','active','completed','terminated','cancelled'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const str8 = s => s ? String(s).slice(0, 8).toUpperCase() : '—';
const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + '…' : (s || '—');

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

function AssetBadge({ assetType }) {
  const m = ASSET_META[assetType] || { label: assetType, icon: '📦' };
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
      {m.icon} {m.label}
    </span>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total Leases',    value: stats.totals?.total_count ?? 0,                   accent: '#8b5cf6' },
    { label: 'Total Value',     value: fmt(stats.totals?.total_lease_value_usd),          accent: '#10b981' },
    { label: 'NJH Commission',  value: fmt(stats.totals?.total_commission_usd),           accent: '#0ea5e9' },
    { label: 'Operator Cost',   value: fmt(stats.totals?.total_operator_cost_usd),        accent: '#f59e0b' },
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

// ── Price / Financials Modal ──────────────────────────────────────────────────
function PriceModal({ booking, onClose, onSaved }) {
  const [form, setForm] = useState({
    monthly_rate_usd:      booking?.monthly_rate_usd      || '',
    total_lease_value_usd: booking?.total_lease_value_usd || '',
    security_deposit_usd:  booking?.security_deposit_usd  || '',
    operator_cost_usd:     booking?.operator_cost_usd     || '',
    commission_pct:        booking?.commission_pct        || '10',
    status:                booking?.status                || '',
    send_email:            true,
    email_message:         '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const save = async () => {
    setSaving(true); setErr('');
    try {
      await adminAPI.setLeasePrice(booking.id, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Financials — ${str8(booking.reference)}`} onClose={onClose} width={540}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Monthly Rate (USD)"     value={form.monthly_rate_usd}      onChange={v => setForm(p => ({ ...p, monthly_rate_usd: v }))}      type="number" />
          <Field label="Total Lease Value (USD)" value={form.total_lease_value_usd} onChange={v => setForm(p => ({ ...p, total_lease_value_usd: v }))} type="number" />
          <Field label="Security Deposit (USD)" value={form.security_deposit_usd}  onChange={v => setForm(p => ({ ...p, security_deposit_usd: v }))}  type="number" />
          <Field label="Operator Cost (USD)"    value={form.operator_cost_usd}     onChange={v => setForm(p => ({ ...p, operator_cost_usd: v }))}     type="number" />
          <Field label="Commission %"           value={form.commission_pct}        onChange={v => setForm(p => ({ ...p, commission_pct: v }))}        type="number" />
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
        <ModalFooter onClose={onClose} onSave={save} saving={saving} saveLabel="Save Financials" />
      </ModalBox>
    </Overlay>
  );
}

// ── Contract Modal ────────────────────────────────────────────────────────────
function ContractModal({ booking, onClose, onSaved }) {
  const [form, setForm] = useState({
    contract_reference: booking?.contract_reference || '',
    contract_url:       booking?.contract_url       || '',
    signed_at:          booking?.signed_at ? booking.signed_at.slice(0, 16) : '',
    signed_by:          booking?.signed_by          || '',
    status:             '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const save = async () => {
    setSaving(true); setErr('');
    try {
      await adminAPI.signLeaseContract(booking.id, form);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Contract — ${str8(booking.reference)}`} onClose={onClose} width={500}>
        <Field label="Contract Reference No." value={form.contract_reference} onChange={v => setForm(p => ({ ...p, contract_reference: v }))} placeholder="e.g. NJH-LEASE-2026-001" />
        <div style={{ marginTop: 14 }}>
          <Field label="Signed Lease Document URL" value={form.contract_url} onChange={v => setForm(p => ({ ...p, contract_url: v }))} placeholder="https://…" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <Field label="Signed At" value={form.signed_at} onChange={v => setForm(p => ({ ...p, signed_at: v }))} type="datetime-local" />
          <Field label="Signed By" value={form.signed_by} onChange={v => setForm(p => ({ ...p, signed_by: v }))} placeholder="Signatory full name" />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Advance to Status</label>
          <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="">— auto (confirmed) —</option>
            <option value="contract_sent">Contract Sent</option>
            <option value="confirmed">Confirmed / Signed</option>
          </select>
        </div>
        {err && <div style={errStyle}>{err}</div>}
        <ModalFooter onClose={onClose} onSave={save} saving={saving} saveLabel="Record Signing" />
      </ModalBox>
    </Overlay>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ booking, onClose, onOpenPrice, onOpenContract }) {
  if (!booking) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ width: 540, background: '#fff', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Lease Booking</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 2 }}>{str8(booking.reference)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={booking.status} />
            <button onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {/* Asset */}
          <Section title="Asset">
            <Row label="Type"          value={<AssetBadge assetType={booking.asset_type} />} />
            <Row label="Asset"         value={booking.asset_label || '—'} bold />
            <Row label="Operator"      value={booking.operator_name || '—'} />
            <Row label="Base Location" value={booking.base_location || '—'} />
          </Section>

          {/* Lease Terms */}
          <Section title="Lease Terms">
            <Row label="Duration"           value={DURATION_LABELS[booking.lease_duration] || booking.lease_duration} />
            <Row label="Start Date"         value={fmtDate(booking.lease_start_date)} />
            <Row label="End Date"           value={fmtDate(booking.lease_end_date)} />
            <Row label="Billing"            value={booking.billing_frequency_display || booking.billing_frequency} />
            <Row label="Crew Included"      value={booking.crew_included ? 'Yes' : 'No'} />
            <Row label="Maintenance Incl."  value={booking.maintenance_included ? 'Yes' : 'No'} />
            <Row label="Insurance by Lessee" value={booking.insurance_by_lessee ? 'Yes' : 'No'} />
            {booking.max_hours_per_month  && <Row label="Max Hours/Month"  value={`${booking.max_hours_per_month} hrs`} />}
            {booking.max_days_per_month   && <Row label="Max Days/Month"   value={`${booking.max_days_per_month} days`} />}
            {booking.termination_notice_days && <Row label="Notice Period" value={`${booking.termination_notice_days} days`} />}
          </Section>

          {/* Client */}
          <Section title="Client">
            <Row label="Name"    value={booking.guest_name} />
            <Row label="Email"   value={booking.guest_email} />
            <Row label="Phone"   value={booking.guest_phone || '—'} />
            <Row label="Company" value={booking.company || '—'} />
          </Section>

          {/* Financials */}
          <Section title="Financials">
            <Row label="Monthly Rate"       value={fmt(booking.monthly_rate_usd)} />
            <Row label="Total Lease Value"  value={fmt(booking.total_lease_value_usd)} bold />
            <Row label="Security Deposit"   value={fmt(booking.security_deposit_usd)} />
            <Row label="Operator Cost"      value={fmt(booking.operator_cost_usd)} />
            <Row label="Commission"         value={`${booking.commission_pct}% = ${fmt(booking.commission_usd)}`} />
            <Row label="NJH Net Revenue"    value={fmt(booking.net_revenue_usd)} />
            {booking.early_termination_fee_usd && <Row label="Early Termination Fee" value={fmt(booking.early_termination_fee_usd)} />}
            <Row label="Payment Status"     value={booking.payment_status} />
          </Section>

          {/* Contract */}
          <Section title="Contract">
            <Row label="Contract Ref" value={booking.contract_reference || '—'} />
            <Row label="Signed At"    value={fmtDateTime(booking.signed_at)} />
            <Row label="Signed By"    value={booking.signed_by || '—'} />
            {booking.contract_url && (
              <Row label="Document" value={<a href={booking.contract_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>View Contract</a>} />
            )}
          </Section>

          {booking.additional_notes && (
            <Section title="Notes">
              <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{booking.additional_notes}</p>
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
          <button style={btnPrimary}    onClick={onOpenPrice}>Set Financials</button>
          <button style={btnSecondary}  onClick={onOpenContract}>Record Contract</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminLeaseBookingsPage() {
  const [bookings, setBookings]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState('');

  // Filters
  const [search, setSearch]         = useState('');
  const [filterStatus, setStatus]   = useState('');
  const [filterAsset, setAsset]     = useState('');
  const [filterDuration, setDuration] = useState('');

  // Modals & drawer
  const [selected, setSelected]     = useState(null);
  const [priceTarget, setPrice]     = useState(null);
  const [contractTarget, setContract] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const params = {};
      if (filterStatus)   params.status     = filterStatus;
      if (filterAsset)    params.asset_type = filterAsset;
      if (filterDuration) params.lease_duration = filterDuration;
      if (search)         params.search     = search;
      const [bRes, sRes] = await Promise.all([
        adminAPI.leaseBookings(params),
        adminAPI.leaseBookingStats(),
      ]);
      setBookings(bRes.data.results || bRes.data);
      setStats(sRes.data);
    } catch (e) {
      setErr('Failed to load lease bookings');
    } finally { setLoading(false); }
  }, [filterStatus, filterAsset, filterDuration, search]);

  useEffect(() => { load(); }, [load]);

  const afterSave = () => { setPrice(null); setContract(null); setSelected(null); load(); };

  const openDetail = async id => {
    try {
      const r = await adminAPI.getLeaseBooking(id);
      setSelected(r.data);
    } catch { setErr('Could not load lease booking detail'); }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Lease Bookings
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Aircraft &amp; yacht lease agreements — financials, contracts &amp; lifecycle
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 220px', margin: 0 }}
          placeholder="Search by name, company, email, contract ref…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inputStyle, width: 170, margin: 0 }} value={filterStatus} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 130, margin: 0 }} value={filterAsset} onChange={e => setAsset(e.target.value)}>
          <option value="">All assets</option>
          <option value="aircraft">✈ Aircraft</option>
          <option value="yacht">⛵ Yacht</option>
        </select>
        <select style={{ ...inputStyle, width: 140, margin: 0 }} value={filterDuration} onChange={e => setDuration(e.target.value)}>
          <option value="">All durations</option>
          {Object.entries(DURATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button style={btnSecondary} onClick={load}>Refresh</button>
      </div>

      {err && <div style={{ ...errStyle, marginBottom: 16 }}>{err}</div>}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No lease bookings found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Ref', 'Client / Company', 'Asset', 'Duration', 'Lease Start', 'Monthly Rate', 'Total Value', 'Operator', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id}
                  style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                  onClick={() => openDetail(b.id)}
                >
                  <td style={td}><code style={{ fontSize: 11, color: '#6b7280' }}>{str8(b.reference)}</code></td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{b.guest_name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.company || b.guest_email}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500, color: '#374151' }}>
                      {ASSET_META[b.asset_type]?.icon} {truncate(b.asset_label, 22)}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{ASSET_META[b.asset_type]?.label}</div>
                  </td>
                  <td style={td}><span style={{ fontSize: 12, color: '#374151' }}>{DURATION_LABELS[b.lease_duration] || b.lease_duration}</span></td>
                  <td style={td}><span style={{ fontSize: 12 }}>{fmtDate(b.lease_start_date)}</span></td>
                  <td style={td}><span style={{ fontWeight: 500, color: '#374151' }}>{fmt(b.monthly_rate_usd)}</span></td>
                  <td style={td}><span style={{ fontWeight: 700, color: '#111827' }}>{fmt(b.total_lease_value_usd)}</span></td>
                  <td style={td}><span style={{ color: '#374151' }}>{b.operator_name || <span style={{ color: '#d1d5db' }}>Unassigned</span>}</span></td>
                  <td style={td}><StatusBadge status={b.status} /></td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btnXS} onClick={() => { openDetail(b.id).then(() => setPrice(b)); }}>Financials</button>
                      <button style={{ ...btnXS, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }} onClick={() => setContract(b)}>Contract</button>
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
          onOpenContract={() => setContract(selected)}
        />
      )}

      {/* Price modal */}
      {priceTarget && (
        <PriceModal booking={priceTarget} onClose={() => setPrice(null)} onSaved={afterSave} />
      )}

      {/* Contract modal */}
      {contractTarget && (
        <ContractModal booking={contractTarget} onClose={() => setContract(null)} onSaved={afterSave} />
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
const td           = { padding: '12px 14px', verticalAlign: 'middle' };
const labelStyle   = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle   = { width: '100%', padding: '8px 11px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none' };
const errStyle     = { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13 };
const btnPrimary   = { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnSecondary = { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const btnGhost     = { background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' };
const btnXS        = { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' };