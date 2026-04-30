import { useState, useEffect } from 'react';
import { operatorAPI } from '../../services/api';

const COMPANY_DETAILS = [
  ['AOC Status',     'Verified ✓'],
  ['Insurance',      'Valid'],
  ['ARGUS Rating',   'Platinum'],
  ['Payment Terms',  '7 days post-completion'],
];

export function OperatorProfilePage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    operatorAPI.reviews()
      .then(r => setReviews(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={pageTitle}>Operator Profile</h1>

      {/* ── Info Grid ── */}
      <div style={profileGrid}>
        {/* Company details */}
        <div style={profileCard}>
          <h3 style={cardTitle}>Company Details</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '1rem' }}>
            Your company profile is managed by the NJH admin team. Contact{' '}
            <a href="mailto:partners@nairobijethouse.com" style={{ color: 'var(--gold,#C9A84C)' }}>
              partners@nairobijethouse.com
            </a>{' '}
            to update your company name, registration, contact details, banking information, or safety certifications.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {COMPANY_DETAILS.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                <span style={{ color: '#81c784' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={profileCard}>
          <h3 style={cardTitle}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href="mailto:partners@nairobijethouse.com?subject=Profile Update Request"
              style={{ ...outlineBtn, textAlign: 'center', textDecoration: 'none' }}
            >
              Request Profile Update
            </a>
            <a
              href="mailto:ops@nairobijethouse.com?subject=Payout Query"
              style={{ ...outlineBtn, textAlign: 'center', textDecoration: 'none' }}
            >
              Payout Query
            </a>
            <a
              href="mailto:ops@nairobijethouse.com?subject=Document Submission"
              style={{ ...outlineBtn, textAlign: 'center', textDecoration: 'none' }}
            >
              Submit Documents
            </a>
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <Section title="Client Reviews">
        {loading ? (
          <p style={muted}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={muted}>No reviews yet. Reviews appear here after clients rate completed bookings.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} style={{ ...rowCard, flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < r.rating_overall ? 'var(--gold,#C9A84C)' : 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>
                    ★
                  </span>
                ))}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {r.created_at?.slice(0, 10)}
                </span>
              </div>

              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                {r.comment || 'No comment.'}
              </p>
              <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
                — {r.reviewer_name}
              </p>
              {!r.is_published && (
                <span style={{ marginTop: '0.5rem', color: '#ffb74d', fontSize: '0.75rem' }}>
                  Pending moderation
                </span>
              )}
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

/* ── Sub-components ── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ── Styles ── */
const pageStyle  = { padding: '2rem', color: '#fff', minHeight: '100vh' };
const pageTitle  = { fontFamily: 'var(--font-display,Georgia,serif)', color: 'var(--gold,#C9A84C)', fontSize: '1.6rem', marginBottom: '1.5rem' };
const muted      = { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' };
const profileGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' };
const profileCard = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' };
const cardTitle  = { color: 'var(--gold,#C9A84C)', marginBottom: '1rem', fontSize: '0.95rem' };
const rowCard    = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' };
const outlineBtn = { padding: '0.5rem 1.1rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'block' };