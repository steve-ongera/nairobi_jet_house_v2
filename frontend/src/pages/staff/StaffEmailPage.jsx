// ═══════════════════════════════════════════════════════════════════════════════
// STAFF EMAIL PAGE - Clean & Simple
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

export function StaffEmailPage() {
  const [form, setForm] = useState({ 
    to_email: '', 
    to_name: '', 
    subject: '', 
    body: '', 
    inquiry_type: 'general' 
  })
  const [logs, setLogs] = useState([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [selectedLog, setSelectedLog] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminAPI.emailLogs()
      const data = response?.data || response
      setLogs(data.results || data || [])
    } catch (err) {
      console.error('Failed to load email logs:', err)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const sendEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    setMessage({ text: '', type: '' })
    try {
      await adminAPI.sendEmail(form)
      setMessage({ text: 'Email sent successfully!', type: 'success' })
      setForm({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' })
      await loadLogs()
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

  const emailTypes = [
    { value: 'general', label: 'General' },
    { value: 'flight_booking', label: 'Flight Booking' },
    { value: 'yacht_charter', label: 'Yacht Charter' },
    { value: 'lease_inquiry', label: 'Lease Inquiry' },
    { value: 'operator', label: 'Operator' },
    { value: 'rfq', label: 'RFQ' },
    { value: 'payout', label: 'Payout' },
  ]

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.success).length,
    failed: logs.filter(l => !l.success).length
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Send Email</h2>
          <p>Compose and send emails to clients or operators</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadLogs}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="email-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Emails</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.sent}</div>
          <div className="stat-label">Sent</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Compose Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-envelope-paper" /> Compose New Email</h4>
          </div>
          <div className="settings-card-body">
            {message.text && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
                <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
                <span>{message.text}</span>
              </div>
            )}

            {/* Quick Recipients */}
            <div className="quick-replies" style={{ marginBottom: '1rem' }}>
              {quickRecipients.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-reply-btn"
                  onClick={() => setForm(f => ({ ...f, to_email: qr.email, to_name: qr.name }))}
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <form onSubmit={sendEmail}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">To Email <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="email" 
                  value={form.to_email} 
                  onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} 
                  required 
                  placeholder="customer@example.com"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Recipient Name (Optional)</label>
                <input 
                  className="form-control" 
                  value={form.to_name} 
                  onChange={e => setForm(f => ({ ...f, to_name: e.target.value }))} 
                  placeholder="Customer name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Subject <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  value={form.subject} 
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} 
                  required 
                  placeholder="Email subject"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Type</label>
                <select 
                  className="form-control" 
                  value={form.inquiry_type} 
                  onChange={e => setForm(f => ({ ...f, inquiry_type: e.target.value }))}
                >
                  {emailTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Message <span className="req">*</span></label>
                <textarea 
                  className="form-control" 
                  rows={8}
                  value={form.body} 
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))} 
                  required 
                  placeholder="Type your message here..."
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
        </div>

        {/* Recent Logs Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-clock-history" /> Recent Sent Emails</h4>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="table-empty" style={{ padding: '2rem' }}>
                <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p>Loading email history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="table-empty" style={{ padding: '3rem' }}>
                <i className="bi bi-envelope" />
                <p>No emails sent yet.</p>
              </div>
            ) : (
              <div>
                {logs.slice(0, 10).map(l => (
                  <div 
                    key={l.id} 
                    className="detail-item" 
                    style={{ cursor: 'pointer', padding: '0.875rem 1rem' }}
                    onClick={() => openDetail(l)}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.subject}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.15rem' }}>
                        {l.to_email} · {new Date(l.sent_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge badge-${l.success ? 'green' : 'red'}`} style={{ flexShrink: 0 }}>
                      {l.success ? 'Sent' : 'Failed'}
                    </span>
                  </div>
                ))}
                {logs.length > 10 && (
                  <div className="detail-item" style={{ textAlign: 'center', borderBottom: 'none' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => window.location.href = '/staff/email-logs'}
                    >
                      View all {logs.length} emails →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default StaffEmailPage