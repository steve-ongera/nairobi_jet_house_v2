import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';

const DEPT_COLORS = {
  operations: '#4fc3f7', commercial: '#81c784', charter: '#ffb74d',
  technical: '#ce93d8', concierge: '#f48fb1', finance: '#a5d6a7',
  it: '#64b5f6', hr: '#ffcc02', marketing: '#ff8a65', management: '#ef9a9a',
  partnerships: '#80cbc4',
};

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    jobsAPI.list({ is_active: true }).then(res => {
      setJobs(res.data.results || res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const departments = [...new Set(jobs.map(j => j.department))];
  const filtered = jobs.filter(j => {
    if (deptFilter && j.department !== deptFilter) return false;
    if (typeFilter && j.job_type !== typeFilter) return false;
    return true;
  });
  const featured = filtered.filter(j => j.is_featured);
  const regular = filtered.filter(j => !j.is_featured);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', color: '#fff' }}>
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>← Home</Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <p style={{ color: 'var(--gold, #C9A84C)', letterSpacing: '0.2em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Join the Team</p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.5rem', margin: '0 auto 1rem', maxWidth: '600px' }}>
          Build Africa's Aviation Future
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '580px', margin: '0 auto', lineHeight: '1.8' }}>
          We're a fast-growing private aviation platform hiring across operations, technology, charter services, and more. We operate across 35 countries and are headquartered in Nairobi, Kenya.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={selectStyle}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="">All Types</option>
            {['full_time', 'part_time', 'contract', 'internship'].map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
          {(deptFilter || typeFilter) && (
            <button onClick={() => { setDeptFilter(''); setTypeFilter(''); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '3rem' }}>Loading positions...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '3rem' }}>No open positions matching your filters.</p>
        ) : (
          <>
            {featured.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--gold, #C9A84C)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Featured Roles
                </h3>
                {featured.map(job => <JobCard key={job.id} job={job} featured />)}
              </div>
            )}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    All Open Positions
                  </h3>
                )}
                {regular.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </>
        )}

        {/* Perks */}
        <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px' }}>
          <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.5rem' }}>
            Why NairobiJetHouse?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              ['✈️', 'Aviation Perks', 'Flight benefits and discounts for you and your family on our charter network.'],
              ['🌍', 'Pan-African Scope', 'Work on a platform that operates across 35 countries with global clients.'],
              ['📈', 'Fast Growth', 'Join a startup scaling rapidly — your work has direct impact from day one.'],
              ['🏡', 'Flexible Work', 'Remote-first culture with hubs in Nairobi, Dubai, London, and Lagos.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                <h4 style={{ color: 'var(--gold, #C9A84C)', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: '1.6', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, featured }) {
  const deptColor = DEPT_COLORS[job.department] || '#aaa';
  return (
    <div style={{
      background: featured ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${featured ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '0.75rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{job.title}</h4>
          {featured && <span style={{ background: 'var(--gold, #C9A84C)', color: 'var(--navy, #0B1D3A)', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '3px', fontWeight: '700' }}>FEATURED</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Tag color={deptColor}>{job.department_display || job.department?.replace('_', ' ')}</Tag>
          <Tag color="rgba(255,255,255,0.3)">{job.location_display || job.location?.replace('_', ' ')}</Tag>
          <Tag color="rgba(255,255,255,0.3)">{job.job_type_display || job.job_type?.replace('_', ' ')}</Tag>
          {job.salary_range && <Tag color="rgba(129,199,132,0.4)">{job.salary_range}</Tag>}
          {job.deadline && <Tag color="rgba(255,167,38,0.3)">Deadline: {job.deadline}</Tag>}
        </div>
      </div>
      <Link to={`/careers/apply/${job.id}`} style={applyBtn}>Apply Now</Link>
    </div>
  );
}

const Tag = ({ color, children }) => (
  <span style={{ display: 'inline-block', padding: '0.15rem 0.6rem', background: `${color}22`, border: `1px solid ${color}66`, borderRadius: '3px', fontSize: '0.75rem', color: '#ddd' }}>
    {children}
  </span>
);

const selectStyle = {
  padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '4px', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
};

const applyBtn = {
  display: 'inline-block', padding: '0.55rem 1.25rem', background: 'var(--gold, #C9A84C)',
  color: 'var(--navy, #0B1D3A)', borderRadius: '4px', fontWeight: '600', fontSize: '0.875rem',
  textDecoration: 'none', whiteSpace: 'nowrap',
};