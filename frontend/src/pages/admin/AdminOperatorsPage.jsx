import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const TIER_COLOR = { 
  standard: '#64748b', 
  preferred: '#0f2d5e', 
  exclusive: '#c9992e' 
}
const STATUS_COLOR = { 
  pending: '#f59e0b', 
  active: '#22c55e', 
  suspended: '#ef4444', 
  terminated: '#64748b' 
}
const TIER_LABEL = {
  standard: 'Standard',
  preferred: 'Preferred',
  exclusive: 'Exclusive'
}
const STATUS_LABEL = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
  terminated: 'Terminated'
}

function Badge({ label, color }) {
  const bgColor = color === 'gold' ? '#c9992e' : color === 'navy' ? '#0f2d5e' : color === 'green' ? '#22c55e' : color === 'amber' ? '#f59e0b' : color === 'red' ? '#ef4444' : '#64748b'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${bgColor}15`,
      color: bgColor,
      border: `1px solid ${bgColor}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  )
}

function Modal({ open, onClose, title, children, maxWidth = 580 }) {
  if (!open) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 43, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: maxWidth,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            color: 'var(--color-mid-gray)',
            padding: '0.25rem'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [stFilter, setStFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailTab, setDetailTab] = useState('aircraft')
  const [message, setMessage] = useState({ text: '', type: '' })

  const blankForm = () => ({ 
    name: '', trading_name: '', country: '', city: '', 
    contact_email: '', contact_phone: '', tier: 'standard', 
    registration_no: '', aoc_number: '', website: '' 
  })
  const [form, setForm] = useState(blankForm())
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (tierFilter) params.tier = tierFilter
      if (stFilter) params.status = stFilter
      const response = await adminAPI.operators(params)
      const data = response?.data || response
      setOperators(data.results || data || [])
    } catch (err) {
      console.error('Failed to load operators:', err)
      setOperators([])
    } finally {
      setLoading(false)
    }
  }, [search, tierFilter, stFilter])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = async (op) => {
    setSelected(op)
    setDetailTab('aircraft')
    setModal('detail')
    try {
      const [aircraft, yachts, bookings, payouts, reviews] = await Promise.all([
        adminAPI.opAircraft(op.id),
        adminAPI.opYachts(op.id),
        adminAPI.opBookings(op.id),
        adminAPI.opPayouts(op.id),
        adminAPI.opReviews(op.id),
      ])
      setDetail({ 
        aircraft: aircraft?.data?.results || aircraft?.data || aircraft || [], 
        yachts: yachts?.data?.results || yachts?.data || yachts || [],
        bookings: bookings?.data?.results || bookings?.data || bookings || [],
        payouts: payouts?.data?.results || payouts?.data || payouts || [],
        reviews: reviews?.data?.results || reviews?.data || reviews || []
      })
    } catch (err) {
      console.error('Failed to load operator details:', err)
    }
  }

  const activate = async (op) => {
    try {
      await adminAPI.activateOperator(op.id)
      setMessage({ text: 'Operator activated successfully.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to activate operator.', type: 'error' })
    }
  }

  const suspend = async (op) => {
    try {
      await adminAPI.suspendOperator(op.id)
      setMessage({ text: 'Operator suspended.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to suspend operator.', type: 'error' })
    }
  }

  const approveAircraft = async (id) => {
    try {
      await adminAPI.approveAircraft(id)
      if (selected) openDetail(selected)
      setMessage({ text: 'Aircraft approved.', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to approve aircraft.', type: 'error' })
    }
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErr('')
    try {
      await adminAPI.createOperator(form)
      setMessage({ text: 'Operator created successfully.', type: 'success' })
      setModal(null)
      setForm(blankForm())
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setFormErr(data?.detail || data?.message || 'Failed to create operator')
    } finally {
      setSaving(false)
    }
  }

  const changeTier = async (op, tier) => {
    try {
      await adminAPI.changeTier(op.id, { tier })
      setMessage({ text: `Tier changed to ${tier}.`, type: 'success' })
      load()
      setModal(null)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to change tier.', type: 'error' })
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const stats = {
    total: operators.length,
    active: operators.filter(o => o.status === 'active').length,
    pending: operators.filter(o => o.status === 'pending').length,
    totalAircraft: operators.reduce((sum, o) => sum + (o.active_aircraft_count || 0), 0)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Charter Operators</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>V2 partner operator network — aircraft & yacht suppliers</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={load} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'transparent',
            color: 'var(--color-navy)',
            border: '1.5px solid var(--color-navy)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button onClick={() => { setForm(blankForm()); setFormErr(''); setModal('create') }} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'var(--color-navy)',
            color: 'var(--color-white)',
            border: '1.5px solid var(--color-navy)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <i className="bi bi-plus-lg"></i> Add Operator
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Operators</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.active}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Active</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.totalAircraft}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Aircraft</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s ease' }}
              placeholder="Name, country, email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Tier</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={tierFilter} 
            onChange={e => setTierFilter(e.target.value)}
          >
            <option value="">All Tiers</option>
            <option value="standard">Standard</option>
            <option value="preferred">Preferred</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={stFilter} 
            onChange={e => setStFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        {(search || tierFilter || stFilter) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setTierFilter(''); setStFilter('') }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Clear
            </button>
          </div>
        )}
      </div>

      {/* Operators Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading operators...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : operators.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-building" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No operators found.</p>
              {(search || tierFilter || stFilter) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setTierFilter(''); setStFilter('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Operator</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Tier</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Yachts</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map(op => (
                  <tr key={op.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(op)}>
                      <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{op.name}</div>
                      {op.trading_name && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{op.trading_name}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>
                      {op.country}{op.city ? `, ${op.city}` : ''}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge label={TIER_LABEL[op.tier] || op.tier} color={TIER_COLOR[op.tier]} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge label={STATUS_LABEL[op.status] || op.status} color={STATUS_COLOR[op.status]} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{op.active_aircraft_count || 0}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}> active</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{op.active_yacht_count || 0}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}> active</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{op.contact_email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{op.contact_phone || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openDetail(op)} 
                          title="View details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {op.status !== 'active' && (
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => activate(op)} 
                            title="Activate"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                        )}
                        {op.status === 'active' && (
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => suspend(op)} 
                            title="Suspend"
                          >
                            <i className="bi bi-pause-circle"></i>
                          </button>
                        )}
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => { setSelected(op); setModal('tier') }} 
                          title="Change tier"
                        >
                          <i className="bi bi-stars"></i>
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

      {/* Stats Summary */}
      {!loading && operators.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {operators.length} operator{operators.length !== 1 ? 's' : ''}
          {(search || tierFilter || stFilter) && ' with current filters'}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => { setModal(null); setDetail(null) }} title={<><i className="bi bi-building"></i> {selected?.name}</>} maxWidth={820}>
        {selected && (
          <div>
            {/* Operator header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--color-off-white)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: TIER_COLOR[selected.tier] }}>{TIER_LABEL[selected.tier] || selected.tier}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Tier</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--color-off-white)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: STATUS_COLOR[selected.status] }}>{STATUS_LABEL[selected.status] || selected.status}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Status</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--color-off-white)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{selected.country}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Country</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--color-off-white)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{selected.active_aircraft_count || 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Aircraft</div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-envelope" style={{ marginRight: '0.5rem' }}></i> Contact Information
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email</span>
                  <span style={{ color: 'var(--color-dark-gray)' }}>{selected.contact_email}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</span>
                  <span style={{ color: 'var(--color-dark-gray)' }}>{selected.contact_phone || '—'}</span>
                </div>
                {selected.website && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Website</span>
                    <a href={selected.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>{selected.website}</a>
                  </div>
                )}
                {selected.aoc_number && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>AOC Number</span>
                    <span style={{ color: 'var(--color-dark-gray)' }}>{selected.aoc_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-light-gray)', paddingBottom: '0.5rem' }}>
              {['aircraft', 'yachts', 'bookings', 'payouts', 'reviews'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  style={{
                    padding: '0.4rem 1rem',
                    background: detailTab === tab ? 'var(--color-navy)' : 'transparent',
                    color: detailTab === tab ? 'var(--color-white)' : 'var(--color-mid-gray)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {detail && detail[tab]?.length > 0 && (
                    <span style={{ marginLeft: '0.3rem', padding: '0.1rem 0.3rem', background: detailTab === tab ? 'rgba(255,255,255,0.2)' : 'var(--color-off-white)', borderRadius: '4px', fontSize: '0.65rem' }}>
                      {detail[tab].length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {!detail ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '40px', height: '40px', margin: '0 auto', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* Aircraft Tab */}
                {detailTab === 'aircraft' && (
                  detail.aircraft.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-airplane" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No aircraft listed.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Aircraft</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Registration</th>
                            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '0.6rem', textAlign: 'right' }}>Rate/hr</th>
                            <th style={{ padding: '0.6rem', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '0.6rem', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.aircraft.map(ac => (
                            <tr key={ac.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                              <td style={{ padding: '0.6rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{ac.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{ac.model}</div>
                              </td>
                              <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: 'var(--color-dark-gray)' }}>{ac.registration_number}</td>
                              <td style={{ padding: '0.6rem', color: 'var(--color-dark-gray)' }}>{ac.category_display || ac.category}</td>
                              <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(ac.hourly_rate_usd)}</td>
                              <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                                <Badge label={ac.status} color={ac.status === 'active' ? 'green' : 'amber'} />
                              </td>
                              <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                                {!ac.is_approved ? (
                                  <button 
                                    style={{ padding: '0.2rem 0.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                    onClick={() => approveAircraft(ac.id)}
                                  >
                                    <i className="bi bi-check-lg"></i> Approve
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>
                                    <i className="bi bi-check-circle-fill"></i> Approved
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* Yachts Tab */}
                {detailTab === 'yachts' && (
                  detail.yachts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-water" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No yachts listed.
                    </div>
                  ) : (
                    detail.yachts.map(y => (
                      <div key={y.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--color-light-gray)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{y.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{y.length_meters}m · {y.guest_capacity} guests · {y.home_port}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(y.daily_rate_usd)}/day</span>
                          <Badge label={y.status} color={y.status === 'available' ? 'green' : 'amber'} />
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Bookings Tab */}
                {detailTab === 'bookings' && (
                  detail.bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-calendar-check" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No bookings yet.
                    </div>
                  ) : (
                    detail.bookings.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--color-light-gray)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-navy)' }}>{String(b.reference).slice(0, 8)}…</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.asset_type} · {new Date(b.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(b.operator_payout_usd)}</span>
                          <Badge label={b.status} color={STATUS_COLOR[b.status]} />
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Payouts Tab */}
                {detailTab === 'payouts' && (
                  detail.payouts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-cash-stack" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No payouts yet.
                    </div>
                  ) : (
                    detail.payouts.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--color-light-gray)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(p.amount_usd)} {p.currency}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{p.payment_method || 'Bank transfer'} · {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                        <Badge label={p.status} color={{ pending: 'amber', processing: 'navy', paid: 'green', failed: 'red' }[p.status] || 'gray'} />
                      </div>
                    ))
                  )
                )}

                {/* Reviews Tab */}
                {detailTab === 'reviews' && (
                  detail.reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-star" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No reviews yet.
                    </div>
                  ) : (
                    detail.reviews.map(r => (
                      <div key={r.id} style={{ marginBottom: '0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{r.reviewer_name}</div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map(n => (
                                <i key={n} className={`bi bi-star${n <= r.rating_overall ? '-fill' : ''}`} style={{ color: '#c9992e', fontSize: '0.8rem' }}></i>
                              ))}
                            </div>
                          </div>
                          {r.comment && <p style={{ fontSize: '0.8rem', color: 'var(--color-mid-gray)', margin: '0.5rem 0 0' }}>{r.comment}</p>}
                          {!r.is_published && <Badge label="Pending approval" color="amber" />}
                        </div>
                      </div>
                    ))
                  )
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Create Operator Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title={<><i className="bi bi-plus-lg"></i> Add Charter Operator</>} maxWidth={620}>
        <form onSubmit={submitCreate}>
          {formErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{formErr}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Company Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="East Africa Air" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Trading Name</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.trading_name} onChange={e => setForm(f => ({ ...f, trading_name: e.target.value }))} placeholder="EA Air" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Country <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required placeholder="Kenya" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>City</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Nairobi" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Contact Email <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Contact Phone</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>AOC Number</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.aoc_number} onChange={e => setForm(f => ({ ...f, aoc_number: e.target.value }))} placeholder="KEN-AOC-001" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Tier</label>
              <select style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer' }} value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                <option value="standard">Standard</option>
                <option value="preferred">Preferred</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Website</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Creating…</> : <><i className="bi bi-check-lg"></i> Create Operator</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Tier Modal */}
      <Modal open={modal === 'tier'} onClose={() => setModal(null)} title={<><i className="bi bi-stars"></i> Change Tier — {selected?.name}</>} maxWidth={420}>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-mid-gray)' }}>Select a new partnership tier for this operator.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            ['standard', 'Standard Partner', 'Base commission rates apply', TIER_COLOR.standard],
            ['preferred', 'Preferred Partner', 'Reduced commission, priority dispatch', TIER_COLOR.preferred],
            ['exclusive', 'Exclusive Partner', 'Custom commission, dedicated support', TIER_COLOR.exclusive]
          ].map(([val, label, desc, color]) => (
            <button 
              key={val} 
              type="button"
              onClick={() => changeTier(selected, val)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: selected?.tier === val ? `${color}10` : 'var(--color-white)',
                border: selected?.tier === val ? `2px solid ${color}` : '1px solid var(--color-light-gray)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="bi bi-patch-check" style={{ fontSize: '1.2rem', color: color }}></i>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}