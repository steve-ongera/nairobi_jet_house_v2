import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    icon: 'bi-tsunami',
    desc: 'Sailing, motor, and superyacht lease arrangements',
  },
];

const LEASE_DURATIONS = [
  { value: 'short_term',  label: 'Short-Term',           sub: '1 – 6 months' },
  { value: 'medium_term', label: 'Medium-Term',          sub: '6 – 24 months' },
  { value: 'long_term',   label: 'Long-Term',            sub: '2 + years' },
  { value: 'wet_lease',   label: 'Wet Lease',            sub: 'Crew & ops included' },
  { value: 'dry_lease',   label: 'Dry Lease',            sub: 'Asset only' },
  { value: 'acmi',        label: 'ACMI',                 sub: 'Aircraft, crew, maintenance, insurance' },
];

const BILLING_FREQUENCIES = [
  { value: 'monthly',   label: 'Monthly Payments' },
  { value: 'quarterly', label: 'Quarterly Payments' },
  { value: 'upfront',   label: 'Full Upfront' },
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
      const payload = {
        asset_type: form.asset_type,
        lease_duration: form.lease_duration,
        lease_start_date: form.lease_start_date,
        lease_end_date: form.lease_end_date || null,
        billing_frequency: form.billing_frequency,
        budget_monthly_usd: form.budget_monthly_usd ? parseFloat(form.budget_monthly_usd) : null,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        contact_phone: form.guest_phone,
        company: form.company,
        intended_use: form.intended_use,
        additional_notes: form.additional_notes,
        preferred_asset_description: [
          form.preferred_asset_name,
          form.preferred_category,
          form.preferred_location,
        ].filter(Boolean).join(' — ') || undefined,
      };
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

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Lease Inquiry Received</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                A dedicated lease consultant will reach out within{' '}
                <strong>4 business hours</strong> with tailored options and indicative pricing.
              </p>
              <div className="ref-box">
                <div className="ref-label">Reference Number</div>
                <div className="ref-value">{String(reference).slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/fleet" className="btn btn-navy">
                  <i className="bi bi-collection"></i> Browse Fleet
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

  // ── Main Page ───────────────────────────────────────────────────────────────
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Asset Leasing</div>
          <h1>Lease. <em style={{ color: 'var(--gold-light)' }}>Fly.</em> Sail.</h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Short-term to multi-year lease arrangements for business jets, turboprops,
            helicopters, and luxury yachts — flexible structures tailored to your operations.
          </p>
        </div>
      </section>

      {/* Step Trail + Form */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {/* Step Progress */}
          <div className="step-trail" style={{ marginBottom: '2rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} className={`trail-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="trail-dot">
                  {i < step ? <i className="bi bi-check"></i> : i + 1}
                </div>
                <span>{s}</span>
                {i < STEPS.length - 1 && <div className="trail-line" />}
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 0: Asset Type ── */}
          {step === 0 && (
            <>
              <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-card-header">
                  <div className="detail-card-title">
                    <i className="bi bi-collection"></i> Asset Type
                  </div>
                </div>
                <div className="detail-card-body">
                  <div className="form-group">
                    <label className="form-label">What would you like to lease? <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {ASSET_TYPES.map(a => (
                        <label
                          key={a.value}
                          style={{
                            flex: '1 1 220px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            padding: '0.75rem 1rem',
                            border: `1.5px solid ${form.asset_type === a.value ? 'var(--navy)' : 'var(--gray-200, #e5e7eb)'}`,
                            borderRadius: '0.5rem',
                            background: form.asset_type === a.value ? 'var(--navy-50, #f0f4ff)' : 'var(--white, #fff)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="radio"
                            name="asset_type"
                            value={a.value}
                            checked={form.asset_type === a.value}
                            onChange={() => update('asset_type', a.value)}
                            style={{ marginTop: '0.2rem', accentColor: 'var(--navy)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>
                              <i className={`bi ${a.icon}`} style={{ marginRight: '0.35rem' }}></i>
                              {a.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{a.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {form.asset_type && (
                <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="detail-card-header">
                    <div className="detail-card-title">
                      <i className="bi bi-sliders"></i>{' '}
                      {form.asset_type === 'aircraft' ? 'Aircraft' : 'Yacht'} Preferences{' '}
                      <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.8rem' }}>(optional)</span>
                    </div>
                  </div>
                  <div className="detail-card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          {form.asset_type === 'aircraft' ? 'Aircraft Type / Model' : 'Yacht Type / Model'}
                        </label>
                        <input
                          className="form-control"
                          placeholder={form.asset_type === 'aircraft' ? 'e.g. Gulfstream G550, King Air…' : 'e.g. Sailing yacht, Sunseeker…'}
                          value={form.preferred_asset_name}
                          onChange={e => update('preferred_asset_name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          {form.asset_type === 'aircraft' ? 'Category' : 'Size'}
                        </label>
                        <input
                          className="form-control"
                          placeholder={form.asset_type === 'aircraft' ? 'e.g. Heavy jet, Turboprop…' : 'e.g. 30m, Superyacht…'}
                          value={form.preferred_category}
                          onChange={e => update('preferred_category', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Base / Home Port</label>
                      <input
                        className="form-control"
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

          {/* ── Step 1: Lease Terms ── */}
          {step === 1 && (
            <>
              <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-card-header">
                  <div className="detail-card-title">
                    <i className="bi bi-file-earmark-text"></i> Lease Structure
                  </div>
                </div>
                <div className="detail-card-body">
                  <div className="form-group">
                    <label className="form-label">Lease Type <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {LEASE_DURATIONS.map(ld => (
                        <label
                          key={ld.value}
                          style={{
                            flex: '1 1 150px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            padding: '0.65rem 0.85rem',
                            border: `1.5px solid ${form.lease_duration === ld.value ? 'var(--navy)' : 'var(--gray-200, #e5e7eb)'}`,
                            borderRadius: '0.5rem',
                            background: form.lease_duration === ld.value ? 'var(--navy-50, #f0f4ff)' : 'var(--white, #fff)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="radio"
                            name="lease_duration"
                            value={ld.value}
                            checked={form.lease_duration === ld.value}
                            onChange={() => update('lease_duration', ld.value)}
                            style={{ marginTop: '0.2rem', accentColor: 'var(--navy)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{ld.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{ld.sub}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-card-header">
                  <div className="detail-card-title">
                    <i className="bi bi-calendar3"></i> Timeline & Billing
                  </div>
                </div>
                <div className="detail-card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Desired Start Date <span className="req">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.lease_start_date}
                        onChange={e => update('lease_start_date', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        End Date{' '}
                        <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>optional</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        min={form.lease_start_date || new Date().toISOString().split('T')[0]}
                        value={form.lease_end_date}
                        onChange={e => update('lease_end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label">Billing Preference</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {BILLING_FREQUENCIES.map(b => (
                        <label key={b.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="billing"
                            value={b.value}
                            checked={form.billing_frequency === b.value}
                            onChange={() => update('billing_frequency', b.value)}
                            style={{ accentColor: 'var(--navy)' }}
                          />
                          <span style={{ fontSize: '0.875rem' }}>{b.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Indicative Monthly Budget (USD){' '}
                      <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none',
                      }}>$</span>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        placeholder="e.g. 50000"
                        value={form.budget_monthly_usd}
                        onChange={e => update('budget_monthly_usd', e.target.value)}
                        style={{ paddingLeft: '1.75rem' }}
                      />
                    </div>
                    <span className="form-hint">Helps us match you to the right assets. Not binding.</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Contact ── */}
          {step === 2 && (
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-person"></i> Your Details
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input
                      className="form-control"
                      placeholder="Jane Mwangi"
                      value={form.guest_name}
                      onChange={e => update('guest_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="req">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane@company.com"
                      value={form.guest_email}
                      onChange={e => update('guest_email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+254 7XX XXX XXX"
                      value={form.guest_phone}
                      onChange={e => update('guest_phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organisation</label>
                    <input
                      className="form-control"
                      placeholder="Your company name"
                      value={form.company}
                      onChange={e => update('company', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Intended Use</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Corporate travel, charter operations, personal use…"
                    value={form.intended_use}
                    onChange={e => update('intended_use', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Any specific requirements, questions, or context for our team…"
                    value={form.additional_notes}
                    onChange={e => update('additional_notes', e.target.value)}
                  />
                  <span className="form-hint">We'll do our best to accommodate all requirements</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-clipboard-check"></i> Review & Submit
                </div>
              </div>
              <div className="detail-card-body">
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Please confirm your lease inquiry details below.
                </p>

                {/* Asset */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gold, #d4af37)', marginBottom: '0.5rem',
                  }}>Asset</div>
                  {[
                    ['Type', form.asset_type === 'aircraft' ? '✈ Aircraft' : '⛵ Yacht'],
                    form.preferred_asset_name && ['Model', form.preferred_asset_name],
                    form.preferred_category && ['Category', form.preferred_category],
                    form.preferred_location && ['Base', form.preferred_location],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.4rem 0', borderBottom: '1px solid var(--gray-100, #f3f4f6)',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: 'var(--gray-400)' }}>{label}</span>
                      <strong style={{ color: 'var(--navy)' }}>{val}</strong>
                    </div>
                  ))}
                </div>

                {/* Lease Terms */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gold, #d4af37)', marginBottom: '0.5rem',
                  }}>Lease Terms</div>
                  {[
                    ['Type', LEASE_DURATIONS.find(d => d.value === form.lease_duration)?.label],
                    ['Start', form.lease_start_date],
                    form.lease_end_date && ['End', form.lease_end_date],
                    ['Billing', BILLING_FREQUENCIES.find(b => b.value === form.billing_frequency)?.label],
                    form.budget_monthly_usd && ['Budget', `~$${Number(form.budget_monthly_usd).toLocaleString()}/mo`],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.4rem 0', borderBottom: '1px solid var(--gray-100, #f3f4f6)',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: 'var(--gray-400)' }}>{label}</span>
                      <strong style={{ color: 'var(--navy)' }}>{val}</strong>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gold, #d4af37)', marginBottom: '0.5rem',
                  }}>Contact</div>
                  {[
                    ['Name', form.guest_name],
                    ['Email', form.guest_email],
                    form.guest_phone && ['Phone', form.guest_phone],
                    form.company && ['Company', form.company],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.4rem 0', borderBottom: '1px solid var(--gray-100, #f3f4f6)',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: 'var(--gray-400)' }}>{label}</span>
                      <strong style={{ color: 'var(--navy)' }}>{val}</strong>
                    </div>
                  ))}
                </div>

                <p style={{
                  marginTop: '1.25rem', fontSize: '0.75rem',
                  color: 'var(--gray-400)', lineHeight: 1.6,
                  paddingTop: '1rem', borderTop: '1px solid var(--gray-100, #f3f4f6)',
                }}>
                  By submitting, you agree to be contacted by a NairobiJetHouse lease consultant.
                  No commitment is required at this stage.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            {step > 0 && (
              <button
                type="button"
                className="btn btn-outline-navy"
                onClick={() => setStep(s => s - 1)}
              >
                <i className="bi bi-arrow-left"></i> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-navy btn-lg"
                onClick={() => setStep(s => s + 1)}
                disabled={!stepValid()}
              >
                Continue <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-navy btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }}></span>
                    &nbsp; Submitting…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Lease Inquiry
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-center text-sm" style={{ marginTop: '1rem', color: 'var(--gray-400)' }}>
            <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 4 business hours.
          </p>

        </div>
      </section>

      {/* Lease Types Info */}
      <section className="section" style={{ background: 'var(--navy, #0d1117)' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700,
            color: '#fff', textAlign: 'center', marginBottom: '3rem',
          }}>
            Lease Structures We Offer
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              {
                name: 'Wet Lease',      tag: 'Aircraft + Crew',
                desc: 'The operator provides the aircraft and full crew. Ideal for airlines, charter companies, or corporates that need turnkey operations.',
              },
              {
                name: 'Dry Lease',      tag: 'Asset Only',
                desc: 'You get the aircraft or yacht without crew or maintenance. Best for AOC holders and operators who bring their own team.',
              },
              {
                name: 'ACMI',           tag: 'Full-Service',
                desc: 'Aircraft, Crew, Maintenance & Insurance. The gold standard for commercial operators requiring a complete solution.',
              },
              {
                name: 'Short-Term Charter Lease', tag: '1 – 6 Months',
                desc: 'Flexible short-term arrangements with no long-term commitment. Perfect for seasonal demand or project-based needs.',
              },
              {
                name: 'Long-Term Lease', tag: '2+ Years',
                desc: 'Predictable cost structure with multi-year commitment. Typically includes preferred rates and dedicated asset allocation.',
              },
              {
                name: 'Yacht Lease',    tag: 'Coastal & Ocean',
                desc: 'From bareboat to fully crewed superyacht leases, covering the East African coast, Indian Ocean islands, and beyond.',
              },
            ].map((lt, i) => (
              <div key={i} style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                transition: 'border-color 0.2s',
              }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.12em', color: 'var(--gold, #d4af37)', marginBottom: '0.6rem',
                }}>{lt.tag}</div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', marginBottom: '0.6rem' }}>{lt.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{lt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* ── Step Trail ── */
        .step-trail {
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .trail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
          max-width: 120px;
        }
        .trail-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #d1cec7;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #bbb;
          position: relative;
          z-index: 1;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .trail-item.active .trail-dot {
          border-color: var(--navy, #0d1117);
          background: var(--navy, #0d1117);
          color: var(--gold, #d4af37);
        }
        .trail-item.done .trail-dot {
          border-color: #2d6a4f;
          background: #2d6a4f;
          color: #fff;
        }
        .trail-item > span {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #aaa;
          text-align: center;
        }
        .trail-item.active > span { color: var(--navy, #0d1117); }
        .trail-item.done > span   { color: #2d6a4f; }
        .trail-line {
          position: absolute;
          top: 17px;
          left: calc(50% + 20px);
          right: calc(-50% + 20px);
          height: 2px;
          background: #e0ddd8;
          z-index: 0;
        }
        .trail-item.done .trail-line { background: #2d6a4f; }
      `}</style>
    </>
  );
}