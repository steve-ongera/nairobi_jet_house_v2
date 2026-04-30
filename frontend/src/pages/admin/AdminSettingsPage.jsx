// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'

export function AdminSettingsPage() {
  const [rules, setRules] = useState([])
  const [legacy, setLegacy] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', markup_pct: '20', commission_pct: '15', priority: '0', operator_tier: '', asset_category: '', min_booking_usd: '', max_booking_usd: '' })
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState('')

  useEffect(() => {
    Promise.all([adminApi.getCommRules(), adminApi.getCommission()])
      .then(([r, l]) => {
        setRules(r.results || r)
        setLegacy(l.results || l)
      })
      .finally(() => setLoading(false))
  }, [])

  const createRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    setOk('')
    try {
      await adminApi.createCommRule(form)
      setOk('Commission rule saved.')
      const d = await adminApi.getCommRules()
      setRules(d.results || d)
    } catch {
      setOk('Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }

  const toggleRule = async (id) => {
    await adminApi.toggleCommRule(id)
    const d = await adminApi.getCommRules()
    setRules(d.results || d)
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Settings</h2>
          <p>Platform commission rules and configuration</p>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Commission Rules Engine
          <span style={{ fontSize: '0.5rem', fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)', padding: '1px 5px', borderRadius: 3 }}>V2</span>
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner-ring" /></div>
      ) : (
        <>
          <div className="table-card" style={{ marginBottom: '1.5rem' }}>
            <div className="table-scroll">
              {rules.length === 0 ? (
                <div className="table-empty"><i className="bi bi-sliders" />No commission rules defined.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Markup %</th>
                      <th>Commission %</th>
                      <th>Priority</th>
                      <th>Tier Match</th>
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map(r => (
                      <tr key={r.id}>
                        <td className="td-name">{r.name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.markup_pct}%</td>
                        <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.commission_pct}%</td>
                        <td>{r.priority}</td>
                        <td>{r.operator_tier || 'Any'}</td>
                        <td><span className={`badge badge-${r.is_active ? 'green' : 'gray'}`}>{r.is_active ? 'Active' : 'Off'}</span></td>
                        <td><button className="btn btn-ghost btn-xs" onClick={() => toggleRule(r.id)}>{r.is_active ? 'Disable' : 'Enable'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-xs)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add Commission Rule</h4>
            {ok && (
              <div className={`alert alert-${ok.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
                <i className="bi bi-check-circle" /><span>{ok}</span>
              </div>
            )}
            <form onSubmit={createRule}>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-group form-full">
                  <label className="form-label">Rule Name <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="e.g. Standard 20% Markup" 
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
              <button type="submit" className="btn btn-navy" disabled={saving}>
                {saving ? (
                  <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                ) : (
                  <><i className="bi bi-plus-lg" /> Add Rule</>
                )}
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <span className="eyebrow">Legacy Commission (V1 Marketplace)</span>
          </div>
          <div className="table-card">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Rate</th><th>Effective From</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {legacy.map(l => (
                    <tr key={l.id}>
                      <td className="td-price">{l.rate_pct}%</td>
                      <td style={{ fontSize: '0.82rem' }}>{l.effective_from}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{l.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}