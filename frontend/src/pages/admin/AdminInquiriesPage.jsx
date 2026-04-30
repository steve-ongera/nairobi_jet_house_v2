// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN INQUIRIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['new', 'read', 'replied', 'archived']
const STATUS_COLOR = {
  new: 'new',
  read: 'gray',
  replied: 'replied',
  archived: 'archived'
}

function Badge({ s }) {
  const colorClass = STATUS_COLOR[s] || 'gray'
  return <span className={`badge badge-${colorClass}`}>{s}</span>
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

export function AdminInquiriesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('contacts')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [replyModal, setReplyModal] = useState(false)
  const [replyForm, setReplyForm] = useState({ subject: '', message: '', send_email: true })
  const [sending, setSending] = useState(false)
  const [replyErr, setReplyErr] = useState('')
  const [stats, setStats] = useState({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminAPI.inquiries()
      const inquiriesData = response?.data || response
      setData(inquiriesData)
      
      // Calculate stats
      const calculateStats = (items) => {
        if (!items) return { total: 0, new: 0, replied: 0 }
        return {
          total: items.length,
          new: items.filter(i => i.status === 'new').length,
          replied: items.filter(i => i.status === 'replied').length
        }
      }
      
      setStats({
        contacts: calculateStats(inquiriesData?.contacts),
        leases: calculateStats(inquiriesData?.leases),
        groups: calculateStats(inquiriesData?.groups),
        cargo: calculateStats(inquiriesData?.cargo),
        sales: calculateStats(inquiriesData?.sales),
        flights: calculateStats(inquiriesData?.flights)
      })
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
    { key: 'contacts', label: 'Contact Forms', icon: 'bi-envelope', count: stats.contacts?.total || 0, newCount: stats.contacts?.new || 0 },
    { key: 'leases', label: 'Lease Inquiries', icon: 'bi-file-earmark', count: stats.leases?.total || 0, newCount: stats.leases?.new || 0 },
    { key: 'groups', label: 'Group Charters', icon: 'bi-people', count: stats.groups?.total || 0, newCount: stats.groups?.new || 0 },
    { key: 'cargo', label: 'Air Cargo', icon: 'bi-boxes', count: stats.cargo?.total || 0, newCount: stats.cargo?.new || 0 },
    { key: 'sales', label: 'Aircraft Sales', icon: 'bi-shop', count: stats.sales?.total || 0, newCount: stats.sales?.new || 0 },
    { key: 'flights', label: 'Flight Inquiries', icon: 'bi-airplane', count: stats.flights?.total || 0, newCount: stats.flights?.new || 0 },
  ]

  const openReplyModal = (inquiry, type) => {
    setSelectedInquiry({ ...inquiry, type })
    setReplyForm({ 
      subject: `Re: Your ${type.replace(/_/g, ' ')} inquiry`, 
      message: '', 
      send_email: true 
    })
    setReplyErr('')
    setReplyModal(true)
  }

  const sendReply = async (e) => {
    e.preventDefault()
    setSending(true)
    setReplyErr('')
    try {
      await adminAPI.sendEmail({
        to: selectedInquiry.email || selectedInquiry.guest_email,
        subject: replyForm.subject,
        message: replyForm.message,
        inquiry_id: selectedInquiry.id,
        inquiry_type: selectedInquiry.type
      })
      await loadData() // Refresh to update status
      setReplyModal(false)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to send reply'
      setReplyErr(msg)
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

  const quickReplies = [
    { label: 'Thank you', message: 'Thank you for your inquiry. We have received your message and will get back to you within 24 hours.' },
    { label: 'Request more info', message: 'Thank you for your interest. Could you please provide more details about your requirements so we can assist you better?' },
    { label: 'Schedule call', message: 'We would love to discuss this further. Would you be available for a quick call this week? Please let us know your preferred time.' },
    { label: 'Send brochure', message: 'Thank you for your interest. I have attached our latest brochure for your reference. Please let me know if you have any questions.' },
  ]

  const getInquiryDetails = (item, type) => {
    switch (type) {
      case 'cargo':
        return [
          { label: 'Cargo Type', value: item.cargo_type || '—' },
          { label: 'Weight', value: item.weight_kg ? `${item.weight_kg} kg` : '—' },
          { label: 'Origin', value: item.origin || '—' },
          { label: 'Destination', value: item.destination || '—' },
          { label: 'Expected Date', value: item.expected_date || '—' }
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
          { label: 'Purchase Timeline', value: item.timeline || '—' }
        ]
      case 'groups':
      case 'charters':
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
      <div key={item.id} className={`inquiry-card ${isNew ? 'new' : ''} ${item.status === 'read' ? 'read' : ''}`}>
        <div className="inquiry-header">
          <div className="inquiry-avatar">
            <i className="bi bi-person" />
          </div>
          <div className="inquiry-info">
            <div className="inquiry-name">
              {name}
              <span className="inquiry-type-badge">
                <i className={`bi ${TABS.find(t => t.key === type)?.icon}`} />
                {type.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="inquiry-meta">
              <span className="inquiry-meta-item">
                <i className="bi bi-envelope" /> {email}
              </span>
              <span className="inquiry-meta-item">
                <i className="bi bi-clock" /> {formatDate(item.created_at)}
              </span>
              {item.phone && (
                <span className="inquiry-meta-item">
                  <i className="bi bi-telephone" /> {item.phone}
                </span>
              )}
            </div>
          </div>
          <Badge s={item.status || 'new'} />
        </div>
        
        <div className="inquiry-body">
          <div className="inquiry-message">
            {message}
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
        
        <div className="inquiry-actions">
          <button 
            className="btn btn-navy btn-sm" 
            onClick={() => openReplyModal(item, type)}
          >
            <i className="bi bi-reply" /> Reply
          </button>
          <button 
            className="btn btn-outline-navy btn-sm" 
            onClick={() => window.open(`mailto:${email}`)}
          >
            <i className="bi bi-envelope" /> External Email
          </button>
        </div>
      </div>
    )
  }

  const currentItems = data && tab ? data[tab] || [] : []
  const currentTab = TABS.find(t => t.key === tab)

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Inquiries</h2>
          <p>Manage all incoming customer inquiries across all channels</p>
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
          <div className="inquiry-stat-number">{stats.contacts?.total || 0}</div>
          <div className="inquiry-stat-label">Total Inquiries</div>
        </div>
        <div className="inquiry-stat-card">
          <div className="inquiry-stat-number" style={{ color: 'var(--gold)' }}>
            {stats.contacts?.new || 0}
          </div>
          <div className="inquiry-stat-label">Unread / New</div>
        </div>
        <div className="inquiry-stat-card">
          <div className="inquiry-stat-number">{stats.contacts?.replied || 0}</div>
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
            {t.newCount > 0 && (
              <span className="badge badge-new" style={{ marginLeft: 4, fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                +{t.newCount}
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
            {currentItems.filter(i => i.status === 'new').length > 0 && 
              ` · ${currentItems.filter(i => i.status === 'new').length} unread`}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <Modal open={replyModal} onClose={() => setReplyModal(false)} title={<><i className="bi bi-reply" /> Reply to Inquiry</>}>
        {selectedInquiry && (
          <form onSubmit={sendReply}>
            {replyErr && (
              <div className="alert alert-error">
                <i className="bi bi-exclamation-triangle" />
                <span>{replyErr}</span>
              </div>
            )}
            
            <div className="reply-preview">
              <div className="reply-preview-header">Replying to:</div>
              <div><strong>{selectedInquiry.full_name || selectedInquiry.guest_name || selectedInquiry.name}</strong></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {selectedInquiry.email || selectedInquiry.guest_email}
              </div>
            </div>

            <div className="quick-replies">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-reply-btn"
                  onClick={() => setReplyForm(f => ({ ...f, message: qr.message }))}
                >
                  {qr.label}
                </button>
              ))}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
              <input 
                type="checkbox" 
                id="send_email_reply" 
                checked={replyForm.send_email} 
                onChange={e => setReplyForm(f => ({ ...f, send_email: e.target.checked }))} 
              />
              <label htmlFor="send_email_reply" style={{ fontSize: '0.84rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
                Send email notification to customer
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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

export default AdminInquiriesPage