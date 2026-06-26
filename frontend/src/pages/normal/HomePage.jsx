import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import {
  catalogAPI,
  bookingAPI,
  charterAPI,
  leaseAPI,
  flightInqAPI
} from '../../services/api'

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '187',    label: 'Countries Served',  icon: 'bi-globe2' },
  { value: '2,400+', label: 'Aircraft Available', icon: 'bi-airplane' },
  { value: '24/7',   label: 'Concierge Access',   icon: 'bi-headset' },
  { value: '< 4hrs', label: 'Avg Response Time',  icon: 'bi-clock' },
]

/* SEO-trimmed copy. Each service now carries 3 images for an auto-rotating carousel. */
const SERVICES = [
  {
    icon: 'bi-airplane',
    title: 'Private Jet Charter',
    tagline: 'Airport to airport, worldwide',
    description: 'Charter a private jet to any destination worldwide — the right aircraft, the right price, instantly.',
    link: '/book-flight',
    cta: 'Book a Flight',
    images: [
      'https://plus.unsplash.com/premium_photo-1682142182464-3be6161b3a42?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJpdmF0ZSUyMGpldCUyMGNoYXJ0ZXJ8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1625513123245-fcb02d69ad12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJpdmF0ZSUyMGpldCUyMGNoYXJ0ZXJ8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1661954864180-e61dea14208a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJpdmF0ZSUyMGpldCUyMGNoYXJ0ZXJ8ZW58MHx8MHx8fDA%3D',
    ],
  },
  {
    icon: 'bi-water',
    title: 'Superyacht Charter',
    tagline: 'Mediterranean, Caribbean & beyond',
    description: 'Charter a superyacht by the week or season — full crew, bespoke itineraries, every ocean.',
    link: '/yachts',
    cta: 'Charter a Yacht',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=80&auto=format&fit=crop',
      'https://plus.unsplash.com/premium_photo-1733317328038-4aa0269ac803?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8eWF0Y2hzfGVufDB8fDB8fHww',
      'https://plus.unsplash.com/premium_photo-1680831748191-d726a2f7b201?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eWF0Y2glMjBjaGFydGVyfGVufDB8fDB8fHww',
    ],
  },
  {
    icon: 'bi-file-earmark-text',
    title: 'Long-Term Leasing',
    tagline: 'Dedicated aircraft & yacht programs',
    description: 'Monthly to multi-year leases on aircraft and yachts — guaranteed availability, lower cost.',
    link: '/leasing',
    cta: 'Explore Leasing',
    images: [
      'https://media.istockphoto.com/id/542970196/photo/handshake.webp?a=1&b=1&s=612x612&w=0&k=20&c=FrWTyn2VhFPh2jvuG8oojIzAG3HQYVV1XlmHylzmAQE=',
      'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517260468809-807bfd11d968?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fEFpcmNyYWZ0JTIwbGVhc2luZ3xlbnwwfHwwfHx8MA%3D%3D',
    ],
  },
  {
    icon: 'bi-send',
    title: 'Flight Inquiry',
    tagline: 'Explore options, no commitment',
    description: 'Not sure of your dates or route? Get a tailored itinerary and pricing within hours.',
    link: '/contact',
    cta: 'Send Inquiry',
    images: [
      'https://images.unsplash.com/photo-1759614581731-4c7090648de0?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNvbnRhY3R8ZW58MHx8MHx8fDA%3D',
    ],
  },
  {
    icon: 'bi-boxes',
    title: 'Air Cargo & Valuables',
    tagline: 'Gold, minerals, pharma & critical freight',
    description: 'Charter air cargo for freight and high-value goods, with full chain-of-custody and insurance.',
    link: '/air-cargo',
    cta: 'Get a Cargo Quote',
    highlight: true,
    images: [
      'https://media.istockphoto.com/id/117952890/photo/loading-cargo-into-a-boeing-747.webp?a=1&b=1&s=612x612&w=0&k=20&c=sXsfWNDuQcBV39AqvcdMiqqPGDDQkfJ_xfq8lt5WYjw=',
      'https://images.unsplash.com/photo-1565876464729-e5184585870a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGFpciUyMGNhcmdvfGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1774698078446-59299e016718?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGFpciUyMGNhcmdvfGVufDB8fDB8fHww',
    ],
  },
  {
    icon: 'bi-people',
    title: 'Group Charter',
    tagline: 'Corporate, sports, events & incentives',
    description: 'Custom group flights for teams, delegations, and productions of any size — fully managed.',
    link: '/group-charter',
    cta: 'Request Group Charter',
    images: [
      'https://media.istockphoto.com/id/136901927/photo/business-people-with-corporate-jet.webp?a=1&b=1&s=612x612&w=0&k=20&c=odLEhuY9SqH1xrA3CkiCImQgMwhWSyQjQh0dXfHxNpk=',
      'https://images.unsplash.com/photo-1590008411086-6efbbf3e2cbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3JvdXAlMjBhaXIlMjBjaGFydGVyfGVufDB8fDB8fHww',
      'https://images.unsplash.com/flagged/photo-1578940836729-707caca98f74?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGdyb3VwJTIwYWlyJTIwY2hhcnRlcnxlbnwwfHwwfHx8MA%3D%3D',
    ],
  },
  {
    icon: 'bi-shop',
    title: 'Aircraft Sales',
    tagline: 'Buy, sell, trade or get a valuation',
    description: 'Private jet acquisitions, trade-ins, and pre-owned valuations — handled worldwide.',
    link: '/aircraft-sales',
    cta: 'Explore Aircraft Sales',
    images: [
      'https://images.unsplash.com/photo-1759614581731-4c7090648de0?w=900&q=80&auto=format&fit=crop',
      'https://media.istockphoto.com/id/2278364445/photo/business-partners-collaborating-on-laptop-during-private-jet-flight.webp?a=1&b=1&s=612x612&w=0&k=20&c=PMhCY1yEgHIlS-qVYjQe-ekxaQc49aCpBgmG8UAyq00=',
      'https://media.istockphoto.com/id/2167925237/photo/businessman-just-bought-a-private-jet.webp?a=1&b=1&s=612x612&w=0&k=20&c=iHEouhChFUUovUQivxy5BE0hgVT_wASWfwkJuDWtyLc=',
    ],
  },
  {
    icon: 'bi-search',
    title: 'Track Your Booking',
    tagline: 'Live status on any inquiry or flight',
    description: 'Track any booking or inquiry in real time with your reference number — no account needed.',
    link: '/track',
    cta: 'Track a Booking',
    images: [
      'https://images.unsplash.com/photo-1619652707252-09331e61ff31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTQxfHx0cmFjayUyMGFpcnBsYW5lfGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1679059384528-e4ea18b65427?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTd8fGFpcmNyYWZ0c3xlbnwwfHwwfHx8MA%3D%3D',
    ],
  },
]

