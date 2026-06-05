// src/pages/normal/GroupCharterPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { groupCharterAPI } from '../../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const GROUP_TYPES = [
  ['corporate',    'Corporate & Business'],
  ['sports_team',  'Sports Team'],
  ['entertainment','Entertainment / Film'],
  ['incentive',    'Incentive Group'],
  ['wedding',      'Wedding Party'],
  ['government',   'Government & Diplomatic'],
  ['other',        'Other'],
]

const AIRCRAFT_CATEGORIES = [
  ['',             'Any / Let us recommend'],
  ['turboprop',    'Turboprop'],
  ['light',        'Light Jet'],
  ['midsize',      'Midsize Jet'],
  ['heavy',        'Heavy Jet'],
  ['vip_airliner', 'VIP Airliner'],
  ['helicopter',   'Helicopter'],
]

const BUDGET_RANGES = [
  ['',          'Select budget range…'],
  ['under_50k', 'Under $50,000'],
  ['50k_150k',  '$50,000 – $150,000'],
  ['150k_500k', '$150,000 – $500,000'],
  ['over_500k', 'Over $500,000'],
  ['flexible',  'Flexible / Open'],
]

const GUIDE_TIPS = [
  { icon: 'bi-people',        title: 'Group Specialists',    desc: 'Dedicated coordinators for complex multi-passenger charters.' },
  { icon: 'bi-clock-history', title: 'Quick Response',       desc: 'Receive a tailored proposal within 2–4 business hours.' },
  { icon: 'bi-shield-check',  title: 'Safety Certified',     desc: 'All operators are KCAA-certified with rigorous safety audits.' },
  { icon: 'bi-geo-alt',       title: 'East Africa Coverage', desc: '50+ airstrips across Kenya, Tanzania, Uganda & beyond.' },
]

const GROUP_TYPE_INFO = [
  { type: 'Corporate',   icon: 'bi-briefcase', desc: 'Conferences, roadshows & executive travel' },
  { type: 'Wedding',     icon: 'bi-heart',     desc: 'Bridal parties, guests & honeymoon transfers' },
  { type: 'Sports Team', icon: 'bi-trophy',    desc: 'Team travel with equipment & full logistics' },
  { type: 'Government',  icon: 'bi-bank2',     desc: 'Diplomatic & official delegation travel' },
]

