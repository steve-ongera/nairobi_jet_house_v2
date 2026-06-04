// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR PROFILE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function OperatorProfilePage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.reviews()
      const data = response?.data?.results || response?.data || response || []
      setReviews(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const companyDetails = [
    { label: 'AOC Status', value: 'Verified', status: 'success' },
    { label: 'Insurance', value: 'Valid', status: 'success' },
    { label: 'ARGUS Rating', value: 'Platinum', status: 'success' },
    { label: 'Payment Terms', value: '7 days post-completion', status: 'info' },
  ]

  const quickActions = [
    { 
      title: 'Request Profile Update', 
      icon: 'bi-pencil-square',
      email: 'partners@nairobijethouse.com',
      subject: 'Profile Update Request'
    },
    { 
      title: 'Payout Query', 
      icon: 'bi-cash-stack',
      email: 'nairobijethouse@gmail.com',
      subject: 'Payout Query'
    },
    { 
      title: 'Submit Documents', 
      icon: 'bi-file-earmark-text',
      email: 'nairobijethouse@gmail.com',
      subject: 'Document Submission'
    },
  ]

  const stats = {
    total: reviews.length,
    published: reviews.filter(r => r.is_published).length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating_overall || 0), 0) / reviews.length).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading profile...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Profile</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage your company profile and view client feedback</p>
        </div>
        <button onClick={loadReviews} style={{
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

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Company Details Card */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-building" style={{ color: 'var(--color-gold)' }}></i> Company Details
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem 1rem', 
              background: 'rgba(15,92,164,0.08)', 
              border: '1px solid rgba(15,92,164,0.22)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: 'var(--color-info)'
            }}>
              <i className="bi bi-info-circle" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
              <div>
                Your company profile is managed by the NJH admin team. Contact{' '}
                <a href="mailto:partners@nairobijethouse.com" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
                  partners@nairobijethouse.com
                </a>{' '}
                to update your company details.
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Operator Name</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{user?.company || user?.name || '—'}</span>
            </div>
            
            {companyDetails.map(detail => (
              <div key={detail.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>{detail.label}</span>
                <span style={{ fontSize: '0.8rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.15rem 0.5rem',
                    background: detail.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(15,92,164,0.1)',
                    color: detail.status === 'success' ? '#22c55e' : 'var(--color-info)',
                    border: `1px solid ${detail.status === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(15,92,164,0.22)'}`,
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    {detail.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-lightning" style={{ color: 'var(--color-gold)' }}></i> Quick Actions
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quickActions.map(action => (
                <a
                  key={action.title}
                  href={`mailto:${action.email}?subject=${encodeURIComponent(action.subject)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--color-off-white)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--color-navy)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,153,46,0.08)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-off-white)'; e.currentTarget.style.color = 'var(--color-navy)' }}
                >
                  <i className={`bi ${action.icon}`} style={{ fontSize: '1rem' }}></i>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{action.title}</span>
                  <i className="bi bi-arrow-right" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <Section title="Client Reviews">
        {/* Review Stats */}
        {reviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Reviews</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Average Rating</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c9992e' }}>{stats.averageRating} ★</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Published</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.published}</div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
            <i className="bi bi-star" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--color-mid-gray)' }}>No reviews yet. Reviews appear here after clients rate completed bookings.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: '10px',
                padding: '1.25rem',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.15rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`bi bi-star${star <= (r.rating_overall || 0) ? '-fill' : ''}`}
                        style={{ color: star <= (r.rating_overall || 0) ? '#c9992e' : 'var(--color-light-gray)', fontSize: '0.9rem' }}
                      ></i>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{formatDate(r.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-dark-gray)', marginBottom: '0.75rem' }}>
                  {r.comment || 'No comment provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>— {r.reviewer_name || 'Anonymous'}</span>
                  {!r.is_published && (
                    <span style={{
                      display: 'inline-flex',
                      padding: '0.15rem 0.5rem',
                      background: 'rgba(245,158,11,0.1)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}>
                      Pending Moderation
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Support Contact */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem 1rem', 
        background: 'rgba(15,92,164,0.08)', 
        border: '1px solid rgba(15,92,164,0.22)', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--color-info)'
      }}>
        <i className="bi bi-headset" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Need help?</strong> Contact our operator support team at{' '}
          <a href="mailto:partners@nairobijethouse.com" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
            partners@nairobijethouse.com
          </a>
        </div>
      </div>
    </div>
  )
}