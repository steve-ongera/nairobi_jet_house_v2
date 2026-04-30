import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <p style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '8rem', color: 'rgba(201,168,76,0.15)', margin: 0, lineHeight: 1, letterSpacing: '-4px' }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2rem', margin: '-1rem 0 1rem', color: '#fff' }}>Page Not Found</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '2rem' }}>
          This flight path doesn't exist. The page you're looking for may have moved, been removed, or the URL may be incorrect.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)}
            style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
            ← Go Back
          </button>
          <Link to="/" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--gold, #C9A84C)', color: 'var(--navy, #0B1D3A)', borderRadius: '4px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
            Return Home
          </Link>
        </div>
        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['Book a Flight', '/book-flight'], ['Track Booking', '/track'], ['Contact Us', '/contact']].map(([label, path]) => (
            <Link key={path} to={path} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}