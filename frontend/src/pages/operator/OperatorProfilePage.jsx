// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR PROFILE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="dash-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        <div className="dash-header-left">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  )
}

export function OperatorProfilePage() {
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
      email: 'ops@nairobijethouse.com',
      subject: 'Payout Query'
    },
    { 
      title: 'Submit Documents', 
      icon: 'bi-file-earmark-text',
      email: 'ops@nairobijethouse.com',
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
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Profile</h2>
          <p>Manage your company profile and view client feedback</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadReviews}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Company Details Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-building" /> Company Details</h4>
          </div>
          <div className="settings-card-body">
            <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <i className="bi bi-info-circle" />
              <div>
                Your company profile is managed by the NJH admin team. Contact{' '}
                <a href="mailto:partners@nairobijethouse.com" style={{ color: 'var(--gold)' }}>
                  partners@nairobijethouse.com
                </a>{' '}
                to update your company details.
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-item-label">Operator Name</span>
              <span className="detail-item-value">{user?.company || user?.name || '—'}</span>
            </div>
            
            {companyDetails.map(detail => (
              <div key={detail.label} className="detail-item">
                <span className="detail-item-label">{detail.label}</span>
                <span className="detail-item-value">
                  <span className={`badge badge-${detail.status === 'success' ? 'green' : 'info'}`}>
                    {detail.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-lightning" /> Quick Actions</h4>
          </div>
          <div className="settings-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quickActions.map(action => (
                <a
                  key={action.title}
                  href={`mailto:${action.email}?subject=${encodeURIComponent(action.subject)}`}
                  className="quick-action-link"
                >
                  <i className={`bi ${action.icon}`} />
                  {action.title}
                  <i className="bi bi-arrow-right" style={{ marginLeft: 'auto', fontSize: '0.8rem' }} />
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
          <div className="payout-summary" style={{ marginBottom: '1rem' }}>
            <div className="payout-summary-item">
              <div className="payout-summary-label">Total Reviews</div>
              <div className="payout-summary-value">{stats.total}</div>
            </div>
            <div className="payout-summary-item">
              <div className="payout-summary-label">Average Rating</div>
              <div className="payout-summary-value" style={{ color: 'var(--gold)' }}>
                {stats.averageRating} ★
              </div>
            </div>
            <div className="payout-summary-item">
              <div className="payout-summary-label">Published</div>
              <div className="payout-summary-value">{stats.published}</div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="table-empty">
            <i className="bi bi-star" />
            <p>No reviews yet. Reviews appear here after clients rate completed bookings.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`bi bi-star${star <= (r.rating_overall || 0) ? '-fill' : ''}`}
                        style={{ color: star <= (r.rating_overall || 0) ? 'var(--gold)' : 'var(--gray-300)' }}
                      />
                    ))}
                  </div>
                  <span className="review-date">{formatDate(r.created_at)}</span>
                </div>
                <p className="review-comment">{r.comment || 'No comment provided.'}</p>
                <div className="review-footer">
                  <span className="review-author">— {r.reviewer_name || 'Anonymous'}</span>
                  {!r.is_published && (
                    <span className="badge badge-amber">Pending Moderation</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Support Contact */}
      <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
        <i className="bi bi-headset" />
        <div>
          <strong>Need help?</strong> Contact our operator support team at{' '}
          <a href="mailto:partners@nairobijethouse.com" style={{ color: 'var(--gold)' }}>
            partners@nairobijethouse.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default OperatorProfilePage