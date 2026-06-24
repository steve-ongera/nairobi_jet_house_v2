import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../hooks/useAuth'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'

const PORTAL = {
  admin:    '/admin',
  staff:    '/staff',
  client:   '/member',
  owner:    '/owner',
  operator: '/operator',
}

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Login | NairobiJetHouse',
  description: 'Sign in to your NairobiJetHouse account to manage bookings, access membership benefits, and more.',
}

export default function LoginPage() {
  const auth = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [show, setShow]       = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()

    if (!auth?.login) {
      setError('Authentication is not configured. Please check useAuth.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await auth.login(form.username, form.password)
      navigate(from || PORTAL[user?.role] || '/')
    } catch (err) {
      const data = err?.response?.data
      const msg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.username?.[0] ||
        data?.password?.[0] ||
        (typeof data === 'string' ? data : null) ||
        'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login | NairobiJetHouse - Sign In to Your Account</title>
        <meta name="description" content="Sign in to your NairobiJetHouse account to manage bookings, access membership benefits, and more." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/login" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />
      
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">

            {/* Header */}
            <div className="login-header">
              <img
                src="/nairobijethouse.png"
                alt="Nairobi Jet House"
                className="login-logo"
              />
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your NairobiJetHouse account</p>
            </div>

            {/* Form */}
            <div className="login-form-wrapper">
              {error && (
                <div className="alert-error login-error">
                  <i className="bi bi-exclamation-triangle" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label-gov">
                    Username <span className="required">*</span>
                  </label>
                  <input
                    className="form-input-gov"
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    placeholder="your_username"
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-gov">
                    Password <span className="required">*</span>
                  </label>
                  <div className="login-password-wrapper">
                    <input
                      className="form-input-gov login-password-input"
                      type={show ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShow(s => !s)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-eye${show ? '-slash' : ''}`} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary-gov btn-full login-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                      &nbsp; Signing in…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right" /> Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="login-register-link">
                Don't have an account?{' '}
                <Link to="/register">Create one</Link>
              </div>
            </div>

            <div className="login-track-link">
              <Link to="/track">
                <i className="bi bi-search" /> Track a booking without signing in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        /* Login Page Styles - Border radius 8-10px */
        .login-page {
          min-height: 100vh;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          min-height: calc(100vh - 80px);
        }
        .login-container {
          width: 100%;
          max-width: 420px;
        }
        .login-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: 5px;
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          height: 6rem;
          width: auto;
          margin: 0 auto 1rem;
          display: block;
        }
        .login-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        .login-subtitle {
          font-size: 0.875rem;
          color: var(--color-mid-gray);
        }
        .login-form-wrapper {
          margin-bottom: 1.25rem;
        }
        .login-error {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }
        .login-password-wrapper {
          position: relative;
        }
        .login-password-input {
          padding-right: 2.5rem;
        }
        .login-password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-mid-gray);
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .login-password-toggle:hover {
          color: var(--color-navy);
        }
        .login-submit {
          width: 100%;
          justify-content: center;
          border-radius: 8px;
        }
        .login-register-link {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.84rem;
          color: var(--color-mid-gray);
        }
        .login-register-link a {
          color: var(--color-navy);
          font-weight: 600;
          text-decoration: none;
        }
        .login-register-link a:hover {
          color: var(--color-gold);
        }
        .login-track-link {
          text-align: center;
          margin-top: 1rem;
        }
        .login-track-link a {
          font-size: 0.82rem;
          color: var(--color-mid-gray);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .login-track-link a:hover {
          color: var(--color-gold);
        }
        .login-track-link a i {
          font-size: 0.8rem;
        }

        /* Form overrides */
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group:last-of-type {
          margin-bottom: 1.5rem;
        }
        .form-label-gov {
          display: block;
          font-family: var(--font-label);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.4rem;
        }
        .form-label-gov .required {
          color: var(--color-error);
          margin-left: 2px;
        }
        .form-input-gov {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid var(--color-light-gray);
          font-family: var(--font-body);
          font-size: 0.93rem;
          color: var(--color-charcoal);
          background: var(--color-white);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
          border-radius: 8px;
        }
        .form-input-gov:focus {
          border-color: var(--color-navy);
          box-shadow: 0 0 0 3px rgba(15,45,94,0.1);
        }
        .btn-primary-gov {
          background: var(--color-navy);
          color: var(--color-white);
          border: 1.5px solid var(--color-navy);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.72rem 1.9rem;
          font-family: var(--font-label);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
          border-radius: 8px;
        }
        .btn-primary-gov:hover:not(:disabled) {
          background: var(--color-navy-mid);
          border-color: var(--color-navy-mid);
          color: var(--color-gold-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .btn-primary-gov:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .btn-full {
          width: 100%;
          justify-content: center;
        }
        .spinner-gov {
          width: 16px;
          height: 16px;
          border: 2px solid var(--color-light-gray);
          border-top-color: var(--color-navy);
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.6s linear infinite;
        }
        .spinner-sm {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .alert-error {
          background: var(--color-error-bg);
          border: 1px solid rgba(192,57,43,0.25);
          color: var(--color-error);
          border-radius: 8px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem;
          }
          .login-title {
            font-size: 1.1rem;
          }
          .login-logo {
            height: 2.5rem;
          }
          .btn-primary-gov {
            padding: 0.6rem 1.5rem;
            font-size: 0.85rem;
          }
          .form-input-gov {
            padding: 0.6rem 0.85rem;
            font-size: 0.88rem;
          }
        }
      `}</style>
    </>
  )
}