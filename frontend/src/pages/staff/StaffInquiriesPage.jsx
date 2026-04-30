// ═══════════════════════════════════════════════════════════════════════════════
// STAFF INQUIRIES PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_COLOR = {
  new: 'new',
  read: 'gray',
  replied: 'replied',
  archived: 'archived'
}

function Badge({ s }) {
  const colorClass = STATUS_COLOR[s] || 'gray'
  const displayText = s || 'new'
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal reply-modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function StaffInquiriesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('contacts')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [replyModal, setReplyModal] = useState(false)
  const [replyForm, setReplyForm] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminAPI.inquiries()
      const inquiriesData = response?.data || response
      setData(inquiriesData)
    } catch (err) {
      console.error('Failed to load inquiries:', err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const TABS = [
    { key: 'contacts', label: 'Contact Forms', icon: 'bi-envelope', count: data?.contacts?.length || 0 },
    { key: 'leases', label: 'Lease Inquiries', icon: 'bi-file-earmark', count: data?.leases?.length || 0 },
    { key: 'groups', label: 'Group Charters', icon: 'bi-people', count: data?.groups?.length || 0 },
    { key: 'cargo', label: 'Air Cargo', icon: 'bi-boxes', count: data?.cargo?.length || 0 },
    { key: 'sales', label: 'Aircraft Sales', icon: 'bi-shop', count: data?.sales?.length || 0 },
  ]

  const openDetail = (inquiry) => {
    setSelectedInquiry(inquiry)
    setDetailModal(true)
  }

  const openReply = (inquiry) => {
    setSelectedInquiry(inquiry)
    setReplyForm({ 
      subject: `Re: Your inquiry`, 
      message: '' 
    })
    setReplyModal(true)
  }

  const sendReply = async (e) => {
    e.preventDefault()
    setSending(true)
    setMessage({ text: '', type: '' })
    try {
      await adminAPI.sendEmail({
        to: selectedInquiry.email || selectedInquiry.guest_email,
        subject: replyForm.subject,
        message: replyForm.message,
        inquiry_id: selectedInquiry.id,
        inquiry_type: tab
      })
      setMessage({ text: 'Reply sent successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      setReplyModal(false)
      await loadData()
    } catch (err) {
      setMessage({ text: 'Failed to send reply.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getInquiryDetails = (item, type) => {
    switch (type) {
      case 'cargo':
        return [
          { label: 'Cargo Type', value: item.cargo_type || '—' },
          { label: 'Weight', value: item.weight_kg ? `${item.weight_kg} kg` : '—' },
          { label: 'Origin', value: item.origin || '—' },
          { label: 'Destination', value: item.destination || '—' }
        ]
      case 'leases':
        return [
          { label: 'Aircraft Type', value: item.aircraft_type || '—' },
          { label: 'Lease Duration', value: item.lease_duration || '—' },
          { label: 'Start Date', value: item.start_date || '—' }
        ]
      case 'sales':
        return [
          { label: 'Aircraft Type', value: item.aircraft_type || '—' },
          { label: 'Budget Range', value: item.budget_range || '—' },
          { label: 'Timeline', value: item.timeline || '—' }
        ]
      case 'groups':
        return [
          { label: 'Group Size', value: item.group_size || '—' },
          { label: 'Destination', value: item.destination || '—' },
          { label: 'Preferred Dates', value: item.preferred_dates || '—' }
        ]
      default:
        return []
    }
  }

  const renderItem = (item, type) => {
    const name = item.full_name || item.guest_name || item.contact_name || item.name || '—'
    const email = item.email || item.guest_email || '—'
    const message = item.message || item.cargo_description || item.usage_description || item.additional_notes || item.inquiry || '—'
    const isNew = item.status === 'new'
    const details = getInquiryDetails(item, type)

    return (
      <div key={item.id} className={`inquiry-card ${isNew ? 'new' : ''}`} onClick={() => openDetail(item)}>
        <div className="inquiry-header">
          <div className="inquiry-avatar">
            <i className="bi bi-person" />
          </div>
          <div className="inquiry-info">
            <div className="inquiry-name">{name}</div>
            <div className="inquiry-meta">
              <span className="inquiry-meta-item">
                <i className="bi bi-envelope" /> {email}
              </span>
              <span className="inquiry-meta-item">
                <i className="bi bi-clock" /> {formatDate(item.created_at)}
              </span>
            </div>
          </div>
          <Badge s={item.status || 'new'} />
        </div>
        
        <div className="inquiry-body">
          <div className="inquiry-message">
            {message.length > 200 ? `${message.substring(0, 200)}...` : message}
          </div>
          
          {details.length > 0 && (
            <div className="inquiry-details">
              {details.map(detail => (
                <div key={detail.label} className="inquiry-detail-item">
                  <span className="inquiry-detail-label">{detail.label}</span>
                  <span className="inquiry-detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="inquiry-actions" onClick={e => e.stopPropagation()}>
          <button 
            className="btn btn-navy btn-sm" 
            onClick={() => openReply(item)}
          >
            <i className="bi bi-reply" /> Reply
          </button>
          <button 
            className="btn btn-outline-navy btn-sm" 
            onClick={() => window.open(`mailto:${email}`)}
          >
            <i className="bi bi-envelope" /> External
          </button>
        </div>
      </div>
    )
  }

  const currentItems = data && tab ? data[tab] || [] : []
  const currentTab = TABS.find(t => t.key === tab)
  const newCount = currentItems.filter(i => i.status === 'new').length

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Inquiries</h2>
          <p>View and respond to customer inquiries</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadData}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="inquiry-stats">
        <div className="inquiry-stat-card">
          <div className="inquiry-stat-number">{currentItems.length}</div>
          <div className="inquiry-stat-label">Total</div>
        </div>
        <div className="inquiry-stat-card">
          <div className="inquiry-stat-number" style={{ color: 'var(--gold)' }}>{newCount}</div>
          <div className="inquiry-stat-label">Unread / New</div>
        </div>
        <div className="inquiry-stat-card">
          <div className="inquiry-stat-number">{currentItems.filter(i => i.status === 'replied').length}</div>
          <div className="inquiry-stat-label">Replied</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map(t => (
          <button 
            key={t.key} 
            className={`tab-btn${tab === t.key ? ' active' : ''}`} 
            onClick={() => setTab(t.key)}
          >
            <i className={`bi ${t.icon}`} /> 
            {t.label}
            {t.count > 0 && (
              <span className="badge badge-gray" style={{ marginLeft: 4 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading inquiries...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="table-empty">
          <i className="bi bi-inbox" />
          <p>No {tab.replace(/_/g, ' ')} found.</p>
        </div>
      ) : (
        <div>
          {currentItems.map(item => renderItem(item, tab))}
          
          {/* Footer stats */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.75rem 1rem', 
            fontSize: '0.8rem', 
            color: 'var(--gray-400)',
            textAlign: 'center',
            borderTop: '1px solid var(--gray-100)'
          }}>
            Showing {currentItems.length} {tab.replace(/_/g, ' ')} 
            {newCount > 0 && ` · ${newCount} unread`}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Inquiry Details">
        {selectedInquiry && (
          <div>
            <div className="detail-row">
              <div className="detail-key">From</div>
              <div className="detail-val">
                <strong>{selectedInquiry.full_name || selectedInquiry.guest_name || selectedInquiry.name}</strong><br />
                {selectedInquiry.email || selectedInquiry.guest_email}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Received</div>
              <div className="detail-val">{new Date(selectedInquiry.created_at).toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val"><Badge s={selectedInquiry.status || 'new'} /></div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Message</div>
              <div className="detail-val" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message || selectedInquiry.cargo_description || selectedInquiry.usage_description || '—'}
              </div>
            </div>
            <div className="detail-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <div className="detail-key">Quick Actions</div>
              <div className="detail-val">
                <button 
                  className="btn btn-navy btn-sm"
                  onClick={() => {
                    setDetailModal(false)
                    openReply(selectedInquiry)
                  }}
                >
                  <i className="bi bi-reply" /> Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal open={replyModal} onClose={() => setReplyModal(false)} title={<><i className="bi bi-reply" /> Reply to Inquiry</>}>
        {selectedInquiry && (
          <form onSubmit={sendReply}>
            {message.text && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
                <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
                <span>{message.text}</span>
              </div>
            )}
            
            <div className="reply-preview">
              <div className="reply-preview-header">Replying to:</div>
              <div><strong>{selectedInquiry.full_name || selectedInquiry.guest_name || selectedInquiry.name}</strong></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {selectedInquiry.email || selectedInquiry.guest_email}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Subject</label>
              <input 
                className="form-control" 
                value={replyForm.subject} 
                onChange={e => setReplyForm(f => ({ ...f, subject: e.target.value }))} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Message</label>
              <textarea 
                className="form-control" 
                rows={6}
                value={replyForm.message} 
                onChange={e => setReplyForm(f => ({ ...f, message: e.target.value }))} 
                placeholder="Type your reply here..."
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setReplyModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-navy" disabled={sending}>
                {sending ? (
                  <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                ) : (
                  <><i className="bi bi-send" /> Send Reply</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default StaffInquiriesPage