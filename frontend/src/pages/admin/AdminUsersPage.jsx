import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

const ROLES = ['client','owner','operator','staff','admin']
const ROLE_COLOR = { client:'navy', owner:'gold', operator:'green', staff:'navy', admin:'red' }

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [role,    setRole]    = useState('')
  const [saving,  setSaving]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const data = await adminApi.getUsers(params)
      setUsers((data.results || data).filter(u => role ? u.role === role : true))
    } finally { setLoading(false) }
  }, [search, role])

  useEffect(() => { load() }, [load])

  const toggle = async (u) => {
    setSaving(u.id)
    try { await adminApi.toggleActive(u.id); load() }
    finally { setSaving(null) }
  }

  const changeRole = async (u, newRole) => {
    setSaving(u.id)
    try { await adminApi.changeRole(u.id, newRole); load() }
    finally { setSaving(null) }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Users</h2><p>All platform users and membership status</p></div>
      </div>

      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <div className="search-wrap" style={{ flex:1, minWidth:220 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search name, email, username…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width:160 }} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
          : users.length === 0 ? <div className="table-empty"><i className="bi bi-people" />No users found.</div>
          : (
            <table>
              <thead>
                <tr><th>User</th><th>Role</th><th>Membership</th><th>Company</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="td-name">{u.full_name || u.username}</div>
                      <div className="td-email">{u.email}</div>
                    </td>
                    <td><span className={`badge badge-${ROLE_COLOR[u.role]||'gray'}`}>{u.role}</span></td>
                    <td>
                      {u.membership_tier
                        ? <div><div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--navy)' }}>{u.membership_tier}</div>
                            <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{u.membership_status}</div></div>
                        : <span style={{ color:'var(--gray-300)', fontSize:'0.78rem' }}>None</span>}
                    </td>
                    <td style={{ fontSize:'0.82rem' }}>{u.company || '—'}</td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${u.is_active ? 'green' : 'red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => toggle(u)} disabled={saving===u.id} title={u.is_active ? 'Deactivate' : 'Activate'}>
                          <i className={`bi bi-toggle-${u.is_active ? 'on text-green' : 'off'}`} />
                        </button>
                        <select className="form-control" style={{ padding:'0.2rem 0.5rem', fontSize:'0.72rem', height:'auto', width:'auto' }}
                          value={u.role} onChange={e => changeRole(u, e.target.value)} disabled={saving===u.id}>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
    </div>
  )
}