const WHY_US = [
  { icon: 'bi-shield-check', title: 'ARGUS Platinum Rated',  desc: 'Every operator in our network holds the highest safety certification in private aviation. Your safety is never compromised.' },
  { icon: 'bi-person-check', title: 'No Account Required',   desc: 'Submit a booking request in minutes with no registration, no membership fee, and no subscription. Luxury without the friction.' },
  { icon: 'bi-cash-coin',    title: 'Transparent Pricing',   desc: 'No hidden fees, no fuel surcharge surprises. The price you are quoted is the price you pay — with full breakdown provided.' },
  { icon: 'bi-headset',      title: '24 / 7 Concierge',      desc: "Our team doesn't sleep. Available around the clock by phone, email, or WhatsApp in English, French, Arabic, and Mandarin." },
  { icon: 'bi-geo-alt',      title: 'Remote Destinations',   desc: "We access airports others can't — private strips, short runways, high-altitude destinations. The world is genuinely open to you." },
  { icon: 'bi-star',         title: 'Tailored Experience',   desc: 'From in-flight catering curated by Michelin-starred chefs to seamless ground transport and hotel coordination — every detail attended to.' },
]

const PROCESS = [
  { step: '01', icon: 'bi-pencil-square',  title: 'Submit Your Request',     desc: 'Tell us your route, dates, and passenger count using our simple booking form. Takes under three minutes with no account needed.' },
  { step: '02', icon: 'bi-envelope-check', title: 'Receive Your Quote',      desc: 'Our specialists review available aircraft and present a tailored quote within two to four hours, complete with aircraft specifications and pricing.' },
  { step: '03', icon: 'bi-airplane-fill',  title: 'Fly in Absolute Comfort', desc: 'Confirm your booking and relax. We handle all logistics — from ground transport to in-flight dining preferences and beyond.' },
]

const LEASE_DURATIONS = [
  { value: 'monthly',    label: 'Monthly' },
  { value: 'quarterly',  label: 'Quarterly (3 months)' },
  { value: 'annual',     label: 'Annual (12 months)' },
  { value: 'multi_year', label: 'Multi-Year' },
]

/* ─── Hero Video Background ──────────────────────────────────────────────────── */
const HERO_VIDEOS = [
  '/video-one.mp4', '/video-two.mp4', '/video-three.mp4',
  '/video-four.mp4', '/video-five.mp4', '/video-six.mp4', '/video-seven.mp4',
]

function HeroVideoBackground() {
  const [current, setCurrent] = useState(0)
  const [next, setNext]       = useState(null)
  const [fading, setFading]   = useState(false)
  const currentRef            = useRef(null)
  const nextRef               = useRef(null)
  const timerRef              = useRef(null)

  const advance = useCallback(() => {
    const nextIdx = (current + 1) % HERO_VIDEOS.length
    setNext(nextIdx); setFading(true)
  }, [current])

  useEffect(() => {
    if (!fading || next === null) return
    const t = setTimeout(() => { setCurrent(next); setNext(null); setFading(false) }, 1000)
    return () => clearTimeout(t)
  }, [fading, next])

  useEffect(() => {
    timerRef.current = setTimeout(advance, 6000)
    return () => clearTimeout(timerRef.current)
  }, [current, advance])

  useEffect(() => { if (currentRef.current) currentRef.current.play().catch(() => {}) }, [current])
  useEffect(() => { if (nextRef.current) nextRef.current.play().catch(() => {}) }, [next])

  const videoStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <video
        key={`c-${current}`}
        ref={currentRef}
        src={HERO_VIDEOS[current]}
        style={{ ...videoStyle, opacity: fading ? 0 : 1, transition: 'opacity 1s ease-in-out', zIndex: 1 }}
        muted playsInline loop autoPlay
      />
      {next !== null && (
        <video
          key={`n-${next}`}
          ref={nextRef}
          src={HERO_VIDEOS[next]}
          style={{ ...videoStyle, opacity: fading ? 1 : 0, transition: 'opacity 1s ease-in-out', zIndex: 2 }}
          muted playsInline loop autoPlay
        />
      )}
    </div>
  )
}

