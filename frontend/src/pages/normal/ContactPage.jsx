import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../../services/api';

const OFFICES = [
  { city: 'Nairobi', country: 'Kenya', address: 'Wilson Airport, Langata Rd, Nairobi', phone: '+254 700 000 000', email: 'nairobi@nairobijethouse.com', flag: '🇰🇪' },
  { city: 'Dubai', country: 'UAE', address: 'DIFC Gate Building, Level 14', phone: '+971 4 000 0000', email: 'dubai@nairobijethouse.com', flag: '🇦🇪' },
  { city: 'London', country: 'UK', address: 'Harrods Aviation, Farnborough Airport', phone: '+44 20 0000 0000', email: 'london@nairobijethouse.com', flag: '🇬🇧' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', subject: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await contactAPI.create(form);
      setSubmitted(true);
    } catch {
      setError('Failed to send your message. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>✉️</div>
      <h2 style={{ color: '#fff', fontFamily: 'var(--font-display, Georgia, serif)' }}>Message Sent</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: '1.7' }}>
        Thank you for reaching out. Our team will respond within 24 hours.
      </p>
      <Link to="/" style={{ color: 'var(--gold, #C9A84C)', textDecoration: 'none' }}>← Back to Home</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', color: '#fff' }}>
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>← Home</Link>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 2rem 2rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: 'var(--gold, #C9A84C)', fontSize: '2.2rem', margin: 0 }}>Contact Us</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem' }}>
          Reach our team for charter enquiries, partnerships, media, or general support.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', flexWrap: 'wrap' }}>
        {/* Form */}
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Send a Message</h2>

          {error && (
            <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '4px', padding: '0.75rem', marginBottom: '1.25rem', color: '#ff6b7a', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your name" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+254 700 000 000" />
              <Field label="Company" name="company" value={form.company} onChange={handleChange} placeholder="Company (optional)" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Subject</label>
              <select name="subject" value={form.subject} onChange={handleChange} style={inputStyle}>
                <option value="general">General Inquiry</option>
                <option value="support">Customer Support</option>
                <option value="partnership">Partnership</option>
                <option value="media">Media & Press</option>
                <option value="careers">Careers</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Message <span style={{ color: 'var(--gold, #C9A84C)' }}>*</span></label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={6}
                placeholder="Tell us how we can help..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <button type="submit" disabled={submitting} style={btnStyle}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Get in Touch Directly</h2>

          <div style={{ marginBottom: '2rem' }}>
            {[
              ['📞', 'Charter Hotline', '+254 700 NJH 247 (24/7)'],
              ['📧', 'Charter Enquiries', 'charter@nairobijethouse.com'],
              ['📧', 'Partnerships & Operators', 'partners@nairobijethouse.com'],
              ['📧', 'Media & Press', 'media@nairobijethouse.com'],
              ['📧', 'Support', 'ops@nairobijethouse.com'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>{icon}</span>
                <div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{label}</p>
                  <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ color: 'var(--gold, #C9A84C)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Offices</h3>
          {OFFICES.map(o => (
            <div key={o.city} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <p style={{ margin: '0 0 0.25rem', color: '#fff', fontWeight: '600' }}>{o.flag} {o.city}, {o.country}</p>
              <p style={{ margin: '0 0 0.15rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{o.address}</p>
              <p style={{ margin: '0 0 0.15rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{o.phone}</p>
              <p style={{ margin: 0, color: 'var(--gold, #C9A84C)', fontSize: '0.82rem' }}>{o.email}</p>
            </div>
          ))}

          {/* Social / Quick Links */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/book-flight" style={outlineBtn}>Book a Flight</Link>
            <Link to="/careers" style={outlineBtn}>Join the Team</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={labelStyle}>{label} {required && <span style={{ color: 'var(--gold, #C9A84C)' }}>*</span>}</label>
    <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} style={inputStyle} />
  </div>
);

const labelStyle = { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.4rem' };
const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
  color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
};
const btnStyle = {
  width: '100%', padding: '0.85rem', background: 'var(--gold, #C9A84C)',
  color: 'var(--navy, #0B1D3A)', border: 'none', borderRadius: '4px',
  fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
};
const outlineBtn = {
  display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '4px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem',
};