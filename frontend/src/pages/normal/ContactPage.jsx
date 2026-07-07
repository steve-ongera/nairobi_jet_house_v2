// src/pages/normal/ContactPage.jsx

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
  telephone: '+254 724 878 136',
  email: 'nairobijethouse@gmail.com',
  sameAs: ['https://wa.me/254724878136'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
}

const OFFICES = [
  { 
    city: 'Nairobi', 
    country: 'Kenya', 
    address: 'Wilson Airport, Karen, Langata Rd, Nairobi, Kenya', 
    phone: '+254 724 878 136', 
    email: 'nairobi@nairobijethouse.com', 
    flag: '🇰🇪',
    lat: -1.3217,
    lng: 36.8150,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wilson+Airport,+Nairobi,+Nairobi+County&query_place_id=ChIJsecKN0YQLxgRk6kAkzxsn_8',
  },
  { 
    city: 'Dubai', 
    country: 'UAE', 
    address: 'DIFC Gate Building, Level 14', 
    phone: '+971 4 000 0000', 
    email: 'dubai@nairobijethouse.com', 
    flag: '🇦🇪',
    lat: 25.2048,
    lng: 55.2708,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=DIFC+Gate+Building,+Dubai',
  },
  { 
    city: 'London', 
    country: 'UK', 
    address: 'Harrods Aviation, Farnborough Airport', 
    phone: '+44 20 0000 0000', 
    email: 'london@nairobijethouse.com', 
    flag: '🇬🇧',
    lat: 51.5074,
    lng: -0.1278,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Harrods+Aviation,+Farnborough+Airport',
  },
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
  { icon: 'bi-telephone-fill', label: 'Phone / WhatsApp', value: '+254 724 878 136', href: 'tel:+254 724 878 136' },
  { icon: 'bi-envelope-fill',  label: 'General Email',    value: 'nairobijethouse@gmail.com', href: 'mailto:nairobijethouse@gmail.com' },
  { icon: 'bi-people-fill',    label: 'Careers',          value: 'careers@nairobijethouse.com', href: 'mailto:careers@nairobijethouse.com' },
  { icon: 'bi-whatsapp',       label: 'WhatsApp',         value: '+254 724 878 136', href: 'https://wa.me/254724878136' },
]

