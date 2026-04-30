// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN EMAIL LOGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function AdminEmailLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showSend, setShowSend] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [sendForm, setSendForm] = useState({ 
    to_email: '', 
    to_name: '', 
    subject: '', 
    body: '', 
    inquiry_type: 'general' 
  })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? { search } : {}
      const response = await adminAPI.emailLogs(params)
      const data = response?.data || response
      setLogs(data.results || data || [])
    } catch (err) {
      console.error('Failed to load email logs:', err)
      setLogs([])
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
    setMessage({ text: '', type: '' })
    try {
      await adminAPI.sendEmail(sendForm)
      setMessage({ text: 'Email sent successfully!', type: 'success' })
      setSendForm({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to send email. Please try again.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const openDetail = (log) => {
    setSelectedLog(log)
    setDetailModal(true)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString()
  }

  const quickRecipients = [
    { label: 'Test', email: 'admin@nairobiJethouse.com', name: 'Admin' },
  ]

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Email Logs</h2>
          <p>Track all outbound emails sent from the platform</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button 
            className={`btn ${showSend ? 'btn-outline-red' : 'btn-navy'} btn-sm`} 
            onClick={() => setShowSend(s => !s)}
          >
            <i className={`bi bi-${showSend ? 'x-lg' : 'send'}`} /> 
            {showSend ? 'Cancel' : 'Send Email'}
          </button>
        </div>
      </div>

      {/* Send Email Form */}
      {showSend && (
        <div className="send-email-card">
          <h4><i className="bi bi-envelope-paper" /> Compose New Email</h4>
          
          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
              <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={sendEmail}>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">To Email <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="email" 
                  value={sendForm.to_email} 
                  onChange={e => setSendForm(f => ({ ...f, to_email: e.target.value }))} 
                  required 
                  placeholder="customer@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">To Name</label>
                <input 
                  className="form-control" 
                  value={sendForm.to_name} 
                  onChange={e => setSendForm(f => ({ ...f, to_name: e.target.value }))} 
                  placeholder="Customer name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Inquiry Type</label>
                <select 
                  className="form-control" 
                  value={sendForm.inquiry_type} 
                  onChange={e => setSendForm(f => ({ ...f, inquiry_type: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="booking">Booking</option>
                  <option value="charter">Charter</option>
                  <option value="membership">Membership</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Subject <span className="req">*</span></label>
              <input 
                className="form-control" 
                value={sendForm.subject} 
                onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))} 
                required 
                placeholder="Email subject"
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea 
                className="form-control" 
                rows={6}
                value={sendForm.body} 
                onChange={e => setSendForm(f => ({ ...f, body: e.target.value }))} 
                required 
                placeholder="Type your message here..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowSend(false)}>Cancel</button>
              <button type="submit" className="btn btn-navy" disabled={sending}>
                {sending ? (
                  <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                ) : (
                  <><i className="bi bi-send" /> Send Email</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Search by email, subject, or recipient..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        {search && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setSearch('')}
            >
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Email Logs Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading email logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-envelope" />
              <p>No email logs found.</p>
              {search && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => setSearch('')}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Sent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(l)}>
                    <td>
                      <div className="td-name">{l.to_name || l.to_email}</div>
                      <div className="td-email">{l.to_email}</div>
                    </td>
                    <td>
                      <div className="email-subject" title={l.subject}>
                        {l.subject}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{l.inquiry_type || 'general'}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(l.sent_at)}
                    </td>
                    <td>
                      <span className={`badge badge-${l.success ? 'green' : 'red'}`}>
                        {l.success ? 'Sent' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && logs.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {logs.length} email{logs.length !== 1 ? 's' : ''}
          {search && ' matching your search'}
          {' · '}
          {logs.filter(l => l.success).length} sent, {logs.filter(l => !l.success).length} failed
        </div>
      )}

      {/* Email Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-envelope" /> Email Details</>}>
        {selectedLog && (
          <div>
            <div className="detail-row">
              <div className="detail-key">To</div>
              <div className="detail-val">
                {selectedLog.to_name && <div>{selectedLog.to_name}</div>}
                <div>{selectedLog.to_email}</div>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Subject</div>
              <div className="detail-val">{selectedLog.subject}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Type</div>
              <div className="detail-val">
                <span className="badge badge-gray">{selectedLog.inquiry_type || 'general'}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Sent</div>
              <div className="detail-val">{formatDate(selectedLog.sent_at)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val">
                <span className={`badge badge-${selectedLog.success ? 'green' : 'red'}`}>
                  {selectedLog.success ? 'Delivered' : 'Failed'}
                </span>
                {selectedLog.error_message && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--red)', marginTop: '0.25rem' }}>
                    {selectedLog.error_message}
                  </div>
                )}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Message</div>
              <div className="detail-val">
                <div className="email-preview">
                  {selectedLog.body || 'No message content'}
                </div>
              </div>
            </div>
            {selectedLog.sent_by && (
              <div className="detail-row">
                <div className="detail-key">Sent By</div>
                <div className="detail-val">{selectedLog.sent_by}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminEmailLogsPage