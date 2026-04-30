// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { contactAPI } from '../../services/api';

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NairobiJetHouse',
  url: 'https://www.nairobijethouse.com',
  telephone: '+254724878136',
  email: 'nairobijethouse@gmail.com',
  sameAs: ['https://wa.me/254724878136'],
}

const OFFICES = [
  { city: 'Nairobi', country: 'Kenya', address: 'Wilson Airport, Langata Rd, Nairobi', phone: '+254 700 000 000', email: 'nairobi@nairobijethouse.com', flag: '🇰🇪' },
  { city: 'Dubai', country: 'UAE', address: 'DIFC Gate Building, Level 14', phone: '+971 4 000 0000', email: 'dubai@nairobijethouse.com', flag: '🇦🇪' },
  { city: 'London', country: 'UK', address: 'Harrods Aviation, Farnborough Airport', phone: '+44 20 0000 0000', email: 'london@nairobijethouse.com', flag: '🇬🇧' },
]

const SUBJECT_OPTIONS = [
  { value: 'general',     label: 'General Inquiry' },
  { value: 'support',     label: 'Customer Support' },
  { value: 'media',       label: 'Media & Press' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'careers',     label: 'Careers' },
  { value: 'other',       label: 'Other' },
]

const CONTACT_ITEMS = [
  { icon: 'bi-telephone-fill', label: 'Phone / WhatsApp', value: '+254 724 878 136', href: 'tel:+254724878136' },
  { icon: 'bi-envelope-fill',  label: 'General Email',    value: 'nairobijethouse@gmail.com', href: 'mailto:nairobijethouse@gmail.com' },
  { icon: 'bi-people-fill',    label: 'Careers',          value: 'careers@nairobijethouse.com', href: 'mailto:careers@nairobijethouse.com' },
  { icon: 'bi-whatsapp',       label: 'WhatsApp',         value: '+254 724 878 136', href: 'https://wa.me/254724878136' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  const blank = () => ({ full_name: '', email: '', phone: '', company: '', subject: 'general', message: '' })
  const [form, setForm]       = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => setForm(blank())

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const response = await contactAPI.create(form)
      setSuccess(response.data || { message: 'Your message has been sent. We will respond within 24 hours.' })
      reset()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to send your message. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us | NairobiJetHouse - 24/7 Private Aviation Support</title>
        <meta name="description" content="Contact NairobiJetHouse 24/7. Our concierge team is ready to assist with charter enquiries, partnerships, and support. Offices in Nairobi, Dubai & London." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/contact" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
            <i className="bi bi-envelope" /> Get in Touch
          </div>
          <h1>We're Here <em style={{ color: 'var(--gold-light)' }}>24 / 7</em></h1>
          <p style={{ maxWidth: 480, marginTop: '0.5rem' }}>
            Our concierge team operates 24 hours a day, 7 days a week. Whether you have a question,
            a request, or simply want to learn more — we're ready.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="tel:+254724878136" className="btn btn-outline-gold btn-sm">
              <i className="bi bi-telephone-fill" /> +254 724 878 136
            </a>
            <a href="mailto:nairobijethouse@gmail.com" className="btn btn-outline-gold btn-sm" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
              <i className="bi bi-envelope-fill" /> nairobijethouse@gmail.com
            </a>
            <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" className="btn btn-outline-gold btn-sm" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
              <i className="bi bi-whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="contact-grid">

            {/* Left column - Contact Info & Offices */}
            <div>
              {/* Contact Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                  <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--r)', flexShrink: 0,
                      background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <div className="text-xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)' }}>{label}</div>
                      {href
                        ? <a href={href} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>{value}</a>
                        : <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{value}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Availability Badge */}
              <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
                <i className="bi bi-clock-history" />
                <span>Concierge available 24/7 — response within 2 hours</span>
              </div>

              {/* Offices Section */}
              <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                <i className="bi bi-building" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} /> Our Global Offices
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {OFFICES.map(o => (
                  <div key={o.city} className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                      {o.flag} {o.city}, {o.country}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>{o.address}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>{o.phone}</div>
                    <a href={`mailto:${o.email}`} style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>{o.email}</a>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/book-flight" className="btn btn-navy btn-sm">
                  <i className="bi bi-airplane" /> Book a Flight
                </Link>
                <Link to="/careers" className="btn btn-outline-navy btn-sm">
                  <i className="bi bi-briefcase" /> Join the Team
                </Link>
              </div>
            </div>

            {/* Right column - Form */}
            <div className="card" style={{ padding: '2rem' }}>
              {success ? (
                <div className="success-state" style={{ textAlign: 'center' }}>
                  <div className="success-icon">
                    <i className="bi bi-check-lg" />
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Message Received</h3>
                  <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
                    {success.message || 'Thank you for reaching out. Our team will respond within 24 hours.'}
                  </p>
                  <button className="btn btn-navy btn-sm" onClick={() => setSuccess(null)}>
                    <i className="bi bi-arrow-counterclockwise" /> Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ marginBottom: '0.25rem' }}>Send a Message</h3>
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>

                  {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                      <i className="bi bi-exclamation-circle" /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name <span className="req">*</span></label>
                        <input 
                          className="form-control" 
                          required 
                          value={form.full_name}
                          onChange={e => set('full_name', e.target.value)} 
                          placeholder="Your full name" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email <span className="req">*</span></label>
                        <input 
                          className="form-control" 
                          type="email" 
                          required 
                          value={form.email}
                          onChange={e => set('email', e.target.value)} 
                          placeholder="your@email.com" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input 
                          className="form-control" 
                          value={form.phone}
                          onChange={e => set('phone', e.target.value)} 
                          placeholder="+254 700 000 000" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input 
                          className="form-control" 
                          value={form.company}
                          onChange={e => set('company', e.target.value)} 
                          placeholder="Optional" 
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Subject <span className="req">*</span></label>
                      <select 
                        className="form-control" 
                        value={form.subject} 
                        onChange={e => set('subject', e.target.value)}
                      >
                        {SUBJECT_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Message <span className="req">*</span></label>
                      <textarea
                        className="form-control"
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button type="submit" className="btn btn-navy btn-full" disabled={loading}>
                      {loading
                        ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending...</>
                        : <><i className="bi bi-send" /> Send Message</>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .success-state {
          text-align: center;
          padding: 1rem 0;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: var(--green-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.75rem;
          color: var(--green);
        }
      `}</style>

      <PublicFooter />
    </>
  )
}