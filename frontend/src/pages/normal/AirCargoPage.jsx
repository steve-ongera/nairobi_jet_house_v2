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

const CARGO_CATEGORIES = [
  { label: 'AOG & Aviation Emergency', icon: 'bi-exclamation-octagon', img: 'https://media.istockphoto.com/id/589429684/photo/emergency-medical-service.webp?a=1&b=1&s=612x612&w=0&k=20&c=9-dyCvfjp8jg1inELkjDvDPPecmNAsH8JTvNOm5oK7k=' },
  { label: 'Aerospace',                icon: 'bi-rocket',              img: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFlcm9wbGFuZXxlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Automotive',               icon: 'bi-car-front',           img: 'https://images.unsplash.com/photo-1584809394311-364392a5011b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHZlaGljbGV8ZW58MHx8MHx8fDA%3D' },
  { label: 'Dangerous Goods',          icon: 'bi-radioactive',         img: 'https://media.istockphoto.com/id/2231129087/photo/cargo-being-loaded-into-a-commercial-airplane-during-sunset-at-an-airport-runway.webp?a=1&b=1&s=612x612&w=0&k=20&c=4xe5o_hoQWyUeRE8rw9dZPv5TTtji3EdDLR0M22kJNY=' },
  { label: 'Energy, Oil & Gas',        icon: 'bi-lightning-charge',    img: 'https://images.unsplash.com/photo-1726731782158-fcf6822b6ca4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVuZXJneSUyMG9pbCUyMGdhc3xlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Live Animals & Livestock', icon: 'bi-heart-pulse',         img: 'https://media.istockphoto.com/id/1065666556/photo/dog-on-an-airplane.webp?a=1&b=1&s=612x612&w=0&k=20&c=egkBbIy1o60ZRa41UgdRCIeVvfqI3cNm6trVBpffPKQ=' },
  { label: 'Heavy & Oversized',        icon: 'bi-boxes',               img: 'https://images.unsplash.com/photo-1777181922137-53d605b2cec1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEhlYXZ5JTIwJTI2JTIwT3ZlcnNpemVkfGVufDB8fDB8fHww' },
  { label: 'Humanitarian Relief',      icon: 'bi-people',              img: 'https://media.istockphoto.com/id/168628716/photo/business-plane.webp?a=1&b=1&s=612x612&w=0&k=20&c=nqJKSM7Zh45vyajVBpydE4c3CxPRBgVTlGUYewsYeAU=' },
  { label: 'Get a Quote',              icon: 'bi-send',                img: null, isCta: true },
];

const FAQS = [
  {
    q: 'What types of cargo can be transported via air charter?',
    a: 'We handle virtually any cargo type - general freight, perishables, dangerous goods (DG), live animals, oversized machinery, pharmaceuticals, valuables, and humanitarian relief. If it needs to move fast, we have a solution.',
  },
  {
    q: 'How is the cost of an air cargo charter determined?',
    a: 'Pricing depends on route, aircraft type, cargo weight and volume, urgency level, and any special handling requirements. Submit an inquiry and our freight specialists will provide a detailed quote within 2 hours.',
  },
  {
    q: 'Are there restrictions on the type of cargo that can be transported?',
    a: 'Some cargo categories require special permits, documentation, or certified aircraft. We will guide you through all regulatory requirements including IATA DG classifications, CITES permits for live animals, and customs clearance.',
  },
  {
    q: 'Can air cargo charter handle urgent or last-minute shipments?',
    a: 'Absolutely. Our Critical / AOG service operates 24/7 with same-day and next-flight-out options. We maintain relationships with operators across Africa and globally to mobilise aircraft at short notice.',
  },
];

const STEPS = [
  { label: 'Route & Schedule', icon: 'bi-geo-alt' },
  { label: 'Cargo Details',    icon: 'bi-boxes' },
  { label: 'Contact Info',     icon: 'bi-person' },
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
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    const el = document.getElementById('cargo-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Per-step validation before advancing
  const validateStep = () => {
    if (step === 0) {
      if (!form.origin_description.trim())      return 'Please enter an origin.';
      if (!form.destination_description.trim()) return 'Please enter a destination.';
      if (!form.pickup_date)                    return 'Please select a pickup date.';
    }
    if (step === 1) {
      if (!form.cargo_type)                     return 'Please select a cargo type.';
      if (!form.weight_kg || parseFloat(form.weight_kg) <= 0) return 'Please enter a valid weight.';
    }
    if (step === 2) {
      if (!form.contact_name.trim())            return 'Please enter your full name.';
      if (!form.contact_email.trim())           return 'Please enter your email address.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError('');
    setStep(s => s + 1);
    scrollToForm();
  };

  const back = () => {
    setStepError('');
    setStep(s => s - 1);
    scrollToForm();
  };

  const submit = async e => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setStepError(err); return; }
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
          <div className="page-header__badges">
            <span className="badge-gov"><i className="bi bi-clock"></i> 24/7 Operations</span>
            <span className="badge-gov"><i className="bi bi-globe2"></i> Worldwide Coverage</span>
            <span className="badge-gov"><i className="bi bi-shield-check"></i> Fully Insured</span>
          </div>
         
        </div>
      </div>

      {/* Form Section with Contact Sidebar */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }} id="cargo-form">
        <div className="container">
          <div className="cargo-form-wrapper">
            {/* Form Column */}
            <div className="cargo-form-column" style={{ maxWidth: 820, flex: 1 }}>
              {/* Breadcrumb-style Stepper */}
              <div className="cargo-stepper">
                {STEPS.map((s, i) => (
                  <div key={i} className={`cargo-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
                    <div className="cargo-step__circle">
                      {i < step
                        ? <i className="bi bi-check-lg"></i>
                        : <i className={`bi ${s.icon}`}></i>
                      }
                    </div>
                    <div className="cargo-step__label">{s.label}</div>
                    {i < STEPS.length - 1 && <div className="cargo-step__line">/</div>}
                  </div>
                ))}
              </div>

              {error && (
                <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}

              {stepError && (
                <div className="alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="bi bi-exclamation-circle"></i>
                  <span>{stepError}</span>
                </div>
              )}

              {/* ── STEP 0: Route & Schedule ── */}
              {step === 0 && (
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
                          placeholder="City, airport, or address"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">Destination <span className="required">*</span></label>
                        <input
                          className="form-input-gov"
                          value={form.destination_description}
                          onChange={e => set('destination_description', e.target.value)}
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

                    <div className="cargo-step-nav">
                      <span></span>
                      <button type="button" className="btn-primary-gov" onClick={next}>
                        Next: Cargo Details <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Cargo Details ── */}
              {step === 1 && (
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

                    <div className="cargo-step-nav">
                      <button type="button" className="btn-outline-gov" onClick={back}>
                        <i className="bi bi-arrow-left"></i> Back
                      </button>
                      <button type="button" className="btn-primary-gov" onClick={next}>
                        Next: Contact Info <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Contact Information ── */}
              {step === 2 && (
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

                    <div className="cargo-step-nav">
                      <button type="button" className="btn-outline-gov" onClick={back}>
                        <i className="bi bi-arrow-left"></i> Back
                      </button>
                      <button
                        type="button"
                        className="btn-primary-gov btn-lg"
                        onClick={submit}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                            &nbsp; Submitting...
                          </>
                        ) : (
                          <><i className="bi bi-send"></i> Submit Cargo Inquiry</>
                        )}
                      </button>
                    </div>

                    <p className="text-center" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Sidebar Column - IMAGE NOW LARGER */}
            <div className="cargo-contact-sidebar">
              <div className="contact-sidebar-card">
                <div className="contact-sidebar__image">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1664297701028-3e9919a2574f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y29udGFjdCUyMHVzJTIwbGFkeXxlbnwwfHwwfHx8MA%3D%3D"
                    alt="Contact us"
                    style={{ height: '250px' }} // image is now larger
                  />
                  <div className="contact-sidebar__overlay" />
                </div>
                <div className="contact-sidebar__content">
                  <div className="contact-sidebar__divider">
                    <span className="divider-curve"></span>
                  </div>
                  <br></br>
                  <h3>Need Help With Your Cargo Request?</h3>
                  <p>Our team is ready to assist with logistics planning, cargo classification, special handling, and any other requirements your shipment may need.</p>
                  <a href="tel:+254724878136" className="contact-sidebar__phone">
                    <i className="bi bi-telephone-fill"></i>
                    <span>+254 724 878 136</span>
                  </a>
                  <Link to="/contact" className="btn-outline-gov" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="bi bi-envelope"></i> Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO SPLIT */}
      <section className="section-padding ac-intro">
        <div className="container ac-intro__grid">
          <div className="ac-intro__text">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">Trusted air cargo specialists across Africa and beyond</h2>
            <p>We work with clients and experienced carriers to arrange the delivery of time-critical air cargo, heavy and outsize equipment, humanitarian goods, and all other types of freight — on budget and on schedule.</p>
            <p>From automotive components and manufacturing materials to energy industry structures and life-saving aid supplies, we ensure every shipment reaches its destination with the care and speed it demands.</p>
            <button onClick={scrollToForm} className="btn-primary-gov" style={{ marginTop: '1rem' }}>
              <i className="bi bi-send"></i> Request a Quote
            </button>
          </div>
          <div className="ac-intro__image">
            <img
              src="https://chapmanfreeborn.aero/wp-content/uploads/2024/12/cargo-air-charter-aircraft.jpg.webp"
              alt="Cargo being loaded onto aircraft"
            />
          </div>
        </div>
      </section>

      {/* CARGO CATEGORIES GRID */}
      <section className="ac-categories">
        <div className="ac-categories__grid">
          {CARGO_CATEGORIES.map((cat, i) => (
            cat.isCta ? (
              <button
                key={i}
                onClick={scrollToForm}
                className="ac-cat-tile ac-cat-tile--cta"
              >
                <i className={`bi ${cat.icon}`}></i>
                <span>{cat.label}</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <div key={i} className="ac-cat-tile">
                <img src={cat.img} alt={cat.label} className="ac-cat-tile__bg" />
                <div className="ac-cat-tile__overlay" />
                <div className="ac-cat-tile__content">
                  <span>{cat.label}</span>
                  <i className="bi bi-arrow-right"></i>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* ABOUT SPLIT */}
      <section className="section-padding ac-about">
        <div className="container ac-about__grid">
          <div className="ac-about__image">
            <img
              src="https://media.istockphoto.com/id/2171899480/photo/aircraft-parked-at-the-airport.webp?a=1&b=1&s=612x612&w=0&k=20&c=oQzaGnSYH7Gp-CshTlNBLS-DxxxUSELzkugyYvPN8d0="
              alt="Nairobi Jet House cargo operations"
            />
          </div>
          <div className="ac-about__text">
            <span className="section-label">Nairobi Jet House</span>
            <h2 className="section-title">Your dedicated air cargo partner</h2>
            <p className="ac-about__sub">Award-winning cargo charter services</p>
            <p>We analyse route, payload, and timescale to propose the most suitable cargo aircraft for your requirements. We also organise part-charters, backloads, and commercially innovative solutions for ad hoc, peak-season, and project cargo.</p>
            <p>Our volume buying power and airline relationships enable us to offer superbly competitive pricing — whatever your air cargo requirements, our specialist team is here to help you find the solution.</p>
            <div className="ac-about__stats">
              <div className="ac-stat">
                <div className="ac-stat__value">24/7</div>
                <div className="ac-stat__label">Operations</div>
              </div>
              <div className="ac-stat">
                <div className="ac-stat__value">50+</div>
                <div className="ac-stat__label">Countries served</div>
              </div>
              <div className="ac-stat">
                <div className="ac-stat__value">2 hrs</div>
                <div className="ac-stat__label">Quote response</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Link to="/about" className="btn-primary-gov">
                <i className="bi bi-info-circle"></i> More About Us
              </Link>
              <Link to="/contact" className="btn-outline-gov">
                <i className="bi bi-envelope"></i> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="ac-cta-banner">
        <div className="ac-cta-banner__overlay" />
        <img
          src="https://chapmanfreeborn.aero/wp-content/uploads/2023/05/air-cargo-charter-a330-aircraft.webp"
          alt="Aircraft on tarmac at night"
          className="ac-cta-banner__bg"
        />
        <div className="container ac-cta-banner__content">
          <h2>Ready to move your cargo?</h2>
          <p>With our global network of operators, we will give you the information and pricing you need to make an informed decision — fast.</p>
          <button onClick={scrollToForm} className="btn-primary-gov btn-lg">
            <i className="bi bi-send"></i> Get a Quote
          </button>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding ac-faqs">
        <div className="container ac-faqs__grid">
          <div className="ac-faqs__left">
            <span className="section-label">Common Questions</span>
            <h2 className="section-title">FAQs</h2>
            <p style={{ color: 'var(--color-mid-gray)', marginTop: '0.75rem' }}>
              We have prepared answers to our most commonly asked questions. If you have additional queries, do not hesitate to get in touch.
            </p>
            <Link to="/contact" className="btn-outline-gov" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              <i className="bi bi-chat"></i> Get in Touch
            </Link>
          </div>
          <div className="ac-faqs__right">
            {FAQS.map((faq, i) => (
              <div key={i} className={`ac-faq-item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="ac-faq-item__q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <i className={`bi bi-${openFaq === i ? 'dash' : 'plus'}`}></i>
                </button>
                {openFaq === i && (
                  <div className="ac-faq-item__a">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Page Header */
        .page-header {
          background: var(--color-navy);
          padding: 5rem 0 4rem;
          color: var(--color-white);
          position: relative;
          overflow: hidden;
        }
        .page-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--color-gold);
        }
        .page-header h1 {
          font-size: clamp(2rem, 5vw, 3.2rem);
          margin: 0.5rem 0 1rem;
          color: var(--color-white);
        }
        .page-header p {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.82);
          max-width: 600px;
          line-height: 1.7;
        }
        .page-header__badges {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }
        .badge-gov {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.85rem;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 2rem;
          font-size: 0.78rem;
          color: var(--color-white);
          letter-spacing: 0.3px;
        }
        .badge-gov i {
          color: var(--color-gold);
        }

        /* Form Wrapper - Two Column Layout */
        .cargo-form-wrapper {
          display: flex;
          gap: 2.5rem;
          align-items: flex-start;
        }
        .cargo-form-column {
          flex: 1;
          min-width: 0;
        }

        /* Contact Sidebar */
        .cargo-contact-sidebar {
          flex: 0 0 320px;
          max-width: 320px;
          position: sticky;
          top: 2rem;
        }
        .contact-sidebar-card {
          background: var(--color-white);
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-light-gray);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .contact-sidebar__image {
          position: relative;
          height: 220px; /* increased from 160px to make image larger */
          overflow: hidden;
        }
        .contact-sidebar__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .contact-sidebar__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,20,40,0.2) 0%, rgba(10,20,40,0.7) 100%);
        }
        .contact-sidebar__content {
          padding: 1.5rem 1.5rem 2rem;
          text-align: center;
          position: relative;
        }
        .contact-sidebar__divider {
          display: flex;
          justify-content: center;
          margin-top: -2.5rem;
          margin-bottom: 1rem;
        }
        .divider-curve::before,
        .divider-curve::after {
          content: '';
          position: absolute;
          bottom: -3px;
          width: 40px;
          height: 20px;
          background: var(--color-white);
          border-bottom: 3px solid var(--color-gold);
        }
        .divider-curve::before {
          left: -40px;
          border-radius: 0 0 100% 0 / 0 0 100% 0;
        }
        .divider-curve::after {
          right: -40px;
          border-radius: 0 0 0 100% / 0 0 0 100%;
        }
        .contact-sidebar__content h3 {
          font-size: 1.1rem;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
          font-family: var(--font-label, sans-serif);
        }
        .contact-sidebar__content p {
          font-size: 0.9rem;
          color: var(--color-mid-gray);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .contact-sidebar__phone {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.25rem;
          background: var(--color-gold);
          color: var(--color-navy);
          border-radius: 2rem;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          margin-bottom: 1rem;
          transition: all 0.2s;
          font-family: var(--font-label, sans-serif);
        }
        .contact-sidebar__phone:hover {
          background: #e8c55a;
          transform: scale(1.02);
        }
        .contact-sidebar__phone i {
          font-size: 1.1rem;
        }

        /* Breadcrumb-style Stepper - now with slash separators */
        .cargo-stepper {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          background: var(--color-white);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-light-gray);
        }
        .cargo-step {
          display: flex;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .cargo-step__circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-light-gray);
          background: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          color: var(--color-mid-gray);
          flex-shrink: 0;
          transition: all 0.25s;
          z-index: 1;
        }
        .cargo-step.active .cargo-step__circle {
          border-color: var(--color-navy);
          background: var(--color-navy);
          color: var(--color-white);
        }
        .cargo-step.done .cargo-step__circle {
          border-color: var(--color-gold);
          background: var(--color-gold);
          color: var(--color-navy);
        }
        .cargo-step__label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-mid-gray);
          margin-left: 0.5rem;
          white-space: nowrap;
          font-family: var(--font-label, sans-serif);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .cargo-step.active .cargo-step__label {
          color: var(--color-navy);
        }
        .cargo-step.done .cargo-step__label {
          color: var(--color-gold);
        }
        /* slash separator instead of line */
        .cargo-step__line {
          flex: 0 0 auto;
          margin: 0 0.5rem;
          color: var(--color-light-gray);
          font-size: 1rem;
          font-weight: 300;
        }

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

        /* Step Navigation */
        .cargo-step-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--color-light-gray);
          gap: 1rem;
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

        /* INTRO SPLIT */
        .ac-intro__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .ac-intro__text h2 {
          margin: 0.5rem 0 1rem;
        }
        .ac-intro__text p {
          color: var(--color-mid-gray);
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }
        .ac-intro__image img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }

        /* CATEGORIES GRID */
        .ac-categories__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .ac-cat-tile {
          position: relative;
          height: 200px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ac-cat-tile__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .ac-cat-tile:hover .ac-cat-tile__bg {
          transform: scale(1.06);
        }
        .ac-cat-tile__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.2) 70%);
          z-index: 1;
        }
        .ac-cat-tile__content {
          position: relative;
          z-index: 2;
          padding: 1.25rem;
          color: var(--color-white);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: var(--font-label, sans-serif);
          text-align: center;
        }
        .ac-cat-tile__content i {
          color: var(--color-gold);
          font-size: 1.1rem;
        }
        .ac-cat-tile--cta {
          background: var(--color-gold);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--color-navy);
          font-weight: 700;
          font-size: 1rem;
          font-family: var(--font-label, sans-serif);
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .ac-cat-tile--cta:hover {
          background: #e8c55a;
        }
        .ac-cat-tile--cta i {
          font-size: 1.4rem;
          color: var(--color-navy);
        }
        .ac-cat-tile--cta span {
          color: var(--color-navy);
        }

        /* ABOUT SPLIT */
        .ac-about {
          background: var(--color-off-white);
        }
        .ac-about__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .ac-about__image img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .ac-about__text p {
          color: var(--color-mid-gray);
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }
        .ac-about__sub {
          color: var(--color-gold) !important;
          font-weight: 600;
          margin-bottom: 1rem !important;
        }
        .ac-about__stats {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-light-gray);
          flex-wrap: wrap;
        }
        .ac-stat__value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-navy);
          font-family: var(--font-label, sans-serif);
          line-height: 1;
        }
        .ac-stat__label {
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 0.25rem;
        }

        /* CTA BANNER */
        .ac-cta-banner {
          position: relative;
          padding: 5rem 0;
          overflow: hidden;
          text-align: center;
        }
        .ac-cta-banner__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .ac-cta-banner__overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,20,40,0.78);
          z-index: 1;
        }
        .ac-cta-banner__content {
          position: relative;
          z-index: 2;
          color: var(--color-white);
        }
        .ac-cta-banner__content h2 {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          color: var(--color-white);
          margin-bottom: 0.75rem;
        }
        .ac-cta-banner__content p {
          color: rgba(255,255,255,0.8);
          max-width: 520px;
          margin: 0 auto 1.75rem;
          font-size: 1rem;
          line-height: 1.7;
        }

        /* FAQS */
        .ac-faqs {
          background: var(--color-white);
        }
        .ac-faqs__grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          align-items: flex-start;
        }
        .ac-faqs__left p {
          color: var(--color-mid-gray);
          line-height: 1.7;
        }
        .ac-faq-item {
          border-bottom: 1px solid var(--color-light-gray);
        }
        .ac-faq-item__q {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-navy);
          font-family: var(--font-label, sans-serif);
        }
        .ac-faq-item__q i {
          flex-shrink: 0;
          color: var(--color-gold);
          font-size: 1.1rem;
        }
        .ac-faq-item__a {
          padding: 0 0 1.1rem;
          font-size: 0.9rem;
          color: var(--color-mid-gray);
          line-height: 1.75;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .cargo-contact-sidebar {
            flex: 0 0 280px;
            max-width: 280px;
          }
        }

        @media (max-width: 992px) {
          .cargo-form-wrapper {
            flex-direction: column;
          }
          .cargo-contact-sidebar {
            flex: 1;
            max-width: 100%;
            position: static;
            width: 100%;
          }
          .contact-sidebar-card {
            max-width: 400px;
            margin: 0 auto;
          }
          .ac-intro__grid, .ac-about__grid, .ac-faqs__grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .ac-about__image {
            order: -1;
          }
          .ac-about__image img, .ac-intro__image img {
            height: 280px;
          }
          .ac-categories__grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cargo-step__label {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .cargo-stepper {
            padding: 0.75rem 1rem;
            flex-wrap: nowrap;
            overflow-x: auto;
          }
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
          .cargo-step-nav {
            flex-direction: column;
          }
          .cargo-step-nav button {
            width: 100%;
            justify-content: center;
          }
          .contact-sidebar-card {
            max-width: 100%;
          }
        }

        @media (max-width: 600px) {
          .ac-categories__grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            padding: 3rem 0 2.5rem;
          }
          .page-header__badges {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}