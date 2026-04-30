// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN EMAIL LOGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

export function AdminEmailLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showSend, setShowSend] = useState(false)
  const [sendForm, setSendForm] = useState({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' })
  const [sending, setSending] = useState(false)
  const [sendOk, setSendOk] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getEmailLogs(search ? { search } : {})
      setLogs(data.results || data)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const sendEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendOk('')
    try {
      await adminApi.sendEmail(sendForm)
      setSendOk('Email sent successfully.')
      setSendForm(f => ({ ...f, to_email: '', to_name: '', subject: '', body: '' }))
      load()
    } catch {
      setSendOk('Failed to send email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Email Logs</h2>
          <p>All outbound emails sent from the platform</p>
        </div>
        <button className="btn btn-navy btn-sm" onClick={() => setShowSend(s => !s)}>
          <i className="bi bi-send" /> {showSend ? 'Hide' : 'Send Email'}
        </button>
      </div>

      {showSend && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Send Manual Email</h4>
          {sendOk && (
            <div className={`alert alert-${sendOk.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
              <i className={`bi bi-${sendOk.includes('Failed') ? 'x-circle' : 'check-circle'}`} />
              <span>{sendOk}</span>
            </div>
          )}
          <form onSubmit={sendEmail}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">To Email <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="email" 
                  value={sendForm.to_email} 
                  onChange={e => setSendForm(f => ({ ...f, to_email: e.target.value }))} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">To Name</label>
                <input 
                  className="form-control" 
                  value={sendForm.to_name} 
                  onChange={e => setSendForm(f => ({ ...f, to_name: e.target.value }))} 
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Subject <span className="req">*</span></label>
              <input 
                className="form-control" 
                value={sendForm.subject} 
                onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea 
                className="form-control" 
                style={{ minHeight: 120 }} 
                value={sendForm.body} 
                onChange={e => setSendForm(f => ({ ...f, body: e.target.value }))} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-navy" disabled={sending}>
              {sending ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
              ) : (
                <><i className="bi bi-send" /> Send</>
              )}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <i className="bi bi-search" />
          <input 
            className="form-control search-input" 
            placeholder="Search email, subject…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : logs.length === 0 ? (
            <div className="table-empty"><i className="bi bi-envelope" />No email logs found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Sent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="td-name">{l.to_name || l.to_email}</div>
                      <div className="td-email">{l.to_email}</div>
                    </td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                      {l.subject}
                    </td>
                    <td><span className="badge badge-gray">{l.inquiry_type}</span></td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(l.sent_at).toLocaleString()}</td>
                    <td><span className={`badge badge-${l.success ? 'green' : 'red'}`}>{l.success ? 'Sent' : 'Failed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEmailLogsPage