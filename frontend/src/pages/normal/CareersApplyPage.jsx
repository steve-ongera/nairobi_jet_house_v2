import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';

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

  if (loadingJob) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading job details...</p>
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#fff', fontSize: '1.2rem' }}>Position not found</p>
      <Link to="/careers" style={goldLink}>← View all positions</Link>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>✅</div>
      <h2 style={{ color: '#fff', fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.8rem', textAlign: 'center' }}>Application Submitted!</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '480px', lineHeight: '1.7' }}>
        Thank you for applying for <strong style={{ color: 'var(--gold, #C9A84C)' }}>{job.title}</strong>. Our HR team will review your application and get back to you within 5–7 business days.
      </p>
      <Link to="/careers" style={{ padding: '0.75rem 1.5rem', background: 'var(--gold, #C9A84C)', color: 'var(--navy, #0B1D3A)', borderRadius: '4px', fontWeight: '600', textDecoration: 'none' }}>
        View More Positions
      </Link>
    </div>
  );

  const Field = ({ label, name, type = 'text', placeholder, required, textarea, rows = 5 }) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
        {label} {required && <span style={{ color: 'var(--gold, #C9A84C)' }}>*</span>}
      </label>
      {textarea ? (
        <textarea name={name} value={form[name]} onChange={handleChange} required={required}
          placeholder={placeholder} rows={rows}
          style={{ ...inputStyle, resize: 'vertical', borderColor: fieldErrors[name] ? '#ff6b7a' : 'rgba(255,255,255,0.15)' }} />
      ) : (
        <input name={name} type={type} value={form[name]} onChange={handleChange} required={required}
          placeholder={placeholder}
          style={{ ...inputStyle, borderColor: fieldErrors[name] ? '#ff6b7a' : 'rgba(255,255,255,0.15)' }} />
      )}
      {fieldErrors[name] && <p style={{ color: '#ff6b7a', fontSize: '0.78rem', margin: '0.3rem 0 0' }}>{Array.isArray(fieldErrors[name]) ? fieldErrors[name][0] : fieldErrors[name]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/careers" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Careers</Link>
        </div>

        {/* Job Summary */}
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: '#fff', fontSize: '1.6rem', margin: '0 0 0.5rem' }}>{job.title}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Chip>{job.department_display || job.department}</Chip>
            <Chip>{job.location_display || job.location}</Chip>
            <Chip>{job.job_type_display || job.job_type}</Chip>
            {job.salary_range && <Chip>{job.salary_range}</Chip>}
          </div>
          {job.description && (
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', fontSize: '0.9rem', margin: 0 }}>
              {job.description.slice(0, 300)}{job.description.length > 300 ? '...' : ''}
            </p>
          )}
          {job.requirements && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ color: 'var(--gold, #C9A84C)', cursor: 'pointer', fontSize: '0.875rem' }}>View Full Requirements</summary>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', fontSize: '0.875rem', marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
            </details>
          )}
        </div>

        {/* Application Form */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2rem' }}>
          <h2 style={{ color: '#fff', marginBottom: '1.75rem', fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.3rem' }}>Your Application</h2>

          {error && (
            <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ff6b7a', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Field label="Full Name" name="full_name" placeholder="Your full name" required />
              <Field label="Email" name="email" type="email" placeholder="you@email.com" required />
              <Field label="Phone" name="phone" placeholder="+254 700 000 000" />
              <Field label="Nationality" name="nationality" placeholder="e.g. Kenyan" />
              <Field label="Current Role" name="current_role" placeholder="e.g. Charter Manager" />
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Years of Experience</label>
                <input type="number" name="years_experience" value={form.years_experience} onChange={handleChange} min={0} max={50} style={inputStyle} />
              </div>
            </div>

            <Field label="LinkedIn Profile URL" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/yourname" />
            <Field label="Portfolio / Website URL" name="portfolio_url" type="url" placeholder="https://yourportfolio.com" />
            <Field label="Resume / CV URL" name="resume_url" type="url" placeholder="Link to your CV (Google Drive, Dropbox, etc.)" />
            <Field label="Cover Letter" name="cover_letter" placeholder="Tell us why you want to work at NairobiJetHouse and why you're a great fit for this role..." required textarea rows={7} />

            <button type="submit" disabled={submitting} style={submitBtn}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Chip = ({ children }) => (
  <span style={{ padding: '0.2rem 0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
    {children}
  </span>
);

const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
  color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
};

const submitBtn = {
  width: '100%', padding: '0.9rem', background: 'var(--gold, #C9A84C)',
  color: 'var(--navy, #0B1D3A)', border: 'none', borderRadius: '4px',
  fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem',
};

const goldLink = { color: 'var(--gold, #C9A84C)', textDecoration: 'none' };