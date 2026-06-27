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

// ── Unique Value Props for Group Charter ──
const GROUP_VALUE_PROPS = [
  { icon: 'bi-people-fill',     title: 'Seamless Group Coordination', desc: 'One point of contact manages all passenger manifests, baggage, and special requirements for your entire group.' },
  { icon: 'bi-clock-history',   title: 'Flexible Scheduling',         desc: 'Depart when your group is ready — no waiting for commercial flight schedules or connections.' },
  { icon: 'bi-shield-check',    title: 'Safety Certified Operators',  desc: 'All partner operators meet KCAA and international safety standards with rigorous audits.' },
  { icon: 'bi-geo-alt',         title: '50+ East Africa Airstrips',   desc: 'Access remote destinations that commercial airlines can\'t reach, from safari camps to private islands.' },
  { icon: 'bi-cup-hot',         title: 'Customised In-Flight Service',desc: 'Tailored catering, entertainment, and seating arrangements for your group\'s specific needs.' },
  { icon: 'bi-headset',         title: '24/7 Group Support',          desc: 'Dedicated group charter specialists available around the clock, every day of the year.' },
]

// ── Group Charter Use Cases (images only - no icons) ──
const GROUP_USE_CASES = [
  { label: 'Corporate Events', img: 'https://plus.unsplash.com/premium_photo-1723867267202-169dfe3b197a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Q29ycG9yYXRlJTIwRXZlbnRzfGVufDB8fDB8fHww' },
  { label: 'Weddings', img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fFdlZGRpbmdzfGVufDB8fDB8fHww' },
  { label: 'Sports Teams', img: 'https://plus.unsplash.com/premium_photo-1709059480254-e4a955dafadf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U3BvcnRzJTIwVGVhbXN8ZW58MHx8MHx8fDA%3D' },
  { label: 'Music Tours', img: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE11c2ljJTIwVG91cnN8ZW58MHx8MHx8fDA%3D' },
  { label: 'Government', img: 'https://images.unsplash.com/photo-1586441133374-ed1cb4007a47?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEdvdmVybm1lbnQlMjBUcmF2ZWx8ZW58MHx8MHx8fDA%3D' },
  { label: 'Incentive Travel', img: 'https://plus.unsplash.com/premium_photo-1663054911397-c7fe60ec3849?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8SW5jZW50aXZlJTIwVHJhdmVsfGVufDB8fDB8fHww' },
  { label: 'Film Production', img: 'https://plus.unsplash.com/premium_photo-1710961232986-36cead00da3c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8RmlsbSUyMFByb2R1Y3Rpb258ZW58MHx8MHx8fDA%3D' },
  { label: 'Request a Quote', img: null, isCta: true },
]

// ── Group Charter Stats ──
const GROUP_STATS = [
  { value: '500+',  label: 'Group charters completed' },
  { value: '98%',   label: 'Client satisfaction rate' },
  { value: '15+',   label: 'Years of group expertise' },
  { value: '24/7',  label: 'Dedicated support' },
]

// ── Popular Group Destinations ──
const GROUP_DESTINATIONS = [
  { city: 'Maasai Mara',     country: 'Kenya',  img: 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWFhc2FpJTIwTWFyYXxlbnwwfHwwfHx8MA%3D%3D' },
  { city: 'Zanzibar',        country: 'Tanzania', img: 'https://images.unsplash.com/photo-1646668072507-b2215b873c70?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8WmFuemliYXJ8ZW58MHx8MHx8fDA%3D' },
  { city: 'Victoria Falls',  country: 'Zimbabwe', img: 'https://plus.unsplash.com/premium_photo-1697729979889-31ec7ecf6f06?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8VmljdG9yaWElMjBGYWxsc3xlbnwwfHwwfHx8MA%3D%3D' },
  { city: 'Kigali',          country: 'Rwanda',  img: 'https://images.unsplash.com/photo-1598605272254-16f0c0ecdfa5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8S2lnYWxpfGVufDB8fDB8fHww' },
  { city: 'Cape Town',       country: 'South Africa', img: 'https://plus.unsplash.com/premium_photo-1697730061063-ad499e343f26?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2FwZSUyMFRvd258ZW58MHx8MHx8fDA%3D' },
]

const GROUP_FAQS = [
  { q: 'How far in advance should I book a group charter?',
    a: 'We recommend at least 2-4 weeks for groups of 10+, but we can accommodate last-minute requests with as little as 24-48 hours notice depending on aircraft availability.' },
  { q: 'Can you accommodate oversized baggage or equipment?',
    a: 'Absolutely. We specialise in moving everything from sports equipment and musical instruments to film gear and medical supplies. Please detail your cargo requirements in your inquiry.' },
  { q: 'What\'s the maximum group size you can handle?',
    a: 'We can accommodate groups from 2 to 500+ passengers, from light jets for small executive teams to VIP airliners for large delegations and events.' },
  { q: 'Do you offer group discounts?',
    a: 'Yes, we offer competitive pricing for group charters. The more passengers, the more cost-effective per seat — often comparable to commercial first class tickets.' },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Group Charter | NairobiJetHouse',
  description: 'Charter a private jet for your group — corporate events, weddings, sports teams and more. Request a tailored quote within 2–4 hours.',
}

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
  const [openFaq, setOpenFaq] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const scrollToForm = () => {
    const el = document.getElementById('group-charter-form-top')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        contact_name:             form.contact_name,
        email:                    form.contact_email,
        phone:                    form.contact_phone || '',
        company:                  form.company       || '',
        group_type:               form.group_type,
        group_size:               Number(form.group_size),
        origin_description:       form.origin_description,
        destination_description:  form.destination_description,
        departure_date:           form.departure_date,
        is_round_trip:            form.is_round_trip,
        catering_required:        form.catering_required,
        ground_transport_required: form.ground_transport_required,
        additional_notes:         form.additional_notes || '',
      }
      if (form.preferred_aircraft_category)
        payload.preferred_aircraft_category = form.preferred_aircraft_category
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
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* ── Page Header ── */}
      <section className="group-hero" id="group-charter-form-top">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--color-gold)' }}>
             Group Charter Services
          </span>
          <h1 className="group-hero__title">Fly Your Group in <span style={{ color: 'var(--color-gold)' }}>Luxury</span></h1>
          <p className="group-hero__subtitle">
            Tailored private aviation for corporate events, weddings, sports teams and more.
            Complete the form below and receive a personalised proposal within 2–4 hours.
          </p>

          <div className="group-hero__layout">

            {/* ── Form column ── */}
            <div className="group-hero__form-col">

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

            {/* ── Side panel: Consultant card ── */}
            <div className="group-hero__side">
              <div className="consultant-card">
                <div className="consultant-card__image">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1661508803572-8411b83606a3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D"
                    alt="Group charter specialist"
                  />
                  <div className="consultant-card__overlay" />
                </div>
                <div className="consultant-card__body">
                  <h3>Speak to Our Group Charter Specialist</h3>
                  <p>Our dedicated group coordinators are ready to discuss your requirements and deliver a tailored proposal.</p>
                  <a href="tel:+254724878136" className="btn-primary-gov" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="bi bi-telephone"></i> Call Now
                  </a>
                  <a href="mailto:nairobijethouse@gmail.com" className="btn-outline-gov" style={{ width: '100%', color: 'white', justifyContent: 'center', marginTop: '0.6rem' }}>
                    <i className="bi bi-envelope"></i> nairobijethouse@gmail.com
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="consultant-card" style={{ background: 'var(--color-navy-dark, #06142e)' }}>
                <div className="consultant-card__body" style={{ marginTop: 0 }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Why Groups Choose Us</h3>
                  {GROUP_STATS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{s.label}</span>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.95rem' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE GROUP CHARTER ============ */}
      <section className="section-padding why-us" style={{ background: 'var(--color-white)' }}>
        <div className="container">
          <h2 className="section-title text-center">Why Choose NairobiJetHouse for Group Charters?</h2>
          <div className="why-us__grid">
            <div className="why-us__image">
              <img
                src="https://images.unsplash.com/photo-1628354215124-dd0ab72828ac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGFpcmNyYWZ0fGVufDB8fDB8fHww"
                alt="Group charter team meeting"
              />
            </div>
            <div className="why-us__props">
              {GROUP_VALUE_PROPS.map((vp, i) => (
                <div key={i} className="why-us__prop">
                  <div className="why-us__prop-icon"><i className={`bi ${vp.icon}`}></i></div>
                  <div>
                    <strong>{vp.title}</strong>
                    <p>{vp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GROUP USE CASES GRID ============ */}
      <section className="service-categories">
        <div className="service-categories__grid">
          {GROUP_USE_CASES.map((cat, i) => (
            cat.isCta ? (
              <button
                key={i}
                onClick={scrollToForm}
                className="svc-cat-tile svc-cat-tile--cta"
              >
                <span className="svc-cat-tile__cta-label">{cat.label}</span>
                <span className="svc-cat-tile__cta-arrow">→</span>
              </button>
            ) : (
              <div key={i} className="svc-cat-tile">
                <img src={cat.img} alt={cat.label} className="svc-cat-tile__bg" />
                <div className="svc-cat-tile__overlay" />
                <div className="svc-cat-tile__content">
                  <span className="svc-cat-tile__label">{cat.label}</span>
                  <span className="svc-cat-tile__arrow">→</span>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* ============ CABIN GALLERY BANNER ============ */}
      <section className="cabin-gallery">
        <img
          src="https://chapmanfreeborn.aero/wp-content/uploads/2023/05/home-page-section-7.webp"
          alt="Luxury private jet cabin interior for groups"
        />
      </section>

      {/* ============ ABOUT + STATS SPLIT ============ */}
      <section className="section-padding about-stats" style={{ background: 'var(--color-off-white)' }}>
        <div className="container about-stats__grid">
          <div className="about-stats__image" style={{ backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1679758629409-83446005843c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGFpcmNyYWZ0fGVufDB8fDB8fHww)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="about-stats__stats-overlay" style={{ background: 'rgba(11,29,58,0.75)' }}>
              {GROUP_STATS.map((s, i) => (
                <div key={i} className="about-stat">
                  <div className="about-stat__value">{s.value}</div>
                  <div className="about-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-stats__text">
            <span className="section-label">Group Charter Experts</span>
            <h2 className="section-title">The Ultimate Group Travel Experience</h2>
            <p>From corporate retreats to destination weddings, we've coordinated group charters for some of the most demanding clients in East Africa and beyond. Our team understands the nuances of group travel — from managing multiple passengers to coordinating ground logistics.</p>
            <p>We work with a carefully vetted network of operators to ensure your group travels together, arrives together, and experiences the luxury of private aviation from start to finish.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button onClick={scrollToForm} className="btn-primary-gov">
                <i className="bi bi-send"></i> Request a Quote
              </button>
              <Link to="/contact" className="btn-outline-gov">
                <i className="bi bi-chat"></i> Talk to a Specialist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ POPULAR GROUP DESTINATIONS ============ */}
      <section className="section-padding destinations-section">
        <div className="container">
          <h2 className="section-title text-center">Popular Group Charter Destinations</h2>
          <div className="destinations-grid">
            {GROUP_DESTINATIONS.map((d, i) => (
              <Link to="/group-charter" key={i} className="destination-card" onClick={scrollToForm}>
                <img src={d.img} alt={`${d.city}, ${d.country}`} />
                <div className="destination-card__overlay" />
                <div className="destination-card__content">
                  <span className="destination-card__country">{d.country}</span>
                  <strong>{d.city}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ REQUEST A QUOTE BANNER ============ */}
      <section className="quote-banner">
        <div className="container quote-banner__inner">
          <div>
            <h2>Ready to Book Your Group Charter?</h2>
            <p>Let our specialists handle every detail of your group's private aviation experience — from aircraft selection to ground logistics.</p>
          </div>
          <button onClick={scrollToForm} className="btn-primary-gov btn-lg">
            <i className="bi bi-send"></i> Get a Quote
          </button>
        </div>
      </section>

      {/* ============ FAQs ============ */}
      <section className="section-padding faq-section">
        <div className="container faq-section__grid">
          <div className="faq-section__left">
            <span className="section-label">Common Questions</span>
            <h2 className="section-title">Group Charter FAQs</h2>
            <p style={{ color: 'var(--color-mid-gray)', marginTop: '0.75rem' }}>
              Find answers to the most common questions about group charter services. If you have additional questions, our specialists are ready to help.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button onClick={scrollToForm} className="btn-primary-gov">
                <i className="bi bi-send"></i> Get a Quote
              </button>
              <Link to="/contact" className="btn-outline-gov">
                <i className="bi bi-chat"></i> Contact Us
              </Link>
            </div>
          </div>
          <div className="faq-section__right">
            {GROUP_FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="faq-item__q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <i className={`bi bi-${openFaq === i ? 'dash' : 'plus'}`}></i>
                </button>
                {openFaq === i && (
                  <div className="faq-item__a">{faq.a}</div>
                )}
              </div>
            ))}
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
      /* ── Hero Section ── */
      .group-hero {
        padding: 3rem 0 2.5rem;
        background: var(--color-off-white);
      }
      .group-hero__title {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        color: var(--color-navy);
        margin: 0.4rem 0 0.75rem;
        font-family: var(--font-serif, Georgia, serif);
      }
      .group-hero__subtitle {
        font-size: 1.05rem;
        color: var(--color-mid-gray);
        max-width: 600px;
        line-height: 1.6;
        margin-bottom: 1.75rem;
      }
      .group-hero__layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 2rem;
        align-items: start;
      }
      .group-hero__form-col { min-width: 0; }
      .group-hero__side { 
        position: sticky; 
        top: 100px; 
        display: flex; 
        flex-direction: column; 
        gap: 1.5rem; 
      }

      /* ── Consultant Card ── */
      .consultant-card {
        background: var(--color-navy);
        border-radius: var(--radius-md);
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      .consultant-card__image {
        position: relative;
        height: 200px;
        overflow: hidden;
      }
      .consultant-card__image img {
        width: 100%; height: 100%; object-fit: cover;
      }
      .consultant-card__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(10,20,40,0.1) 0%, var(--color-navy) 100%);
      }
      .consultant-card__body {
        padding: 1.5rem;
        margin-top: -1.5rem;
        position: relative;
      }
      .consultant-card__body h3 {
        color: var(--color-white);
        font-size: 1.05rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-serif, Georgia, serif);
      }
      .consultant-card__body p {
        color: rgba(255,255,255,0.75);
        font-size: 0.85rem;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      /* ── Booking Card ── */
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

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 1.5rem;
      }
      .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
      .form-label-gov {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--color-dark-gray);
        letter-spacing: 0.3px;
      }
      .form-label-gov .required { color: #e53e3e; margin-left: 2px; }
      .form-input-gov {
        padding: 0.6rem 0.85rem;
        border: 1.5px solid var(--color-light-gray);
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: var(--color-white);
        color: var(--color-navy);
        width: 100%;
        font-family: inherit;
      }
      .form-input-gov:focus {
        outline: none;
        border-color: var(--color-navy);
        box-shadow: 0 0 0 3px rgba(11,29,58,0.08);
      }
      .form-hint {
        font-size: 0.7rem;
        color: var(--color-mid-gray);
        margin-top: 0.15rem;
      }
      .checkbox-group { display: flex; gap: 1.5rem; flex-wrap: wrap; }
      .checkbox-label { 
        display: flex; 
        align-items: center; 
        gap: 0.5rem; 
        cursor: pointer; 
        font-size: 0.875rem; 
        color: var(--color-dark-gray); 
      }
      .checkbox-label input[type="checkbox"] { 
        width: 17px; 
        height: 17px; 
        accent-color: var(--color-navy); 
        cursor: pointer; 
      }

      /* ── Buttons ── */
      .btn-primary-gov {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        background: var(--color-navy);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-sm);
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-label, sans-serif);
        text-decoration: none;
        line-height: 1.4;
      }
      .btn-primary-gov:hover:not(:disabled) {
        background: var(--color-navy-light);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(11,29,58,0.2);
      }
      .btn-primary-gov:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      .btn-primary-gov.btn-lg { padding: 0.8rem 2rem; font-size: 0.95rem; }
      .btn-outline-gov {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        background: transparent;
        color: var(--color-navy);
        border: 1.5px solid var(--color-navy);
        border-radius: var(--radius-sm);
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-label, sans-serif);
        text-decoration: none;
        line-height: 1.4;
      }
      .btn-outline-gov:hover {
        background: var(--color-navy);
        color: var(--color-white);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(11,29,58,0.15);
      }
      .btn-outline-gov.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }

      .spinner-gov {
        width: 18px; height: 18px;
        border: 2px solid rgba(255,255,255,0.2);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }
      .spinner-gov.spinner-sm { width: 16px; height: 16px; border-width: 2px; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .alert-error {
        background: #FFF5F5;
        border: 1px solid #FEB2B2;
        border-radius: var(--radius-sm);
        padding: 0.75rem 1rem;
        color: #C53030;
        font-size: 0.875rem;
      }

      .text-center { text-align: center; }

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

      /* ── Why Us ── */
      .why-us__grid {
        display: grid;
        grid-template-columns: 0.9fr 1.1fr;
        gap: 3rem;
        align-items: center;
        margin-top: 2.5rem;
      }
      .why-us__image img {
        width: 100%; height: 460px;
        object-fit: cover;
        border-radius: var(--radius-md);
      }
      .why-us__props {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      .why-us__prop { display: flex; gap: 0.85rem; }
      .why-us__prop-icon {
        width: 42px; height: 42px; flex-shrink: 0;
        border-radius: 50%;
        background: var(--color-off-white);
        border: 1px solid var(--color-light-gray);
        display: flex; align-items: center; justify-content: center;
        color: var(--color-gold);
        font-size: 1.1rem;
      }
      .why-us__prop strong { display: block; color: var(--color-navy); font-size: 0.95rem; margin-bottom: 0.25rem; }
      .why-us__prop p { font-size: 0.82rem; color: var(--color-mid-gray); line-height: 1.6; margin: 0; }

      /* ── Service Categories / Use Cases Grid ── */
      .service-categories__grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }
      .svc-cat-tile {
        position: relative;
        height: 220px;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      .svc-cat-tile:hover {
        transform: scale(1.02);
        z-index: 2;
      }
      .svc-cat-tile__bg {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .svc-cat-tile:hover .svc-cat-tile__bg { transform: scale(1.08); }
      .svc-cat-tile__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.2) 60%);
        z-index: 1;
      }
      .svc-cat-tile__content {
        position: relative; z-index: 2;
        padding: 1.25rem 1.5rem;
        color: var(--color-white);
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-family: var(--font-label, sans-serif);
      }
      .svc-cat-tile__label {
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
      .svc-cat-tile__arrow {
        color: var(--color-gold);
        font-size: 1.4rem;
        transition: transform 0.3s ease;
        display: inline-block;
        font-weight: 300;
      }
      .svc-cat-tile:hover .svc-cat-tile__arrow {
        transform: translateX(6px);
      }

      /* CTA Tile (Request a Quote) */
      .svc-cat-tile--cta {
        background: var(--color-gold);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--color-navy);
        font-family: var(--font-label, sans-serif);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        height: 220px;
        position: relative;
      }
      .svc-cat-tile--cta:hover {
        background: #e8c55a;
        transform: scale(1.02);
        z-index: 2;
      }
      .svc-cat-tile__cta-label {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--color-navy);
      }
      .svc-cat-tile__cta-arrow {
        font-size: 1.8rem;
        font-weight: 300;
        color: var(--color-navy);
        transition: transform 0.3s ease;
        display: inline-block;
      }
      .svc-cat-tile--cta:hover .svc-cat-tile__cta-arrow {
        transform: translateX(6px);
      }

      /* ── Cabin Gallery ── */
      .cabin-gallery { width: 100%; line-height: 0; }
      .cabin-gallery img {
        width: 100%; height: 420px;
        object-fit: cover;
        display: block;
      }

      /* ── About Stats ── */
      .about-stats__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }
      .about-stats__image {
        border-radius: var(--radius-md);
        min-height: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        background-size: cover;
        background-position: center;
      }
      .about-stats__stats-overlay {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 2rem;
        position: relative;
        z-index: 1;
        width: 100%;
        border-radius: var(--radius-md);
      }
      .about-stat { text-align: center; }
      .about-stat__value {
        font-size: 2.4rem; font-weight: 700;
        color: var(--color-gold);
        font-family: var(--font-label, sans-serif);
        line-height: 1;
      }
      .about-stat__label {
        font-size: 0.75rem; color: rgba(255,255,255,0.75);
        text-transform: uppercase; letter-spacing: 1px;
        margin-top: 0.5rem;
      }
      .about-stats__text p { color: var(--color-mid-gray); line-height: 1.75; margin-bottom: 0.75rem; }

      /* ── Destinations ── */
      .destinations-section { background: var(--color-off-white); }
      .destinations-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1.25rem;
        margin-top: 2rem;
      }
      .destination-card {
        position: relative;
        height: 260px;
        border-radius: var(--radius-md);
        overflow: hidden;
        display: block;
        text-decoration: none;
      }
      .destination-card img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.4s ease;
      }
      .destination-card:hover img { transform: scale(1.07); }
      .destination-card__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.1) 60%);
      }
      .destination-card__content {
        position: absolute; bottom: 1rem; left: 1rem; right: 1rem;
        color: var(--color-white);
      }
      .destination-card__country {
        display: block;
        font-size: 0.65rem;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--color-gold);
        margin-bottom: 0.2rem;
      }
      .destination-card__content strong { font-size: 1.1rem; }

      /* ── Quote Banner ── */
      .quote-banner {
        background: var(--color-navy-dark, var(--color-navy));
        padding: 3.5rem 0;
      }
      .quote-banner__inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
      }
      .quote-banner h2 { color: var(--color-white); margin-bottom: 0.5rem; font-family: var(--font-serif, Georgia, serif); }
      .quote-banner p { color: rgba(255,255,255,0.75); max-width: 520px; margin: 0; line-height: 1.6; }

      /* ── FAQs ── */
      .faq-section__grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 4rem;
        align-items: flex-start;
      }
      .faq-item { border-bottom: 1px solid var(--color-light-gray); }
      .faq-item__q {
        width: 100%;
        display: flex; justify-content: space-between; align-items: center;
        gap: 1rem;
        padding: 1.1rem 0;
        background: none; border: none; cursor: pointer;
        text-align: left;
        font-size: 0.95rem; font-weight: 600;
        color: var(--color-navy);
        font-family: var(--font-label, sans-serif);
      }
      .faq-item__q i { flex-shrink: 0; color: var(--color-gold); font-size: 1.1rem; }
      .faq-item__a { padding: 0 0 1.1rem; font-size: 0.9rem; color: var(--color-mid-gray); line-height: 1.75; }

      /* ── Responsive ── */
      @media (max-width: 1024px) {
        .group-hero__layout { grid-template-columns: 1fr; }
        .group-hero__side {
          position: static;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .consultant-card { grid-column: 1 / -1; }
        .why-us__grid { grid-template-columns: 1fr; }
        .why-us__image img { height: 320px; }
        .about-stats__grid { grid-template-columns: 1fr; gap: 2rem; }
        .about-stats__image { order: -1; min-height: 320px; }
        .service-categories__grid { grid-template-columns: repeat(2, 1fr); }
        .destinations-grid { grid-template-columns: repeat(3, 1fr); }
        .faq-section__grid { grid-template-columns: 1fr; gap: 2rem; }
      }

      @media (max-width: 768px) {
        .group-hero__side { grid-template-columns: 1fr; }
        .form-row { grid-template-columns: 1fr; }
        .why-us__props { grid-template-columns: 1fr; }
        .service-categories__grid { grid-template-columns: 1fr; }
        .destinations-grid { grid-template-columns: repeat(2, 1fr); }
        .about-stats__stats-overlay { gap: 1.25rem; padding: 1.5rem; }
        .about-stat__value { font-size: 1.8rem; }
        .cabin-gallery img { height: 280px; }
        .quote-banner__inner { flex-direction: column; text-align: center; }
        .gc-stepper { flex-wrap: wrap; gap: 0.5rem; }
        .gc-step { flex: 0 0 auto; }
        .gc-step-line { display: none; }
        .svc-cat-tile { height: 180px; }
        .svc-cat-tile--cta { height: 180px; }
      }

      @media (max-width: 480px) {
        .destinations-grid { grid-template-columns: 1fr; }
        .booking-card__body { padding: 1rem; }
        .checkbox-group { flex-direction: column; gap: 0.75rem; }
        .gc-review-row { flex-direction: column; gap: 0.15rem; }
        .gc-review-val { text-align: left; }
        .svc-cat-tile { height: 160px; }
        .svc-cat-tile--cta { height: 160px; }
        .svc-cat-tile__label { font-size: 0.85rem; }
        .svc-cat-tile__cta-label { font-size: 1rem; }
      }
    `}</style>
  )
}