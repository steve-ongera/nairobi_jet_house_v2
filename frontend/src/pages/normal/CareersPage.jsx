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
        <meta name="description" content="Build Africa's aviation future with NairobiJetHouse. We're hiring across operations, technology, charter services, and more. Join a fast-growing private aviation platform." />
        <meta name="keywords" content="aviation careers, private jet jobs, airline careers, Nairobi jobs, aviation jobs Africa" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/careers" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">
            <i className="bi bi-briefcase"></i> Join the Team
          </span>
          <h1>Build Africa's <em style={{ color: 'var(--color-gold-light)' }}>Aviation Future</em></h1>
          <p>We're a fast-growing private aviation platform hiring across operations, technology, charter services, and more. We operate across 35 countries and are headquartered in Nairobi, Kenya.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          
          {/* Filters */}
          <div className="careers-filters">
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)} 
              className="form-input-gov careers-filter-select"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="form-input-gov careers-filter-select"
            >
              <option value="">All Types</option>
              {['full_time', 'part_time', 'contract', 'internship'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            {(deptFilter || typeFilter) && (
              <button 
                onClick={() => { setDeptFilter(''); setTypeFilter(''); }}
                className="btn-ghost btn-sm"
              >
                <i className="bi bi-x-circle"></i> Clear filters
              </button>
            )}
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="loading-page">
              <div className="spinner-gov"></div>
              <p>Loading positions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h3>No open positions</h3>
              <p>No open positions matching your filters.</p>
              <button 
                onClick={() => { setDeptFilter(''); setTypeFilter(''); }}
                className="btn-primary-gov btn-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="careers-jobs-list">
              {featured.length > 0 && (
                <div className="careers-section">
                  <div className="section-label">Featured Roles</div>
                  {featured.map(job => <JobCard key={job.id} job={job} featured />)}
                </div>
              )}
              {regular.length > 0 && (
                <div className="careers-section">
                  {featured.length > 0 && <div className="section-label">All Open Positions</div>}
                  {regular.map(job => <JobCard key={job.id} job={job} />)}
                </div>
              )}
            </div>
          )}

          {/* Perks Section */}
          <div className="careers-perks">
            <div className="section-header centered">
              <div className="section-label">Why NairobiJetHouse?</div>
              <h2 className="section-title">Join a Team That <em style={{ color: 'var(--color-gold)' }}>Takes Flight</em></h2>
              <div className="gold-divider center"></div>
            </div>
            <div className="careers-perks-grid">
              {PERKS.map(({ icon, title, desc }) => (
                <div key={title} className="careers-perk-card">
                  <div className="careers-perk-icon">
                    <i className={`bi ${icon}`}></i>
                  </div>
                  <h4 className="careers-perk-title">{title}</h4>
                  <p className="careers-perk-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="careers-cta">
            <h3>Don't see the perfect role?</h3>
            <p>We're always looking for talented people. Send us your CV and we'll keep you in mind.</p>
            <div className="careers-cta-actions">
              <Link to="/contact?subject=careers" className="btn-gold">
                <i className="bi bi-envelope"></i> Send Speculative Application
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Careers Filters */
        .careers-filters {
          display: flex;
          gap: 1rem;
          justify-content: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .careers-filter-select {
          width: auto;
          min-width: 180px;
        }
        @media (max-width: 768px) {
          .careers-filters {
            flex-direction: column;
          }
          .careers-filter-select {
            width: 100%;
          }
        }

        /* Jobs List */
        .careers-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .careers-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Job Card */
        .careers-job-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          transition: all var(--transition-base);
        }
        .careers-job-card.featured {
          border: 2px solid var(--color-gold);
          background: var(--color-off-white);
        }
        .careers-job-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .careers-job-card__content {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .careers-job-card__info {
          flex: 1;
        }
        .careers-job-card__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .careers-job-card__title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0;
        }
        .careers-job-card__featured {
          font-size: 0.65rem;
        }
        .careers-job-card__meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .careers-job-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          background: var(--color-off-white);
          border: 1px solid var(--color-light-gray);
          font-family: var(--font-label);
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--color-mid-gray);
        }
        .careers-job-meta i {
          font-size: 0.7rem;
          color: var(--color-gold);
        }
        .careers-job-meta--success {
          background: rgba(26,127,90,0.1);
          border-color: rgba(26,127,90,0.2);
          color: var(--color-success);
        }
        .careers-job-meta--warning {
          background: rgba(200,117,0,0.1);
          border-color: rgba(200,117,0,0.2);
          color: var(--color-warning);
        }
        .careers-job-card__action {
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .careers-job-card__content {
            flex-direction: column;
            align-items: stretch;
          }
          .careers-job-card__action {
            width: 100%;
            justify-content: center;
          }
        }

        /* Perks Section */
        .careers-perks {
          margin-top: 4rem;
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2.5rem;
        }
        .careers-perks-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        .careers-perk-card {
          text-align: center;
          padding: 1rem;
        }
        .careers-perk-icon {
          width: 64px;
          height: 64px;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .careers-perk-icon i {
          font-size: 1.6rem;
          color: var(--color-gold);
        }
        .careers-perk-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .careers-perk-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--color-mid-gray);
          margin: 0;
        }
        @media (max-width: 900px) {
          .careers-perks-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .careers-perks {
            padding: 1.5rem;
          }
          .careers-perks-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* CTA Section */
        .careers-cta {
          margin-top: 2rem;
          text-align: center;
          padding: 3rem;
          background: var(--color-navy);
          position: relative;
          overflow: hidden;
        }
        .careers-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .careers-cta h3 {
          color: var(--color-white);
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        .careers-cta p {
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }
        .careers-cta-actions {
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .careers-cta {
            padding: 2rem;
          }
        }
      `}</style>
    </>
  );
}

function JobCard({ job, featured }) {
  return (
    <div className={`careers-job-card ${featured ? 'featured' : ''}`}>
      <div className="careers-job-card__content">
        <div className="careers-job-card__info">
          <div className="careers-job-card__header">
            <h4 className="careers-job-card__title">{job.title}</h4>
            {featured && (
              <span className="badge-gold careers-job-card__featured">
                <i className="bi bi-star-fill"></i> FEATURED
              </span>
            )}
          </div>
          <div className="careers-job-card__meta">
            <span className="careers-job-meta">
              <i className="bi bi-building"></i> {job.department_display || job.department?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="careers-job-meta">
              <i className="bi bi-geo-alt"></i> {job.location_display || job.location?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="careers-job-meta">
              <i className="bi bi-briefcase"></i> {job.job_type_display || job.job_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {job.salary_range && (
              <span className="careers-job-meta careers-job-meta--success">
                <i className="bi bi-cash"></i> {job.salary_range}
              </span>
            )}
            {job.deadline && (
              <span className="careers-job-meta careers-job-meta--warning">
                <i className="bi bi-calendar"></i> Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Link to={`/careers/apply/${job.id}`} className="btn-primary-gov btn-sm careers-job-card__action">
          Apply Now <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}