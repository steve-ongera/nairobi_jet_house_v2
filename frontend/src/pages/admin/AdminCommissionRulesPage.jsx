// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN COMMISSION RULES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

export function AdminCommissionRulesPage() {
  const [rules, setRules] = useState([])
  const [legacy, setLegacy] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ 
    name: '', 
    markup_pct: '20', 
    commission_pct: '15', 
    priority: '0', 
    operator_tier: '', 
    asset_category: '', 
    min_booking_usd: '', 
    max_booking_usd: '' 
  })
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [r, l] = await Promise.all([adminAPI.getCommRules(), adminAPI.getCommission()])
      setRules(r.results || r)
      setLegacy(l.results || l)
    } catch (err) {
      console.error('Failed to load commission data:', err)
    } finally {
      setLoading(false)
    }
  }

  const createRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    setOk('')
    setError('')
    try {
      await adminAPI.createCommRule(form)
      setOk('Commission rule created successfully.')
      setForm({ 
        name: '', markup_pct: '20', commission_pct: '15', priority: '0', 
        operator_tier: '', asset_category: '', min_booking_usd: '', max_booking_usd: '' 
      })
      await loadData()
    } catch (err) {
      setError('Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }

  const updateRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    setOk('')
    setError('')
    try {
      await adminAPI.updateCommRule(editing.id, form)
      setOk('Commission rule updated successfully.')
      setEditing(null)
      setForm({ 
        name: '', markup_pct: '20', commission_pct: '15', priority: '0', 
        operator_tier: '', asset_category: '', min_booking_usd: '', max_booking_usd: '' 
      })
      await loadData()
    } catch (err) {
      setError('Failed to update rule.')
    } finally {
      setSaving(false)
    }
  }

  const toggleRule = async (id) => {
    try {
      await adminAPI.toggleCommRule(id)
      await loadData()
    } catch (err) {
      console.error('Failed to toggle rule:', err)
    }
  }

  const deleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this commission rule?')) return
    try {
      await adminAPI.deleteCommRule(id)
      await loadData()
      setOk('Commission rule deleted successfully.')
    } catch (err) {
      setError('Failed to delete rule.')
    }
  }

  const editRule = (rule) => {
    setEditing(rule)
    setForm({
      name: rule.name,
      markup_pct: rule.markup_pct,
      commission_pct: rule.commission_pct,
      priority: rule.priority,
      operator_tier: rule.operator_tier || '',
      asset_category: rule.asset_category || '',
      min_booking_usd: rule.min_booking_usd || '',
      max_booking_usd: rule.max_booking_usd || ''
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ 
      name: '', markup_pct: '20', commission_pct: '15', priority: '0', 
      operator_tier: '', asset_category: '', min_booking_usd: '', max_booking_usd: '' 
    })
    setError('')
    setOk('')
  }

  const OPERATOR_TIERS = ['', 'standard', 'preferred', 'exclusive']
  const ASSET_CATEGORIES = ['', 'light', 'midsize', 'super_midsize', 'heavy', 'ultra_long', 'vip_airliner', 'yacht']

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Commission Rules</h2>
          <p>Configure platform commission and markup rules</p>
        </div>
      </div>

      {ok && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <i className="bi bi-check-circle" />
          <span>{ok}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      {/* V2 Commission Rules */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="bi bi-sliders2" /> Commission Rules Engine
          <span style={{ fontSize: '0.5rem', fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)', padding: '1px 5px', borderRadius: 3 }}>V2</span>
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
      ) : (
        <>
          {/* Rules Table */}
          <div className="table-card" style={{ marginBottom: '1.5rem' }}>
            <div className="table-scroll">
              {rules.length === 0 ? (
                <div className="table-empty">
                  <i className="bi bi-sliders" />No commission rules defined. Create your first rule below.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Markup %</th>
                      <th>Commission %</th>
                      <th>Priority</th>
                      <th>Tier Match</th>
                      <th>Asset Category</th>
                      <th>Min/Max Booking</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map(r => (
                      <tr key={r.id}>
                        <td className="td-name">{r.name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.markup_pct}%</td>
                        <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.commission_pct}%</td>
                        <td>{r.priority}</td>
                        <td>
                          <span className="badge badge-gray">
                            {r.operator_tier ? r.operator_tier.toUpperCase() : 'Any'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-gray">
                            {r.asset_category ? r.asset_category.replace(/_/g, ' ') : 'Any'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {r.min_booking_usd && `$${r.min_booking_usd}`}
                          {r.min_booking_usd && r.max_booking_usd && ' - '}
                          {r.max_booking_usd && `$${r.max_booking_usd}`}
                          {!r.min_booking_usd && !r.max_booking_usd && '—'}
                        </td>
                        <td>
                          <span className={`badge badge-${r.is_active ? 'green' : 'gray'}`}>
                            {r.is_active ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td>
                          <div className="td-actions">
                            <button className="btn btn-ghost btn-xs" onClick={() => editRule(r)}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-ghost btn-xs" onClick={() => toggleRule(r.id)}>
                              <i className={`bi bi-${r.is_active ? 'toggle-off' : 'toggle-on'}`} />
                            </button>
                            <button className="btn btn-ghost btn-xs text-red" onClick={() => deleteRule(r.id)}>
                              <i className="bi bi-trash" />
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

          {/* Create/Edit Rule Form */}
          <div style={{ 
            background: 'var(--white)', 
            border: '1px solid var(--gray-100)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            boxShadow: 'var(--shadow-xs)' 
          }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
              {editing ? <><i className="bi bi-pencil" /> Edit Commission Rule</> : <><i className="bi bi-plus-lg" /> Add Commission Rule</>}
            </h4>
            <form onSubmit={editing ? updateRule : createRule}>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-group form-full">
                  <label className="form-label">Rule Name <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="e.g. Standard 20% Markup, Premium Tier, Heavy Aircraft" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Markup % (client price)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={form.markup_pct} 
                    onChange={e => setForm(f => ({ ...f, markup_pct: e.target.value }))} 
                  />
                  <small className="form-hint">Percentage added to operator cost</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Commission % (NJH keeps)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={form.commission_pct} 
                    onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))} 
                  />
                  <small className="form-hint">Percentage of gross revenue</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.priority} 
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} 
                  />
                  <small className="form-hint">Higher number = checked first</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Operator Tier Match</label>
                  <select 
                    className="form-control" 
                    value={form.operator_tier} 
                    onChange={e => setForm(f => ({ ...f, operator_tier: e.target.value }))}
                  >
                    {OPERATOR_TIERS.map(t => (
                      <option key={t} value={t}>{t === '' ? 'Any tier' : t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Category Match</label>
                  <select 
                    className="form-control" 
                    value={form.asset_category} 
                    onChange={e => setForm(f => ({ ...f, asset_category: e.target.value }))}
                  >
                    {ASSET_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c === '' ? 'Any category' : c.replace(/_/g, ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Booking Amount (USD)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={form.min_booking_usd} 
                    onChange={e => setForm(f => ({ ...f, min_booking_usd: e.target.value }))} 
                    placeholder="e.g. 10000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Booking Amount (USD)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={form.max_booking_usd} 
                    onChange={e => setForm(f => ({ ...f, max_booking_usd: e.target.value }))} 
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {editing && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-navy" disabled={saving}>
                  {saving ? (
                    <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                  ) : (
                    <><i className={`bi bi-${editing ? 'check-lg' : 'plus-lg'}`} /> {editing ? 'Update Rule' : 'Add Rule'}</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Legacy V1 Commission */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="eyebrow">
              <i className="bi bi-clock-history" /> Legacy Commission (V1 Marketplace)
            </span>
          </div>
          <div className="table-card">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rate</th>
                    <th>Effective From</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {legacy.map(l => (
                    <tr key={l.id}>
                      <td className="td-price">{l.rate_pct}%</td>
                      <td style={{ fontSize: '0.82rem' }}>{l.effective_from}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{l.notes || '—'}</td>
                    </tr>
                  ))}
                  {legacy.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                        No legacy commission records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminCommissionRulesPage