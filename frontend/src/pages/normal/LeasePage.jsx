import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { leaseAPI } from '../../services/api';

const ASSET_TYPES = [
  {
    value: 'aircraft',
    label: 'Aircraft',
    icon: 'bi-airplane',
    desc: 'Jets, turboprops, helicopters — wet or dry lease options',
  },
  {
    value: 'yacht',
    label: 'Yacht',
    icon: 'bi-water',
    desc: 'Sailing, motor, and superyacht lease arrangements',
  },
];

const LEASE_DURATIONS = [
  { value: 'monthly',    label: 'Monthly',    sub: 'Rolling monthly lease' },
  { value: 'quarterly',  label: 'Quarterly',  sub: '3-month term' },
  { value: 'annual',     label: 'Annual',     sub: '12-month lease' },
  { value: 'multi_year', label: 'Multi-Year', sub: '2+ year agreement' },
];

const BILLING_FREQUENCIES = [
  { value: 'monthly',   label: 'Monthly Payments' },
  { value: 'quarterly', label: 'Quarterly Payments' },
  { value: 'upfront',   label: 'Full Upfront' },
];

const LEASE_TYPES = [
  {
    name: 'Wet Lease',
    tag: 'Aircraft + Crew',
    desc: 'The operator provides the aircraft and full crew. Ideal for airlines, charter companies, or corporates that need turnkey operations.',
  },
  {
    name: 'Dry Lease',
    tag: 'Asset Only',
    desc: 'You get the aircraft or yacht without crew or maintenance. Best for AOC holders and operators who bring their own team.',
  },
  {
    name: 'ACMI',
    tag: 'Full-Service',
    desc: 'Aircraft, Crew, Maintenance & Insurance. The gold standard for commercial operators requiring a complete solution.',
  },
  {
    name: 'Short-Term Charter Lease',
    tag: '1 – 6 Months',
    desc: 'Flexible short-term arrangements with no long-term commitment. Perfect for seasonal demand or project-based needs.',
  },
  {
    name: 'Long-Term Lease',
    tag: '2+ Years',
    desc: 'Predictable cost structure with multi-year commitment. Typically includes preferred rates and dedicated asset allocation.',
  },
  {
    name: 'Yacht Lease',
    tag: 'Coastal & Ocean',
    desc: 'From bareboat to fully crewed superyacht leases, covering the East African coast, Indian Ocean islands, and beyond.',
  },
];

const STEPS = ['Asset Type', 'Lease Terms', 'Your Details', 'Review'];

const initialForm = {
  asset_type: '',
  preferred_asset_name: '',
  preferred_category: '',
  preferred_location: '',
  lease_duration: '',
  lease_start_date: '',
  lease_end_date: '',
  billing_frequency: 'monthly',
  budget_monthly_usd: '',
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  company: '',
  intended_use: '',
  additional_notes: '',
};

export default function LeasePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const stepValid = () => {
    if (step === 0) return !!form.asset_type;
    if (step === 1) return form.lease_duration && form.lease_start_date;
    if (step === 2) return form.guest_name && form.guest_email;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const billingNote = [
        form.billing_frequency && `Billing preference: ${form.billing_frequency}`,
        form.budget_monthly_usd && `Monthly budget: ~$${Number(form.budget_monthly_usd).toLocaleString()}`,
      ].filter(Boolean).join(' | ');

      const payload = {
        asset_type:           form.asset_type,
        lease_duration:       form.lease_duration,
        preferred_start_date: form.lease_start_date,
        guest_name:           form.guest_name,
        guest_email:          form.guest_email,
        guest_phone:          form.guest_phone,
        company:              form.company,
        usage_description:    form.intended_use,
        budget_range:         form.budget_monthly_usd ? `~$${Number(form.budget_monthly_usd).toLocaleString()}/mo` : '',
        additional_notes:     [form.additional_notes, billingNote].filter(Boolean).join('\n'),
        preferred_asset_description: [
          form.preferred_asset_name,
          form.preferred_category,
          form.preferred_location,
        ].filter(Boolean).join(' — ') || undefined,
      }
      const { data } = await leaseAPI.create(payload);
      setReference(data.reference || data.id || 'LSE-' + Date.now());
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        const first = Object.values(msg)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Submission failed. Please review your details and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Lease Inquiry Submitted | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="lease-success">
              <div className="lease-success__icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Lease Inquiry Received</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                A dedicated lease consultant will reach out within <strong>4 business hours</strong> with tailored options and indicative pricing.
              </p>
              <div className="lease-success__ref">
                <div className="lease-success__ref-label">Reference Number</div>
                <div className="lease-success__ref-value">{String(reference).slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="lease-success__actions">
                <Link to="/fleet" className="btn-primary-gov">
                  <i className="bi bi-collection"></i> Browse Fleet
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
          .lease-success {
            text-align: center;
            max-width: 500px;
            margin: 0 auto;
          }
          .lease-success__icon {
            width: 80px;
            height: 80px;
            background: rgba(26,127,90,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .lease-success__icon i {
            font-size: 2.5rem;
            color: var(--color-success);
          }
          .lease-success__ref {
            background: var(--color-off-white);
            border: 1px solid var(--color-light-gray);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .lease-success__ref-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--color-gold);
            margin-bottom: 0.25rem;
          }
          .lease-success__ref-value {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-navy);
          }
          .lease-success__actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .lease-success__actions {
              flex-direction: column;
            }
            .lease-success__actions a {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </>
    );
  }

  // Main Page
  return (
    <>
      <Helmet>
        <title>Asset Leasing | NairobiJetHouse - Aircraft & Yacht Leasing</title>
        <meta name="description" content="Short-term to multi-year lease arrangements for business jets, turboprops, helicopters, and luxury yachts. Flexible structures tailored to your operations." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/lease" />
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Asset Leasing</span>
          <h1>Lease. <em style={{ color: 'var(--color-gold-light)' }}>Fly.</em> Sail.</h1>
          <p>Short-term to multi-year lease arrangements for business jets, turboprops, helicopters, and luxury yachts — flexible structures tailored to your operations.</p>
        </div>
      </div>

      {/* Form Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {/* Step Progress */}
          <div className="lease-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`lease-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="lease-step__dot">
                  {i < step ? <i className="bi bi-check"></i> : i + 1}
                </div>
                <span className="lease-step__label">{s}</span>
                {i < STEPS.length - 1 && <div className="lease-step__line" />}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Step 0: Asset Type */}
          {step === 0 && (
            <>
              <div className="lease-card">
                <div className="lease-card__header">
                  <i className="bi bi-collection"></i> Asset Type
                </div>
                <div className="lease-card__body">
                  <div className="form-group">
                    <label className="form-label-gov">What would you like to lease? <span className="required">*</span></label>
                    <div className="lease-asset-types">
                      {ASSET_TYPES.map(a => (
                        <label
                          key={a.value}
                          className={`lease-asset-option ${form.asset_type === a.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="asset_type"
                            value={a.value}
                            checked={form.asset_type === a.value}
                            onChange={() => update('asset_type', a.value)}
                          />
                          <div>
                            <div className="lease-asset-option__title">
                              <i className={`bi ${a.icon}`}></i>
                              {a.label}
                            </div>
                            <div className="lease-asset-option__desc">{a.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {form.asset_type && (
                <div className="lease-card">
                  <div className="lease-card__header">
                    <i className="bi bi-sliders"></i> {form.asset_type === 'aircraft' ? 'Aircraft' : 'Yacht'} Preferences
                    <span className="lease-card__optional">(optional)</span>
                  </div>
                  <div className="lease-card__body">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label-gov">{form.asset_type === 'aircraft' ? 'Aircraft Type / Model' : 'Yacht Type / Model'}</label>
                        <input
                          className="form-input-gov"
                          placeholder={form.asset_type === 'aircraft' ? 'e.g. Gulfstream G550, King Air…' : 'e.g. Sailing yacht, Sunseeker…'}
                          value={form.preferred_asset_name}
                          onChange={e => update('preferred_asset_name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">{form.asset_type === 'aircraft' ? 'Category' : 'Size'}</label>
                        <input
                          className="form-input-gov"
                          placeholder={form.asset_type === 'aircraft' ? 'e.g. Heavy jet, Turboprop…' : 'e.g. 30m, Superyacht…'}
                          value={form.preferred_category}
                          onChange={e => update('preferred_category', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label-gov">Preferred Base / Home Port</label>
                      <input
                        className="form-input-gov"
                        placeholder={form.asset_type === 'aircraft' ? 'e.g. Nairobi JKIA, Mombasa…' : 'e.g. Mombasa, Zanzibar, Seychelles…'}
                        value={form.preferred_location}
                        onChange={e => update('preferred_location', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 1: Lease Terms */}
          {step === 1 && (
            <>
              <div className="lease-card">
                <div className="lease-card__header">
                  <i className="bi bi-file-earmark-text"></i> Lease Structure
                </div>
                <div className="lease-card__body">
                  <div className="form-group">
                    <label className="form-label-gov">Lease Type <span className="required">*</span></label>
                    <div className="lease-duration-grid">
                      {LEASE_DURATIONS.map(ld => (
                        <label
                          key={ld.value}
                          className={`lease-duration-option ${form.lease_duration === ld.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="lease_duration"
                            value={ld.value}
                            checked={form.lease_duration === ld.value}
                            onChange={() => update('lease_duration', ld.value)}
                          />
                          <div>
                            <div className="lease-duration-option__label">{ld.label}</div>
                            <div className="lease-duration-option__sub">{ld.sub}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lease-card">
                <div className="lease-card__header">
                  <i className="bi bi-calendar3"></i> Timeline & Billing
                </div>
                <div className="lease-card__body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-gov">Desired Start Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input-gov"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.lease_start_date}
                        onChange={e => update('lease_start_date', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label-gov">End Date <span className="optional">(optional)</span></label>
                      <input
                        type="date"
                        className="form-input-gov"
                        min={form.lease_start_date || new Date().toISOString().split('T')[0]}
                        value={form.lease_end_date}
                        onChange={e => update('lease_end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-gov">Billing Preference</label>
                    <div className="billing-options">
                      {BILLING_FREQUENCIES.map(b => (
                        <label key={b.value} className="checkbox-label">
                          <input
                            type="radio"
                            name="billing"
                            value={b.value}
                            checked={form.billing_frequency === b.value}
                            onChange={() => update('billing_frequency', b.value)}
                          />
                          <span>{b.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-gov">Indicative Monthly Budget (USD) <span className="optional">(optional)</span></label>
                    <div className="budget-input">
                      <span className="budget-currency">$</span>
                      <input
                        type="number"
                        className="form-input-gov"
                        min="0"
                        placeholder="e.g. 50000"
                        value={form.budget_monthly_usd}
                        onChange={e => update('budget_monthly_usd', e.target.value)}
                      />
                    </div>
                    <div className="form-hint">Helps us match you to the right assets. Not binding.</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="lease-card">
              <div className="lease-card__header">
                <i className="bi bi-person"></i> Your Details
              </div>
              <div className="lease-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Full Name <span className="required">*</span></label>
                    <input
                      className="form-input-gov"
                      placeholder="Jane Mwangi"
                      value={form.guest_name}
                      onChange={e => update('guest_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input-gov"
                      placeholder="jane@company.com"
                      value={form.guest_email}
                      onChange={e => update('guest_email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input-gov"
                      placeholder="+254 7XX XXX XXX"
                      value={form.guest_phone}
                      onChange={e => update('guest_phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Company / Organisation</label>
                    <input
                      className="form-input-gov"
                      placeholder="Your company name"
                      value={form.company}
                      onChange={e => update('company', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Intended Use</label>
                  <input
                    className="form-input-gov"
                    placeholder="e.g. Corporate travel, charter operations, personal use…"
                    value={form.intended_use}
                    onChange={e => update('intended_use', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Additional Notes</label>
                  <textarea
                    className="form-input-gov"
                    rows={3}
                    placeholder="Any specific requirements, questions, or context for our team…"
                    value={form.additional_notes}
                    onChange={e => update('additional_notes', e.target.value)}
                  />
                  <div className="form-hint">We'll do our best to accommodate all requirements</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="lease-card">
              <div className="lease-card__header">
                <i className="bi bi-clipboard-check"></i> Review & Submit
              </div>
              <div className="lease-card__body">
                <p className="lease-review-intro">Please confirm your lease inquiry details below.</p>

                {/* Asset Section */}
                <div className="lease-review-section">
                  <div className="lease-review-section__title">Asset</div>
                  <div className="lease-review-items">
                    <div className="lease-review-item">
                      <span>Type</span>
                      <strong>{form.asset_type === 'aircraft' ? '✈ Aircraft' : '⛵ Yacht'}</strong>
                    </div>
                    {form.preferred_asset_name && (
                      <div className="lease-review-item">
                        <span>Model</span>
                        <strong>{form.preferred_asset_name}</strong>
                      </div>
                    )}
                    {form.preferred_category && (
                      <div className="lease-review-item">
                        <span>Category</span>
                        <strong>{form.preferred_category}</strong>
                      </div>
                    )}
                    {form.preferred_location && (
                      <div className="lease-review-item">
                        <span>Base</span>
                        <strong>{form.preferred_location}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lease Terms Section */}
                <div className="lease-review-section">
                  <div className="lease-review-section__title">Lease Terms</div>
                  <div className="lease-review-items">
                    <div className="lease-review-item">
                      <span>Type</span>
                      <strong>{LEASE_DURATIONS.find(d => d.value === form.lease_duration)?.label}</strong>
                    </div>
                    <div className="lease-review-item">
                      <span>Start</span>
                      <strong>{form.lease_start_date}</strong>
                    </div>
                    {form.lease_end_date && (
                      <div className="lease-review-item">
                        <span>End</span>
                        <strong>{form.lease_end_date}</strong>
                      </div>
                    )}
                    <div className="lease-review-item">
                      <span>Billing</span>
                      <strong>{BILLING_FREQUENCIES.find(b => b.value === form.billing_frequency)?.label}</strong>
                    </div>
                    {form.budget_monthly_usd && (
                      <div className="lease-review-item">
                        <span>Budget</span>
                        <strong>~${Number(form.budget_monthly_usd).toLocaleString()}/mo</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="lease-review-section">
                  <div className="lease-review-section__title">Contact</div>
                  <div className="lease-review-items">
                    <div className="lease-review-item">
                      <span>Name</span>
                      <strong>{form.guest_name}</strong>
                    </div>
                    <div className="lease-review-item">
                      <span>Email</span>
                      <strong>{form.guest_email}</strong>
                    </div>
                    {form.guest_phone && (
                      <div className="lease-review-item">
                        <span>Phone</span>
                        <strong>{form.guest_phone}</strong>
                      </div>
                    )}
                    {form.company && (
                      <div className="lease-review-item">
                        <span>Company</span>
                        <strong>{form.company}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <p className="lease-review-disclaimer">
                  By submitting, you agree to be contacted by a NairobiJetHouse lease consultant.
                  No commitment is required at this stage.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="lease-navigation">
            {step > 0 && (
              <button type="button" className="btn-outline-gov" onClick={() => setStep(s => s - 1)}>
                <i className="bi bi-arrow-left"></i> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn-primary-gov btn-lg"
                onClick={() => setStep(s => s + 1)}
                disabled={!stepValid()}
              >
                Continue <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-gov btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    &nbsp; Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Lease Inquiry
                  </>
                )}
              </button>
            )}
          </div>
          <p className="lease-security-note">
            <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 4 business hours.
          </p>

        </div>
      </section>

      {/* Lease Types Info Section */}
      <section className="lease-types-section">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Lease Structures</div>
            <h2 className="section-title">We Offer <em style={{ color: 'var(--color-gold)' }}>Flexible</em> Lease Options</h2>
            <div className="gold-divider center"></div>
          </div>
          <div className="lease-types-grid">
            {LEASE_TYPES.map((lt, i) => (
              <div key={i} className="lease-type-card">
                <div className="lease-type-card__tag">{lt.tag}</div>
                <h4 className="lease-type-card__title">{lt.name}</h4>
                <p className="lease-type-card__desc">{lt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Lease Steps */
        .lease-steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .lease-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
          max-width: 120px;
        }
        .lease-step__dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-light-gray);
          background: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-mid-gray);
          position: relative;
          z-index: 1;
          transition: all var(--transition-base);
        }
        .lease-step.active .lease-step__dot {
          border-color: var(--color-navy);
          background: var(--color-navy);
          color: var(--color-gold);
        }
        .lease-step.done .lease-step__dot {
          border-color: var(--color-success);
          background: var(--color-success);
          color: var(--color-white);
        }
        .lease-step__label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--color-mid-gray);
          text-align: center;
        }
        .lease-step.active .lease-step__label {
          color: var(--color-navy);
        }
        .lease-step.done .lease-step__label {
          color: var(--color-success);
        }
        .lease-step__line {
          position: absolute;
          top: 17px;
          left: calc(50% + 20px);
          right: calc(-50% + 20px);
          height: 2px;
          background: var(--color-light-gray);
          z-index: 0;
        }
        .lease-step.done .lease-step__line {
          background: var(--color-success);
        }

        /* Lease Cards */
        .lease-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .lease-card__header {
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
        .lease-card__header i {
          color: var(--color-gold);
          font-size: 1rem;
        }
        .lease-card__optional {
          margin-left: 0.5rem;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          font-size: 0.75rem;
        }
        .lease-card__body {
          padding: 1.5rem;
        }

        /* Asset Type Options */
        .lease-asset-types {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }
        .lease-asset-option {
          flex: 1 1 220px;
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
        .lease-asset-option.selected {
          border-color: var(--color-navy);
          background: var(--color-off-white);
        }
        .lease-asset-option input {
          margin-top: 0.2rem;
          accent-color: var(--color-navy);
        }
        .lease-asset-option__title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        .lease-asset-option__title i {
          margin-right: 0.35rem;
          color: var(--color-gold);
        }
        .lease-asset-option__desc {
          font-size: 0.75rem;
          color: var(--color-mid-gray);
        }

        /* Lease Duration Grid */
        .lease-duration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.6rem;
          margin-top: 0.25rem;
        }
        .lease-duration-option {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.65rem 0.85rem;
          border: 1.5px solid var(--color-light-gray);
          border-radius: var(--radius-sm);
          background: var(--color-white);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .lease-duration-option.selected {
          border-color: var(--color-navy);
          background: var(--color-off-white);
        }
        .lease-duration-option input {
          margin-top: 0.2rem;
          accent-color: var(--color-navy);
        }
        .lease-duration-option__label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-navy);
        }
        .lease-duration-option__sub {
          font-size: 0.7rem;
          color: var(--color-mid-gray);
        }

        /* Billing Options */
        .billing-options {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        /* Budget Input */
        .budget-input {
          position: relative;
        }
        .budget-currency {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-mid-gray);
          pointer-events: none;
          z-index: 1;
        }
        .budget-input .form-input-gov {
          padding-left: 1.75rem;
        }

        /* Review Section */
        .lease-review-intro {
          color: var(--color-mid-gray);
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }
        .lease-review-section {
          margin-bottom: 1rem;
        }
        .lease-review-section__title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-gold);
          margin-bottom: 0.5rem;
        }
        .lease-review-items {
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .lease-review-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--color-light-gray);
          font-size: 0.875rem;
        }
        .lease-review-item:last-child {
          border-bottom: none;
        }
        .lease-review-item span {
          color: var(--color-mid-gray);
        }
        .lease-review-item strong {
          color: var(--color-navy);
        }
        .lease-review-disclaimer {
          margin-top: 1.25rem;
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          line-height: 1.6;
          padding-top: 1rem;
          border-top: 1px solid var(--color-light-gray);
        }

        /* Navigation */
        .lease-navigation {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-top: 0.5rem;
        }
        .lease-security-note {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--color-mid-gray);
        }
        .lease-security-note i {
          margin-right: 0.3rem;
        }

        /* Lease Types Section */
        .lease-types-section {
          padding: 5rem 0;
          background: var(--color-navy);
          position: relative;
          overflow: hidden;
        }
        .lease-types-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .lease-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }
        .lease-type-card {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          background: rgba(255,255,255,0.03);
          transition: all var(--transition-base);
        }
        .lease-type-card:hover {
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        .lease-type-card__tag {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-gold);
          margin-bottom: 0.6rem;
        }
        .lease-type-card__title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--color-white);
          margin-bottom: 0.6rem;
        }
        .lease-type-card__desc {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lease-card__body {
            padding: 1rem;
          }
          .lease-asset-types {
            flex-direction: column;
          }
          .lease-duration-grid {
            grid-template-columns: 1fr;
          }
          .billing-options {
            flex-direction: column;
            gap: 0.75rem;
          }
          .lease-navigation {
            flex-wrap: wrap;
          }
          .lease-navigation button {
            flex: 1;
          }
          .lease-types-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}