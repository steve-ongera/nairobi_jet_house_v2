// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CAREERS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const APP_STATUS = ['received', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected']

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function AdminCareersPage() {
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [tab, setTab] = useState('jobs')
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [jobsRes, appsRes] = await Promise.all([
        adminAPI.jobs(),
        adminAPI.jobApplications()
      ])
      setJobs(jobsRes?.data?.results || jobsRes?.data || jobsRes || [])
      setApps(appsRes?.data?.results || appsRes?.data || appsRes || [])
    } catch (err) {
      console.error('Failed to load careers data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleJob = async (id) => {
    try {
      await adminAPI.toggleJob(id)
      await loadData()
    } catch (err) {
      console.error('Failed to toggle job:', err)
    }
  }

  const updateAppStatus = async (id, status) => {
    try {
      await adminAPI.updateAppStatus(id, { status })
      await loadData()
    } catch (err) {
      console.error('Failed to update application:', err)
    }
  }

  const openAppDetail = (app) => {
    setSelectedApp(app)
    setDetailModal(true)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const stats = {
    activeJobs: jobs.filter(j => j.is_active).length,
    totalApps: apps.length,
    newApps: apps.filter(a => a.status === 'received').length,
    hired: apps.filter(a => a.status === 'hired').length
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Careers</h2>
          <p>Manage job postings and track applications</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadData}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="careers-stats">
        <div className="careers-stat-card">
          <div className="careers-stat-number">{stats.activeJobs}</div>
          <div className="careers-stat-label">Open Jobs</div>
        </div>
        <div className="careers-stat-card">
          <div className="careers-stat-number">{stats.totalApps}</div>
          <div className="careers-stat-label">Applications</div>
        </div>
        <div className="careers-stat-card">
          <div className="careers-stat-number">{stats.newApps}</div>
          <div className="careers-stat-label">New</div>
        </div>
        <div className="careers-stat-card">
          <div className="careers-stat-number">{stats.hired}</div>
          <div className="careers-stat-label">Hired</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        <button 
          className={`tab-btn${tab === 'jobs' ? ' active' : ''}`} 
          onClick={() => setTab('jobs')}
        >
          <i className="bi bi-briefcase" /> Jobs
          <span className="badge badge-gray" style={{ marginLeft: 4 }}>{jobs.length}</span>
        </button>
        <button 
          className={`tab-btn${tab === 'apps' ? ' active' : ''}`} 
          onClick={() => setTab('apps')}
        >
          <i className="bi bi-people" /> Applications
          <span className="badge badge-gray" style={{ marginLeft: 4 }}>{apps.length}</span>
          {stats.newApps > 0 && (
            <span className="badge badge-new" style={{ marginLeft: 4 }}>+{stats.newApps}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Jobs Tab */}
          {tab === 'jobs' && (
            jobs.length === 0 ? (
              <div className="table-empty">
                <i className="bi bi-briefcase" />
                <p>No job postings yet.</p>
              </div>
            ) : (
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
                            {j.is_featured && (
                              <span className="badge badge-gold" style={{ marginLeft: 6 }}>Featured</span>
                            )}
                          </td>
                          <td>{j.department_display || j.department || '—'}</td>
                          <td>{j.location_display || j.location || '—'}</td>
                          <td>{j.application_count ?? '—'}</td>
                          <td>
                            <span className={`badge badge-${j.is_active ? 'green' : 'gray'}`}>
                              {j.is_active ? 'Active' : 'Closed'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className={`btn btn-${j.is_active ? 'outline-red' : 'green'} btn-xs`} 
                              onClick={() => toggleJob(j.id)}
                            >
                              {j.is_active ? 'Close' : 'Reopen'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Applications Tab */}
          {tab === 'apps' && (
            apps.length === 0 ? (
              <div className="table-empty">
                <i className="bi bi-inbox" />
                <p>No applications received yet.</p>
              </div>
            ) : (
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
                          <td style={{ cursor: 'pointer' }} onClick={() => openAppDetail(a)}>
                            <div className="td-name">{a.full_name}</div>
                            <div className="td-email">{a.email}</div>
                          </td>
                          <td>{a.job_title || '—'}</td>
                          <td>
                            <span className={`badge status-${a.status}`}>
                              {a.status_display || a.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem' }}>{formatDate(a.created_at)}</td>
                          <td>
                            <select 
                              className="role-select" 
                              value={a.status} 
                              onChange={e => updateAppStatus(a.id, e.target.value)}
                            >
                              {APP_STATUS.map(s => (
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
            )
          )}
        </>
      )}

      {/* Application Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Application Details">
        {selectedApp && (
          <div>
            <div className="detail-row">
              <div className="detail-key">Full Name</div>
              <div className="detail-val">{selectedApp.full_name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Email</div>
              <div className="detail-val">{selectedApp.email}</div>
            </div>
            {selectedApp.phone && (
              <div className="detail-row">
                <div className="detail-key">Phone</div>
                <div className="detail-val">{selectedApp.phone}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-key">Position</div>
              <div className="detail-val">{selectedApp.job_title}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Experience</div>
              <div className="detail-val">{selectedApp.experience_years || '—'} years</div>
            </div>
            {selectedApp.cover_letter && (
              <div className="detail-row">
                <div className="detail-key">Cover Letter</div>
                <div className="detail-val" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedApp.cover_letter}
                </div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-key">Applied</div>
              <div className="detail-val">{new Date(selectedApp.created_at).toLocaleString()}</div>
            </div>
            {selectedApp.resume_url && (
              <div className="detail-row">
                <div className="detail-key">Resume</div>
                <div className="detail-val">
                  <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-navy btn-sm">
                    <i className="bi bi-file-pdf" /> View Resume
                  </a>
                </div>
              </div>
            )}
            <div className="detail-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <div className="detail-key">Update Status</div>
              <div className="detail-val">
                <select 
                  className="role-select" 
                  value={selectedApp.status} 
                  onChange={e => {
                    updateAppStatus(selectedApp.id, e.target.value)
                    setDetailModal(false)
                  }}
                >
                  {APP_STATUS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminCareersPage