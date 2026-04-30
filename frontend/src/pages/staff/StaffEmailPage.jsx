// ═══════════════════════════════════════════════════════════════════════════════
// STAFF EMAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

export function StaffEmailPage() {
  const [form, setForm] = useState({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' })
  const [logs, setLogs] = useState([])
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getEmailLogs()
      .then(d => setLogs(d.results || d))
      .finally(() => setLoading(false))
  }, [])

  const send = async (e) => {
    e.preventDefault()
    setSending(true)
    setMsg('')
    try {
      await adminAPI.sendEmail(form)
      setMsg('Email sent successfully.')
      setForm(f => ({ ...f, to_email: '', to_name: '', subject: '', body: '' }))
      const d = await adminAPI.getEmailLogs()
      setLogs(d.results || d)
    } catch {
      setMsg('Failed to send email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader title="Send Email" sub="Compose and send emails to clients or operators" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Compose */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Compose</h4>
          {msg && (
            <div className={`alert alert-${msg.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
              <i className={`bi bi-${msg.includes('Failed') ? 'x-circle' : 'check-circle'}`} />
              <span>{msg}</span>
            </div>
          )}
          <form onSubmit={send}>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">To Email <span className="req">*</span></label>
              <input 
                className="form-control" 
                type="email" 
                value={form.to_email} 
                onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">To Name</label>
              <input 
                className="form-control" 
                value={form.to_name} 
                onChange={e => setForm(f => ({ ...f, to_name: e.target.value }))} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Subject <span className="req">*</span></label>
              <input 
                className="form-control" 
                value={form.subject} 
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Type</label>
              <select 
                className="form-control" 
                value={form.inquiry_type} 
                onChange={e => setForm(f => ({ ...f, inquiry_type: e.target.value }))}
              >
                {['general', 'flight_booking', 'yacht_charter', 'lease_inquiry', 'operator', 'rfq', 'payout'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea 
                className="form-control" 
                style={{ minHeight: 160 }} 
                value={form.body} 
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-navy btn-full" disabled={sending}>
              {sending ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
              ) : (
                <><i className="bi bi-send" /> Send Email</>
              )}
            </button>
          </form>
        </div>

        {/* Recent logs */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Sent</h4>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}><div className="spinner-ring" /></div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--gray-300)', padding: '2rem', fontSize: '0.875rem' }}>
              No emails sent yet.
            </div>
          ) : (
            logs.slice(0, 12).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid var(--gray-100)', gap: '0.5rem' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.subject}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {l.to_email} · {new Date(l.sent_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`badge badge-${l.success ? 'green' : 'red'}`} style={{ flexShrink: 0 }}>
                  {l.success ? 'Sent' : 'Failed'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffEmailPage;