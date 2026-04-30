// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function AdminSettingsPage() {
  const [rules, setRules] = useState([])
  const [legacy, setLegacy] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [editModal, setEditModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  
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

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [rulesRes, legacyRes] = await Promise.all([
        adminAPI.commissionRules(),
        adminAPI.commission()
      ])
      setRules(rulesRes?.data?.results || rulesRes?.data || rulesRes || [])
      setLegacy(legacyRes?.data?.results || legacyRes?.data || legacyRes || [])
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await adminAPI.createCommissionRule(form)
      setMessage({ text: 'Commission rule saved successfully!', type: 'success' })
      await loadData()
      // Reset form
      setForm({ 
        name: '', markup_pct: '20', commission_pct: '15', priority: '0', 
        operator_tier: '', asset_category: '', min_booking_usd: '', max_booking_usd: '' 
      })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to save rule. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const toggleRule = async (id) => {
    try {
      await adminAPI.toggleCommissionRule(id)
      await loadData()
    } catch (err) {
      console.error('Failed to toggle rule:', err)
    }
  }

  const openEditRule = (rule) => {
    setSelectedRule(rule)
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
    setEditModal(true)
  }

  const updateRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.updateCommissionRule(selectedRule.id, form)
      setMessage({ text: 'Rule updated successfully!', type: 'success' })
      await loadData()
      setEditModal(false)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to update rule.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const deleteRule = async (id) => {
    if (!confirm('Delete this commission rule? This action cannot be undone.')) return
    try {
      await adminAPI.deleteCommissionRule(id)
      setMessage({ text: 'Rule deleted.', type: 'success' })
      await loadData()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to delete rule.', type: 'error' })
    }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Settings</h2>
          <p>Platform commission rules and configuration</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadData}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Commission Rules Section */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h4>
                <i className="bi bi-sliders" />
                Commission Rules Engine
                <span style={{ fontSize: '0.5rem', fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)', padding: '1px 5px', borderRadius: 3 }}>
                  V2
                </span>
              </h4>
            </div>
            <div className="settings-card-body">
              {rules.length === 0 ? (
                <div className="table-empty">
                  <i className="bi bi-sliders" />
                  <p>No commission rules defined.</p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Rule Name</th>
                        <th>Markup %</th>
                        <th>Commission %</th>
                        <th>Priority</th>
                        <th>Tier Match</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map(r => (
                        <tr key={r.id}>
                          <td className="td-name">{r.name}</td>
                          <td style={{ fontWeight: 600 }}>{r.markup_pct}%</td>
                          <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.commission_pct}%</td>
                          <td>{r.priority}</td>
                          <td>{r.operator_tier || 'Any'}</td>
                          <td>
                            <span className={`badge badge-${r.is_active ? 'green' : 'gray'}`}>
                              {r.is_active ? 'Active' : 'Off'}
                            </span>
                          </td>
                          <td>
                            <div className="td-actions">
                              <button 
                                className="btn btn-outline-navy btn-xs" 
                                onClick={() => openEditRule(r)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button 
                                className="btn btn-ghost btn-xs" 
                                onClick={() => toggleRule(r.id)}
                                title={r.is_active ? 'Disable' : 'Enable'}
                              >
                                <i className={`bi bi-toggle-${r.is_active ? 'on' : 'off'}`} />
                              </button>
                              <button 
                                className="btn btn-outline-red btn-xs" 
                                onClick={() => deleteRule(r.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add Rule Form */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h4><i className="bi bi-plus-circle" /> Add Commission Rule</h4>
            </div>
            <div className="settings-card-body">
              <form onSubmit={createRule}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label className="form-label">Rule Name <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      value={form.name} 
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                      required 
                      placeholder="e.g., Standard 20% Markup" 
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
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority (higher = checked first)</label>
                    <input 
                      className="form-control" 
                      type="number" 
                      value={form.priority} 
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operator Tier Match</label>
                    <select 
                      className="form-control" 
                      value={form.operator_tier} 
                      onChange={e => setForm(f => ({ ...f, operator_tier: e.target.value }))}
                    >
                      <option value="">Any tier</option>
                      <option value="standard">Standard</option>
                      <option value="preferred">Preferred</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-navy" disabled={saving}>
                    {saving ? (
                      <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                    ) : (
                      <><i className="bi bi-plus-lg" /> Add Rule</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Legacy Commission Section */}
          {legacy.length > 0 && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h4><i className="bi bi-clock-history" /> Legacy Commission (V1 Marketplace)</h4>
              </div>
              <div className="settings-card-body">
                <div className="table-scroll">
                  <table>
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
                          <td>{l.effective_from}</td>
                          <td style={{ color: 'var(--gray-400)' }}>{l.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Rule Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={<><i className="bi bi-pencil" /> Edit Commission Rule</>}>
        <form onSubmit={updateRule}>
          <div className="form-group form-full" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Rule Name <span className="req">*</span></label>
            <input 
              className="form-control" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              required 
            />
          </div>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Markup %</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={form.markup_pct} 
                onChange={e => setForm(f => ({ ...f, markup_pct: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commission %</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={form.commission_pct} 
                onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <input 
                className="form-control" 
                type="number" 
                value={form.priority} 
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operator Tier</label>
              <select 
                className="form-control" 
                value={form.operator_tier} 
                onChange={e => setForm(f => ({ ...f, operator_tier: e.target.value }))}
              >
                <option value="">Any tier</option>
                <option value="standard">Standard</option>
                <option value="preferred">Preferred</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : <>Update Rule</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminSettingsPage