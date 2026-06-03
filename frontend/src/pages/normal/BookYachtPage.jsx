// src/pages/public/BookYachtPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { charterAPI } from '../../services/api';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Yacht Charter Request | NairobiJetHouse',
  description: 'Request a superyacht charter quote. Fill out our form and receive a personalised proposal within 4 hours.',
}

export default function BookYachtPage() {
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    departure_port: '', destination_port: '', charter_start: '', charter_end: '',
    guest_count: 2, itinerary_description: '', special_requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    try {
      const { data } = await charterAPI.create(form);
      setSuccess(data.charter?.reference);
    } catch(e) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again or contact us directly.');
    } finally { 
      setLoading(false); 
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Charter Request Received | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="yacht-success">
              <div className="yacht-success__icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Charter Request Received</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                Our yacht specialists will respond with a tailored proposal within 4 hours.
              </p>
              <div className="yacht-success__ref">
                <div className="yacht-success__ref-label">Reference Number</div>
                <div className="yacht-success__ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="yacht-success__actions">
                <Link to="/track" className="btn-primary-gov">
                  <i className="bi bi-search"></i> Track Your Request
                </Link>
                <Link to="/yachts" className="btn-outline-gov">
                  <i className="bi bi-water"></i> Browse More Yachts
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />

        <style>{`
          .yacht-success {
            text-align: center;
            max-width: 500px;
            margin: 0 auto;
          }
          .yacht-success__icon {
            width: 80px;
            height: 80px;
            background: rgba(26,127,90,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .yacht-success__icon i {
            font-size: 2.5rem;
            color: var(--color-success);
          }
          .yacht-success__ref {
            background: var(--color-off-white);
            border: 1px solid var(--color-light-gray);
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .yacht-success__ref-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--color-gold);
            margin-bottom: 0.25rem;
          }
          .yacht-success__ref-value {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-navy);
          }
          .yacht-success__actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .yacht-success__actions {
              flex-direction: column;
            }
            .yacht-success__actions a {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Yacht Charter Request | NairobiJetHouse - Luxury Superyacht Rentals</title>
        <meta name="description" content="Request a superyacht charter quote. Fill out our simple form and receive a personalised proposal within 4 hours. Worldwide luxury yacht charters available." />
        <meta name="keywords" content="yacht charter, superyacht rental, luxury yacht charter, book a yacht, crewed yacht" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/book-yacht" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">
            <i className="bi bi-water"></i> Yacht Charter
          </span>
          <h1>Request Your <em style={{ color: 'var(--color-gold-light)' }}>Bespoke Yacht Experience</em></h1>
          <p>Complete the form below and our yacht specialists will respond with a tailored proposal within 4 hours.</p>
        </div>
      </div>

      {/* Form Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          
          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Contact Information */}
            <div className="yacht-form-card">
              <div className="yacht-form-card__header">
                <i className="bi bi-person"></i> Contact Information
              </div>
              <div className="yacht-form-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Full Name <span className="required">*</span></label>
                    <input 
                      className="form-input-gov" 
                      value={form.guest_name} 
                      onChange={e => set('guest_name', e.target.value)} 
                      required 
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Email <span className="required">*</span></label>
                    <input 
                      type="email" 
                      className="form-input-gov" 
                      value={form.guest_email} 
                      onChange={e => set('guest_email', e.target.value)} 
                      required 
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Phone</label>
                    <input 
                      className="form-input-gov" 
                      value={form.guest_phone} 
                      onChange={e => set('guest_phone', e.target.value)} 
                      placeholder="+254724878136"
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
              </div>
            </div>

            {/* Charter Details */}
            <div className="yacht-form-card">
              <div className="yacht-form-card__header">
                <i className="bi bi-water"></i> Charter Details
              </div>
              <div className="yacht-form-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Departure Port <span className="required">*</span></label>
                    <input 
                      className="form-input-gov" 
                      value={form.departure_port} 
                      onChange={e => set('departure_port', e.target.value)} 
                      required 
                      placeholder="e.g., Monte Carlo, Malé, Athens"
                    />
                    <div className="form-hint">Where will your voyage begin?</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Destination Port</label>
                    <input 
                      className="form-input-gov" 
                      value={form.destination_port} 
                      onChange={e => set('destination_port', e.target.value)} 
                      placeholder="Or return to departure port"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Charter Start <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-input-gov" 
                      value={form.charter_start} 
                      onChange={e => set('charter_start', e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Charter End <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-input-gov" 
                      value={form.charter_end} 
                      onChange={e => set('charter_end', e.target.value)} 
                      min={form.charter_start || new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Number of Guests <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min={1} 
                      max={200} 
                      className="form-input-gov" 
                      value={form.guest_count} 
                      onChange={e => set('guest_count', parseInt(e.target.value))} 
                      required 
                    />
                    <div className="form-hint">Maximum 200 guests on most vessels</div>
                  </div>
                </div>

                {/* Duration preview */}
                {form.charter_start && form.charter_end && (
                  <div className="alert-info yacht-duration-preview">
                    <i className="bi bi-calculator"></i>
                    <span>
                      Estimated duration: {
                        Math.ceil((new Date(form.charter_end) - new Date(form.charter_start)) / (1000 * 60 * 60 * 24))
                      } nights
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary & Special Requests */}
            <div className="yacht-form-card">
              <div className="yacht-form-card__header">
                <i className="bi bi-map"></i> Voyage Preferences
              </div>
              <div className="yacht-form-card__body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label-gov">Itinerary Description</label>
                  <textarea 
                    className="form-input-gov" 
                    rows={3} 
                    value={form.itinerary_description} 
                    onChange={e => set('itinerary_description', e.target.value)} 
                    placeholder="Describe your preferred route, destinations, islands to visit, or any specific places you'd like to explore..."
                  />
                  <div className="form-hint">The more details, the better we can tailor your experience</div>
                </div>

                <div className="form-group">
                  <label className="form-label-gov">Special Requests</label>
                  <textarea 
                    className="form-input-gov" 
                    rows={2} 
                    value={form.special_requests} 
                    onChange={e => set('special_requests', e.target.value)} 
                    placeholder="Dietary requirements, celebration packages, water sports preferences, or any special occasions..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn-primary-gov btn-full yacht-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Charter Request
                  </>
                )}
              </button>
              <p className="yacht-security-note">
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 4 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Yacht Form Card Styles - Border radius 8-10px */
        .yacht-form-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .yacht-form-card__header {
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
        .yacht-form-card__header i {
          color: var(--color-gold);
          font-size: 1rem;
        }
        .yacht-form-card__body {
          padding: 1.5rem;
        }
        .yacht-duration-preview {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }
        .yacht-submit {
          width: 100%;
          justify-content: center;
          border-radius: 8px;
        }
        .yacht-security-note {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--color-mid-gray);
        }
        .yacht-security-note i {
          margin-right: 0.3rem;
        }

        /* Form overrides */
        .form-group {
          margin-bottom: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-label-gov {
          display: block;
          font-family: var(--font-label);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.4rem;
        }
        .form-label-gov .required {
          color: var(--color-error);
          margin-left: 2px;
        }
        .form-input-gov {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid var(--color-light-gray);
          font-family: var(--font-body);
          font-size: 0.93rem;
          color: var(--color-charcoal);
          background: var(--color-white);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
          border-radius: 8px;
        }
        .form-input-gov:focus {
          border-color: var(--color-navy);
          box-shadow: 0 0 0 3px rgba(15,45,94,0.1);
        }
        .form-input-gov.error {
          border-color: var(--color-error);
        }
        .form-hint {
          font-family: var(--font-label);
          font-size: 0.72rem;
          color: var(--color-mid-gray);
          margin-top: 0.25rem;
        }
        textarea.form-input-gov {
          resize: vertical;
          min-height: 80px;
        }
        .btn-primary-gov {
          background: var(--color-navy);
          color: var(--color-white);
          border: 1.5px solid var(--color-navy);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.72rem 1.9rem;
          font-family: var(--font-label);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
          border-radius: 8px;
        }
        .btn-primary-gov:hover:not(:disabled) {
          background: var(--color-navy-mid);
          border-color: var(--color-navy-mid);
          color: var(--color-gold-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .btn-primary-gov:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .btn-outline-gov {
          background: transparent;
          color: var(--color-navy);
          border: 1.5px solid var(--color-navy);
          padding: 0.72rem 1.9rem;
          border-radius: 8px;
          font-family: var(--font-label);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-base);
          white-space: nowrap;
        }
        .btn-outline-gov:hover {
          background: var(--color-navy);
          color: var(--color-white);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .btn-full {
          width: 100%;
          justify-content: center;
        }
        .spinner-gov {
          width: 16px;
          height: 16px;
          border: 2px solid var(--color-light-gray);
          border-top-color: var(--color-navy);
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.6s linear infinite;
        }
        .spinner-sm {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .alert-error {
          background: var(--color-error-bg);
          border: 1px solid rgba(192,57,43,0.25);
          color: var(--color-error);
          border-radius: 8px;
        }
        .alert-info {
          background: var(--color-info-bg);
          border: 1px solid rgba(15,92,164,0.22);
          color: var(--color-info);
          border-radius: 8px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .yacht-form-card__body {
            padding: 1rem;
          }
          .btn-primary-gov, .btn-outline-gov {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
          }
          .form-input-gov {
            padding: 0.6rem 0.85rem;
            font-size: 0.88rem;
          }
        }
      `}</style>
    </>
  );
}