import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const ROLES = ['client', 'owner', 'operator', 'staff', 'admin']
const ROLE_COLOR = { client: 'client', owner: 'owner', operator: 'operator', staff: 'staff', admin: 'admin' }
const ROLE_DISPLAY = { client: 'Client', owner: 'Owner', operator: 'Operator', staff: 'Staff', admin: 'Admin' }

function Badge({ s, type = 'role' }) {
  if (type === 'role') {
    const colorClass = ROLE_COLOR[s] || 'gray'
    return <span className={`badge badge-${colorClass}`}>{ROLE_DISPLAY[s] || s}</span>
  }
  return <span className={`badge badge-${s === 'active' ? 'green' : 'red'}`}>{s}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
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
      
      // Filter by role
      if (role) {
        usersData = usersData.filter(u => u.role === role)
      }
      setUsers(usersData)
      
      // Calculate stats
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

  const getAvatarClass = (role) => {
    return `user-avatar ${ROLE_COLOR[role] || 'client'}`
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Users</h2>
          <p>Manage all platform users, roles, and membership status</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="users-stats">
        <div className={`user-stat-card ${!role ? 'active' : ''}`} onClick={() => setRole('')}>
          <div className="user-stat-number">{stats.total || 0}</div>
          <div className="user-stat-label">Total Users</div>
        </div>
        <div className={`user-stat-card ${role === 'client' ? 'active' : ''}`} onClick={() => setRole('client')}>
          <div className="user-stat-number">{stats.byRole?.client || 0}</div>
          <div className="user-stat-label">Clients</div>
        </div>
        <div className={`user-stat-card ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')}>
          <div className="user-stat-number">{stats.byRole?.owner || 0}</div>
          <div className="user-stat-label">Owners</div>
        </div>
        <div className={`user-stat-card ${role === 'operator' ? 'active' : ''}`} onClick={() => setRole('operator')}>
          <div className="user-stat-number">{stats.byRole?.operator || 0}</div>
          <div className="user-stat-label">Operators</div>
        </div>
        <div className={`user-stat-card ${role === 'staff' ? 'active' : ''}`} onClick={() => setRole('staff')}>
          <div className="user-stat-number">{stats.byRole?.staff || 0}</div>
          <div className="user-stat-label">Staff</div>
        </div>
        <div className={`user-stat-card ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
          <div className="user-stat-number">{stats.byRole?.admin || 0}</div>
          <div className="user-stat-label">Admins</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Name, email, or username..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        {(search || role) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setSearch(''); setRole('') }}
            >
              <i className="bi bi-x-lg" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-people" />
              <p>No users found.</p>
              {(search || role) && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => { setSearch(''); setRole('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Membership</th>
                  <th>Company</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(u)}>
                      <div className="user-info-compact">
                        <div className={getAvatarClass(u.role)}>
                          {getInitials(u.full_name || u.username)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{u.full_name || u.username}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge s={u.role} type="role" />
                    </td>
                    <td>
                      {u.membership_tier ? (
                        <>
                          <div className="membership-badge">
                            <i className="bi bi-star-fill" style={{ fontSize: '0.6rem' }} />
                            {u.membership_tier}
                          </div>
                          <div className="membership-status">{u.membership_status || 'active'}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--gray-300)', fontSize: '0.78rem' }}>No membership</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{u.company || '—'}</td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td>
                      <Badge s={u.is_active ? 'active' : 'inactive'} type="status" />
                    </td>
                    <td>
                      <div className="td-actions">
                        <label className="toggle-switch" style={{ marginRight: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={u.is_active} 
                            onChange={() => toggle(u)} 
                            disabled={saving === u.id}
                          />
                          <span className="toggle-slider" />
                        </label>
                        <select 
                          className="role-select" 
                          value={u.role} 
                          onChange={e => changeRole(u, e.target.value)} 
                          disabled={saving === u.id}
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
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
          {stats.active !== undefined && ` · ${stats.active} active`}
          {stats.members !== undefined && ` · ${stats.members} with membership`}
          {(search || role) && ' with current filters'}
        </div>
      )}

      {/* User Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-person" /> User Details</>}>
        {selectedUser && (
          <div>
            {/* Profile Section */}
            <div className="user-detail-section">
              <h4><i className="bi bi-person-circle" /> Profile Information</h4>
              <div className="detail-row">
                <div className="detail-key">Full Name</div>
                <div className="detail-val">{selectedUser.full_name || selectedUser.username}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Email</div>
                <div className="detail-val">{selectedUser.email}</div>
              </div>
              {selectedUser.phone && (
                <div className="detail-row">
                  <div className="detail-key">Phone</div>
                  <div className="detail-val">{selectedUser.phone}</div>
                </div>
              )}
              <div className="detail-row">
                <div className="detail-key">Username</div>
                <div className="detail-val">{selectedUser.username}</div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Role</div>
                <div className="detail-val"><Badge s={selectedUser.role} type="role" /></div>
              </div>
              <div className="detail-row">
                <div className="detail-key">Status</div>
                <div className="detail-val">
                  <Badge s={selectedUser.is_active ? 'active' : 'inactive'} type="status" />
                </div>
              </div>
            </div>

            {/* Company Section */}
            {selectedUser.company && (
              <div className="user-detail-section">
                <h4><i className="bi bi-building" /> Company Information</h4>
                <div className="detail-row">
                  <div className="detail-key">Company Name</div>
                  <div className="detail-val">{selectedUser.company}</div>
                </div>
                {selectedUser.company_position && (
                  <div className="detail-row">
                    <div className="detail-key">Position</div>
                    <div className="detail-val">{selectedUser.company_position}</div>
                  </div>
                )}
                {selectedUser.vat_number && (
                  <div className="detail-row">
                    <div className="detail-key">VAT Number</div>
                    <div className="detail-val">{selectedUser.vat_number}</div>
                  </div>
                )}
              </div>
            )}

            {/* Membership Section */}
            {selectedUser.membership_tier && (
              <div className="user-detail-section">
                <h4><i className="bi bi-star" /> Membership</h4>
                <div className="detail-row">
                  <div className="detail-key">Tier</div>
                  <div className="detail-val">{selectedUser.membership_tier}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Status</div>
                  <div className="detail-val">{selectedUser.membership_status || 'Active'}</div>
                </div>
                {selectedUser.membership_expiry && (
                  <div className="detail-row">
                    <div className="detail-key">Expires</div>
                    <div className="detail-val">{formatDate(selectedUser.membership_expiry)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Account Info Section */}
            <div className="user-detail-section">
              <h4><i className="bi bi-calendar" /> Account Information</h4>
              <div className="detail-row">
                <div className="detail-key">Joined</div>
                <div className="detail-val">{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              {selectedUser.last_login && (
                <div className="detail-row">
                  <div className="detail-key">Last Login</div>
                  <div className="detail-val">{new Date(selectedUser.last_login).toLocaleString()}</div>
                </div>
              )}
              {selectedUser.updated_at && (
                <div className="detail-row">
                  <div className="detail-key">Last Updated</div>
                  <div className="detail-val">{new Date(selectedUser.updated_at).toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="detail-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
              <div className="detail-key">Quick Actions</div>
              <div className="detail-val">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-outline-navy btn-sm"
                    onClick={() => window.open(`mailto:${selectedUser.email}`)}
                  >
                    <i className="bi bi-envelope" /> Email
                  </button>
                  <button 
                    className={`btn btn-sm ${selectedUser.is_active ? 'btn-outline-red' : 'btn-green'}`}
                    onClick={() => toggle(selectedUser)}
                  >
                    <i className={`bi bi-toggle-${selectedUser.is_active ? 'on' : 'off'}`} />
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