// src/pages/admin/AdminGroupCharterInquiryPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['pending', 'reviewing', 'quoted', 'confirmed', 'cancelled']

const STATUS_META = {
  pending:   { label: 'Pending',   color: '#f59e0b', icon: 'bi-hourglass-split' },
  reviewing: { label: 'Reviewing', color: '#3b82f6', icon: 'bi-eye' },
  quoted:    { label: 'Quoted',    color: '#8b5cf6', icon: 'bi-tag' },
  confirmed: { label: 'Confirmed', color: '#22c55e', icon: 'bi-check-circle' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'bi-x-circle' },
}

const GROUP_TYPE_LABELS = {
  corporate:    'Corporate & Business',
  sports_team:  'Sports Team',
  entertainment:'Entertainment / Film',
  incentive:    'Incentive Group',
  wedding:      'Wedding Party',
  government:   'Government & Diplomatic',
  other:        'Other',
}

const NJH = {
  name:    'Nairobi Jet House',
  phone:   '+254 724 878 136',
  email:   'nairobijethouse@gmail.com',
  website: 'www.nairobijethouse.com',
  address: 'JKIA Executive Terminal, Airport North Road, Nairobi, Kenya',
}

// ── Helper Components ─────────────────────────────────────────────────────────
function Badge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: '#64748b', icon: 'bi-circle' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.2rem 0.65rem',
      background: `${meta.color}12`,
      color: meta.color,
      border: `1px solid ${meta.color}30`,
      borderRadius: '4px',
      fontSize: '0.7rem', fontWeight: 600,
    }}>
      <i className={`bi ${meta.icon}`} style={{ fontSize: '0.65rem' }} />
      {meta.label}
    </span>
  )
}

function GroupTypeBadge({ type }) {
  const icons = {
    corporate: 'bi-briefcase', sports_team: 'bi-trophy', entertainment: 'bi-camera-video',
    incentive: 'bi-gift', wedding: 'bi-heart', government: 'bi-bank2', other: 'bi-people',
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '0.2rem 0.6rem',
      background: 'rgba(10,37,64,0.07)',
      color: '#0a2540',
      borderRadius: '4px',
      fontSize: '0.72rem', fontWeight: 600,
    }}>
      <i className={`bi ${icons[type] || 'bi-people'}`} style={{ fontSize: '0.7rem' }} />
      {GROUP_TYPE_LABELS[type] || type}
    </span>
  )
}

