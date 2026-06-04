// ═══════════════════════════════════════════════════════════════════════════════
// STAFF EMAIL PAGE - Clean & Simple
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
        maxWidth: '560px',
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

export default function StaffEmailPage() {
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading email history...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Send Email</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Compose and send emails to clients or operators</p>
        </div>
        <button onClick={loadLogs} style={{
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Emails</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.sent}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Sent</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444' }}>{stats.failed}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Failed</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Compose Section */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-envelope-paper" style={{ color: 'var(--color-gold)' }}></i> Compose New Email
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
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

            {/* Quick Recipients */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {quickRecipients.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, to_email: qr.email, to_name: qr.name }))}
                  style={{
                    padding: '0.3rem 0.7rem',
                    background: 'var(--color-off-white)',
                    border: '1px solid var(--color-light-gray)',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,153,46,0.1)'; e.currentTarget.style.borderColor = 'var(--color-gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-off-white)'; e.currentTarget.style.borderColor = 'var(--color-light-gray)' }}
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <form onSubmit={sendEmail}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>To Email <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  type="email" 
                  value={form.to_email} 
                  onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} 
                  required 
                  placeholder="customer@example.com"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Recipient Name (Optional)</label>
                <input 
                  value={form.to_name} 
                  onChange={e => setForm(f => ({ ...f, to_name: e.target.value }))} 
                  placeholder="Customer name"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Subject <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  value={form.subject} 
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} 
                  required 
                  placeholder="Email subject"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Email Type</label>
                <select 
                  value={form.inquiry_type} 
                  onChange={e => setForm(f => ({ ...f, inquiry_type: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                >
                  {emailTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Message <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <textarea 
                  rows={8}
                  value={form.body} 
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))} 
                  required 
                  placeholder="Type your message here..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <button type="submit" disabled={sending} style={{
                width: '100%',
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
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {sending ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Sending…</>
                ) : (
                  <><i className="bi bi-send"></i> Send Email</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Logs Section */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-clock-history" style={{ color: 'var(--color-gold)' }}></i> Recent Sent Emails
            </h4>
          </div>
          <div>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="bi bi-envelope" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }}></i>
                <p style={{ color: 'var(--color-mid-gray)' }}>No emails sent yet.</p>
              </div>
            ) : (
              <div>
                {logs.slice(0, 10).map(l => (
                  <div 
                    key={l.id} 
                    onClick={() => openDetail(l)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid var(--color-light-gray)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-off-white)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.subject}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.15rem' }}>
                        {l.to_email} · {new Date(l.sent_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.15rem 0.5rem',
                      background: l.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: l.success ? '#22c55e' : '#ef4444',
                      border: `1px solid ${l.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {l.success ? 'Sent' : 'Failed'}
                    </span>
                  </div>
                ))}
                {logs.length > 10 && (
                  <div style={{ textAlign: 'center', padding: '0.875rem 1rem', borderBottom: 'none' }}>
                    <button 
                      onClick={() => window.location.href = '/staff/email-logs'}
                      style={{
                        padding: '0.3rem 0.7rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-navy)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
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
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-envelope"></i> Email Details</>}>
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>To</div>
              <div>
                {selectedLog.to_name && <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{selectedLog.to_name}</div>}
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedLog.to_email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Subject</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedLog.subject}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Type</div>
              <div>
                <span style={{
                  display: 'inline-flex',
                  padding: '0.15rem 0.5rem',
                  background: 'rgba(100,116,139,0.1)',
                  color: 'var(--color-mid-gray)',
                  border: '1px solid rgba(100,116,139,0.2)',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 600
                }}>
                  {selectedLog.inquiry_type || 'general'}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Sent</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selectedLog.sent_at)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.6rem',
                  background: selectedLog.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: selectedLog.success ? '#22c55e' : '#ef4444',
                  border: `1px solid ${selectedLog.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {selectedLog.success ? 'Delivered' : 'Failed'}
                </span>
                {selectedLog.error_message && (
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    {selectedLog.error_message}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Message</div>
              <div>
                <div style={{
                  padding: '0.75rem',
                  background: 'var(--color-off-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: 'var(--color-dark-gray)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {selectedLog.body || 'No message content'}
                </div>
              </div>
            </div>
            {selectedLog.sent_by && (
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Sent By</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedLog.sent_by}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}