const INITIAL = {
  contact_name:                '',
  contact_email:               '',
  contact_phone:               '',
  company:                     '',
  group_type:                  '',
  group_size:                  '',
  preferred_aircraft_category: '',
  budget_range:                '',
  origin_description:          '',
  destination_description:     '',
  departure_date:              '',
  departure_time:              '',
  return_date:                 '',
  return_time:                 '',
  is_round_trip:               false,
  catering_required:           false,
  ground_transport_required:   false,
  additional_notes:            '',
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GroupCharterPage() {
  const [form, setForm]       = useState(INITIAL)
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Field names match GroupCharterInquiry model exactly
      const payload = {
        contact_name:             form.contact_name,
        email:                    form.contact_email,           // model field: email
        phone:                    form.contact_phone || '',
        company:                  form.company       || '',
        group_type:               form.group_type,
        group_size:               Number(form.group_size),
        origin_description:       form.origin_description,     // model field
        destination_description:  form.destination_description, // model field
        departure_date:           form.departure_date,
        is_round_trip:            form.is_round_trip,
        catering_required:        form.catering_required,
        ground_transport_required: form.ground_transport_required, // model field
        additional_notes:         form.additional_notes || '',  // model field
      }
      if (form.preferred_aircraft_category)
        payload.preferred_aircraft_category = form.preferred_aircraft_category  // model field
      if (form.budget_range)
        payload.budget_range = form.budget_range
      if (form.is_round_trip && form.return_date)
        payload.return_date = form.return_date

      const { data } = await groupCharterAPI.create(payload)
      setSuccess(data)
    } catch (err) {
      const d = err.response?.data
      if (typeof d === 'object' && d !== null) {
        const msgs = Object.entries(d)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(' ') : errs}`)
          .join(' | ')
        setError(msgs)
      } else {
        setError('Submission failed. Please try again or contact us directly.')
      }
    } finally {
      setLoading(false)
    }
  }

  const canStep1 = form.contact_name && form.contact_email && form.group_type && form.group_size
  const canStep2 = form.origin_description && form.destination_description && form.departure_date &&
                   (!form.is_round_trip || form.return_date)

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <>
        <Helmet>
          <title>Inquiry Submitted | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="booking-success">
              <div className="booking-success__icon">
                <i className="bi bi-check-lg" />
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Inquiry Submitted</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                Our group charter specialists will contact you within 2–4 hours with a tailored proposal.
              </p>
              {success?.reference && (
                <div className="booking-success__ref">
                  <div className="booking-success__ref-label">Reference Number</div>
                  <div className="booking-success__ref-value">
                    {String(success.reference).slice(0, 8).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="booking-success__actions">
                <Link to="/track" className="btn-primary-gov">
                  <i className="bi bi-search" /> Track Your Booking
                </Link>
                <Link to="/" className="btn-outline-gov">
                  <i className="bi bi-house" /> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />
        <SuccessStyles />
      </>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Group Charter | NairobiJetHouse — Private Aviation for Groups</title>
        <meta name="description" content="Charter a private jet for your group — corporate events, weddings, sports teams and more. Request a tailored quote within 2–4 hours." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/group-charter" />
      </Helmet>

      <PublicNavbar />

      {/* ── Page Header ── */}
      <div className="page-header" style={{
        backgroundImage: 'linear-gradient(140deg, var(--color-navy-dark) 0%, var(--color-navy) 55%, var(--color-navy-light) 100%)',
      }}>
        <div className="container page-header__inner">
          <span className="section-label">
            <i className="bi bi-people-fill" /> Group Charter Services
          </span>
          <h1>Fly Your Group in <em style={{ color: 'var(--color-gold-light)' }}>Luxury</em></h1>
          <p>
            Tailored private aviation for corporate events, weddings, sports teams and more.
            Complete the form below and receive a personalised proposal within 2–4 hours.
          </p>
        </div>
      </div>

      {/* ── Form + Sidebar ── */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="booking-layout">

            {/* ── Left: Multi-step Form ── */}
            <div className="booking-form-col">

              {/* Step Indicator */}
              <div className="gc-stepper">
                {[
                  { n: 1, l: 'Group & Contact' },
                  { n: 2, l: 'Flight Details'  },
                  { n: 3, l: 'Review & Submit' },
                ].map(s => (
                  <div key={s.n} className={`gc-step${step === s.n ? ' active' : step > s.n ? ' done' : ''}`}>
                    <div className="gc-step-dot">
                      {step > s.n ? <i className="bi bi-check" /> : s.n}
                    </div>
                    <span className="gc-step-lbl">{s.l}</span>
                    {s.n < 3 && <div className="gc-step-line" />}
                  </div>
                ))}
              </div>

              {error && (
                <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <i className="bi bi-exclamation-triangle" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* ══ STEP 1: Group & Contact ══ */}
                {step === 1 && (
                  <>
                    {/* Contact Info Card */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-person" /> Contact Information
                      </div>
                      <div className="booking-card__body">
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label-gov">
                              Full Name <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              placeholder="Full name"
                              value={form.contact_name}
                              onChange={e => set('contact_name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">
                              Email Address <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              type="email"
                              placeholder="email@company.com"
                              value={form.contact_email}
                              onChange={e => set('contact_email', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">Phone Number</label>
                            <input
                              className="form-input-gov"
                              placeholder="+254 700 000 000"
                              value={form.contact_phone}
                              onChange={e => set('contact_phone', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">Company / Organisation</label>
                            <input
                              className="form-input-gov"
                              placeholder="Optional"
                              value={form.company}
                              onChange={e => set('company', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Group Details Card */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-people" /> Group Details
                      </div>
                      <div className="booking-card__body">
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label-gov">
                              Group Type <span className="required">*</span>
                            </label>
                            <select
                              className="form-input-gov"
                              value={form.group_type}
                              onChange={e => set('group_type', e.target.value)}
                              required
                            >
                              <option value="">Select group type…</option>
                              {GROUP_TYPES.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                            <div className="form-hint">Choose the option that best describes your group</div>
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">
                              Group Size <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              type="number"
                              min="2"
                              max="500"
                              placeholder="Number of passengers"
                              value={form.group_size}
                              onChange={e => set('group_size', e.target.value)}
                              required
                            />
                            <div className="form-hint">Total number of passengers flying</div>
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">Budget Range</label>
                            <select
                              className="form-input-gov"
                              value={form.budget_range}
                              onChange={e => set('budget_range', e.target.value)}
                            >
                              {BUDGET_RANGES.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">Preferred Aircraft Type</label>
                            <select
                              className="form-input-gov"
                              value={form.preferred_aircraft_category}
                              onChange={e => set('preferred_aircraft_category', e.target.value)}
                            >
                              {AIRCRAFT_CATEGORIES.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-primary-gov"
                        disabled={!canStep1}
                        onClick={() => { setError(''); setStep(2) }}
                      >
                        Next: Flight Details <i className="bi bi-arrow-right" />
                      </button>
                    </div>
                  </>
                )}

                {/* ══ STEP 2: Flight Details ══ */}
                {step === 2 && (
                  <>
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-airplane" /> Flight Details
                      </div>
                      <div className="booking-card__body">

                        {/* Round trip toggle */}
                        <div
                          className="gc-toggle-row"
                          style={{ marginBottom: '1.5rem' }}
                          onClick={() => set('is_round_trip', !form.is_round_trip)}
                        >
                          <div className={`gc-pill${form.is_round_trip ? ' on' : ''}`} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                              Round Trip
                            </div>
                            <div className="form-hint" style={{ marginTop: 0 }}>
                              Include a return flight for your group
                            </div>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label-gov">
                              Origin / Departure City <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              placeholder="e.g. Nairobi, Kenya"
                              value={form.origin_description}
                              onChange={e => set('origin_description', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">
                              Destination <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              placeholder="e.g. Mombasa, Kenya"
                              value={form.destination_description}
                              onChange={e => set('destination_description', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">
                              Departure Date <span className="required">*</span>
                            </label>
                            <input
                              className="form-input-gov"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={form.departure_date}
                              onChange={e => set('departure_date', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-gov">Preferred Departure Time</label>
                            <input
                              className="form-input-gov"
                              type="time"
                              value={form.departure_time}
                              onChange={e => set('departure_time', e.target.value)}
                            />
                          </div>

                          {form.is_round_trip && (
                            <>
                              <div className="form-group">
                                <label className="form-label-gov">
                                  Return Date <span className="required">*</span>
                                </label>
                                <input
                                  className="form-input-gov"
                                  type="date"
                                  min={form.departure_date || new Date().toISOString().split('T')[0]}
                                  value={form.return_date}
                                  onChange={e => set('return_date', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label-gov">Preferred Return Time</label>
                                <input
                                  className="form-input-gov"
                                  type="time"
                                  value={form.return_time}
                                  onChange={e => set('return_time', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add-ons Card */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-stars" /> Add-on Services
                      </div>
                      <div className="booking-card__body">
                        <div className="checkbox-group">
                          {[
                            ['catering_required',          'bi-cup-hot',   'In-Flight Catering',  'Meals, beverages & dietary options'],
                            ['ground_transport_required',  'bi-car-front', 'Ground Transport',    'Airport transfers & on-ground logistics'],
                          ].map(([k, icon, label, hint]) => (
                            <label
                              key={k}
                              className="checkbox-label"
                              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', flex: '1 1 200px' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                  type="checkbox"
                                  checked={form[k]}
                                  onChange={e => set(k, e.target.checked)}
                                />
                                <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }} />
                                <span style={{ fontWeight: 600 }}>{label}</span>
                              </div>
                              <span className="form-hint" style={{ marginLeft: '1.6rem', marginTop: 0 }}>{hint}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button type="button" className="btn-outline-gov" onClick={() => setStep(1)}>
                        <i className="bi bi-arrow-left" /> Back
                      </button>
                      <button
                        type="button"
                        className="btn-primary-gov"
                        disabled={!canStep2}
                        onClick={() => { setError(''); setStep(3) }}
                      >
                        Review Inquiry <i className="bi bi-arrow-right" />
                      </button>
                    </div>
                  </>
                )}

                {/* ══ STEP 3: Review & Submit ══ */}
                {step === 3 && (
                  <>
                    {/* Review: Group */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-person-check" /> Group Information
                        <button type="button" className="gc-edit-btn" onClick={() => setStep(1)}>
                          <i className="bi bi-pencil" /> Edit
                        </button>
                      </div>
                      <div className="booking-card__body">
                        <div className="gc-review-grid">
                          {[
                            ['Contact',       form.contact_name],
                            ['Email',         form.contact_email],
                            ['Phone',         form.contact_phone || '—'],
                            ['Company',       form.company || '—'],
                            ['Group Type',    GROUP_TYPES.find(([v]) => v === form.group_type)?.[1] || '—'],
                            ['Group Size',    `${form.group_size} passengers`],
                            ['Budget',        BUDGET_RANGES.find(([v]) => v === form.budget_range)?.[1] || 'Not specified'],
                            ['Aircraft Pref', AIRCRAFT_CATEGORIES.find(([v]) => v === form.preferred_aircraft_category)?.[1] || 'Any / Recommend'],
                          ].map(([k, v]) => (
                            <div className="gc-review-row" key={k}>
                              <span className="gc-review-key">{k}</span>
                              <span className="gc-review-val">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review: Flight */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-airplane" /> Flight Details
                        <button type="button" className="gc-edit-btn" onClick={() => setStep(2)}>
                          <i className="bi bi-pencil" /> Edit
                        </button>
                      </div>
                      <div className="booking-card__body">
                        <div className="gc-review-grid">
                          {[
                            ['From',       form.origin_description],
                            ['To',         form.destination_description],
                            ['Departure',  form.departure_date + (form.departure_time ? ` at ${form.departure_time}` : '')],
                            ['Trip Type',  form.is_round_trip ? 'Round Trip' : 'One Way'],
                            ...(form.is_round_trip
                              ? [['Return', form.return_date + (form.return_time ? ` at ${form.return_time}` : '')]]
                              : []),
                            ['Catering',   form.catering_required          ? '✓ Requested' : 'Not required'],
                            ['Transport',  form.ground_transport_required  ? '✓ Requested' : 'Not required'],
                          ].map(([k, v]) => (
                            <div className="gc-review-row" key={k}>
                              <span className="gc-review-key">{k}</span>
                              <span className="gc-review-val">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
                      <div className="booking-card__header">
                        <i className="bi bi-chat-text" /> Additional Notes
                      </div>
                      <div className="booking-card__body">
                        <div className="form-group">
                          <label className="form-label-gov">Special Requirements or Notes</label>
                          <textarea
                            className="form-input-gov"
                            rows={4}
                            placeholder="VIP lounge access, seating arrangements, accessibility needs, cargo requirements, or any other details…"
                            value={form.additional_notes}
                            onChange={e => set('additional_notes', e.target.value)}
                          />
                          <div className="form-hint">We'll do our best to accommodate all requests</div>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <button type="button" className="btn-outline-gov" onClick={() => setStep(2)}>
                        <i className="bi bi-arrow-left" /> Back
                      </button>
                      <button type="submit" className="btn-primary-gov btn-lg" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }} />
                            &nbsp; Submitting…
                          </>
                        ) : (
                          <><i className="bi bi-send" /> Submit Group Charter Inquiry</>
                        )}
                      </button>
                    </div>
                    <p className="text-center" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-shield-check" /> Your information is secure. We'll respond within 2–4 hours.
                    </p>
                  </>
                )}

              </form>
            </div>

            {/* ── Right: Sidebar ── */}
            <div className="booking-sidebar">

              <div className="booking-sidebar-card">
                <div className="booking-sidebar-card__header">
                  <i className="bi bi-lightbulb" /> Why Choose Group Charter
                </div>
                <div className="booking-sidebar-card__body">
                  {GUIDE_TIPS.map(({ icon, title, desc }) => (
                    <div key={title} className="booking-tip-item">
                      <i className={`bi ${icon}`} />
                      <div>
                        <strong>{title}</strong>
                        <p>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="booking-sidebar-card">
                <div className="booking-sidebar-card__header">
                  <i className="bi bi-people" /> Charter Types
                </div>
                <div className="booking-sidebar-card__body">
                  {GROUP_TYPE_INFO.map((g, i) => (
                    <div key={i} className="aircraft-sidebar-item">
                      <div className="aircraft-sidebar-info">
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className={`bi ${g.icon}`} style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }} />
                          {g.type}
                        </strong>
                        <p>{g.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="booking-sidebar-card">
                <div className="booking-sidebar-card__header">
                  <i className="bi bi-headset" /> Need Help?
                </div>
                <div className="booking-sidebar-card__body">
                  <p>Our concierge team is available 24/7 to assist with your group charter.</p>
                  <a
                    href="tel:+254724878136"
                    className="btn-outline-gov btn-sm"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                  >
                    <i className="bi bi-telephone" /> +254 724 878 136
                  </a>
                  <a
                    href="mailto:info@nairobijethouse.com"
                    className="btn-outline-gov btn-sm"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    <i className="bi bi-envelope" /> info@nairobijethouse.com
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      <PageStyles />
    </>
  )
}

// ── Style Blocks ──────────────────────────────────────────────────────────────
function SuccessStyles() {
  return (
    <style>{`
      .booking-success { text-align: center; max-width: 500px; margin: 0 auto; }
      .booking-success__icon {
        width: 80px; height: 80px;
        background: rgba(26,127,90,0.1); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1.5rem;
      }
      .booking-success__icon i { font-size: 2.5rem; color: var(--color-success); }
      .booking-success__ref {
        background: var(--color-off-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md);
        padding: 1rem; margin-bottom: 2rem;
      }
      .booking-success__ref-label {
        font-size: 0.7rem; font-weight: 700;
        letter-spacing: 3px; text-transform: uppercase;
        color: var(--color-gold); margin-bottom: 0.25rem;
      }
      .booking-success__ref-value {
        font-family: monospace; font-size: 1.1rem;
        font-weight: 700; color: var(--color-navy);
      }
      .booking-success__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
      @media (max-width: 480px) {
        .booking-success__actions { flex-direction: column; }
        .booking-success__actions a { width: 100%; justify-content: center; }
      }
    `}</style>
  )
}

function PageStyles() {
  return (
    <style>{`
      /* ── Layout ── */
      .booking-layout {
        display: grid; grid-template-columns: 1fr 320px;
        gap: 2rem; align-items: start;
      }
      .booking-form-col { min-width: 0; }
      .booking-sidebar  { position: sticky; top: 100px; }

      .booking-card {
        background: var(--color-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md); overflow: hidden;
      }
      .booking-card__header {
        background: var(--color-navy); color: var(--color-white);
        padding: 1rem 1.5rem;
        font-family: var(--font-label); font-size: 0.85rem;
        font-weight: 700; letter-spacing: 0.5px;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .booking-card__header i { color: var(--color-gold); font-size: 1rem; }
      .booking-card__body { padding: 1.5rem; }

      .booking-sidebar-card {
        background: var(--color-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md); overflow: hidden;
        margin-bottom: 1.5rem;
      }
      .booking-sidebar-card__header {
        background: var(--color-navy); color: var(--color-white);
        padding: 0.85rem 1.25rem;
        font-family: var(--font-label); font-size: 0.8rem;
        font-weight: 700; letter-spacing: 0.5px;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .booking-sidebar-card__header i { color: var(--color-gold); font-size: 0.9rem; }
      .booking-sidebar-card__body { padding: 1.25rem; }

      .booking-tip-item {
        display: flex; gap: 0.75rem;
        margin-bottom: 1rem; padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-light-gray);
      }
      .booking-tip-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .booking-tip-item i { font-size: 1.2rem; color: var(--color-gold); flex-shrink: 0; }
      .booking-tip-item strong { display: block; font-size: 0.85rem; color: var(--color-navy); margin-bottom: 0.2rem; }
      .booking-tip-item p { font-size: 0.75rem; color: var(--color-mid-gray); margin: 0; line-height: 1.4; }

      .aircraft-sidebar-item {
        margin-bottom: 1rem; padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-light-gray);
      }
      .aircraft-sidebar-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .aircraft-sidebar-info strong { display: block; font-size: 0.85rem; color: var(--color-navy); margin-bottom: 0.25rem; }
      .aircraft-sidebar-info p { font-size: 0.72rem; color: var(--color-mid-gray); margin: 0; line-height: 1.4; }

      .checkbox-group { display: flex; gap: 1.5rem; flex-wrap: wrap; }
      .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--color-dark-gray); }
      .checkbox-label input[type="checkbox"] { width: 17px; height: 17px; accent-color: var(--color-navy); cursor: pointer; }

      /* ── Step Indicator ── */
      .gc-stepper {
        display: flex; align-items: center;
        background: var(--color-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md);
        padding: 1rem 1.5rem; margin-bottom: 1.5rem;
        gap: 0;
      }
      .gc-step { display: flex; align-items: center; flex: 1; gap: 0.6rem; position: relative; }
      .gc-step-dot {
        width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; z-index: 1;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.78rem; font-weight: 700;
        border: 2px solid var(--color-light-gray);
        color: var(--color-mid-gray); background: var(--color-white);
        transition: all 0.2s;
      }
      .gc-step.active .gc-step-dot { background: var(--color-navy); border-color: var(--color-navy); color: #fff; }
      .gc-step.done .gc-step-dot   { background: var(--color-gold);  border-color: var(--color-gold);  color: var(--color-navy); }
      .gc-step-lbl { font-size: 0.73rem; font-weight: 600; color: var(--color-mid-gray); display: none; }
      @media (min-width: 480px) { .gc-step-lbl { display: block; } }
      .gc-step.active .gc-step-lbl { color: var(--color-navy);      font-weight: 700; }
      .gc-step.done   .gc-step-lbl { color: var(--color-dark-gray); }
      .gc-step-line { flex: 1; height: 1px; background: var(--color-light-gray); }

      /* ── Round Trip Toggle ── */
      .gc-toggle-row {
        display: flex; align-items: center; gap: 1rem;
        padding: 0.85rem 1rem; border-radius: var(--radius-sm);
        background: var(--color-off-white);
        border: 1px solid var(--color-light-gray);
        cursor: pointer; user-select: none; transition: border-color 0.2s;
      }
      .gc-toggle-row:hover { border-color: var(--color-navy); }
      .gc-pill {
        width: 44px; height: 24px; border-radius: 99px;
        background: var(--color-light-gray); position: relative;
        flex-shrink: 0; transition: background 0.2s;
      }
      .gc-pill.on { background: var(--color-navy); }
      .gc-pill::after {
        content: ''; position: absolute; top: 3px; left: 3px;
        width: 18px; height: 18px; border-radius: 50%;
        background: #fff; transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      .gc-pill.on::after { transform: translateX(20px); }

      /* ── Review Grid ── */
      .gc-review-grid { display: flex; flex-direction: column; gap: 0; }
      .gc-review-row {
        display: flex; justify-content: space-between; align-items: flex-start;
        font-size: 0.875rem; padding: 0.45rem 0;
        border-bottom: 1px solid var(--color-off-white);
      }
      .gc-review-row:last-child { border-bottom: none; }
      .gc-review-key { color: var(--color-mid-gray); flex-shrink: 0; margin-right: 1rem; }
      .gc-review-val { font-weight: 500; text-align: right; word-break: break-word; color: var(--color-navy); }

      /* Edit button inside card header */
      .gc-edit-btn {
        margin-left: auto; background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;
        color: #fff; font-size: 0.72rem; font-weight: 600;
        padding: 0.2rem 0.6rem; cursor: pointer;
        display: flex; align-items: center; gap: 0.3rem;
        transition: background 0.2s;
      }
      .gc-edit-btn:hover { background: rgba(255,255,255,0.22); }
      .gc-edit-btn i { font-size: 0.65rem; }

      /* ── Responsive ── */
      @media (max-width: 1024px) {
        .booking-layout { grid-template-columns: 1fr; }
        .booking-sidebar { position: static; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .booking-sidebar-card { margin-bottom: 0; }
      }
      @media (max-width: 768px) {
        .booking-card__body { padding: 1rem; }
        .booking-sidebar { grid-template-columns: 1fr; }
        .checkbox-group { flex-direction: column; gap: 0.75rem; }
      }
    `}</style>
  )
}