/* ─── Service Card Image Carousel ────────────────────────────────────────────────
   NEW: Each service card now cycles through 3 images automatically, with a
   crossfade transition. Height increased from 160px to 220px for more visual
   weight in the grid.
──────────────────────────────────────────────────────────────────────────────── */
function ServiceImageCarousel({ images, title, intervalMs = 4000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const t = setInterval(() => {
      setIndex(i => (i + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [images, intervalMs])

  if (!images || images.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={`${title} ${i + 1}`}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1.1s ease-in-out',
          }}
        />
      ))}
      {/* dot indicators */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 5, zIndex: 2,
      }}>
        {images.map((_, i) => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i === index ? '#C9A84C' : 'rgba(255,255,255,0.55)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Airport Combobox ───────────────────────────────────────────────────────────
   FIX: The previous version called onChange('') whenever the user typed while
   a value was already selected. This caused the parent origin/dest state to be
   silently cleared even though the input still displayed the airport name.
   
   Fix: Only call onChange('') when the input is fully emptied (length === 0),
   NOT on every keystroke while a value is present. The selected ID stays valid
   until the user either picks a new airport or clears the field entirely.
──────────────────────────────────────────────────────────────────────────────── */
function AirportCombobox({ airports, airportsLoading, value, onChange, label, placeholder, required }) {
  const [query, setQuery]             = useState('')
  const [open, setOpen]               = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const selectedAirport = airports.find(
    a => a.id === value || String(a.id) === String(value)
  )

  // Sync display text when value changes externally (e.g. on reset)
  useEffect(() => {
    if (!value) {
      setQuery('')
    } else if (selectedAirport) {
      setQuery(`${selectedAirport.code} – ${selectedAirport.name}, ${selectedAirport.city}`)
    }
  }, [value, selectedAirport])

  const filtered = query.length >= 2
    ? airports
        .filter(a => {
          const q = query.toLowerCase()
          return (
            a.code?.toLowerCase().includes(q) ||
            a.name?.toLowerCase().includes(q) ||
            a.city?.toLowerCase().includes(q) ||
            a.country?.toLowerCase().includes(q)
          )
        })
        .slice(0, 10)
    : []

  const selectAirport = airport => {
    onChange(airport.id)
    setQuery(`${airport.code} – ${airport.name}, ${airport.city}`)
    setOpen(false)
    setHighlighted(0)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      // If user walked away without selecting anything and field is empty, clear parent
      if (!value && !query) setQuery('')
      // If they typed but didn't select, restore the previously selected airport label
      // so the display stays consistent with the actual selected value
      if (value && selectedAirport) {
        setQuery(`${selectedAirport.code} – ${selectedAirport.name}, ${selectedAirport.city}`)
      }
    }, 160)
  }

  const handleKeyDown = e => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) selectAirport(filtered[highlighted]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const handleInputChange = e => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setOpen(true)
    setHighlighted(0)

    // FIX: Only clear the parent ID when the field is fully emptied.
    // Previously this called onChange('') on every keystroke while value was set,
    // which silently cleared origin/dest even though the label still showed.
    if (!newQuery) {
      onChange('')
    }
    // If user is editing (non-empty), we keep the existing selected ID in parent
    // until they actually pick a new airport from the dropdown.
    // This prevents silent 400s where the form looks complete but IDs are gone.
  }

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {label && (
        <label className="form-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}
      <input
        className="form-control"
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query.length >= 2) setOpen(true) }}
        onBlur={handleBlur}
        placeholder={airportsLoading ? 'Loading airports…' : (placeholder || 'Type 2+ letters…')}
        disabled={airportsLoading}
        required={required}
        autoComplete="off"
      />
      {airportsLoading && (
        <span style={{
          position: 'absolute', right: '0.75rem',
          top: label ? '65%' : '50%', transform: 'translateY(-50%)',
          fontSize: '0.75rem', color: '#888',
        }}>
          <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }} />
        </span>
      )}
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 1300,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          margin: 0, padding: '0.25rem 0', listStyle: 'none',
          maxHeight: '260px', overflowY: 'auto',
        }}>
          {filtered.map((a, i) => (
            <li
              key={a.id}
              onMouseDown={() => selectAirport(a)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '0.6rem 1rem', cursor: 'pointer',
                background: i === highlighted ? '#f8fafc' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: '#C9A84C', background: '#FDF3D9',
                padding: '1px 6px', borderRadius: '3px',
                minWidth: '2.8rem', textAlign: 'center',
              }}>
                {a.code}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#1a202c' }}>
                {a.name}
                <span style={{ color: '#718096', marginLeft: '0.35rem' }}>
                  — {a.city}, {a.country}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && !airportsLoading && query.length >= 2 && filtered.length === 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 1300,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem', color: '#718096',
        }}>
          No airports found for "{query}"
        </div>
      )}
    </div>
  )
}

/* ─── Modal Shell ────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 680 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <style>{`@keyframes modalPop{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(11,29,58,0.60)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%', maxWidth,
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          animation: 'modalPop 0.25s ease',
          border: '1px solid #e2e8f0',
        }}>
          {/* Header */}
          <div style={{
            padding: '1.4rem 1.75rem',
            borderBottom: '1px solid #f0f4f8',
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44, background: '#FDF3D9',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: '#C9A84C' }} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '1.2rem',
                  fontWeight: 600, color: '#0B1D3A', lineHeight: 1.2,
                }}>
                  {title}
                </div>
                {subtitle && (
                  <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: 3 }}>
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#a0aec0', fontSize: '1.2rem',
                padding: '0.25rem', lineHeight: 1, flexShrink: 0,
                borderRadius: '6px',
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
          {/* Body */}
          <div style={{ overflowY: 'auto', padding: '1.6rem 1.75rem', flex: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Success State ──────────────────────────────────────────────────────────── */
function SuccessState({ title, message, reference, onNew, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <div style={{
        width: 64, height: 64, background: '#EBF7F1', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem', fontSize: '1.75rem', color: '#1a7f5a',
      }}>
        <i className="bi bi-check-lg" />
      </div>
      <h3 style={{ marginBottom: '0.6rem', color: '#0B1D3A' }}>{title}</h3>
      <p style={{ lineHeight: 1.8, maxWidth: 400, margin: '0 auto 1.5rem', color: '#4a5568' }}>
        {message}
      </p>
      {reference && (
        <div style={{
          background: '#f7fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '1rem 1.25rem',
          marginBottom: '1.75rem', textAlign: 'left',
        }}>
          <div style={{
            fontSize: '0.64rem', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#C9A84C', marginBottom: '0.4rem',
          }}>
            Reference Number
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: '0.87rem',
            color: '#0B1D3A', wordBreak: 'break-all', fontWeight: 600,
          }}>
            {reference}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: '0.35rem' }}>
            Save this to track your booking at <strong>/track</strong>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline-navy btn-sm" onClick={onNew}>
          <i className="bi bi-arrow-counterclockwise" /> New Request
        </button>
        <button className="btn btn-navy btn-sm" onClick={onClose}>
          <i className="bi bi-x" /> Close
        </button>
      </div>
    </div>
  )
}

