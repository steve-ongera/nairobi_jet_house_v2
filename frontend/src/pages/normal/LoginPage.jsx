import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../hooks/useAuth'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import api from '../../services/api'

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

// ── OTP input: 3 digits, dash, 3 digits ──────────────────────────────────────
function OTPInput({ value, onChange }) {
  const digits  = value.replace(/\D/g, '').slice(0, 6)
  const display = digits.length > 3
    ? digits.slice(0, 3) + '-' + digits.slice(3)
    : digits

  const handle = (e) => {
    const raw       = e.target.value.replace(/\D/g, '').slice(0, 6)
    const formatted = raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw
    onChange(formatted)
  }

  return (
    <input
      className="otp-input"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={display}
      onChange={handle}
      placeholder="XXX-XXX"
      maxLength={7}
      autoFocus
    />
  )
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning]     = useState(false)

  const start = () => {
    setRemaining(seconds)
    setRunning(true)
  }

  useState(() => {
    if (!running) return
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { setRunning(false); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  })

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { display: `${mm}:${ss}`, expired: remaining <= 0, start, running }
}

export default function LoginPage() {
  const auth     = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from?.pathname || null

  const [step, setStep]           = useState('credentials')
  const [form, setForm]           = useState({ username: '', password: '' })
  const [otpCode, setOtpCode]     = useState('')
  const [maskedEmail, setMasked]  = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [resendCool, setResendCool] = useState(false)

  const countdown = useCountdown(120)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Step 1: submit credentials ────────────────────────────────────────────
  const submitCredentials = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login/', {
        username: form.username,
        password: form.password,
      })
      setMasked(data.masked_email)
      setStep('otp')
      countdown.start()
    } catch (err) {
      const d = err?.response?.data
      setError(
        d?.detail ||
        d?.non_field_errors?.[0] ||
        d?.username?.[0] ||
        d?.password?.[0] ||
        'Invalid credentials. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const submitOTP = async (e) => {
    e.preventDefault()

    if (otpCode.replace(/\D/g, '').length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/verify-otp/', {
        username: form.username,
        code:     otpCode,
      })

      // ✅ Single call — saves tokens to localStorage AND updates React state.
      // After this line, useAuth().user is populated and isAuthenticated = true.
      auth.setSession(data)

      navigate(from || PORTAL[data.user?.role] || '/')
    } catch (err) {
      const d = err?.response?.data
      setError(d?.detail || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend code ───────────────────────────────────────────────────────────
  const resend = async () => {
    setResendCool(true)
    setError('')
    setOtpCode('')

    try {
      const { data } = await api.post('/auth/login/', {
        username: form.username,
        password: form.password,
      })
      setMasked(data.masked_email)
      countdown.start()
    } catch {
      setError('Could not resend code. Please go back and try again.')
    } finally {
      setTimeout(() => setResendCool(false), 30_000)
    }
  }

  const goBack = () => {
    setStep('credentials')
    setOtpCode('')
    setError('')
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
              <img src="/nairobijethouse.png" alt="Nairobi Jet House" className="login-logo" />
              <h2 className="login-title">
                {step === 'credentials' ? 'Welcome back' : 'Check your email'}
              </h2>
              <p className="login-subtitle">
                {step === 'credentials'
                  ? 'Sign in to your NairobiJetHouse account'
                  : <>We sent a verification code to <strong>{maskedEmail}</strong></>
                }
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert-error login-error">
                <i className="bi bi-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: Credentials ── */}
            {step === 'credentials' && (
              <form onSubmit={submitCredentials}>
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

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label-gov">
                    Password <span className="required">*</span>
                  </label>
                  <div className="login-password-wrapper">
                    <input
                      className="form-input-gov login-password-input"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPass(s => !s)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-eye${showPass ? '-slash' : ''}`} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary-gov btn-full"
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }} /> Sending code…</>
                  ) : (
                    <><i className="bi bi-shield-lock" /> Continue</>
                  )}
                </button>

                <div className="login-register-link">
                  Don't have an account?{' '}
                  <Link to="/register">Create one</Link>
                </div>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <form onSubmit={submitOTP}>

                <div className="otp-timer-row">
                  <span className={`otp-timer ${countdown.expired ? 'otp-timer--expired' : ''}`}>
                    <i className="bi bi-clock" />
                    {countdown.expired ? 'Code expired' : `Expires in ${countdown.display}`}
                  </span>
                </div>

                <div className="form-group otp-group">
                  <label className="form-label-gov" style={{ textAlign: 'center', display: 'block' }}>
                    Enter your 6-digit code
                  </label>
                  <OTPInput value={otpCode} onChange={setOtpCode} />
                  <p className="otp-hint">Format: XXX-XXX (e.g. 673-893)</p>
                </div>

                <button
                  type="submit"
                  className="btn-primary-gov btn-full"
                  disabled={loading || countdown.expired || otpCode.replace(/\D/g, '').length < 6}
                >
                  {loading ? (
                    <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }} /> Verifying…</>
                  ) : (
                    <><i className="bi bi-check2-shield" /> Verify & Sign In</>
                  )}
                </button>

                <div className="otp-actions">
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={resend}
                    disabled={resendCool && !countdown.expired}
                  >
                    <i className="bi bi-arrow-clockwise" /> Resend code
                  </button>
                  <button type="button" className="otp-back-btn" onClick={goBack}>
                    <i className="bi bi-arrow-left" /> Use different account
                  </button>
                </div>
              </form>
            )}

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
        .login-page {
          min-height: calc(100vh - 80px);
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
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
          margin-bottom: 1.75rem;
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
        .login-error {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: var(--color-error-bg);
          border: 1px solid rgba(192,57,43,0.25);
          color: var(--color-error);
        }

        /* Form */
        .form-group { margin-bottom: 1rem; }
        .form-label-gov {
          display: block;
          font-family: var(--font-label);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.4rem;
        }
        .form-label-gov .required { color: var(--color-error); margin-left: 2px; }
        .form-input-gov {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid var(--color-light-gray);
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 0.93rem;
          color: var(--color-charcoal);
          background: var(--color-white);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
          box-sizing: border-box;
        }
        .form-input-gov:focus {
          border-color: var(--color-navy);
          box-shadow: 0 0 0 3px rgba(15,45,94,0.1);
        }

        /* Password */
        .login-password-wrapper { position: relative; }
        .login-password-input { padding-right: 2.5rem; }
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
          padding: 0;
        }
        .login-password-toggle:hover { color: var(--color-navy); }

        /* Buttons */
        .btn-primary-gov {
          background: var(--color-navy);
          color: var(--color-white);
          border: 1.5px solid var(--color-navy);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.72rem 1.9rem;
          font-family: var(--font-label);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-base);
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .btn-primary-gov:hover:not(:disabled) {
          background: var(--color-navy-mid);
          border-color: var(--color-navy-mid);
          color: var(--color-gold-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .btn-primary-gov:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* OTP */
        .otp-timer-row {
          display: flex;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .otp-timer {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          background: var(--color-info-bg);
          color: var(--color-info);
          border: 1px solid rgba(15,92,164,0.2);
          transition: all 0.3s;
        }
        .otp-timer--expired {
          background: var(--color-error-bg);
          color: var(--color-error);
          border-color: rgba(192,57,43,0.2);
        }
        .otp-group { text-align: center; margin-bottom: 1.5rem; }
        .otp-input {
          width: 100%;
          max-width: 220px;
          margin: 0.6rem auto 0;
          display: block;
          padding: 0.85rem 1rem;
          border: 2px solid var(--color-light-gray);
          border-radius: 10px;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-align: center;
          color: var(--color-navy);
          background: var(--color-surface);
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          font-family: var(--font-mono);
          box-sizing: border-box;
        }
        .otp-input:focus {
          border-color: var(--color-navy);
          box-shadow: 0 0 0 3px rgba(15,45,94,0.12);
          background: var(--color-white);
        }
        .otp-hint {
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          margin-top: 0.4rem;
        }
        .otp-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          margin-top: 1.25rem;
        }
        .otp-resend-btn, .otp-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.83rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: color var(--transition-fast);
          padding: 0;
          font-family: var(--font-body);
        }
        .otp-resend-btn {
          color: var(--color-navy);
          font-weight: 600;
        }
        .otp-resend-btn:hover:not(:disabled) { color: var(--color-gold); }
        .otp-resend-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .otp-back-btn { color: var(--color-mid-gray); }
        .otp-back-btn:hover { color: var(--color-navy); }

        /* Misc */
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
        .login-register-link a:hover { color: var(--color-gold); }
        .login-track-link {
          text-align: center;
          margin-top: 1.25rem;
        }
        .login-track-link a {
          font-size: 0.82rem;
          color: var(--color-mid-gray);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .login-track-link a:hover { color: var(--color-gold); }
        .spinner-gov {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card { padding: 1.5rem; }
          .login-logo { height: 3rem; }
          .otp-input { font-size: 1.3rem; max-width: 180px; }
        }
      `}</style>
    </>
  )
}