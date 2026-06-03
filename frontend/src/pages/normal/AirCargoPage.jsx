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
  ['perishables',    'Perishable / Cold Chain'],
  ['dangerous_goods','Dangerous Goods (DG)'],
  ['artwork',        'Valuables & High-Security'],
  ['live_animals',   'Live Animals / Livestock'],
  ['oversized',      'Oversized / Heavy Lift'],
  ['humanitarian',   'Humanitarian / Relief'],
  ['pharma',         'Pharmaceutical / Medical'],
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
    special_handling: '',
    is_hazardous: false,
    requires_refrigeration: false,
    insurance_required: false,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
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
      const notesWithHandling = [
        form.additional_notes,
        form.special_handling ? `Special handling: ${form.special_handling}` : '',
      ].filter(Boolean).join('\n');

      const payload = {
        origin_description:      form.origin_description,
        destination_description: form.destination_description,
        pickup_date:             form.pickup_date,
        urgency:                 form.urgency,
        cargo_type:              form.cargo_type,
        cargo_description:       form.cargo_description || '-',
        weight_kg:               parseFloat(form.weight_kg) || null,
        volume_m3:               form.volume_m3 ? parseFloat(form.volume_m3) : null,
        is_hazardous:            form.is_hazardous,
        requires_temperature_control: form.requires_refrigeration,
        insurance_required:      form.insurance_required,
        contact_name:            form.contact_name,
        email:                   form.contact_email,
        phone:                   form.contact_phone,
        company:                 form.company,
        additional_notes:        notesWithHandling,
      };

      const { data } = await cargoAPI.create(payload);
      setSuccess(data.reference || data.id || 'CGO-' + Date.now());
    } catch (err) {
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
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="cargo-success">
              <div className="cargo-success__icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Cargo Inquiry Received</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                Our freight specialists will contact you within <strong>2 hours</strong> during business hours.
              </p>
              <div className="cargo-success__ref">
                <div className="cargo-success__ref-label">Reference Number</div>
                <div className="cargo-success__ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="cargo-success__actions">
                <Link to="/track" className="btn-primary-gov">
                  <i className="bi bi-search"></i> Track Your Shipment
                </Link>
                <Link to="/" className="btn-outline-gov">
                  <i className="bi bi-house"></i> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />
        <style>{`
          .cargo-success {
            text-align: center;
            max-width: 500px;
            margin: 0 auto;
          }
          .cargo-success__icon {
            width: 80px;
            height: 80px;
            background: rgba(26,127,90,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .cargo-success__icon i {
            font-size: 2.5rem;
            color: var(--color-success);
          }
          .cargo-success__ref {
            background: var(--color-off-white);
            border: 1px solid var(--color-light-gray);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .cargo-success__ref-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--color-gold);
            margin-bottom: 0.25rem;
          }
          .cargo-success__ref-value {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-navy);
          }
          .cargo-success__actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .cargo-success__actions {
              flex-direction: column;
            }
            .cargo-success__actions a {
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
        <title>Air Cargo Services | NairobiJetHouse</title>
        <meta name="description" content="Time-critical freight, perishables, dangerous goods and oversized cargo. Request an air cargo quote — we respond within 2 hours." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/air-cargo" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Air Cargo Services</span>
          <h1>Your Cargo. <em style={{ color: 'var(--color-gold-light)' }}>Our Priority.</em></h1>
          <p>Time-critical freight, perishables, dangerous goods, and oversized cargo — we move what matters most, anywhere in Africa and beyond.</p>
        </div>
      </div>

      {/* Form Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>

            {/* Route & Schedule */}
            <div className="cargo-card">
              <div className="cargo-card__header">
                <i className="bi bi-geo-alt"></i> Route & Schedule
              </div>
              <div className="cargo-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Origin <span className="required">*</span></label>
                    <input
                      className="form-input-gov"
                      value={form.origin_description}
                      onChange={e => set('origin_description', e.target.value)}
                      required
                      placeholder="City, airport, or address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Destination <span className="required">*</span></label>
                    <input
                      className="form-input-gov"
                      value={form.destination_description}
                      onChange={e => set('destination_description', e.target.value)}
                      required
                      placeholder="City, airport, or address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Pickup Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input-gov"
                      value={form.pickup_date}
                      onChange={e => set('pickup_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label-gov">Urgency Level <span className="required">*</span></label>
                  <div className="cargo-urgency-grid">
                    {URGENCY_LEVELS.map(([val, label, desc]) => (
                      <label
                        key={val}
                        className={`cargo-urgency-option ${form.urgency === val ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={val}
                          checked={form.urgency === val}
                          onChange={() => set('urgency', val)}
                        />
                        <div>
                          <div className="cargo-urgency-option__label">{label}</div>
                          <div className="cargo-urgency-option__desc">{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="cargo-card">
              <div className="cargo-card__header">
                <i className="bi bi-boxes"></i> Cargo Details
              </div>
              <div className="cargo-card__body">
                <div className="form-group">
                  <label className="form-label-gov">Cargo Type <span className="required">*</span></label>
                  <select
                    className="form-input-gov"
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Total Weight (kg) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input-gov"
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 500"
                      value={form.weight_kg}
                      onChange={e => set('weight_kg', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Volume (m³) <span className="optional">(optional)</span></label>
                    <input
                      type="number"
                      className="form-input-gov"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 2.5"
                      value={form.volume_m3}
                      onChange={e => set('volume_m3', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-gov">Cargo Description</label>
                  <textarea
                    className="form-input-gov"
                    rows={3}
                    placeholder="Brief description of goods, packaging, dimensions, etc."
                    value={form.cargo_description}
                    onChange={e => set('cargo_description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-gov">Special Handling Requirements</label>
                  <input
                    className="form-input-gov"
                    placeholder="e.g. Keep upright, temperature range, fragile…"
                    value={form.special_handling}
                    onChange={e => set('special_handling', e.target.value)}
                  />
                </div>

                <div className="cargo-checkboxes">
                  {[
                    ['is_hazardous', 'bi-exclamation-triangle', 'Contains hazardous / dangerous goods (DG)'],
                    ['requires_refrigeration', 'bi-thermometer-snow', 'Requires refrigeration / temperature control'],
                    ['insurance_required', 'bi-shield-check', 'Cargo insurance required'],
                  ].map(([k, icon, label]) => (
                    <label key={k} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={e => set(k, e.target.checked)}
                      />
                      <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="cargo-card">
              <div className="cargo-card__header">
                <i className="bi bi-person"></i> Contact Information
              </div>
              <div className="cargo-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Full Name <span className="required">*</span></label>
                    <input
                      className="form-input-gov"
                      value={form.contact_name}
                      onChange={e => set('contact_name', e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input-gov"
                      value={form.contact_email}
                      onChange={e => set('contact_email', e.target.value)}
                      required
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Phone Number</label>
                    <input
                      className="form-input-gov"
                      value={form.contact_phone}
                      onChange={e => set('contact_phone', e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Company / Organisation</label>
                    <input
                      className="form-input-gov"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Additional Notes</label>
                  <textarea
                    className="form-input-gov"
                    rows={3}
                    placeholder="Any other information that might help us prepare your quote…"
                    value={form.additional_notes}
                    onChange={e => set('additional_notes', e.target.value)}
                  />
                  <div className="form-hint">We'll do our best to accommodate all requirements</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn-primary-gov btn-lg btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Cargo Inquiry
                  </>
                )}
              </button>
              <p className="text-center" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)' }}>
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2 hours.
              </p>
            </div>

          </form>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Cargo Cards */
        .cargo-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .cargo-card__header {
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
        .cargo-card__header i {
          color: var(--color-gold);
          font-size: 1rem;
        }
        .cargo-card__body {
          padding: 1.5rem;
        }

        /* Urgency Grid */
        .cargo-urgency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          margin-top: 0.25rem;
        }
        .cargo-urgency-option {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--color-light-gray);
          border-radius: var(--radius-sm);
          background: var(--color-white);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .cargo-urgency-option.selected {
          border-color: var(--color-navy);
          background: var(--color-off-white);
        }
        .cargo-urgency-option input {
          margin-top: 0.2rem;
          accent-color: var(--color-navy);
        }
        .cargo-urgency-option__label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-navy);
        }
        .cargo-urgency-option__desc {
          font-size: 0.7rem;
          color: var(--color-mid-gray);
        }

        /* Checkboxes */
        .cargo-checkboxes {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        /* Optional text styling */
        .optional {
          font-weight: 400;
          color: var(--color-mid-gray);
          font-size: 0.7rem;
          margin-left: 0.25rem;
        }

        /* Full width button */
        .btn-full {
          width: 100%;
          justify-content: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cargo-card__body {
            padding: 1rem;
          }
          .cargo-urgency-grid {
            grid-template-columns: 1fr;
          }
          .cargo-checkboxes {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}