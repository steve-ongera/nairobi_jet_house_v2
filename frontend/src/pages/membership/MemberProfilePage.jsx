// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER PROFILE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { authAPI, membershipAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export function MemberProfilePage() {
  const { user, updateUser } = useAuth()
  const [membership, setMembership] = useState(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    preferred_aircraft: '',
    dietary_restrictions: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const membershipRes = await membershipAPI.my()
        setMembership(membershipRes?.data || membershipRes)
        if (user) {
          setForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.company || '',
            preferred_aircraft: user.preferred_aircraft || '',
            dietary_restrictions: user.dietary_restrictions || '',
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }
    loadProfile()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await authAPI.updateProfile(form)
      if (updateUser) updateUser(form)
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to update profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>My Profile</h2>
          <p>Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Membership Card */}
      {membership && (
        <div className="membership-card" style={{ marginBottom: '1.5rem' }}>
          <div className="membership-card-header">
            <i className="bi bi-star-fill" />
            <span>{membership.tier || 'Standard'} Membership</span>
          </div>
          <div className="membership-card-body">
            <div className="membership-points">
              <span className="points-label">Points Balance</span>
              <span className="points-value">{membership.points || 0}</span>
            </div>
            <div className="membership-benefits-list">
              <strong>Benefits:</strong>
              <ul>
                <li>✓ Priority customer support</li>
                <li>✓ Best rate guarantee</li>
                <li>✓ Flexible booking options</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h4><i className="bi bi-person" /> Personal Information</h4>
        </div>
        <div className="settings-card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                  className="form-control" 
                  value={form.first_name} 
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                  className="form-control" 
                  value={form.last_name} 
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                  className="form-control" 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input 
                  className="form-control" 
                  value={form.company} 
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Aircraft</label>
                <input 
                  className="form-control" 
                  value={form.preferred_aircraft} 
                  onChange={e => setForm(f => ({ ...f, preferred_aircraft: e.target.value }))}
                  placeholder="e.g., Gulfstream G650"
                />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Dietary Restrictions</label>
                <textarea 
                  className="form-control" 
                  rows={2}
                  value={form.dietary_restrictions} 
                  onChange={e => setForm(f => ({ ...f, dietary_restrictions: e.target.value }))}
                  placeholder="Any dietary restrictions or preferences"
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-navy" disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-save" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MemberProfilePage