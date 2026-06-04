// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

function Modal({ open, onClose, title, children }) {
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
        borderRadius: '10px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
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

export default function AdminSettingsPage() {
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Settings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Platform commission rules and configuration</p>
        </div>
        <button onClick={loadData} style={{
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--color-mid-gray)' }}>Loading settings...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          {/* Commission Rules Section */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-sliders"></i>
                Commission Rules Engine
                <span style={{ 
                  fontSize: '0.5rem', 
                  fontWeight: 700, 
                  background: 'var(--color-gold)', 
                  color: 'var(--color-navy-dark)', 
                  padding: '1px 5px', 
                  borderRadius: '4px' 
                }}>V2</span>
              </h4>
            </div>
            <div style={{ padding: '1rem' }}>
              {rules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="bi bi-sliders" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--color-mid-gray)' }}>No commission rules defined.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Rule Name</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Markup %</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Commission %</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Priority</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Tier Match</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--color-navy)' }}>{r.name}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>{r.markup_pct}%</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-gold)' }}>{r.commission_pct}%</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{r.priority}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{r.operator_tier || 'Any'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.2rem 0.6rem',
                              background: r.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                              color: r.is_active ? '#22c55e' : 'var(--color-mid-gray)',
                              border: `1px solid ${r.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}`,
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {r.is_active ? 'Active' : 'Off'}
                            </span>
                           </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button 
                                style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                onClick={() => openEditRule(r)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-mid-gray)', border: '1px solid var(--color-light-gray)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                onClick={() => toggleRule(r.id)}
                                title={r.is_active ? 'Disable' : 'Enable'}
                              >
                                <i className={`bi bi-toggle-${r.is_active ? 'on' : 'off'}`}></i>
                              </button>
                              <button 
                                style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                onClick={() => deleteRule(r.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
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
          <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-plus-circle"></i> Add Commission Rule
              </h4>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={createRule}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Rule Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                      required 
                      placeholder="e.g., Standard 20% Markup"
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Markup % (client price)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={form.markup_pct} 
                      onChange={e => setForm(f => ({ ...f, markup_pct: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Commission % (NJH keeps)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={form.commission_pct} 
                      onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Priority (higher = checked first)</label>
                    <input 
                      type="number" 
                      value={form.priority} 
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Tier Match</label>
                    <select 
                      value={form.operator_tier} 
                      onChange={e => setForm(f => ({ ...f, operator_tier: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                    >
                      <option value="">Any tier</option>
                      <option value="standard">Standard</option>
                      <option value="preferred">Preferred</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" disabled={saving} style={{
                    padding: '0.6rem 1.2rem',
                    background: 'var(--color-navy)',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {saving ? (
                      <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
                    ) : (
                      <><i className="bi bi-plus-lg"></i> Add Rule</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Legacy Commission Section */}
          {legacy.length > 0 && (
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-clock-history"></i> Legacy Commission (V1 Marketplace)
                </h4>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Rate</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Effective From</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Notes</th>
                       </tr>
                    </thead>
                    <tbody>
                      {legacy.map(l => (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>{l.rate_pct}%</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{l.effective_from}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-mid-gray)' }}>{l.notes || '—'}</td>
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
      <Modal open={editModal} onClose={() => setEditModal(false)} title={<><i className="bi bi-pencil"></i> Edit Commission Rule</>}>
        <form onSubmit={updateRule}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Rule Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              required 
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Markup %</label>
              <input 
                type="number" 
                step="0.01" 
                value={form.markup_pct} 
                onChange={e => setForm(f => ({ ...f, markup_pct: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Commission %</label>
              <input 
                type="number" 
                step="0.01" 
                value={form.commission_pct} 
                onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Priority</label>
              <input 
                type="number" 
                value={form.priority} 
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Tier</label>
              <select 
                value={form.operator_tier} 
                onChange={e => setForm(f => ({ ...f, operator_tier: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                <option value="">Any tier</option>
                <option value="standard">Standard</option>
                <option value="preferred">Preferred</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={() => setEditModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</> : <>Update Rule</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}