// Google Maps Component
function ContactMap() {
  const [selectedOffice, setSelectedOffice] = useState(0);

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(OFFICES[selectedOffice].address)}&output=embed`;
  
  return (
    <div className="contact-map-container">
      <div className="contact-map__header">
        <i className="bi bi-geo-alt"></i> Find Us
      </div>
      <div className="contact-map__body">
        <div className="contact-map__selector">
          {OFFICES.map((office, idx) => (
            <button
              key={office.city}
              className={`contact-map__btn ${selectedOffice === idx ? 'active' : ''}`}
              onClick={() => setSelectedOffice(idx)}
            >
              {office.flag} {office.city}
            </button>
          ))}
        </div>
        <div className="contact-map__iframe-wrapper">
          <iframe
            title="Office Location"
            src={mapUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="contact-map__info">
          <div className="contact-map__info-address">
            <i className="bi bi-building"></i>
            <div>
              <strong>{OFFICES[selectedOffice].city}, {OFFICES[selectedOffice].country}</strong>
              <p>{OFFICES[selectedOffice].address}</p>
              <a
                href={OFFICES[selectedOffice].mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-map__open-link"
              >
                <i className="bi bi-box-arrow-up-right"></i> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <meta name="description" content="Contact NairobiJetHouse 24/7. Our concierge team is ready to assist with charter enquiries, partnerships, and support. Offices in Nairobi (Wilson Airport), Dubai & London." />
        <meta name="keywords" content="contact NairobiJetHouse, private jet charter Nairobi contact, Wilson Airport jet charter office, Nairobi aviation concierge, charter booking support Kenya, NairobiJetHouse Dubai office, NairobiJetHouse London office" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/contact" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">
            <i className="bi bi-envelope"></i> Get in Touch
          </span>
          <h1>We're Here <em style={{ color: 'var(--color-gold-light)' }}>24 / 7</em></h1>
          <p>Our concierge team operates 24 hours a day, 7 days a week. Whether you have a question, a request, or simply want to learn more — we're ready.</p>
          <div className="contact-hero-actions">
            <a href="tel:+254 724 878 136" className="btn-outline-white">
              <i className="bi bi-telephone-fill"></i> +254 724 878 136
            </a>
            <a href="mailto:nairobijethouse@gmail.com" className="btn-outline-white">
              <i className="bi bi-envelope-fill"></i> nairobijethouse@gmail.com
            </a>
            <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" className="btn-outline-white">
              <i className="bi bi-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="contact-grid">

            {/* Left column - Contact Info & Offices */}
            <div>
              {/* Contact Items */}
              <div className="contact-items">
                {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                  <div key={label} className="contact-item">
                    <div className="contact-item__icon">
                      <i className={`bi ${icon}`}></i>
                    </div>
                    <div>
                      <div className="contact-item__label">{label}</div>
                      {href
                        ? <a href={href} className="contact-item__value">{value}</a>
                        : <div className="contact-item__value">{value}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Availability Badge */}
              <div className="alert-info contact-availability">
                <i className="bi bi-clock-history"></i>
                <span>Concierge available 24/7 — response within 2 hours</span>
              </div>

              {/* Google Map */}
              <ContactMap />

              {/* Quick Links */}
              <div className="contact-quick-links">
                <Link to="/private-jet-charter" className="btn-primary-gov btn-sm">
                  <i className="bi bi-airplane"></i> Book a Flight
                </Link>
                <Link to="/careers" className="btn-outline-gov btn-sm">
                  <i className="bi bi-briefcase"></i> Join the Team
                </Link>
              </div>
            </div>

            {/* Right column - Form */}
            <div className="contact-form-card">
              {success ? (
                <div className="contact-success">
                  <div className="contact-success__icon">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Message Received</h3>
                  <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.25rem' }}>
                    {success.message || 'Thank you for reaching out. Our team will respond within 24 hours.'}
                  </p>
                  <button className="btn-primary-gov btn-sm" onClick={() => setSuccess(null)}>
                    <i className="bi bi-arrow-counterclockwise"></i> Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="contact-form-header">
                    <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>Send a Message</h3>
                    <p className="contact-form-subtitle">Fill out the form below and we'll get back to you within 24 hours.</p>
                  </div>

                  {error && (
                    <div className="alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i className="bi bi-exclamation-circle"></i> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label-gov">Full Name <span className="required">*</span></label>
                        <input 
                          className="form-input-gov" 
                          required 
                          value={form.full_name}
                          onChange={e => set('full_name', e.target.value)} 
                          placeholder="Your full name" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">Email <span className="required">*</span></label>
                        <input 
                          className="form-input-gov" 
                          type="email" 
                          required 
                          value={form.email}
                          onChange={e => set('email', e.target.value)} 
                          placeholder="your@email.com" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">Phone</label>
                        <input 
                          className="form-input-gov" 
                          value={form.phone}
                          onChange={e => set('phone', e.target.value)} 
                          placeholder="+254 724 878 136" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">Company</label>
                        <input 
                          className="form-input-gov" 
                          value={form.company}
                          onChange={e => set('company', e.target.value)} 
                          placeholder="Optional" 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label-gov">Subject <span className="required">*</span></label>
                      <select 
                        className="form-input-gov" 
                        value={form.subject} 
                        onChange={e => set('subject', e.target.value)}
                      >
                        {SUBJECT_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label-gov">Message <span className="required">*</span></label>
                      <textarea
                        className="form-input-gov"
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button type="submit" className="btn-primary-gov btn-full" disabled={loading}>
                      {loading
                        ? <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div> Sending...</>
                        : <><i className="bi bi-send"></i> Send Message</>
                      }
                    </button>
                  </form>
                </>
              )}

              {/* ── Full Width Customer Service Image ── */}
              <div className="contact-service-image">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" 
                  alt="Our dedicated customer service team ready to assist you" 
                  loading="lazy"
                />
                <div className="contact-service-overlay">
                  <div className="contact-service-content">
                    <i className="bi bi-headset"></i>
                    <div>
                      <div className="contact-service-title">24/7 Customer Support</div>
                      <div className="contact-service-subtitle">Our team is ready to assist you anytime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }

        /* Hero Actions */
        .contact-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        /* Contact Items */
        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .contact-item {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all var(--transition-base);
        }
        .contact-item:hover {
          box-shadow: var(--shadow-sm);
          transform: translateY(-2px);
        }
        .contact-item__icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contact-item__icon i {
          font-size: 1.2rem;
          color: var(--color-gold);
        }
        .contact-item__label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-gold);
          margin-bottom: 0.25rem;
        }
        .contact-item__value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-navy);
          text-decoration: none;
        }
        .contact-item__value:hover {
          color: var(--color-gold-dark);
        }

        /* Availability */
        .contact-availability {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
        }

        /* Google Map */
        .contact-map-container {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .contact-map__header {
          background: var(--color-navy);
          color: var(--color-white);
          padding: 1rem 1.5rem;
          font-family: var(--font-label);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .contact-map__header i {
          color: var(--color-gold);
        }
        .contact-map__body {
          padding: 1rem;
        }
        .contact-map__selector {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .contact-map__btn {
          padding: 0.4rem 1rem;
          background: var(--color-off-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-sm);
          font-family: var(--font-label);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-mid-gray);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .contact-map__btn:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }
        .contact-map__btn.active {
          background: var(--color-navy);
          border-color: var(--color-navy);
          color: var(--color-white);
        }
        .contact-map__iframe-wrapper {
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .contact-map__info {
          padding: 0.75rem;
          background: var(--color-off-white);
          border-radius: var(--radius-sm);
        }
        .contact-map__info-address {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .contact-map__info-address i {
          color: var(--color-gold);
          font-size: 1rem;
          margin-top: 0.15rem;
        }
        .contact-map__info-address strong {
          color: var(--color-navy);
          font-size: 0.85rem;
        }
        .contact-map__info-address p {
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          margin-top: 0.25rem;
        }
        .contact-map__open-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-gold-dark);
          text-decoration: none;
        }
        .contact-map__open-link:hover {
          text-decoration: underline;
        }

        /* Quick Links */
        .contact-quick-links {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* Form Card */
        .contact-form-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          padding: 2rem;
          overflow: hidden;
        }
        .contact-form-header {
          margin-bottom: 1.5rem;
        }
        .contact-form-subtitle {
          color: var(--color-mid-gray);
          font-size: 0.875rem;
        }

        /* Success State */
        .contact-success {
          text-align: center;
          padding: 1rem 0;
        }
        .contact-success__icon {
          width: 80px;
          height: 80px;
          background: rgba(26,127,90,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .contact-success__icon i {
          font-size: 2.5rem;
          color: var(--color-success);
        }

        /* Full Width Button */
        .btn-full {
          width: 100%;
          justify-content: center;
        }

        /* ── Full Width Customer Service Image ── */
        .contact-service-image {
          margin-top: 2.75rem;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          width: calc(100% + 2rem);
          margin-left: -1rem;
          margin-right: -1rem;
          margin-bottom: 1rem;
          background: var(--color-navy-dark);
          min-height: 160px;
        }

        .contact-service-image img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .contact-service-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(11, 28, 54, 0.75) 0%, rgba(11, 28, 54, 0.4) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .contact-service-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
          text-align: center;
        }
        .contact-service-content i {
          font-size: 2.2rem;
          color: var(--color-gold);
          flex-shrink: 0;
        }
        .contact-service-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.1rem;
        }
        .contact-service-subtitle {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .contact-service-image {
            width: calc(100% + 3rem);
            margin-left: -1.5rem;
            margin-right: -1.5rem;
            margin-bottom: -1.5rem;
          }
        }

        @media (max-width: 768px) {
          .contact-form-card {
            padding: 1.5rem;
          }
          .contact-map__selector {
            justify-content: center;
          }
          .contact-hero-actions {
            flex-direction: column;
          }
          .contact-hero-actions a {
            width: 100%;
            justify-content: center;
          }
          .contact-service-image {
            width: calc(100% + 3rem);
            margin-left: -1.5rem;
            margin-right: -1.5rem;
            margin-bottom: -1.5rem;
          }
          .contact-service-image img {
            height: 160px;
          }
          .contact-service-content i {
            font-size: 1.8rem;
          }
          .contact-service-title {
            font-size: 0.95rem;
          }
          .contact-service-subtitle {
            font-size: 0.75rem;
          }
        }
        @media (max-width: 480px) {
          .contact-service-image img {
            height: 140px;
          }
          .contact-service-content {
            gap: 0.75rem;
          }
          .contact-service-content i {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}