/* ─── Asset Banner ───────────────────────────────────────────────────────────── */
function AssetBanner({ asset, type }) {
  if (!asset) return null
  const isAc = type === 'aircraft'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: '#EBF2FF',
      border: '1px solid #BED1EF',
      borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1.6rem',
    }}>
      <i
        className={`bi ${isAc ? 'bi-airplane-fill' : 'bi-water'}`}
        style={{ fontSize: '1.3rem', color: '#0B1D3A', flexShrink: 0 }}
      />
      <div>
        <div style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '0.92rem' }}>
          {asset.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: 2 }}>
          {isAc
            ? `${asset.category_display} · ${asset.passenger_capacity} passengers · ${asset.range_km?.toLocaleString()} km range`
            : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · ${asset.crew_count} crew`}
          {isAc  && asset.hourly_rate_usd && ` · $${parseInt(asset.hourly_rate_usd).toLocaleString()}/hr`}
          {!isAc && asset.daily_rate_usd  && ` · $${parseInt(asset.daily_rate_usd).toLocaleString()}/day`}
        </div>
      </div>
    </div>
  )
}

function FormSection({ icon, children }) {
  return (
    <div style={{
      fontWeight: 600, fontSize: '0.8rem', color: '#0B1D3A',
      marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem',
    }}>
      <i className={`bi ${icon}`} style={{ color: '#C9A84C' }} />
      {children}
    </div>
  )
}

/* ─── Shared error alert ─────────────────────────────────────────────────────── */
function ErrorAlert({ error }) {
  if (!error) return null
  return (
    <div style={{
      marginBottom: '1.25rem', padding: '0.75rem 1rem',
      background: '#FFF5F5', border: '1px solid #FEB2B2',
      borderRadius: '8px', color: '#C53030',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      fontSize: '0.875rem',
    }}>
      <i className="bi bi-exclamation-triangle" /><span>{error}</span>
    </div>
  )
}

/* ─── Shared error parser ────────────────────────────────────────────────────────
   FIX: Added console.error so DRF validation errors are visible in DevTools,
   making future debugging much easier without changing UX.
──────────────────────────────────────────────────────────────────────────────── */
function parseApiError(err) {
  // Always log the raw error body so it's visible in browser DevTools
  if (err.response?.data) {
    console.error('[NJH API Error]', err.response.status, JSON.stringify(err.response.data))
  }

  const detail = err.response?.data
  if (!detail) return 'Something went wrong. Please try again.'

  if (typeof detail === 'string') return detail

  if (typeof detail === 'object') {
    // Handle { detail: "..." } format
    if (detail.detail) return detail.detail

    // Handle { field: ["error"], ... } format — join all field errors
    return Object.entries(detail)
      .map(([field, errs]) => {
        const msg = Array.isArray(errs) ? errs.join(' ') : String(errs)
        // Make field names human-readable
        const label = field
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        return `${label}: ${msg}`
      })
      .join(' · ')
  }

  return 'Something went wrong. Please try again.'
}

/* ─── Shared submit button ───────────────────────────────────────────────────── */
function SubmitRow({ loading, onClose, label = 'Submit' }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button type="button" className="btn btn-outline-navy" onClick={onClose} style={{ flex: '0 0 auto' }}>
        Cancel
      </button>
      <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
        {loading
          ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
          : <><i className="bi bi-send" /> {label}</>}
      </button>
    </div>
  )
}

/* ─── Book Flight Modal ──────────────────────────────────────────────────────────
   FIX: Relies on the fixed AirportCombobox for correct origin/dest ID handling.
   Also improved: strips all optional empty/falsy fields before POST so DRF
   never receives '' for non-blank CharFields or undefined for FK fields.
──────────────────────────────────────────────────────────────────────────────── */
function BookFlightModal({ open, onClose, aircraft: asset }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '',
    trip_type: 'one_way', passenger_count: 1,
    departure_date: '', departure_time: '', return_date: '',
    catering_requested: false, ground_transport_requested: false,
    special_requests: '',
  })

  const [form, setForm]                       = useState(blank)
  const [origin, setOrigin]                   = useState('')
  const [dest, setDest]                       = useState('')
  const [airports, setAirports]               = useState([])
  const [airportsLoading, setAirportsLoading] = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [success, setSuccess]                 = useState(null)
  const [error, setError]                     = useState(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setAirportsLoading(true)
    catalogAPI.airports()
      .then(data => { if (!cancelled) setAirports(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setAirports([]) })
      .finally(() => { if (!cancelled) setAirportsLoading(false) })
    return () => { cancelled = true }
  }, [open])

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setOrigin(''); setDest(''); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

  const submit = async e => {
    e.preventDefault()

    // Validate airports are actually selected (not just typed)
    if (!origin || !dest) {
      setError('Please select both origin and destination airports from the dropdown.')
      return
    }
    if (String(origin) === String(dest)) {
      setError('Origin and destination airports cannot be the same.')
      return
    }

    setLoading(true); setError(null)
    try {
      const payload = {
        guest_name:      form.guest_name,
        guest_email:     form.guest_email,
        trip_type:       form.trip_type,
        origin:          origin,
        destination:     dest,
        departure_date:  form.departure_date,
        passenger_count: form.passenger_count,
        catering_requested:          form.catering_requested,
        ground_transport_requested:  form.ground_transport_requested,
      }

      // Optional fields — only include if non-empty to avoid DRF blank validation errors
      if (form.guest_phone?.trim())      payload.guest_phone      = form.guest_phone.trim()
      if (form.departure_time)           payload.departure_time   = form.departure_time
      if (form.special_requests?.trim()) payload.special_requests = form.special_requests.trim()
      // asset comes from opAircraft — send as operator_aircraft (FK to OperatorAircraft),
      // NOT aircraft (which is FK to the catalog Aircraft model)
      if (asset?.id)                     payload.operator_aircraft = asset.id

      // Round trip needs return date
      if (form.trip_type === 'round_trip' && form.return_date) {
        payload.return_date = form.return_date
      }

      const { data } = await bookingAPI.create(payload)
      setSuccess(data)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open} onClose={close} icon="bi-airplane"
      title={asset ? `Book — ${asset.name}` : 'Book a Flight'}
      subtitle={asset ? `${asset.category_display} · up to ${asset.passenger_capacity} passengers` : ''}
      maxWidth={700}
    >
      {success ? (
        <SuccessState
          title="Flight Request Submitted"
          message={success.message || 'Our specialists will contact you within 2–4 hours.'}
          reference={success.booking?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} type="aircraft" />
          <ErrorAlert error={error} />

          <FormSection icon="bi-person">Your Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name}
                onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email}
                onChange={e => set('guest_email', e.target.value)} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone}
                onChange={e => set('guest_phone', e.target.value)} placeholder="+254 724 878 136" />
            </div>
            <div className="form-group">
              <label className="form-label">Passengers <span className="req">*</span></label>
              <input className="form-control" type="number" min={1}
                max={asset?.passenger_capacity || 400} required
                value={form.passenger_count}
                onChange={e => set('passenger_count', parseInt(e.target.value) || 1)} />
              {asset && <span className="form-hint">Max {asset.passenger_capacity} on this aircraft</span>}
            </div>
          </div>

          <FormSection icon="bi-map">Route &amp; Schedule</FormSection>
          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['one_way', 'One Way'], ['round_trip', 'Round Trip'], ['multi_leg', 'Multi-Leg']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('trip_type', v)} style={{
                padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 500,
                borderRadius: '20px',
                border: `1.5px solid ${form.trip_type === v ? '#0B1D3A' : '#e2e8f0'}`,
                background: form.trip_type === v ? '#0B1D3A' : 'transparent',
                color: form.trip_type === v ? 'white' : '#718096',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {l}
              </button>
            ))}
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <AirportCombobox
              label="From" required
              airports={airports} airportsLoading={airportsLoading}
              value={origin} onChange={setOrigin}
              placeholder="Type city or airport code…"
            />
            <AirportCombobox
              label="To" required
              airports={airports} airportsLoading={airportsLoading}
              value={dest} onChange={setDest}
              placeholder="Type city or airport code…"
            />
            <div className="form-group">
              <label className="form-label">Departure Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.departure_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('departure_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <input className="form-control" type="time" value={form.departure_time}
                onChange={e => set('departure_time', e.target.value)} />
            </div>
          </div>

          {form.trip_type === 'round_trip' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Return Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.return_date}
                min={form.departure_date || new Date().toISOString().split('T')[0]}
                onChange={e => set('return_date', e.target.value)} />
            </div>
          )}

          <FormSection icon="bi-stars">Add-ons</FormSection>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              ['catering_requested', 'bi-cup-hot', 'In-Flight Catering'],
              ['ground_transport_requested', 'bi-car-front', 'Ground Transport'],
            ].map(([k, icon, label]) => (
              <button key={k} type="button" onClick={() => set(k, !form[k])} style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500,
                borderRadius: '20px',
                border: `1.5px solid ${form[k] ? '#0B1D3A' : '#e2e8f0'}`,
                background: form[k] ? '#EBF2FF' : 'transparent',
                color: form[k] ? '#0B1D3A' : '#718096',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <i className={`bi ${icon}`} style={{ color: form[k] ? '#0B1D3A' : '#C9A84C' }} />
                {label}
                {form[k] && <i className="bi bi-check" />}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Special Requests</label>
            <textarea className="form-control" style={{ minHeight: 75 }}
              value={form.special_requests}
              onChange={e => set('special_requests', e.target.value)}
              placeholder="Dietary requirements, seating preferences, special occasions…" />
          </div>

          <SubmitRow loading={loading} onClose={close} label="Submit Flight Request" />
        </form>
      )}
    </Modal>
  )
}

/* ─── Charter Yacht Modal ────────────────────────────────────────────────────────
   FIX: yacht FK is now conditionally included (same pattern as aircraft in
   BookFlightModal). If asset is undefined/null, no yacht key is sent — avoiding
   DRF receiving yacht: null/undefined on a field that may be required or
   cause unexpected validation behaviour.
──────────────────────────────────────────────────────────────────────────────── */
function CharterYachtModal({ open, onClose, yacht: asset }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '',
    departure_port: '', destination_port: '',
    charter_start: '', charter_end: '',
    guest_count: 2, itinerary_description: '', special_requests: '',
  })

  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

  const nights = () => {
    if (form.charter_start && form.charter_end) {
      const n = (new Date(form.charter_end) - new Date(form.charter_start)) / 86400000
      return n > 0 ? n : null
    }
    return null
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      // Build payload explicitly — only include defined/non-empty fields
      const payload = {
        guest_name:    form.guest_name,
        guest_email:   form.guest_email,
        departure_port: form.departure_port,
        charter_start: form.charter_start,
        charter_end:   form.charter_end,
        guest_count:   form.guest_count,
      }

      // FIX: Only attach yacht FK if asset exists (mirrors BookFlightModal pattern)
      // Previously sent `yacht: asset?.id` which evaluates to `yacht: undefined`
      // when no asset — axios serialises this as absent in JSON body which is fine,
      // but if DRF view requires it, the error message was confusing. Now explicit.
      if (asset?.id) payload.yacht = asset.id

      // Optional string fields — only include if non-empty
      if (form.guest_phone?.trim())           payload.guest_phone            = form.guest_phone.trim()
      if (form.destination_port?.trim())      payload.destination_port       = form.destination_port.trim()
      if (form.itinerary_description?.trim()) payload.itinerary_description  = form.itinerary_description.trim()
      if (form.special_requests?.trim())      payload.special_requests       = form.special_requests.trim()

      const { data } = await charterAPI.create(payload)
      setSuccess(data)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open} onClose={close} icon="bi-water"
      title={asset ? `Charter — ${asset.name}` : 'Charter a Yacht'}
      subtitle={asset ? `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests` : ''}
      maxWidth={700}
    >
      {success ? (
        <SuccessState
          title="Charter Request Received"
          message={success.message || 'Our yacht specialists will respond with a tailored proposal within 4 hours.'}
          reference={success.charter?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} type="yacht" />
          <ErrorAlert error={error} />

          <FormSection icon="bi-person">Contact Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name}
                onChange={e => set('guest_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email}
                onChange={e => set('guest_email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone}
                onChange={e => set('guest_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Number of Guests <span className="req">*</span></label>
              <input className="form-control" type="number" min={1}
                max={asset?.guest_capacity || 200} required
                value={form.guest_count}
                onChange={e => set('guest_count', parseInt(e.target.value) || 1)} />
              {asset && <span className="form-hint">Max {asset.guest_capacity} guests on this vessel</span>}
            </div>
          </div>

          <FormSection icon="bi-map">Voyage Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Departure Port <span className="req">*</span></label>
              <input className="form-control" required value={form.departure_port}
                onChange={e => set('departure_port', e.target.value)}
                placeholder="e.g. Monaco, Mykonos, Miami" />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Port</label>
              <input className="form-control" value={form.destination_port}
                onChange={e => set('destination_port', e.target.value)}
                placeholder="Or return to departure port" />
            </div>
            <div className="form-group">
              <label className="form-label">Charter Start <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.charter_start}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('charter_start', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Charter End <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.charter_end}
                min={form.charter_start || new Date().toISOString().split('T')[0]}
                onChange={e => set('charter_end', e.target.value)} />
            </div>
          </div>

          {nights() && (
            <div style={{
              background: '#FDF3D9', border: '1px solid #E6CFA0',
              borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.82rem', color: '#7A5C22',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <i className="bi bi-moon-stars" />
              <strong>{nights()} night{nights() > 1 ? 's' : ''}</strong>
              {asset?.daily_rate_usd && (
                <span style={{ color: '#9A7530' }}>
                  — estimated ${(nights() * parseInt(asset.daily_rate_usd)).toLocaleString()} before crew &amp; provisions
                </span>
              )}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Itinerary Ideas</label>
            <textarea className="form-control" style={{ minHeight: 75 }}
              value={form.itinerary_description}
              onChange={e => set('itinerary_description', e.target.value)}
              placeholder="Route preferences, island stops, diving, water sports…" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Special Requests</label>
            <textarea className="form-control" style={{ minHeight: 75 }}
              value={form.special_requests}
              onChange={e => set('special_requests', e.target.value)}
              placeholder="Dietary requirements, celebrations, chef preferences…" />
          </div>

          <SubmitRow loading={loading} onClose={close} label="Submit Charter Request" />
        </form>
      )}
    </Modal>
  )
}

/* ─── Lease Modal ────────────────────────────────────────────────────────────────
   Verified correct: aircraft/yacht FKs already guarded before delete.
   Added explicit payload build (like other modals) for clarity & safety.
──────────────────────────────────────────────────────────────────────────────── */
function LeaseModal({ open, onClose, asset, assetType }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    lease_duration: 'annual', preferred_start_date: '',
    budget_range: '', usage_description: '', additional_notes: '',
  })

  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)
  const isAc = assetType === 'aircraft'

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const payload = {
        guest_name:          form.guest_name,
        guest_email:         form.guest_email,
        company:             form.company,
        asset_type:          assetType,
        lease_duration:      form.lease_duration,
        preferred_start_date: form.preferred_start_date,
        usage_description:   form.usage_description,
      }

      // Assets come from catalogAPI.opAircraft / opYachts — use operator FK fields,
      // not the catalog aircraft/yacht FKs (which expect catalog model PKs)
      if (isAc && asset?.id)  payload.operator_aircraft = asset.id
      if (!isAc && asset?.id) payload.yacht             = asset.id  // LeaseInquiry has no operator_yacht FK

      // Optional fields
      if (form.guest_phone?.trim())      payload.guest_phone      = form.guest_phone.trim()
      if (form.budget_range?.trim())     payload.budget_range     = form.budget_range.trim()
      if (form.additional_notes?.trim()) payload.additional_notes = form.additional_notes.trim()

      const { data } = await leaseAPI.create(payload)
      setSuccess(data)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open} onClose={close} icon="bi-file-earmark-text"
      title={`Lease — ${asset?.name || (isAc ? 'Aircraft' : 'Yacht')}`}
      subtitle={asset
        ? (isAc
            ? `${asset.category_display} · ${asset.passenger_capacity} passengers`
            : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests`)
        : ''}
      maxWidth={660}
    >
      {success ? (
        <SuccessState
          title="Lease Inquiry Submitted"
          message={success.message || 'Our leasing team will respond within 24 hours with a tailored program proposal.'}
          reference={success.inquiry?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          {asset && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              background: '#FDF3D9', border: '1px solid #E6CFA0',
              borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1.6rem',
            }}>
              <i
                className={`bi ${isAc ? 'bi-airplane' : 'bi-water'}`}
                style={{ fontSize: '1.3rem', color: '#C9A84C', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 600, color: '#7A5C22', fontSize: '0.92rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9A7530', marginTop: 2 }}>
                  {isAc
                    ? `${asset.category_display} · ${asset.passenger_capacity} pax · ${asset.range_km?.toLocaleString()} km · $${parseInt(asset.hourly_rate_usd || 0).toLocaleString()}/hr`
                    : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · $${parseInt(asset.daily_rate_usd || 0).toLocaleString()}/day`}
                </div>
              </div>
            </div>
          )}

          <ErrorAlert error={error} />

          <FormSection icon="bi-person">Contact Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name}
                onChange={e => set('guest_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email}
                onChange={e => set('guest_email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone}
                onChange={e => set('guest_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company <span className="req">*</span></label>
              <input className="form-control" required value={form.company}
                onChange={e => set('company', e.target.value)} />
            </div>
          </div>

          <FormSection icon="bi-calendar">Lease Program</FormSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {LEASE_DURATIONS.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set('lease_duration', value)} style={{
                padding: '0.65rem 1rem', textAlign: 'left',
                fontSize: '0.82rem', fontWeight: 500,
                borderRadius: '8px',
                border: `1.5px solid ${form.lease_duration === value ? '#0B1D3A' : '#e2e8f0'}`,
                background: form.lease_duration === value ? '#EBF2FF' : 'transparent',
                color: form.lease_duration === value ? '#0B1D3A' : '#718096',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {label}
                {form.lease_duration === value && (
                  <i className="bi bi-check-circle-fill" style={{ color: '#0B1D3A' }} />
                )}
              </button>
            ))}
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Preferred Start Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.preferred_start_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('preferred_start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Budget Range</label>
              <input className="form-control" value={form.budget_range}
                onChange={e => set('budget_range', e.target.value)}
                placeholder="e.g. $50K – $150K/month" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Intended Usage <span className="req">*</span></label>
            <textarea className="form-control" required style={{ minHeight: 80 }}
              value={form.usage_description}
              onChange={e => set('usage_description', e.target.value)}
              placeholder={isAc
                ? 'Typical routes, estimated hours/month, corporate or personal travel…'
                : 'Preferred cruising grounds, season length, group size, type of voyages…'} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Additional Notes</label>
            <textarea className="form-control" style={{ minHeight: 65 }}
              value={form.additional_notes}
              onChange={e => set('additional_notes', e.target.value)}
              placeholder="Customisation, branding, crew language preferences…" />
          </div>

          <SubmitRow loading={loading} onClose={close} label="Submit Lease Inquiry" />
        </form>
      )}
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts]     = useState([])
  const [modal, setModal]       = useState(null)

  useEffect(() => {
    catalogAPI.opAircraft({ limit: 3 })
      .then(r => setAircraft(r.data?.results || r.data || []))
      .catch(() => {})

    catalogAPI.opYachts({ limit: 3 })
      .then(r => setYachts(r.data?.results || r.data || []))
      .catch(() => {})
  }, [])

  const open  = (type, asset) => setModal({ type, asset })
  const close = useCallback(() => setModal(null), [])

  return (
    <>
      {/* SEO Helmet */}
      <Helmet>
        <title>Nairobi Jet House | Private Jet Charter & Luxury Yacht Rentals in Kenya</title>
        <meta name="description" content="Nairobi Jet House offers premium private jet charters, luxury yacht rentals, air cargo services, and aircraft leasing in Kenya and worldwide. 24/7 concierge, 2,400+ aircraft, 800+ yachts." />
        <meta name="keywords" content="private jet charter Kenya, luxury yacht rental Nairobi, air cargo Kenya, aircraft leasing, private aviation, charter flights Nairobi, executive jet hire" />
        <meta name="author" content="Nairobi Jet House" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi" />
        <meta name="geo.position" content="-1.286389;36.817223" />
        <meta name="ICBM" content="-1.286389, 36.817223" />
        <meta property="og:title" content="Nairobi Jet House - Premier Private Aviation in Kenya" />
        <meta property="og:description" content="Experience luxury travel with Nairobi Jet House. Private jet charters, yacht rentals, and air cargo services across Africa and worldwide." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.nairobijethouse.com" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:alt" content="Nairobi Jet House luxury private jet" />
        <meta property="og:site_name" content="Nairobi Jet House" />
        <meta property="og:locale" content="en_KE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nairobi Jet House - Private Jet Charter & Luxury Travel" />
        <meta name="twitter:description" content="Premium private aviation services in Kenya and worldwide. Book your luxury flight today." />
        <meta name="twitter:image" content="/twitter-image.jpg" />
        <link rel="canonical" href="https://www.nairobijethouse.com" />
        <link rel="alternate" href="https://www.nairobijethouse.com" hrefLang="en" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Nairobi Jet House",
            "url": "https://www.nairobijethouse.com",
            "logo": "https://www.nairobijethouse.com/logo.png",
            "image": "https://www.nairobijethouse.com/hero-image.jpg",
            "description": "Premier private jet charter and luxury yacht rental company in Kenya, offering worldwide travel solutions.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "KE"
            },
            "telephone": "+254780729617",
            "email": "info@nairobijethouse.com",
            "priceRange": "$$$",
            "openingHours": "24/7",
            "sameAs": [
              "https://www.instagram.com/nairobijethouse",
              "https://www.linkedin.com/company/nairobijethouse"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Aviation Services",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Private Jet Charter" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Yacht Charter" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Air Cargo" } },
              ]
            }
          })}
        </script>
      </Helmet>

      <div>
        <PublicNavbar dark />

        {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative', minHeight: '100vh', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HeroVideoBackground />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(11,29,58,0.80) 0%, rgba(11,29,58,0.50) 100%)',
            zIndex: 3, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative', zIndex: 4,
            width: '100%', maxWidth: 1200, margin: '0 auto',
            padding: '0 2rem', paddingTop: '7rem', paddingBottom: '5rem',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem',
            }}>
              <i className="bi bi-patch-check" style={{ fontSize: '0.9rem' }} />
              Travel across hidden lands
            </div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 700, lineHeight: 1.1,
              color: '#ffffff', marginBottom: '1.5rem', maxWidth: 680,
            }}>
              Private Jet Charters <br />
              <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Yacht Charter</em>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              color: 'rgba(255,255,255,0.82)', lineHeight: 1.75,
              maxWidth: 560, marginBottom: '2.5rem',
            }}>
              Instant access to 2,400+ private aircraft and 800+ yachts in 187 countries.
              No membership. No waiting. Just seamless luxury travel tailored to you.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to="/book-flight"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem', background: '#C9A84C', color: '#0B1D3A',
                  fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: 700,
                  textDecoration: 'none', borderRadius: 6, border: '2px solid #C9A84C',
                  letterSpacing: '0.02em', transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <i className="bi bi-airplane" style={{ fontSize: '1rem' }} /> Plan a Flight
              </Link>
              <Link
                to="/lease"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff', fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: 600,
                  textDecoration: 'none', borderRadius: 6,
                  border: '2px solid rgba(255,255,255,0.55)',
                  letterSpacing: '0.02em', backdropFilter: 'blur(6px)',
                  transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)' }}
              >
                <i className="bi bi-send" style={{ fontSize: '0.9rem' }} /> Leasing Inquiry
              </Link>
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: '2rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: 4, opacity: 0.5,
          }}>
            <i className="bi bi-chevron-double-down" style={{ color: '#ffffff', fontSize: '1.1rem' }} />
          </div>
        </section>

        {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
        <section className="stats-bar">
          <div className="container">
            <div className="grid-4">
              {STATS.map(({ value, label, icon }) => (
                <div className="stat-item" key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                    <div className="stat-value">{value}</div>
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SERVICES ═════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <span className="eyebrow">What We Offer</span>
              <h2>Luxury Travel, <em>Simplified</em></h2>
              <div className="gold-rule gold-rule-center" />
              <p style={{ maxWidth: 540, margin: '0 auto', fontSize: '1rem' }}>
                From a single flight to a season-long yacht charter or a multi-year aircraft lease,
                NairobiJetHouse gives you direct access to the world's finest private travel assets —
                without the complexity.
              </p>
            </div>

            {/* Primary services */}
            <div className="grid-4" style={{ marginTop: '3rem' }}>
              {SERVICES.slice(0, 4).map(({ icon, title, tagline, description, link, cta, images }) => (
                <div className="card" key={title} style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <ServiceImageCarousel images={images} title={title} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(11,29,58,0) 50%, rgba(11,29,58,0.55) 100%)',
                      zIndex: 1,
                    }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
                    <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.02em' }}>{tagline}</div>
                    <p style={{ fontSize: '0.855rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>{description}</p>
                    <Link to={link} className="btn btn-outline-navy btn-sm">{cta} <i className="bi bi-arrow-right" /></Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 2rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>More Services</span>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            </div>

            {/* Additional services */}
            <div className="grid-4">
              {SERVICES.slice(4).map(({ icon, title, tagline, description, link, cta, highlight, images }) => (
                <div className="card" key={title} style={{
                  padding: 0, overflow: 'hidden',
                  ...(highlight ? { borderColor: 'var(--gold)', borderWidth: 2 } : {}),
                }}>
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <ServiceImageCarousel images={images} title={title} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(11,29,58,0) 50%, rgba(11,29,58,0.55) 100%)',
                      zIndex: 1,
                    }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
                    <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.02em' }}>{tagline}</div>
                    <p style={{ fontSize: '0.855rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>{description}</p>
                    <Link to={link} className={`btn btn-sm ${highlight ? 'btn-navy' : 'btn-outline-navy'}`}>
                      {cta} <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURED AIRCRAFT ════════════════════════════════════════════════ */}
        {aircraft.length > 0 && (
          <section className="section">
            <div className="container">
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem',
              }}>
                <div>
                  <span className="eyebrow">Private Jet Fleet</span>
                  <h2>Aircraft for Every <em>Mission</em></h2>
                  <div className="gold-rule" />
                  <p style={{ maxWidth: 500 }}>
                    From nimble light jets perfect for European city hops to ultra-long-range flagships
                    that connect New York to Singapore nonstop — our fleet covers every range, cabin
                    size, and budget.
                  </p>
                </div>
                <Link to="/fleet" className="btn btn-outline-navy">
                  View Full Fleet <i className="bi bi-arrow-right" />
                </Link>
              </div>
              <div className="grid-3">
                {aircraft.map(ac => (
                  <div className="card" key={ac.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {ac.image_url
                      ? <img src={ac.image_url} alt={`${ac.name} private jet`} className="card-img" loading="lazy" />
                      : <div className="card-img-placeholder"><i className="bi bi-airplane" /></div>}
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span className="card-tag">{ac.category_display}</span>
                      <div className="card-title">{ac.name}</div>
                      <div className="card-meta" style={{ marginBottom: '1rem' }}>
                        <i className="bi bi-people" style={{ marginRight: 5 }} />{ac.passenger_capacity} passengers
                        <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>·</span>
                        <i className="bi bi-arrow-left-right" style={{ marginRight: 5 }} />{ac.range_km?.toLocaleString()} km range
                      </div>
                      <div className="card-actions" style={{ marginTop: 'auto' }}>
                        <button className="btn btn-navy btn-sm" onClick={() => open('book-flight', ac)}>
                          <i className="bi bi-airplane" /> Book
                        </button>
                        <button className="btn btn-outline-navy btn-sm" onClick={() => open('lease-aircraft', ac)}>
                          <i className="bi bi-file-earmark-text" /> Lease
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ WHY US ═══════════════════════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--gray-50)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <span className="eyebrow">Why NairobiJetHouse</span>
              <h2>The Standard Others <em>Aspire To</em></h2>
              <div className="gold-rule gold-rule-center" />
              <p style={{ maxWidth: 520, margin: '0 auto' }}>
                With over 20 years serving heads of state, Fortune 500 executives, and discerning
                private travellers, NairobiJetHouse has perfected what private travel should feel like.
              </p>
            </div>
            <div className="grid-3" style={{ marginTop: '3rem' }}>
              {WHY_US.map(({ icon, title, desc }) => (
                <div key={title} style={{
                  display: 'flex', gap: '1.25rem', padding: '1.5rem',
                  background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--gray-100)',
                }}>
                  <div style={{
                    flexShrink: 0, width: 44, height: 44,
                    background: 'var(--gold-pale)', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</h4>
                    <p style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ YACHT CTA ════════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative', padding: '7rem 0', overflow: 'hidden',
          backgroundImage: `url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,29,58,0.88) 0%, rgba(11,29,58,0.55) 100%)' }} />
          <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              <i className="bi bi-water" /> Superyacht Charter
            </span>
            <h2 style={{ color: 'white', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              Set Sail on the <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>World's Finest</em> Yachts
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.75)', maxWidth: 560,
              margin: '0 auto 2.5rem', fontSize: '1rem', lineHeight: 1.8,
            }}>
              From the turquoise waters of the Maldives to the dramatic fjords of Norway, our
              superyacht fleet takes you to places only accessible by sea. Fully crewed, provisioned,
              and ready to sail on your schedule.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/yacht-charter" className="btn btn-gold btn-lg">
                <i className="bi bi-water" /> Charter a Yacht
              </Link>
              <Link to="/fleet" className="btn btn-outline-gold btn-lg"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                Browse Yachts
              </Link>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-4">
              <span className="eyebrow">The NairobiJetHouse Process</span>
              <h2>From Request to <em>Takeoff</em> in Three Steps</h2>
              <div className="gold-rule gold-rule-center" />
              <p style={{ maxWidth: 500, margin: '0 auto' }}>
                We've eliminated every unnecessary step. Our booking process is designed for busy
                people who value their time as much as their comfort.
              </p>
            </div>
            <div className="grid-3" style={{ marginTop: '3.5rem' }}>
              {PROCESS.map(({ step, icon, title, desc }) => (
                <div key={step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: 72, height: 72, background: 'var(--navy)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto',
                    }}>
                      <i className={`bi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--gold)' }} />
                    </div>
                    <span style={{
                      position: 'absolute', top: -6, right: -10,
                      fontFamily: 'Georgia, serif', fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--gold)', background: 'var(--gold-pale)',
                      padding: '1px 6px', borderRadius: 4,
                    }}>
                      {step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link to="/book-flight" className="btn btn-navy btn-lg">
                <i className="bi bi-airplane" /> Begin Your Journey
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FEATURED YACHTS ═══════════════════════════════════════════════════ */}
        {yachts.length > 0 && (
          <section className="section" style={{ background: 'var(--off-white)' }}>
            <div className="container">
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem',
              }}>
                <div>
                  <span className="eyebrow">Superyacht Fleet</span>
                  <h2>Vessels Built for <em>Extraordinary</em> Voyages</h2>
                  <div className="gold-rule" />
                </div>
                <Link to="/fleet" className="btn btn-outline-navy">
                  View All Yachts <i className="bi bi-arrow-right" />
                </Link>
              </div>
              <div className="grid-3">
                {yachts.map(y => (
                  <div className="card" key={y.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {y.image_url
                      ? <img src={y.image_url} alt={`${y.name} luxury yacht`} className="card-img" loading="lazy" />
                      : <div className="card-img-placeholder"><i className="bi bi-water" /></div>}
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span className="card-tag">{y.size_display}</span>
                      <div className="card-title">{y.name}</div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        {y.length_meters}m &nbsp;·&nbsp; {y.guest_capacity} guests &nbsp;·&nbsp; {y.crew_count} crew
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem' }}>
                        From ${parseInt(y.daily_rate_usd).toLocaleString()}
                        <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.78rem' }}>/day</span>
                      </div>
                      <div className="card-actions" style={{ marginTop: 'auto' }}>
                        <button className="btn btn-navy btn-sm" onClick={() => open('charter-yacht', y)}>
                          <i className="bi bi-water" /> Charter
                        </button>
                        <button className="btn btn-outline-navy btn-sm" onClick={() => open('lease-yacht', y)}>
                          <i className="bi bi-file-earmark-text" /> Lease
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative', padding: '7rem 0', overflow: 'hidden',
          backgroundImage: `url(https://plus.unsplash.com/premium_photo-1682142182464-3be6161b3a42?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJpdmF0ZSUyMGNoYXJ0ZXJ8ZW58MHx8MHx8fDA%3D)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,29,58,0.92) 0%, rgba(11,29,58,0.78) 100%)' }} />
          <div className="container" style={{ position: 'relative', maxWidth: 680, textAlign: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Ready to Fly?</span>
            <h2 style={{ color: 'white', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              Your Private Jet is <em style={{ color: 'white', fontStyle: 'italic' }}>Waiting</em>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem',
              fontSize: '1rem', lineHeight: 1.8,
            }}>
              Whether you're flying solo or bringing an entire team, NairobiJetHouse has the right
              aircraft at the right price. Our concierge team is standing by 24 hours a day, seven
              days a week.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/book-flight" className="btn btn-gold btn-lg">
                <i className="bi bi-airplane" /> Book a Flight
              </Link>
              <Link to="/contact" className="btn btn-outline-gold btn-lg"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                <i className="bi bi-send" /> Send an Inquiry
              </Link>
            </div>
          </div>
        </section>

        <PublicFooter />

        {/* ══ MODALS ════════════════════════════════════════════════════════════ */}
        <BookFlightModal
          open={modal?.type === 'book-flight'}
          onClose={close}
          aircraft={modal?.asset}
        />
        <CharterYachtModal
          open={modal?.type === 'charter-yacht'}
          onClose={close}
          yacht={modal?.asset}
        />
        <LeaseModal
          open={modal?.type === 'lease-aircraft'}
          onClose={close}
          asset={modal?.asset}
          assetType="aircraft"
        />
        <LeaseModal
          open={modal?.type === 'lease-yacht'}
          onClose={close}
          asset={modal?.asset}
          assetType="yacht"
        />
      </div>
    </>
  )
}