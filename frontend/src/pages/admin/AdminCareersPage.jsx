// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CAREERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

export function AdminCareersPage() {
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [tab, setTab] = useState('jobs')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getJobs(), adminAPI.getApplications()])
      .then(([j, a]) => {
        setJobs(j.results || j)
        setApps(a.results || a)
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleJob = async (id) => {
    await adminAPI.toggleJobActive(id)
    const d = await adminAPI.getJobs()
    setJobs(d.results || d)
  }

  const updateApp = async (id, status) => {
    await adminAPI.updateAppStatus(id, { status })
    const d = await adminAPI.getApplications()
    setApps(d.results || d)
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Careers</h2>
          <p>Job postings and applications</p>
        </div>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn${tab === 'jobs' ? ' active' : ''}`} onClick={() => setTab('jobs')}>
          <i className="bi bi-briefcase" /> Jobs <span className="badge badge-gray">{jobs.length}</span>
        </button>
        <button className={`tab-btn${tab === 'apps' ? ' active' : ''}`} onClick={() => setTab('apps')}>
          <i className="bi bi-people" /> Applications <span className="badge badge-gray">{apps.length}</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
      ) : (
        <>
          {tab === 'jobs' && (
            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Applications</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td className="td-name">
                          {j.title}
                          {j.is_featured && <span className="badge badge-gold" style={{ marginLeft: 6 }}>Featured</span>}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{j.department_display || j.department}</td>
                        <td style={{ fontSize: '0.82rem' }}>{j.location_display || j.location}</td>
                        <td>{j.application_count ?? '—'}</td>
                        <td><span className={`badge badge-${j.is_active ? 'green' : 'gray'}`}>{j.is_active ? 'Active' : 'Closed'}</span></td>
                        <td><button className="btn btn-ghost btn-xs" onClick={() => toggleJob(j.id)}>{j.is_active ? 'Close' : 'Reopen'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'apps' && (
            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="td-name">{a.full_name}</div>
                          <div className="td-email">{a.email}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{a.job_title}</td>
                        <td><span className={`status-${a.status} badge`}>{a.status_display || a.status}</span></td>
                        <td style={{ fontSize: '0.78rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td>
                          <select 
                            className="form-control" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', height: 'auto', width: 'auto' }}
                            value={a.status} 
                            onChange={e => updateApp(a.id, e.target.value)}
                          >
                            {['received', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminCareersPage;