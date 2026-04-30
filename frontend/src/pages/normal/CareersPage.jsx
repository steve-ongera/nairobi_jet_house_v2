// src/pages/public/Careers.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { jobsAPI } from '../../services/api';

const DEPT_COLORS = {
  operations: '#4fc3f7', commercial: '#81c784', charter: '#ffb74d',
  technical: '#ce93d8', concierge: '#f48fb1', finance: '#a5d6a7',
  it: '#64b5f6', hr: '#ffcc02', marketing: '#ff8a65', management: '#ef9a9a',
  partnerships: '#80cbc4',
};

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NairobiJetHouse Careers',
  url: 'https://www.nairobijethouse.com/careers',
  sameAs: ['https://www.linkedin.com/company/nairobijethouse'],
}

const PERKS = [
  { icon: 'bi-airplane', title: 'Aviation Perks', desc: 'Flight benefits and discounts for you and your family on our charter network.' },
  { icon: 'bi-globe2', title: 'Pan-African Scope', desc: 'Work on a platform that operates across 35 countries with global clients.' },
  { icon: 'bi-graph-up', title: 'Fast Growth', desc: 'Join a startup scaling rapidly — your work has direct impact from day one.' },
  { icon: 'bi-house-door', title: 'Flexible Work', desc: 'Remote-first culture with hubs in Nairobi, Dubai, London, and Lagos.' },
  { icon: 'bi-trophy', title: 'Career Development', desc: 'Continuous learning budget and mentorship programs to grow your career.' },
  { icon: 'bi-heart', title: 'Great Culture', desc: 'Collaborative, inclusive, and passionate team that celebrates wins together.' },
]

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
    <>
      <Helmet>
        <title>Careers | NairobiJetHouse - Join Our Team</title>
        <meta name="description" content="Build Africa's aviation future with NairobiJetHouse. We're hiring across operations, technology, charter services, and more." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/careers" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Join the Team</div>
          <h1>Build Africa's <em style={{ color: 'var(--gold-light)' }}>Aviation Future</em></h1>
          <p style={{ maxWidth: 580, marginTop: '0.5rem' }}>
            We're a fast-growing private aviation platform hiring across operations, technology, charter services, and more. 
            We operate across 35 countries and are headquartered in Nairobi, Kenya.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          
          {/* Filters */}
          <div className="filter-bar" style={{ marginBottom: '2rem' }}>
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)} 
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="form-control"
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="">All Types</option>
              {['full_time', 'part_time', 'contract', 'internship'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            {(deptFilter || typeFilter) && (
              <button 
                onClick={() => { setDeptFilter(''); setTypeFilter(''); }}
                className="btn btn-ghost btn-sm"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Jobs List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner-dark" style={{ margin: '0 auto' }}></div>
              <p style={{ color: 'var(--gray-400)', marginTop: '1rem' }}>Loading positions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '1rem', display: 'block' }} />
              <p style={{ color: 'var(--gray-400)' }}>No open positions matching your filters.</p>
              <button 
                onClick={() => { setDeptFilter(''); setTypeFilter(''); }}
                className="btn btn-outline-navy btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div className="eyebrow" style={{ marginBottom: '1rem' }}>Featured Roles</div>
                  {featured.map(job => <JobCard key={job.id} job={job} featured />)}
                </div>
              )}
              {regular.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <div className="eyebrow" style={{ marginBottom: '1rem' }}>All Open Positions</div>
                  )}
                  {regular.map(job => <JobCard key={job.id} job={job} />)}
                </div>
              )}
            </>
          )}

          {/* Perks Section */}
          <div className="card" style={{ marginTop: '4rem', padding: '2.5rem' }}>
            <div className="text-center mb-4">
              <div className="eyebrow">Why NairobiJetHouse?</div>
              <h2>Join a Team That <em>Takes Flight</em></h2>
              <div className="gold-rule gold-rule-center" />
            </div>
            <div className="grid-3" style={{ marginTop: '2rem' }}>
              {PERKS.map(({ icon, title, desc }) => (
                <div key={title} style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{
                    width: 64, height: 64, background: 'var(--gold-pale)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <i className={`bi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--gold)' }} />
                  </div>
                  <h4 style={{ color: 'var(--navy)', marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', background: 'var(--navy)' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Don't see the perfect role?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
              We're always looking for talented people. Send us your CV and we'll keep you in mind.
            </p>
            <Link to="/contact?subject=careers" className="btn btn-gold">
              <i className="bi bi-envelope" /> Send Speculative Application
            </Link>
          </div>

        </div>
      </section>

      <PublicFooter />
    </>
  );
}

function JobCard({ job, featured }) {
  const deptColor = DEPT_COLORS[job.department] || '#aaa';
  
  return (
    <div className={`card ${featured ? 'featured' : ''}`} style={{ 
      marginBottom: '1rem',
      border: featured ? '2px solid var(--gold)' : '1px solid var(--gray-100)',
      background: featured ? 'var(--gold-pale)' : 'var(--white)',
    }}>
      <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h4 style={{ margin: 0, color: 'var(--navy)', fontSize: '1rem' }}>{job.title}</h4>
            {featured && (
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                <i className="bi bi-star-fill" /> FEATURED
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="pill" style={{ 
              background: `${deptColor}22`, 
              borderColor: deptColor,
              color: deptColor,
              cursor: 'default'
            }}>
              <i className="bi bi-building" /> {job.department_display || job.department?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="pill" style={{ cursor: 'default' }}>
              <i className="bi bi-geo-alt" /> {job.location_display || job.location?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="pill" style={{ cursor: 'default' }}>
              <i className="bi bi-briefcase" /> {job.job_type_display || job.job_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {job.salary_range && (
              <span className="pill" style={{ background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green)', cursor: 'default' }}>
                <i className="bi bi-cash" /> {job.salary_range}
              </span>
            )}
            {job.deadline && (
              <span className="pill" style={{ background: 'var(--amber-light)', borderColor: 'var(--amber)', color: 'var(--amber)', cursor: 'default' }}>
                <i className="bi bi-calendar" /> Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Link to={`/careers/apply/${job.id}`} className="btn btn-navy btn-sm">
          Apply Now <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}