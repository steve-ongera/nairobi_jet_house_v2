// src/pages/public/BookYachtPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { charterAPI } from '../../services/api';

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
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
        <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Charter Request Received</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Our yacht specialists will respond with a tailored proposal within 4 hours.
              </p>
              <div className="ref-box">
                <div className="ref-label">Reference Number</div>
                <div className="ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/track" className="btn btn-navy">
                  <i className="bi bi-search"></i> Track Your Request
                </Link>
                <Link to="/yachts" className="btn btn-outline-navy">
                  <i className="bi bi-water"></i> Browse More Yachts
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
        <title>Yacht Charter Request | NairobiJetHouse - Luxury Superyacht Rentals</title>
        <meta name="description" content="Request a superyacht charter quote. Fill out our simple form and receive a personalised proposal within 4 hours. Worldwide luxury yacht charters available." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/book-yacht" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Yacht Charter</div>
          <h1>Request Your <em style={{ color: 'var(--gold-light)' }}>Bespoke Yacht Experience</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Complete the form below and our yacht specialists will respond with a tailored proposal within 4 hours.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Contact Information */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-person"></i> Contact Information
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      value={form.guest_name} 
                      onChange={e => set('guest_name', e.target.value)} 
                      required 
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={form.guest_email} 
                      onChange={e => set('guest_email', e.target.value)} 
                      required 
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input 
                      className="form-control" 
                      value={form.guest_phone} 
                      onChange={e => set('guest_phone', e.target.value)} 
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
              </div>
            </div>

            {/* Charter Details */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-water"></i> Charter Details
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Departure Port <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      value={form.departure_port} 
                      onChange={e => set('departure_port', e.target.value)} 
                      required 
                      placeholder="e.g., Monte Carlo, Malé, Athens"
                    />
                    <span className="form-hint">Where will your voyage begin?</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Port</label>
                    <input 
                      className="form-control" 
                      value={form.destination_port} 
                      onChange={e => set('destination_port', e.target.value)} 
                      placeholder="Or return to departure port"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Charter Start <span className="req">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={form.charter_start} 
                      onChange={e => set('charter_start', e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Charter End <span className="req">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={form.charter_end} 
                      onChange={e => set('charter_end', e.target.value)} 
                      min={form.charter_start || new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Guests <span className="req">*</span></label>
                    <input 
                      type="number" 
                      min={1} 
                      max={200} 
                      className="form-control" 
                      value={form.guest_count} 
                      onChange={e => set('guest_count', parseInt(e.target.value))} 
                      required 
                    />
                    <span className="form-hint">Maximum 200 guests on most vessels</span>
                  </div>
                </div>

                {/* Duration preview */}
                {form.charter_start && form.charter_end && (
                  <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
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
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-map"></i> Voyage Preferences
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Itinerary Description</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    value={form.itinerary_description} 
                    onChange={e => set('itinerary_description', e.target.value)} 
                    placeholder="Describe your preferred route, destinations, islands to visit, or any specific places you'd like to explore..."
                  />
                  <span className="form-hint">The more details, the better we can tailor your experience</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea 
                    className="form-control" 
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
              <button type="submit" className="btn btn-navy btn-lg btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }}></span>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Charter Request
                  </>
                )}
              </button>
              <p className="text-center text-sm" style={{ marginTop: '1rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 4 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}