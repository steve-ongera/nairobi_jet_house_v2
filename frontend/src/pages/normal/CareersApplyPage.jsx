// src/pages/public/CareersApplyPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { jobsAPI } from '../../services/api';

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Apply for Career | NairobiJetHouse',
  description: 'Submit your job application to join the NairobiJetHouse team.',
}

export default function CareersApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', nationality: '',
    current_role: '', years_experience: 0, linkedin_url: '',
    portfolio_url: '', resume_url: '', cover_letter: '',
  });

  useEffect(() => {
    jobsAPI.get(id)
      .then(res => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoadingJob(false));
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await jobsAPI.apply({ ...form, job: id });
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && !Array.isArray(data)) setFieldErrors(data);
      else setError(data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="spinner-dark" style={{ margin: '0 auto' }}></div>
            <p style={{ color: 'var(--gray-400)', marginTop: '1rem' }}>Loading job details...</p>
          </div>
        </section>
        <PublicFooter />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 480 }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '1rem', display: 'block' }} />
            <h3>Position Not Found</h3>
            <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>The job posting you're looking for doesn't exist or has been filled.</p>
            <Link to="/careers" className="btn btn-navy">
              <i className="bi bi-arrow-left"></i> View All Positions
            </Link>
          </div>
        </section>
        <PublicFooter />
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Application Submitted | NairobiJetHouse Careers</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Application Submitted!</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>
                Thank you for applying for{' '}
                <strong style={{ color: 'var(--gold)' }}>{job.title}</strong>
              </p>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Our HR team will review your application and get back to you within 5–7 business days.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/careers" className="btn btn-navy">
                  <i className="bi bi-briefcase"></i> View More Positions
                </Link>
                <Link to="/" className="btn btn-outline-navy">
                  <i className="bi bi-house"></i> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Apply for {job.title} | NairobiJetHouse Careers</title>
        <meta name="description" content={`Apply for the ${job.title} position at NairobiJetHouse. Join our team and help build Africa's aviation future.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.nairobijethouse.com/careers/apply/${id}`} />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">
            <i className="bi bi-briefcase" /> Apply Now
          </div>
          <h1>Join Our <em style={{ color: 'var(--gold-light)' }}>Team</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Submit your application for the position below. We're excited to learn more about you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          
          {/* Job Summary Card */}
          <div className="detail-card" style={{ marginBottom: '2rem' }}>
            <div className="detail-card-header">
              <div className="detail-card-title">
                <i className="bi bi-info-circle"></i> Position Details
              </div>
            </div>
            <div className="detail-card-body">
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--navy)' }}>{job.title}</h2>
              
              <div className="filter-bar" style={{ marginBottom: '1rem', paddingBottom: 0 }}>
                <span className="pill" style={{ cursor: 'default' }}>
                  <i className="bi bi-building"></i> {job.department_display || job.department?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="pill" style={{ cursor: 'default' }}>
                  <i className="bi bi-geo-alt"></i> {job.location_display || job.location?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="pill" style={{ cursor: 'default' }}>
                  <i className="bi bi-clock"></i> {job.job_type_display || job.job_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {job.salary_range && (
                  <span className="pill" style={{ background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green)', cursor: 'default' }}>
                    <i className="bi bi-cash"></i> {job.salary_range}
                  </span>
                )}
              </div>

              {job.description && (
                <>
                  <div className="gold-rule" style={{ margin: '1rem 0' }} />
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--navy)' }}>Job Description</strong>
                    <p style={{ color: 'var(--gray-500)', lineHeight: 1.7, fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      {job.description}
                    </p>
                  </div>
                </>
              )}

              {job.requirements && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>
                    <i className="bi bi-eye"></i> View Full Requirements
                  </summary>
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'var(--gray-50)', 
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--gray-100)'
                  }}>
                    <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {job.requirements}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Application Form Card */}
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="detail-card-title">
                <i className="bi bi-file-text"></i> Your Application
              </div>
            </div>
            <div className="detail-card-body">
              
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  <i className="bi bi-exclamation-triangle"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      name="full_name" 
                      value={form.full_name} 
                      onChange={handleChange} 
                      placeholder="Your full name"
                      required 
                    />
                    {fieldErrors.full_name && <div className="form-error">{fieldErrors.full_name[0]}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      placeholder="you@email.com"
                      required 
                    />
                    {fieldErrors.email && <div className="form-error">{fieldErrors.email[0]}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input 
                      className="form-control" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <input 
                      className="form-control" 
                      name="nationality" 
                      value={form.nationality} 
                      onChange={handleChange} 
                      placeholder="e.g., Kenyan"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Current Role</label>
                    <input 
                      className="form-control" 
                      name="current_role" 
                      value={form.current_role} 
                      onChange={handleChange} 
                      placeholder="e.g., Charter Manager"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="years_experience" 
                      value={form.years_experience} 
                      onChange={handleChange} 
                      min={0} 
                      max={50}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    name="linkedin_url" 
                    value={form.linkedin_url} 
                    onChange={handleChange} 
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio / Website URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    name="portfolio_url" 
                    value={form.portfolio_url} 
                    onChange={handleChange} 
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume / CV URL <span className="req">*</span></label>
                  <input 
                    type="url" 
                    className="form-control" 
                    name="resume_url" 
                    value={form.resume_url} 
                    onChange={handleChange} 
                    placeholder="Link to your CV (Google Drive, Dropbox, etc.)"
                    required 
                  />
                  <span className="form-hint">Please upload your CV to a cloud service and share the link here</span>
                  {fieldErrors.resume_url && <div className="form-error">{fieldErrors.resume_url[0]}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Letter <span className="req">*</span></label>
                  <textarea 
                    className="form-control" 
                    name="cover_letter" 
                    value={form.cover_letter} 
                    onChange={handleChange} 
                    placeholder="Tell us why you want to work at NairobiJetHouse and why you're a great fit for this role..."
                    rows={6}
                    required
                  />
                  {fieldErrors.cover_letter && <div className="form-error">{fieldErrors.cover_letter[0]}</div>}
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-navy btn-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner" style={{ borderTopColor: 'white' }}></span>
                        &nbsp; Submitting Application...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send"></i> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}