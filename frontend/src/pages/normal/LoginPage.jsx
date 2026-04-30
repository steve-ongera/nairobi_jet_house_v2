import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

export default function LoginPage() {
  const auth = useAuth()          // guard against undefined hook
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

    // Safety check — if hook isn't wired up yet, show a clear error
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
      // Axios wraps the response — errors come from err.response.data
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
    <div>
      <PublicNavbar />
      <div style={{
        minHeight: '100vh',
        background: 'var(--off-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1rem 3rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'var(--navy)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.4rem',
              color: 'var(--gold)',
            }}>
              <i className="bi bi-airplane-fill" />
            </div>
            <h2 style={{ marginBottom: '0.25rem' }}>Welcome back</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Sign in to your NairobiJetHouse account
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--gray-100)',
          }}>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <i className="bi bi-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Username <span className="req">*</span>
                </label>
                <input
                  className="form-control"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  placeholder="your_username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Password <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--gray-400)',
                    }}
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi bi-eye${show ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-navy btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }} />
                    &nbsp;Signing in…
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" /> Sign In
                  </>
                )}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.84rem',
              color: 'var(--gray-400)',
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>
                Create one
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/track" style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
              <i className="bi bi-search" /> Track a booking without signing in
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
