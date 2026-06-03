// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN INQUIRIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['new', 'read', 'replied', 'archived']
const STATUS_COLOR = {
  new: '#f59e0b',
  read: '#64748b',
  replied: '#22c55e',
  archived: '#9ca3af'
}
const STATUS_LABEL = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived'
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  )
}

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
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
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

export default function AdminInquiriesPage() {
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
      await loadData()
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
      <div key={item.id} style={{
        background: isNew ? 'rgba(245,158,11,0.03)' : 'var(--color-white)',
        border: `1px solid ${isNew ? 'rgba(245,158,11,0.3)' : 'var(--color-light-gray)'}`,
        borderRadius: '10px',
        marginBottom: '1rem',
        padding: '1.25rem',
        transition: 'all 0.2s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--color-off-white)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className="bi bi-person" style={{ color: 'var(--color-gold)', fontSize: '1.1rem' }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{name}</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.4rem',
                  background: 'var(--color-off-white)',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  color: 'var(--color-mid-gray)'
                }}>
                  <i className={`bi ${TABS.find(t => t.key === type)?.icon}`} style={{ fontSize: '0.6rem' }}></i>
                  {type.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className="bi bi-envelope"></i> {email}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className="bi bi-clock"></i> {formatDate(item.created_at)}
                </span>
                {item.phone && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-telephone"></i> {item.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge status={item.status || 'new'} />
        </div>
        
        {/* Message Body */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            background: 'var(--color-off-white)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'var(--color-dark-gray)'
          }}>
            {message}
          </div>
          
          {details.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {details.map(detail => (
                <div key={detail.label} style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{detail.label}:</span> {detail.value}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            style={{ padding: '0.4rem 0.8rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => openReplyModal(item, type)}
          >
            <i className="bi bi-reply"></i> Reply
          </button>
          <button 
            style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => window.open(`mailto:${email}`)}
          >
            <i className="bi bi-envelope"></i> External Email
          </button>
        </div>
      </div>
    )
  }

  const currentItems = data && tab ? data[tab] || [] : []
  const currentTab = TABS.find(t => t.key === tab)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Inquiries</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage all incoming customer inquiries across all channels</p>
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.contacts?.total || 0}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Inquiries</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gold)' }}>{stats.contacts?.new || 0}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Unread / New</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.contacts?.replied || 0}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Replied</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-light-gray)', paddingBottom: '0.5rem' }}>
        {TABS.map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: tab === t.key ? 'var(--color-navy)' : 'transparent',
              color: tab === t.key ? 'var(--color-white)' : 'var(--color-mid-gray)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`bi ${t.icon}`}></i> 
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: '0.25rem',
                padding: '0.1rem 0.3rem',
                background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'var(--color-off-white)',
                borderRadius: '4px',
                fontSize: '0.65rem'
              }}>
                {t.count}
              </span>
            )}
            {t.newCount > 0 && (
              <span style={{
                marginLeft: '0.25rem',
                padding: '0.1rem 0.3rem',
                background: '#f59e0b',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.6rem'
              }}>
                +{t.newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--color-mid-gray)' }}>Loading inquiries...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <p style={{ color: 'var(--color-mid-gray)' }}>No {tab.replace(/_/g, ' ')} found.</p>
        </div>
      ) : (
        <div>
          {currentItems.map(item => renderItem(item, tab))}
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.75rem', 
            fontSize: '0.8rem', 
            color: 'var(--color-mid-gray)',
            textAlign: 'center'
          }}>
            Showing {currentItems.length} {tab.replace(/_/g, ' ')} 
            {currentItems.filter(i => i.status === 'new').length > 0 && 
              ` · ${currentItems.filter(i => i.status === 'new').length} unread`}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <Modal open={replyModal} onClose={() => setReplyModal(false)} title={<><i className="bi bi-reply"></i> Reply to Inquiry</>}>
        {selectedInquiry && (
          <form onSubmit={sendReply}>
            {replyErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle"></i>
                <span>{replyErr}</span>
              </div>
            )}
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-off-white)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Replying to:</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{selectedInquiry.full_name || selectedInquiry.guest_name || selectedInquiry.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>{selectedInquiry.email || selectedInquiry.guest_email}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    padding: '0.3rem 0.6rem',
                    background: 'var(--color-off-white)',
                    border: '1px solid var(--color-light-gray)',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setReplyForm(f => ({ ...f, message: qr.message }))}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-off-white)'; e.currentTarget.style.color = 'inherit' }}
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Subject</label>
              <input 
                value={replyForm.subject} 
                onChange={e => setReplyForm(f => ({ ...f, subject: e.target.value }))} 
                required 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Message</label>
              <textarea 
                rows={6}
                value={replyForm.message} 
                onChange={e => setReplyForm(f => ({ ...f, message: e.target.value }))} 
                placeholder="Type your reply here..."
                required 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input 
                type="checkbox" 
                id="send_email_reply" 
                checked={replyForm.send_email} 
                onChange={e => setReplyForm(f => ({ ...f, send_email: e.target.checked }))} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="send_email_reply" style={{ fontSize: '0.84rem', color: 'var(--color-dark-gray)', cursor: 'pointer' }}>
                Send email notification to customer
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setReplyModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={sending} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {sending ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Sending…</>
                ) : (
                  <><i className="bi bi-send"></i> Send Reply</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}