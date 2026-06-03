import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const ROLES = ['client', 'owner', 'operator', 'staff', 'admin']
const ROLE_COLOR = { 
  client: '#22c55e', 
  owner: '#3b82f6', 
  operator: '#8b5cf6', 
  staff: '#f59e0b', 
  admin: '#ef4444' 
}
const ROLE_DISPLAY = { 
  client: 'Client', 
  owner: 'Owner', 
  operator: 'Operator', 
  staff: 'Staff', 
  admin: 'Admin' 
}

function Badge({ status, type = 'role' }) {
  if (type === 'role') {
    const color = ROLE_COLOR[status] || '#64748b'
    const label = ROLE_DISPLAY[status] || status
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'capitalize'
      }}>
        {label}
      </span>
    )
  }
  
  const isActive = status === 'active'
  const color = isActive ? '#22c55e' : '#ef4444'
  const label = isActive ? 'Active' : 'Inactive'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600
    }}>
      {label}
    </span>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 43, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            color: 'var(--color-mid-gray)',
            padding: '0.25rem'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [stats, setStats] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const response = await adminAPI.users(params)
      const data = response?.data || response
      let usersData = data.results || data || []
      
      if (role) {
        usersData = usersData.filter(u => u.role === role)
      }
      setUsers(usersData)
      
      const roleStats = {}
      let totalActive = 0
      let totalMembers = 0
      
      usersData.forEach(u => {
        roleStats[u.role] = (roleStats[u.role] || 0) + 1
        if (u.is_active) totalActive++
        if (u.membership_tier) totalMembers++
      })
      
      setStats({
        total: usersData.length,
        active: totalActive,
        members: totalMembers,
        byRole: roleStats
      })
    } catch (err) {
      console.error('Failed to load users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search, role])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (u) => {
    setSaving(u.id)
    try { 
      await adminAPI.toggleUser(u.id)
      await load()
    } finally { 
      setSaving(null) 
    }
  }

  const changeRole = async (u, newRole) => {
    setSaving(u.id)
    try { 
      await adminAPI.changeRole(u.id, { role: newRole })
      await load()
    } finally { 
      setSaving(null) 
    }
  }

  const openDetail = (user) => {
    setSelectedUser(user)
    setDetailModal(true)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }

  const getAvatarColor = (role) => {
    return ROLE_COLOR[role] || '#64748b'
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Users</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage all platform users, roles, and membership status</p>
        </div>
        <button onClick={load} style={{
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

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '0.75rem', 
        marginBottom: '1.5rem' 
      }}>
        <div 
          onClick={() => setRole('')}
          style={{ 
            padding: '1rem', 
            background: !role ? 'var(--color-navy)' : 'var(--color-white)', 
            border: '1px solid var(--color-light-gray)', 
            borderRadius: '8px', 
            textAlign: 'center', 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { if (!role) return; e.currentTarget.style.borderColor = 'var(--color-navy)' }}
          onMouseLeave={e => { if (!role) return; e.currentTarget.style.borderColor = 'var(--color-light-gray)' }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: !role ? 'var(--color-white)' : 'var(--color-navy)' }}>{stats.total || 0}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: !role ? 'rgba(255,255,255,0.7)' : 'var(--color-mid-gray)' }}>Total Users</div>
        </div>
        {ROLES.map(r => (
          <div 
            key={r}
            onClick={() => setRole(r)}
            style={{ 
              padding: '1rem', 
              background: role === r ? 'var(--color-navy)' : 'var(--color-white)', 
              border: '1px solid var(--color-light-gray)', 
              borderRadius: '8px', 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: role === r ? 'var(--color-white)' : 'var(--color-navy)' }}>{stats.byRole?.[r] || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: role === r ? 'rgba(255,255,255,0.7)' : 'var(--color-mid-gray)' }}>{ROLE_DISPLAY[r]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s ease' }}
              placeholder="Name, email, or username..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        {(search || role) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setRole('') }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading users...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-people" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No users found.</p>
              {(search || role) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setRole('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Membership</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Joined</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(u)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: getAvatarColor(u.role),
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: 'var(--color-white)',
                          fontSize: '0.9rem'
                        }}>
                          {getInitials(u.full_name || u.username)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{u.full_name || u.username}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={u.role} type="role" />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.membership_tier ? (
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', background: 'rgba(201,153,46,0.1)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-gold-dark)' }}>
                            <i className="bi bi-star-fill" style={{ fontSize: '0.6rem' }}></i>
                            {u.membership_tier}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', marginTop: '0.2rem' }}>{u.membership_status || 'active'}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-light-gray)', fontSize: '0.78rem' }}>No membership</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--color-dark-gray)' }}>{u.company || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--color-dark-gray)' }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge status={u.is_active ? 'active' : 'inactive'} type="status" />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '22px' }}>
                          <input 
                            type="checkbox" 
                            checked={u.is_active} 
                            onChange={() => toggle(u)} 
                            disabled={saving === u.id}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: u.is_active ? 'var(--color-success)' : 'var(--color-light-gray)',
                            transition: '0.2s',
                            borderRadius: '22px'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '""',
                              height: '18px',
                              width: '18px',
                              left: u.is_active ? '24px' : '2px',
                              bottom: '2px',
                              background: 'var(--color-white)',
                              transition: '0.2s',
                              borderRadius: '50%'
                            }} />
                          </span>
                        </label>
                        <select 
                          value={u.role} 
                          onChange={e => changeRole(u, e.target.value)} 
                          disabled={saving === u.id}
                          style={{
                            padding: '0.3rem 0.5rem',
                            border: '1.5px solid var(--color-light-gray)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            background: 'var(--color-white)',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_DISPLAY[r]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && users.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          fontSize: '0.8rem', 
          color: 'var(--color-mid-gray)',
          textAlign: 'center'
        }}>
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
          {stats.active !== undefined && ` · ${stats.active} active`}
          {stats.members !== undefined && ` · ${stats.members} with membership`}
          {(search || role) && ' with current filters'}
        </div>
      )}

      {/* User Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-person"></i> User Details</>}>
        {selectedUser && (
          <div>
            {/* Profile Section */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-person-circle"></i> Profile Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Full Name</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.full_name || selectedUser.username}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.email}</div>
              </div>
              {selectedUser.phone && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.phone}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Username</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.username}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Role</div>
                <div><Badge status={selectedUser.role} type="role" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
                <div><Badge status={selectedUser.is_active ? 'active' : 'inactive'} type="status" /></div>
              </div>
            </div>

            {/* Company Section */}
            {selectedUser.company && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-building"></i> Company Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Company Name</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.company}</div>
                </div>
                {selectedUser.company_position && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Position</div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.company_position}</div>
                  </div>
                )}
                {selectedUser.vat_number && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>VAT Number</div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.vat_number}</div>
                  </div>
                )}
              </div>
            )}

            {/* Membership Section */}
            {selectedUser.membership_tier && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-star"></i> Membership
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Tier</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.membership_tier}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selectedUser.membership_status || 'Active'}</div>
                </div>
                {selectedUser.membership_expiry && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Expires</div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selectedUser.membership_expiry)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Account Info Section */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-calendar"></i> Account Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Joined</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              {selectedUser.last_login && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Last Login</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedUser.last_login).toLocaleString()}</div>
                </div>
              )}
              {selectedUser.updated_at && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Last Updated</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedUser.updated_at).toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Quick Actions</div>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                    onClick={() => window.open(`mailto:${selectedUser.email}`)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}
                  >
                    <i className="bi bi-envelope"></i> Email
                  </button>
                  <button 
                    style={{ padding: '0.4rem 0.8rem', background: selectedUser.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: selectedUser.is_active ? '#ef4444' : '#22c55e', border: `1.5px solid ${selectedUser.is_active ? '#ef4444' : '#22c55e'}`, borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                    onClick={() => toggle(selectedUser)}
                  >
                    <i className={`bi bi-toggle-${selectedUser.is_active ? 'on' : 'off'}`}></i>
                    {selectedUser.is_active ? ' Deactivate' : ' Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}