// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CAREERS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const APP_STATUS = ['received', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected']

const STATUS_COLOR = {
  received: '#f59e0b',
  reviewing: '#0f2d5e',
  shortlisted: '#8b5cf6',
  interview: '#3b82f6',
  offered: '#06b6d4',
  hired: '#22c55e',
  rejected: '#ef4444'
}

const STATUS_LABEL = {
  received: 'Received',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected'
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
        borderRadius: '10px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
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

export default function AdminCareersPage() {
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Careers</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage job postings and track applications</p>
        </div>
        <button onClick={loadData} style={{
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

      {/* Simple Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.activeJobs}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Open Jobs</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.totalApps}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Applications</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.newApps}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>New</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.hired}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Hired</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-light-gray)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setTab('jobs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 1rem',
            background: tab === 'jobs' ? 'var(--color-navy)' : 'transparent',
            color: tab === 'jobs' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="bi bi-briefcase"></i> Jobs
          <span style={{
            marginLeft: '0.25rem',
            padding: '0.1rem 0.3rem',
            background: tab === 'jobs' ? 'rgba(255,255,255,0.2)' : 'var(--color-off-white)',
            borderRadius: '4px',
            fontSize: '0.65rem'
          }}>{jobs.length}</span>
        </button>
        <button 
          onClick={() => setTab('apps')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 1rem',
            background: tab === 'apps' ? 'var(--color-navy)' : 'transparent',
            color: tab === 'apps' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="bi bi-people"></i> Applications
          <span style={{
            marginLeft: '0.25rem',
            padding: '0.1rem 0.3rem',
            background: tab === 'apps' ? 'rgba(255,255,255,0.2)' : 'var(--color-off-white)',
            borderRadius: '4px',
            fontSize: '0.65rem'
          }}>{apps.length}</span>
          {stats.newApps > 0 && (
            <span style={{
              marginLeft: '0.25rem',
              padding: '0.1rem 0.3rem',
              background: '#f59e0b',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.6rem'
            }}>+{stats.newApps}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--color-mid-gray)' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          {/* Jobs Tab */}
          {tab === 'jobs' && (
            jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
                <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-mid-gray)' }}>No job postings yet.</p>
              </div>
            ) : (
              <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Title</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Department</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Location</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Applications</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(j => (
                        <tr key={j.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{j.title}</div>
                            {j.is_featured && (
                              <span style={{
                                display: 'inline-flex',
                                marginLeft: '0.5rem',
                                padding: '0.15rem 0.4rem',
                                background: 'rgba(201,153,46,0.12)',
                                color: 'var(--color-gold-dark)',
                                border: '1px solid rgba(201,153,46,0.28)',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                fontWeight: 600
                              }}>Featured</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>{j.department_display || j.department || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>{j.location_display || j.location || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{j.application_count ?? '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.2rem 0.6rem',
                              background: j.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                              color: j.is_active ? '#22c55e' : 'var(--color-mid-gray)',
                              border: `1px solid ${j.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}`,
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {j.is_active ? 'Active' : 'Closed'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button 
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: j.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                color: j.is_active ? '#ef4444' : '#22c55e',
                                border: `1px solid ${j.is_active ? '#ef4444' : '#22c55e'}`,
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
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
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-mid-gray)' }}>No applications received yet.</p>
              </div>
            ) : (
              <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Applicant</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Role</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Applied</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                          <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openAppDetail(a)}>
                            <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{a.full_name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{a.email}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>{a.job_title || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.2rem 0.6rem',
                              background: `${STATUS_COLOR[a.status] || '#64748b'}15`,
                              color: STATUS_COLOR[a.status] || '#64748b',
                              border: `1px solid ${STATUS_COLOR[a.status] || '#64748b'}30`,
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              {STATUS_LABEL[a.status] || a.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--color-dark-gray)' }}>{formatDate(a.created_at)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <select 
                              value={a.status} 
                              onChange={e => updateAppStatus(a.id, e.target.value)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                border: '1px solid var(--color-light-gray)',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                background: 'var(--color-white)',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                            >
                              {APP_STATUS.map(s => (
                                <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
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
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Full Name</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedApp.full_name}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedApp.email}</div>
            </div>
            {selectedApp.phone && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedApp.phone}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Position</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedApp.job_title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Experience</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedApp.experience_years || '—'} years</div>
            </div>
            {selectedApp.cover_letter && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Cover Letter</div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-dark-gray)' }}>{selectedApp.cover_letter}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Applied</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedApp.created_at).toLocaleString()}</div>
            </div>
            {selectedApp.resume_url && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Resume</div>
                <div>
                  <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.7rem',
                    background: 'transparent',
                    color: 'var(--color-navy)',
                    border: '1px solid var(--color-navy)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    textDecoration: 'none'
                  }}>
                    <i className="bi bi-file-pdf"></i> View Resume
                  </a>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Update Status</div>
              <div>
                <select 
                  value={selectedApp.status} 
                  onChange={e => {
                    updateAppStatus(selectedApp.id, e.target.value)
                    setDetailModal(false)
                  }}
                  style={{
                    padding: '0.4rem 0.7rem',
                    border: '1px solid var(--color-light-gray)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    background: 'var(--color-white)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                >
                  {APP_STATUS.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
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