// src/pages/normal/AirCargoPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { cargoAPI } from '../../services/api';

// Values match AirCargoInquiry.CARGO_TYPE_CHOICES exactly
const CARGO_TYPES = [
  ['general',        'General Cargo'],
  ['perishables',    'Perishable / Cold Chain'],       // was 'perishable'
  ['dangerous_goods','Dangerous Goods (DG)'],          // was 'dangerous'
  ['artwork',        'Valuables & High-Security'],     // was 'valuable'
  ['live_animals',   'Live Animals / Livestock'],      // was 'livestock'
  ['oversized',      'Oversized / Heavy Lift'],
  ['humanitarian',   'Humanitarian / Relief'],
  ['pharma',         'Pharmaceutical / Medical'],      // was 'pharmaceutical'
  ['automotive',     'Automotive Parts'],
  ['other',          'Other'],
];

const URGENCY_LEVELS = [
  ['standard', 'Standard',       '3–5 business days'],
  ['express',  'Express',        '24–48 hours'],
  ['critical', 'Critical / AOG', 'Same day / Next flight out'],
];

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Air Cargo Services | NairobiJetHouse',
  description: 'Time-critical freight, perishables, dangerous goods and oversized cargo — we move what matters most across Africa and beyond.',
};

export default function AirCargoPage() {
  const [form, setForm] = useState({
    origin_description: '',
    destination_description: '',
    pickup_date: '',
    urgency: 'standard',
    cargo_type: '',
    weight_kg: '',
    volume_m3: '',
    cargo_description: '',
    special_handling: '',           // encoded into additional_notes on submit
    is_hazardous: false,
    requires_refrigeration: false,  // mapped to requires_temperature_control on submit
    insurance_required: false,
    contact_name: '',
    contact_email: '',              // mapped to email on submit
    contact_phone: '',              // mapped to phone on submit
    company: '',
    additional_notes: '',
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
      // Merge special_handling into additional_notes since it's not a model field
      const notesWithHandling = [
        form.additional_notes,
        form.special_handling ? `Special handling: ${form.special_handling}` : '',
      ].filter(Boolean).join('\n');

      const payload = {
        // Route
        origin_description:      form.origin_description,
        destination_description: form.destination_description,
        pickup_date:             form.pickup_date,
        urgency:                 form.urgency,
        // Cargo
        cargo_type:                    form.cargo_type,
        cargo_description:             form.cargo_description || '-',  // required field
        weight_kg:                     parseFloat(form.weight_kg) || null,
        volume_m3:                     form.volume_m3 ? parseFloat(form.volume_m3) : null,
        is_hazardous:                  form.is_hazardous,
        requires_temperature_control:  form.requires_refrigeration,  // correct model field name
        insurance_required:            form.insurance_required,
        // Contact — model uses email/phone not contact_email/contact_phone
        contact_name:  form.contact_name,
        email:         form.contact_email,
        phone:         form.contact_phone,
        company:       form.company,
        additional_notes: notesWithHandling,
      };

      const { data } = await cargoAPI.create(payload);
      setSuccess(data.reference || data.id || 'CGO-' + Date.now());
    } catch (err) {
      console.log('CARGO ERROR:', JSON.stringify(err.response?.data));
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        const first = Object.values(msg)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Submission failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Cargo Request Submitted | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Cargo Inquiry Received</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Our freight specialists will contact you within <strong>2 hours</strong> during business hours.
              </p>
              <div className="ref-box">
                <div className="ref-label">Reference Number</div>
                <div className="ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/track" className="btn btn-navy">
                  <i className="bi bi-search"></i> Track Your Shipment
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
        <title>Air Cargo Services | NairobiJetHouse</title>
        <meta name="description" content="Time-critical freight, perishables, dangerous goods and oversized cargo. Request an air cargo quote — we respond within 2 hours." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/air-cargo" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Air Cargo Services</div>
          <h1>Your Cargo. <em style={{ color: 'var(--gold-light)' }}>Our Priority.</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Time-critical freight, perishables, dangerous goods, and oversized cargo —
            we move what matters most, anywhere in Africa and beyond.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>

            {/* ── Route & Schedule ── */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-geo-alt"></i> Route & Schedule
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Origin <span className="req">*</span></label>
                    <input
                      className="form-control"
                      value={form.origin_description}
                      onChange={e => set('origin_description', e.target.value)}
                      required
                      placeholder="City, airport, or address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination <span className="req">*</span></label>
                    <input
                      className="form-control"
                      value={form.destination_description}
                      onChange={e => set('destination_description', e.target.value)}
                      required
                      placeholder="City, airport, or address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pickup Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.pickup_date}
                      onChange={e => set('pickup_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Urgency Level <span className="req">*</span></label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {URGENCY_LEVELS.map(([val, label, desc]) => (
                      <label
                        key={val}
                        style={{
                          flex: '1 1 180px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          border: `1.5px solid ${form.urgency === val ? 'var(--navy)' : 'var(--gray-200, #e5e7eb)'}`,
                          borderRadius: '0.5rem',
                          background: form.urgency === val ? 'var(--navy-50, #f0f4ff)' : 'var(--white, #fff)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={val}
                          checked={form.urgency === val}
                          onChange={() => set('urgency', val)}
                          style={{ marginTop: '0.2rem', accentColor: 'var(--navy)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cargo Details ── */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-boxes"></i> Cargo Details
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-group">
                  <label className="form-label">Cargo Type <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={form.cargo_type}
                    onChange={e => set('cargo_type', e.target.value)}
                    required
                  >
                    <option value="">Select cargo type…</option>
                    {CARGO_TYPES.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Total Weight (kg) <span className="req">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 500"
                      value={form.weight_kg}
                      onChange={e => set('weight_kg', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Volume (m³){' '}
                      <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>optional</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 2.5"
                      value={form.volume_m3}
                      onChange={e => set('volume_m3', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cargo Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief description of goods, packaging, dimensions, etc."
                    value={form.cargo_description}
                    onChange={e => set('cargo_description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Handling Requirements</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Keep upright, temperature range, fragile…"
                    value={form.special_handling}
                    onChange={e => set('special_handling', e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {[
                    ['is_hazardous',          'bi-exclamation-triangle', 'Contains hazardous / dangerous goods (DG)'],
                    ['requires_refrigeration', 'bi-thermometer-snow',    'Requires refrigeration / temperature control'],
                    ['insurance_required',     'bi-shield-check',        'Cargo insurance required'],
                  ].map(([k, icon, label]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={e => set(k, e.target.checked)}
                      />
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }}></i>
                      <span style={{ fontSize: '0.875rem' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Contact Information ── */}
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
                      value={form.contact_name}
                      onChange={e => set('contact_name', e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="req">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.contact_email}
                      onChange={e => set('contact_email', e.target.value)}
                      required
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-control"
                      value={form.contact_phone}
                      onChange={e => set('contact_phone', e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organisation</label>
                    <input
                      className="form-control"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Any other information that might help us prepare your quote…"
                    value={form.additional_notes}
                    onChange={e => set('additional_notes', e.target.value)}
                  />
                  <span className="form-hint">We'll do our best to accommodate all requirements</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-navy btn-lg btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }}></span>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Cargo Inquiry
                  </>
                )}
              </button>
              <p className="text-center text-sm" style={{ marginTop: '1rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2 hours.
              </p>
            </div>

          </form>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}