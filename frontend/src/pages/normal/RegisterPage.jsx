import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'  // ✅ CORRECT
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'

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
      <label className="form-label">{label}{['username','email','password','password2'].includes(key) && <span className="req"> *</span>}</label>
      <input className={`form-control${errors[key] ? ' error' : ''}`} type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} required={['username','email','password','password2'].includes(key)} />
      {errors[key] && <span className="form-error">{errors[key][0]}</span>}
    </div>
  )

  return (
    <div>
      <PublicNavbar />
      <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 3rem' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, background: 'var(--navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.4rem', color: 'var(--gold)' }}>
              <i className="bi bi-person-plus" />
            </div>
            <h2 style={{ marginBottom: '0.25rem' }}>Create your account</h2>
            <p style={{ fontSize: '0.875rem' }}>Join NairobiJetHouse to access the member fleet</p>
          </div>

          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}
            <form onSubmit={submit}>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                {field('first_name','First Name','text','Jane')}
                {field('last_name','Last Name','text','Smith')}
              </div>
              <div style={{ marginBottom: '1rem' }}>{field('username','Username','text','jane_smith')}</div>
              <div style={{ marginBottom: '1rem' }}>{field('email','Email','email','jane@company.com')}</div>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                {field('phone','Phone','tel','+254 700 000 000')}
                {field('company','Company','text','Acme Corp')}
              </div>
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                {field('password','Password','password','Min 8 characters')}
                {field('password2','Confirm Password','password','Repeat password')}
              </div>
              <button type="submit" className="btn btn-navy btn-full" disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Creating account…</> : <><i className="bi bi-person-check" /> Create Account</>}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.84rem', color: 'var(--gray-400)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 600 }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}