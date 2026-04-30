// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN OPERATOR DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'

export function AdminOperatorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [operator, setOperator] = useState(null)
  const [aircraft, setAircraft] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [op, ac, bk] = await Promise.all([
        adminAPI.getOperatorDetail(id),
        adminAPI.getOperatorAircraft({ operator_id: id }),
        adminAPI.getOperatorBookings(id)
      ])
      setOperator(op)
      setAircraft(ac.results || ac)
      setBookings(bk.results || bk)
      setForm({
        company_name: op.company_name,
        email: op.email,
        phone: op.phone,
        tier: op.tier || 'standard',
        commission_rate: op.commission_rate || 15,
        is_active: op.is_active
      })
    } catch (err) {
      console.error('Failed to load operator details:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateOperator = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await adminAPI.updateOperator(id, form)
      setMessage('Operator updated successfully.')
      setEditing(false)
      loadData()
    } catch (err) {
      setMessage('Failed to update operator.')
    } finally {
      setSaving(false)
    }
  }

  const updateAircraftStatus = async (aircraftId, status) => {
    try {
      await adminAPI.updateAircraftStatus(aircraftId, { status })
      loadData()
    } catch (err) {
      console.error('Failed to update aircraft status:', err)
    }
  }

  const formatCurrency = (n) => n ? `$${Number(n).toLocaleString()}` : '—'
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner-ring" />
      </div>
    )
  }

  if (!operator) {
    return (
      <div className="table-empty">
        <i className="bi bi-exclamation-triangle" />
        <p>Operator not found.</p>
        <button className="btn btn-navy btn-sm" onClick={() => navigate('/admin/operators')}>
          Back to Operators
        </button>
      </div>
    )
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.gross_amount_usd) || 0), 0)
  const totalCommission = bookings.reduce((sum, b) => sum + (Number(b.commission_usd) || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/operators')} style={{ marginRight: '0.75rem' }}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <h2>{operator.company_name || operator.name}</h2>
          <p>Operator details and performance overview</p>
        </div>
        <button className="btn btn-navy btn-sm" onClick={() => setEditing(!editing)}>
          <i className={`bi bi-${editing ? 'x-lg' : 'pencil'}`} /> {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.includes('Failed') ? 'x-circle' : 'check-circle'}`} />
          <span>{message}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-airplane" /></div>
          <div className="stat-label">Aircraft</div>
          <div className="stat-value">{aircraft.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-percent" /></div>
          <div className="stat-label">Total Commission</div>
          <div className="stat-value">{formatCurrency(totalCommission)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-calendar" /></div>
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Edit Operator</h4>
          <form onSubmit={updateOperator}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-control" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tier</label>
                <select className="form-control" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                  <option value="standard">Standard</option>
                  <option value="preferred">Preferred</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Commission Rate (%)</label>
                <input className="form-control" type="number" step="0.01" value={form.commission_rate} onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-navy" disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-nav">
        <button className={`tab-btn${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
          <i className="bi bi-info-circle" /> Overview
        </button>
        <button className={`tab-btn${activeTab === 'aircraft' ? ' active' : ''}`} onClick={() => setActiveTab('aircraft')}>
          <i className="bi bi-airplane" /> Aircraft ({aircraft.length})
        </button>
        <button className={`tab-btn${activeTab === 'bookings' ? ' active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <i className="bi bi-calendar-check" /> Bookings ({bookings.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Contact Information</h4>
            <div className="detail-group">
              <label>Email</label>
              <p>{operator.email || '—'}</p>
            </div>
            <div className="detail-group">
              <label>Phone</label>
              <p>{operator.phone || '—'}</p>
            </div>
            <div className="detail-group">
              <label>Address</label>
              <p>{operator.address || '—'}</p>
            </div>
            <div className="detail-group">
              <label>Joined</label>
              <p>{formatDate(operator.created_at)}</p>
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Platform Settings</h4>
            <div className="detail-group">
              <label>Tier</label>
              <p><span className={`badge badge-${operator.tier === 'exclusive' ? 'gold' : operator.tier === 'preferred' ? 'navy' : 'gray'}`}>{operator.tier?.toUpperCase() || 'Standard'}</span></p>
            </div>
            <div className="detail-group">
              <label>Commission Rate</label>
              <p className="td-price">{operator.commission_rate || 15}%</p>
            </div>
            <div className="detail-group">
              <label>Status</label>
              <p><span className={`badge badge-${operator.is_active ? 'green' : 'gray'}`}>{operator.is_active ? 'Active' : 'Inactive'}</span></p>
            </div>
            <div className="detail-group">
              <label>KYC Verified</label>
              <p><span className={`badge badge-${operator.kyc_verified ? 'green' : 'amber'}`}>{operator.kyc_verified ? 'Verified' : 'Pending'}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Aircraft Tab */}
      {activeTab === 'aircraft' && (
        <div className="table-card">
          <div className="table-scroll">
            {aircraft.length === 0 ? (
              <div className="table-empty"><i className="bi bi-airplane" />No aircraft listed by this operator.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Aircraft</th><th>Registration</th><th>Category</th><th>Hourly Rate</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {aircraft.map(ac => (
                    <tr key={ac.id}>
                      <td className="td-name">{ac.name}<div className="td-sub">{ac.model}</div></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{ac.registration_number}</td>
                      <td><span className="badge badge-gray">{ac.category_display || ac.category}</span></td>
                      <td className="td-price">${Number(ac.hourly_rate_usd).toLocaleString()}/hr</td>
                      <td><span className={`badge badge-${ac.is_approved ? 'green' : 'amber'}`}>{ac.is_approved ? 'Approved' : 'Pending'}</span></td>
                      <td>
                        <div className="td-actions">
                          {ac.is_approved ? (
                            <button className="btn btn-ghost btn-xs" onClick={() => updateAircraftStatus(ac.id, 'maintenance')}>Maintenance</button>
                          ) : (
                            <button className="btn btn-green btn-xs" onClick={() => updateAircraftStatus(ac.id, 'approved')}>Approve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="table-card">
          <div className="table-scroll">
            {bookings.length === 0 ? (
              <div className="table-empty"><i className="bi bi-calendar" />No bookings for this operator.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Reference</th><th>Client</th><th>Aircraft</th><th>Route</th><th>Date</th><th>Gross</th><th>Commission</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="td-ref">{b.reference?.slice(0, 8)}…</td>
                      <td><div className="td-name">{b.client_name}</div><div className="td-email">{b.client_email}</div></td>
                      <td>{b.aircraft_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{b.origin} → {b.destination}</td>
                      <td style={{ fontSize: '0.78rem' }}>{formatDate(b.departure_datetime)}</td>
                      <td className="td-price">{formatCurrency(b.gross_amount_usd)}</td>
                      <td className="td-price">{formatCurrency(b.commission_usd)}</td>
                      <td><span className={`badge badge-${b.status === 'confirmed' ? 'green' : 'amber'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOperatorDetailPage