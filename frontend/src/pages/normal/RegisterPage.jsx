import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../hooks/useAuth'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Register | NairobiJetHouse',
  description: 'Create a NairobiJetHouse account to access member fleet, manage bookings, and enjoy exclusive benefits.',
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ username: '', email: '', first_name: '', last_name: '', phone: '', company: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [errors,  setErrors]  = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setLoading(true); setError(''); setErrors({})
    try {
      const { authApi } = await import('../../services/api')
      await authApi.register({ ...form, role: 'client' })
      await login(form.username, form.password)
      navigate('/member')
    } catch (err) {
      if (typeof err === 'object' && !err.detail) setErrors(err)
      else setError(err?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label-gov">
        {label}
        {['username', 'email', 'password', 'password2'].includes(key) && <span className="required"> *</span>}
      </label>
      <input 
        className={`form-input-gov ${errors[key] ? 'error' : ''}`} 
        type={type} 
        value={form[key]} 
        onChange={e => set(key, e.target.value)} 
        placeholder={placeholder} 
        required={['username', 'email', 'password', 'password2'].includes(key)} 
      />
      {errors[key] && <div className="register-field-error">{errors[key][0]}</div>}
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Register | NairobiJetHouse - Create Your Account</title>
        <meta name="description" content="Create a NairobiJetHouse account to access member fleet, manage bookings, and enjoy exclusive benefits. Join the premier private aviation platform." />
        <meta name="keywords" content="register account, create account, private aviation signup, member registration" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/register" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />
      
      <div className="register-page">
        <div className="register-container">
          <div className="register-card">

            {/* Header */}
            <div className="register-header">
              <img
                src="/nairobijethouse.png"
                alt="Nairobi Jet House"
                className="register-logo"
              />
              <h2 className="register-title">Create your account</h2>
              <p className="register-subtitle">Join NairobiJetHouse to access the member fleet</p>
            </div>

            {/* Form */}
            <div className="register-form-wrapper">
              {error && (
                <div className="alert-error register-error">
                  <i className="bi bi-exclamation-triangle" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={submit}>
                <div className="form-row">
                  {field('first_name', 'First Name', 'text', 'Jane')}
                  {field('last_name', 'Last Name', 'text', 'Smith')}
                </div>

                <div className="form-group">
                  {field('username', 'Username', 'text', 'jane_smith')}
                </div>

                <div className="form-group">
                  {field('email', 'Email', 'email', 'jane@company.com')}
                </div>

                <div className="form-row">
                  {field('phone', 'Phone', 'tel', '+254 724 878 136')}
                  {field('company', 'Company', 'text', 'Acme Corp')}
                </div>

                <div className="form-row">
                  {field('password', 'Password', 'password', 'Min 8 characters')}
                  {field('password2', 'Confirm Password', 'password', 'Repeat password')}
                </div>

                <button
                  type="submit"
                  className="btn-primary-gov btn-full register-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                      &nbsp; Creating account…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check" /> Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="register-login-link">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        /* Register Page Styles - Border radius 8-10px */
        .register-page {
          min-height: 100vh;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 1rem 3rem;
        }
        .register-container {
          width: 100%;
          max-width: 580px;
        }
        .register-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: 10px;
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .register-logo {
          height: 3.5rem;
          width: auto;
          margin: 0 auto 1rem;
          display: block;
        }
        .register-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        .register-subtitle {
          font-size: 0.875rem;
          color: var(--color-mid-gray);
        }
        .register-form-wrapper {
          margin-bottom: 0.5rem;
        }
        .register-error {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }
        .register-field-error {
          font-family: var(--font-label);
          font-size: 0.72rem;
          color: var(--color-error);
          margin-top: 0.25rem;
        }
        .register-submit {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
          border-radius: 8px;
        }
        .register-login-link {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.84rem;
          color: var(--color-mid-gray);
        }
        .register-login-link a {
          color: var(--color-navy);
          font-weight: 600;
          text-decoration: none;
        }
        .register-login-link a:hover {
          color: var(--color-gold);
        }

        /* Form overrides */
        .form-group {
          margin-bottom: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 0;
        }
        .form-row .form-group {
          margin-bottom: 1rem;
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
        .form-input-gov.error {
          border-color: var(--color-error);
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
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
        @media (max-width: 480px) {
          .register-card {
            padding: 1.5rem;
          }
          .register-title {
            font-size: 1.1rem;
          }
          .register-logo {
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