function Spinner({ size = 16, color = '#ffffff' }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}40`,
      borderTopColor: color,
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  const maxW = size === 'xl' ? '860px' : size === 'lg' ? '640px' : size === 'md' ? '480px' : '360px'
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,37,64,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: '12px',
        width: '100%', maxWidth: maxW, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', borderBottom: '1px solid #e8edf2',
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0a2540', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#6b7c93', padding: '0.25rem' }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 1fr',
      gap: '0.5rem', padding: '0.55rem 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{ fontWeight: 600, color: '#5a6e8a', fontSize: '0.78rem', paddingTop: '1px' }}>{label}</div>
      <div style={{ color: '#1a2a3e', fontSize: '0.85rem' }}>{value || '—'}</div>
    </div>
  )
}

// ── Input helpers ─────────────────────────────────────────────────────────────
const inp = (extra = {}) => ({
  style: {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1.5px solid #e8edf2', borderRadius: '6px',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s', ...extra,
  },
  onFocus: e => { e.currentTarget.style.borderColor = '#0a2540' },
  onBlur:  e => { e.currentTarget.style.borderColor = '#e8edf2' },
})

const lbl = (text, required) => (
  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0a2540', marginBottom: '0.25rem' }}>
    {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </label>
)

// ══ Main Component ════════════════════════════════════════════════════════════
export default function AdminGroupCharterInquiryPage() {
  const [inquiries, setInquiries]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [groupFilter, setGroupFilter]   = useState('')
  const [selected, setSelected]         = useState(null)
  const [modal, setModal]               = useState(null) // 'detail' | 'reply' | 'status'

  const [replyForm, setReplyForm]   = useState({ subject: '', message: '', new_status: '', quoted_price: '' })
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyErr, setReplyErr]     = useState('')
  const [replySent, setReplySent]   = useState(false)

  const [statusForm, setStatusForm] = useState({ status: '' })
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusErr, setStatusErr]   = useState('')

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)       params.search     = search
      if (statusFilter) params.status     = statusFilter
      if (groupFilter)  params.group_type = groupFilter
      const res  = await adminAPI.groups(params)
      const data = res?.data || res
      setInquiries(data.results || data || [])
    } catch (err) {
      console.error('Failed to load group charters:', err)
      setInquiries([])
    } finally { setLoading(false) }
  }, [search, statusFilter, groupFilter])

  useEffect(() => { load() }, [load])

  // ── Open Detail ───────────────────────────────────────────────────────────
  const openDetail = (inq) => { setSelected(inq); setModal('detail') }

  // ── Open Reply ────────────────────────────────────────────────────────────
  const openReply = (inq) => {
    setSelected(inq)
    const ref = String(inq.reference || inq.id).slice(0, 8).toUpperCase()
    setReplyForm({
      subject: `Group Charter Proposal — Ref ${ref} | Nairobi Jet House`,
      message: `Dear ${inq.contact_name || 'Valued Client'},\n\nThank you for your group charter inquiry with Nairobi Jet House.\n\nWe have reviewed your request for a group of ${inq.group_size || '—'} passengers travelling from ${inq.origin_description || '—'} to ${inq.destination_description || '—'} on ${inq.departure_date || 'TBA'}.\n\nWe are pleased to provide the following proposal:\n\n[Add your proposal details here]\n\nFor any questions, please don't hesitate to contact us:\n📞 ${NJH.phone}\n✉️ ${NJH.email}\n🌐 ${NJH.website}\n\nWarm regards,\nNairobi Jet House Group Charter Team`,
      new_status:   'quoted',
      quoted_price: '',
    })
    setReplyErr(''); setReplySent(false)
    setModal('reply')
  }

  // ── Submit Reply ──────────────────────────────────────────────────────────
  const submitReply = async (e) => {
    e.preventDefault()
    setReplyLoading(true); setReplyErr('')
    try {
      await adminAPI.sendEmail({
        to_email:     selected.email,
        to_name:      selected.contact_name || '',
        subject:      replyForm.subject,
        body:         replyForm.message,
        inquiry_type: 'group_charter',
        related_id:   selected.id,
      })
      // Update status if changed
      if (replyForm.new_status && replyForm.new_status !== selected.status) {
        await adminAPI.updateGroupStatus?.(selected.id, { status: replyForm.new_status })
          .catch(() => {}) // silent — endpoint may not exist yet
      }
      setReplySent(true)
      await load()
    } catch (err) {
      const d = err?.response?.data
      setReplyErr(d?.detail || d?.message || JSON.stringify(d) || 'Failed to send reply')
    } finally { setReplyLoading(false) }
  }

  // ── Open Status ───────────────────────────────────────────────────────────
  const openStatus = (inq) => {
    setSelected(inq)
    setStatusForm({ status: inq.status || 'pending' })
    setStatusErr('')
    setModal('status')
  }

  // ── Submit Status ─────────────────────────────────────────────────────────
  const submitStatus = async (e) => {
    e.preventDefault()
    setStatusLoading(true); setStatusErr('')
    try {
      // PATCH /admin/group-charters/:id/  or a custom action
      await adminAPI.updateGroupStatus?.(selected.id, { status: statusForm.status })
        .catch(async () => {
          // Fallback: try generic PATCH via groups endpoint
          throw new Error('Status update endpoint not available')
        })
      await load(); setModal(null)
    } catch (err) {
      const d = err?.response?.data
      setStatusErr(d?.detail || d?.message || err?.message || 'Failed to update status')
    } finally { setStatusLoading(false) }
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    total:     inquiries.length,
    pending:   inquiries.filter(i => i.status === 'pending').length,
    confirmed: inquiries.filter(i => i.status === 'confirmed').length,
    totalPax:  inquiries.reduce((s, i) => s + (Number(i.group_size) || 0), 0),
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1rem', maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0a2540', marginBottom: '0.25rem', letterSpacing: '-0.3px' }}>
            Group Charter Inquiries
          </h2>
          <p style={{ color: '#6b7c93', fontSize: '0.875rem' }}>
            Review, reply and manage all group charter requests
          </p>
        </div>
        <button
          onClick={load}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', color: '#0a2540', border: '1.5px solid #0a2540', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0a2540'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0a2540' }}
        >
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Inquiries', value: stats.total,     icon: 'bi-inbox',         color: '#0a2540' },
          { label: 'Pending Review',  value: stats.pending,   icon: 'bi-hourglass-split',color: '#f59e0b' },
          { label: 'Confirmed',       value: stats.confirmed, icon: 'bi-check-circle',   color: '#22c55e' },
          { label: 'Total Pax',       value: stats.totalPax,  icon: 'bi-people-fill',    color: '#8b5cf6' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6b7c93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a2540', lineHeight: 1 }}>{value}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '8px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`bi ${icon}`} style={{ color, fontSize: '1.1rem' }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7c93', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7c93', fontSize: '0.85rem' }} />
            <input
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.1rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              placeholder="Name, email, origin…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#0a2540'}
              onBlur={e => e.currentTarget.style.borderColor = '#e8edf2'}
            />
          </div>
        </div>

        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7c93', marginBottom: '0.25rem' }}>Status</label>
          <select
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#fff', outline: 'none', cursor: 'pointer' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7c93', marginBottom: '0.25rem' }}>Group Type</label>
          <select
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#fff', outline: 'none', cursor: 'pointer' }}
            value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(GROUP_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {(search || statusFilter || groupFilter) && (
          <button
            style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#6b7c93', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => { setSearch(''); setStatusFilter(''); setGroupFilter('') }}
          >
            <i className="bi bi-x-lg" /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: 40, height: 40, margin: '0 auto 1rem', border: '3px solid #e8edf2', borderTopColor: '#0a2540', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7c93' }}>Loading inquiries…</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-people" style={{ fontSize: '3rem', color: '#cbd5e1', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7c93' }}>No group charter inquiries found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>
                  {['Reference', 'Contact', 'Group', 'Route', 'Date', 'Pax', 'Add-ons', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem',
                      textAlign: ['Pax', 'Status', 'Actions', 'Add-ons'].includes(h) ? 'center' : 'left',
                      fontWeight: 600, color: '#0a2540',
                      whiteSpace: 'nowrap', fontSize: '0.75rem', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr
                    key={inq.id}
                    style={{ borderBottom: '1px solid #e8edf2', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Reference */}
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#2a3a4e' }}>
                      {String(inq.reference || inq.id).slice(0, 8).toUpperCase()}…
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: '#0a2540' }}>{inq.contact_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7c93' }}>{inq.email || '—'}</div>
                      {inq.company && (
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
                          <i className="bi bi-building" style={{ marginRight: 3 }} />{inq.company}
                        </div>
                      )}
                    </td>

                    {/* Group Type */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <GroupTypeBadge type={inq.group_type} />
                    </td>

                    {/* Route */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0a2540' }}>
                        {inq.origin_description || '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7c93', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-arrow-down" style={{ fontSize: '0.6rem' }} />
                        {inq.destination_description || '—'}
                      </div>
                    </td>

                    {/* Departure Date */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#2a3a4e' }}>
                      <div>{inq.departure_date || '—'}</div>
                      {inq.is_round_trip && inq.return_date && (
                        <div style={{ fontSize: '0.68rem', color: '#6b7c93' }}>
                          <i className="bi bi-arrow-return-left" style={{ marginRight: 3 }} />{inq.return_date}
                        </div>
                      )}
                      {inq.is_round_trip && (
                        <div style={{ fontSize: '0.65rem', color: '#8b5cf6', marginTop: 2, fontWeight: 600 }}>
                          Round Trip
                        </div>
                      )}
                    </td>

                    {/* Pax */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>{inq.group_size || 1}</span>
                      <div style={{ fontSize: '0.65rem', color: '#6b7c93' }}>pax</div>
                    </td>

                    {/* Add-ons */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {inq.catering_required && (
                          <span title="Catering" style={{ fontSize: '0.85rem', color: '#c8a245' }}>
                            <i className="bi bi-cup-hot" />
                          </span>
                        )}
                        {inq.ground_transport_required && (
                          <span title="Ground Transport" style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                            <i className="bi bi-car-front" />
                          </span>
                        )}
                        {!inq.catering_required && !inq.ground_transport_required && (
                          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>—</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge status={inq.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {/* View Details */}
                        <button
                          title="View details"
                          style={{ padding: '0.3rem 0.6rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openDetail(inq)}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        {/* Reply / Propose */}
                        <button
                          title="Reply / Send proposal"
                          style={{ padding: '0.3rem 0.6rem', background: '#c8a245', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openReply(inq)}
                        >
                          <i className="bi bi-envelope-paper" />
                        </button>
                        {/* Update Status */}
                        <button
                          title="Update status"
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: '#0a2540', border: '1px solid #0a2540', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openStatus(inq)}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && inquiries.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7c93', textAlign: 'center' }}>
          Showing {inquiries.length} inquiry{inquiries.length !== 1 ? 's' : ''}
          {(search || statusFilter || groupFilter) && ' with current filters'}
        </div>
      )}

      {/* ══ DETAIL MODAL ══ */}
      <Modal
        open={modal === 'detail'}
        onClose={() => setModal(null)}
        size="lg"
        title={<><i className="bi bi-people" style={{ color: '#c8a245' }} /> Group Charter — {selected?.contact_name}</>}
      >
        {selected && (
          <div>
            {/* Status + Group Type badges */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <Badge status={selected.status} />
              <GroupTypeBadge type={selected.group_type} />
              {selected.is_round_trip && (
                <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                  <i className="bi bi-arrow-left-right" style={{ marginRight: 4 }} />Round Trip
                </span>
              )}
            </div>

            {/* Contact */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              <i className="bi bi-person" style={{ marginRight: 4 }} />Contact Information
            </div>
            <Field label="Full Name"    value={selected.contact_name} />
            <Field label="Email"        value={selected.email} />
            <Field label="Phone"        value={selected.phone} />
            <Field label="Company"      value={selected.company} />

            {/* Group */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.25rem 0 0.5rem' }}>
              <i className="bi bi-people" style={{ marginRight: 4 }} />Group Details
            </div>
            <Field label="Group Type"   value={GROUP_TYPE_LABELS[selected.group_type] || selected.group_type} />
            <Field label="Group Size"   value={`${selected.group_size} passengers`} />
            <Field label="Aircraft Pref" value={selected.preferred_aircraft_category || 'No preference'} />
            <Field label="Budget Range" value={selected.budget_range || 'Not specified'} />

            {/* Route */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.25rem 0 0.5rem' }}>
              <i className="bi bi-airplane" style={{ marginRight: 4 }} />Flight Details
            </div>
            <Field label="From"         value={selected.origin_description} />
            <Field label="To"           value={selected.destination_description} />
            <Field label="Departure"    value={selected.departure_date} />
            <Field label="Return"       value={selected.return_date || (selected.is_round_trip ? 'TBC' : 'One Way')} />

            {/* Add-ons */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.25rem 0 0.5rem' }}>
              <i className="bi bi-stars" style={{ marginRight: 4 }} />Add-on Services
            </div>
            <Field label="Catering"       value={selected.catering_required ? '✓ Requested' : 'Not required'} />
            <Field label="Ground Transport" value={selected.ground_transport_required ? '✓ Requested' : 'Not required'} />

            {/* Notes */}
            {selected.additional_notes && (
              <>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.25rem 0 0.5rem' }}>
                  <i className="bi bi-chat-text" style={{ marginRight: 4 }} />Additional Notes
                </div>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e8edf2', fontSize: '0.85rem', color: '#2a3a4e', lineHeight: 1.6 }}>
                  {selected.additional_notes}
                </div>
              </>
            )}

            {/* Meta */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e8edf2', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span><i className="bi bi-clock" style={{ marginRight: 4 }} />Submitted {new Date(selected.created_at).toLocaleString()}</span>
              <span style={{ fontFamily: 'monospace' }}>Ref: {String(selected.reference || selected.id).slice(0, 8).toUpperCase()}</span>
            </div>

            {/* Footer actions */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setModal(null); openStatus(selected) }}
                style={{ padding: '0.6rem 1rem', background: 'transparent', color: '#0a2540', border: '1.5px solid #0a2540', borderRadius: '6px', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className="bi bi-pencil" /> Update Status
              </button>
              <button
                onClick={() => { setModal(null); openReply(selected) }}
                style={{ padding: '0.6rem 1.2rem', background: '#c8a245', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className="bi bi-envelope-paper" /> Send Proposal
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ REPLY MODAL ══ */}
      <Modal
        open={modal === 'reply'}
        onClose={() => setModal(null)}
        size="xl"
        title={<><i className="bi bi-envelope-paper" style={{ color: '#c8a245' }} /> Send Proposal — {selected?.contact_name}</>}
      >
        {selected && (
          <div>
            {/* Context strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e8edf2', borderRadius: '8px', marginBottom: '1.25rem' }}>
              {[
                ['Group', `${selected.group_size} pax — ${GROUP_TYPE_LABELS[selected.group_type] || selected.group_type}`],
                ['Route', `${selected.origin_description || '—'} → ${selected.destination_description || '—'}`],
                ['Date',  selected.departure_date || 'TBA'],
                ['Email', selected.email || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '0.68rem', color: '#6b7c93', marginBottom: '2px' }}>{k}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0a2540' }}>{v}</div>
                </div>
              ))}
            </div>

            {replySent && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', color: '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-check-circle-fill" /> Proposal sent successfully to <strong>{selected.email}</strong>
              </div>
            )}
            {replyErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle-fill" /> {replyErr}
              </div>
            )}

            <form onSubmit={submitReply}>
              {/* Subject */}
              <div style={{ marginBottom: '1rem' }}>
                {lbl('Email Subject', true)}
                <input
                  {...inp()}
                  value={replyForm.subject}
                  onChange={e => setReplyForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1rem' }}>
                {lbl('Message / Proposal', true)}
                <textarea
                  rows={12}
                  {...inp({ resize: 'vertical' })}
                  value={replyForm.message}
                  onChange={e => setReplyForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>

              {/* Status + Quoted Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  {lbl('Update Inquiry Status')}
                  <select
                    {...inp()}
                    value={replyForm.new_status}
                    onChange={e => setReplyForm(f => ({ ...f, new_status: e.target.value }))}
                  >
                    <option value="">Keep current ({STATUS_META[selected.status]?.label || selected.status})</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  {lbl('Quoted Price (USD)')}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 45000"
                    {...inp()}
                    value={replyForm.quoted_price}
                    onChange={e => setReplyForm(f => ({ ...f, quoted_price: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  style={{ padding: '0.6rem 1.3rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {replyLoading ? <><Spinner /> Sending…</> : <><i className="bi bi-send-fill" /> Send Proposal</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* ══ STATUS MODAL ══ */}
      <Modal
        open={modal === 'status'}
        onClose={() => setModal(null)}
        size="md"
        title={<><i className="bi bi-pencil-square" /> Update Status — {selected?.contact_name}</>}
      >
        {selected && (
          <form onSubmit={submitStatus}>
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e8edf2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#2a3a4e' }}>
              <span>Current status</span>
              <Badge status={selected.status} />
            </div>

            {statusErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle-fill" /> {statusErr}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              {lbl('New Status', true)}
              <select {...inp()} value={statusForm.status} onChange={e => setStatusForm({ status: e.target.value })} required>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                ))}
              </select>
            </div>

            {/* Preview next badge */}
            {statusForm.status && statusForm.status !== selected.status && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#6b7c93' }}>
                <Badge status={selected.status} />
                <i className="bi bi-arrow-right" />
                <Badge status={statusForm.status} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(null)}
                style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={statusLoading}
                style={{ padding: '0.6rem 1.2rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {statusLoading ? <><Spinner /> Saving…</> : <><i className="bi bi-check-lg" /> Save Status</>}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}