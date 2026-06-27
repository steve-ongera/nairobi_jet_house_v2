// src/pages/public/BookFlightPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { bookingAPI, catalogAPI } from '../../services/api';

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  'light', 'midsize', 'super_midsize', 'heavy',
  'ultra_long', 'vip_airliner', 'turboprop', 'helicopter',
];
const TRIP_TYPES = [
  ['one_way', 'One Way'],
  ['round_trip', 'Round Trip'],
  ['multi_leg', 'Multi-Leg'],
];
const CATEGORY_NAMES = {
  light:         'Light Jets',
  midsize:       'Midsize Jets',
  super_midsize: 'Super Midsize',
  heavy:         'Heavy Jets',
  ultra_long:    'Ultra Long Range',
  vip_airliner:  'VIP Airliners',
  turboprop:     'Turboprops',
  helicopter:    'Helicopters',
};

const FORM_STEPS = [
  { label: 'Travel Details',         icon: 'bi-airplane' },
  { label: 'Contact & Confirmation', icon: 'bi-person-check' },
];

// Why-choose-us value props
const VALUE_PROPS = [
  { icon: 'bi-send-check',     title: 'Direct Flights',        desc: 'Fly point-to-point to hard-to-reach destinations, skipping the lines and layovers of commercial routes.' },
  { icon: 'bi-clock',          title: 'Flexible Scheduling',   desc: "Departure times built around you. Plans change — we change with them, even at short notice." },
  { icon: 'bi-person-badge',   title: 'Dedicated Specialist',  desc: 'One aviation specialist manages your charter from first enquiry to wheels-down, every time.' },
  { icon: 'bi-shield-lock',    title: 'Discreet & Secure',     desc: 'Sensitive itineraries and high-profile travel handled with total discretion and care.' },
  { icon: 'bi-cup-hot',        title: 'Tailored Catering',     desc: "Dietary needs, favourite meals, or a celebration on board — catered exactly to your journey." },
  { icon: 'bi-headset',        title: '24/7 Support',          desc: 'Our team is reachable around the clock, every day of the year, wherever you are flying.' },
];

// Carbon offset pricing per category (USD per flight hour) — mirrors reference page's bar chart
const OFFSET_PRICING = [
  { category: 'Turboprop',         price: 9,  pct: 13 },
  { category: 'Light Jet',         price: 11, pct: 16 },
  { category: 'Super Light Jet',   price: 19, pct: 28 },
  { category: 'Midsize Jet',       price: 23, pct: 33 },
  { category: 'Super Mid-Size Jet',price: 29, pct: 42 },
  { category: 'Heavy Jet',         price: 39, pct: 57 },
  { category: 'Ultra Long Range',  price: 46, pct: 67 },
  { category: 'VIP Airliner',      price: 69, pct: 100 },
];

// Use-case / service category tiles
const SERVICE_CATEGORIES = [
  { label: 'Business Aviation',   icon: 'bi-briefcase',        img: 'https://plus.unsplash.com/premium_photo-1683121196780-90e1c01ec74f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8QnVzaW5lc3MlMjBBdmlhdGlvbnxlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Medevac',             icon: 'bi-heart-pulse',      img: 'https://plus.unsplash.com/premium_photo-1664303503818-a6fab2dcfd91?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVkZXZhY3xlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Hospitality & Events',icon: 'bi-stars',            img: 'https://plus.unsplash.com/premium_photo-1722168614154-60badae538c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SG9zcGl0YWxpdHklMjAlMjYlMjBFdmVudHN8ZW58MHx8MHx8fDA%3D' },
  { label: 'Music Tours',         icon: 'bi-music-note-beamed',img: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fE11c2ljJTIwVG91cnN8ZW58MHx8MHx8fDA%3D' },
  { label: 'Sports Events',       icon: 'bi-trophy',           img: 'https://images.unsplash.com/photo-1569863959165-56dae551d4fc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3BvcnRzJTIwRXZlbnRzfGVufDB8fDB8fHww' },
  { label: 'Luxury Travel',       icon: 'bi-gem',               img: 'https://images.unsplash.com/photo-1661954864180-e61dea14208a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEx1eHVyeSUyMFRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Movie & Production',  icon: 'bi-camera-reels',     img: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TW92aWUlMjAlMjYlMjBQcm9kdWN0aW9ufGVufDB8fDB8fHww' },
  { label: 'Empty Leg Flights',   icon: 'bi-arrow-left-right', img: 'https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEVtcHR5JTIwTGVnJTIwRmxpZ2h0c3xlbnwwfHwwfHx8MA%3D%3D' },
  { label: 'Request a Quote',     icon: 'bi-send',             img: null, isCta: true },
];

// Stats strip
const COMPANY_STATS = [
  { value: '15+',  label: 'Years of expertise' },
  { value: '4,000+', label: 'Satisfied clients' },
  { value: '12,000+',label: 'Flights completed' },
  { value: '24/7', label: 'Support' },
];

// Popular destinations
const DESTINATIONS = [
  { city: 'Nairobi',     country: 'Kenya',         img: 'https://images.unsplash.com/photo-1643913224222-17cc6adb2dfc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fE5haXJvYml8ZW58MHx8MHx8fDA%3D' },
  { city: 'Dubai',       country: 'UAE',           img: 'https://media.istockphoto.com/id/454222161/photo/dubai-madinat-jumeirah.webp?a=1&b=1&s=612x612&w=0&k=20&c=6Ck16ZlHKkarnYW5irrlD9ALoU3E9xnWxnj7k3Kop9w=' },
  { city: 'London',      country: 'United Kingdom',img: 'https://images.unsplash.com/photo-1529180184525-78f99adb8e98?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHVuaXRlZCUyMGtpbmdkb218ZW58MHx8MHx8fDA%3D' },
  { city: 'Cape Town',   country: 'South Africa',  img: 'https://images.unsplash.com/photo-1585061528750-3baca2cb6a10?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FwZSUyMHRvd258ZW58MHx8MHx8fDA%3D' },
  { city: 'Mombasa',     country: 'Kenya',         img: 'https://images.unsplash.com/photo-1579005318686-5a86bbb3bf03?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9tYmFzYXxlbnwwfHwwfHx8MA%3D%3D' },
];

const FAQS = [
  { q: 'How much does it cost to charter a private jet?',
    a: 'Pricing depends on aircraft category, route, flight hours, and any add-on services you request. Submit an enquiry and a specialist will respond with a tailored quote within 2–4 hours.' },
  { q: 'What is the check-in process for a private jet flight?',
    a: "Most private terminals (FBOs) ask you to arrive just 15–30 minutes before departure. We'll share exact terminal details and timing once your charter is confirmed." },
  { q: 'What type of private jets are available, and how will I know which one to book?',
    a: "We offer everything from light jets to VIP airliners and helicopters. Tell us your route, passenger count, and budget, and we'll recommend the best fit — or leave the category open and we'll do it for you." },
  { q: 'Can I fly with my pet on a private jet charter?',
    a: 'Yes. Pets are welcome on board most private charters with no crate requirement in most cases. Let us know in your special requests and we will confirm aircraft suitability.' },
];

const RELATED_POSTS = [
  { tag: 'GUIDES',  title: 'VIPs & Pets: Travelling with Your Animals',     img: 'https://plus.unsplash.com/premium_photo-1773417399842-14c757e7dcd8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UGV0cyUyMGFlcm9wbGFuZXxlbnwwfHwwfHx8MA%3D%3D' },
  { tag: 'NEWS',    title: '5 Places You Can\u2019t Miss Near Nairobi',     img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fE5FV1N8ZW58MHx8MHx8fDA%3D' },
  { tag: 'PRESS',   title: 'NairobiJetHouse Wins Best Air Charter Award',   img: 'https://plus.unsplash.com/premium_photo-1689701711439-e54f039f8d97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UFJFU1N8ZW58MHx8MHx8fDA%3D' },
  { tag: 'GUIDES',  title: 'Private Jet Classifications and Capabilities',  img: 'https://images.unsplash.com/photo-1504607798333-52a30db54a5d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8R1VJREVTfGVufDB8fDB8fHww' },
];

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Book a Private Jet Charter | NairobiJetHouse',
  description: 'Request a private jet charter quote. Fill out our simple form and receive a personalised quote within 2–4 hours.',
};
// ── Airport Combobox (unchanged) ────────────────────────────────────────────
function AirportCombobox({ airports, airportsLoading, value, onChange, placeholder, required }) {
  const [query, setQuery]           = useState('');
  const [open, setOpen]             = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const selectedAirport = airports.find(
    a => a.id === value || String(a.id) === String(value)
  );

  useEffect(() => {
    if (!value) {
      setQuery('');
    } else if (selectedAirport) {
      setQuery(`${selectedAirport.code} – ${selectedAirport.name}, ${selectedAirport.city}`);
    }
  }, [value, selectedAirport]);

  const filtered = query.length >= 2
    ? airports
        .filter(a => {
          const q = query.toLowerCase();
          return (
            a.code?.toLowerCase().includes(q) ||
            a.name?.toLowerCase().includes(q) ||
            a.city?.toLowerCase().includes(q) ||
            a.country?.toLowerCase().includes(q)
          );
        })
        .slice(0, 10)
    : [];

  const selectAirport = airport => {
    onChange(airport.id);
    setQuery(`${airport.code} – ${airport.name}, ${airport.city}`);
    setOpen(false);
    setHighlighted(0);
  };

  const handleInputChange = e => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlighted(0);
    if (value) onChange('');
  };

  const handleKeyDown = e => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) selectAirport(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      if (!value) setQuery('');
    }, 160);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="form-input-gov"
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
        onBlur={handleBlur}
        placeholder={
          airportsLoading
            ? 'Loading airports…'
            : (placeholder || 'Type 2+ letters to search…')
        }
        disabled={airportsLoading}
        required={required}
        autoComplete="off"
      />
      <input type="hidden" value={value || ''} />

      {airportsLoading && (
        <span style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.75rem', color: 'var(--color-mid-gray)',
        }}>
          <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }}></i>
        </span>
      )}

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 1000,
            background: 'var(--color-white)',
            border: '1px solid var(--color-light-gray)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            margin: 0, padding: '0.25rem 0', listStyle: 'none',
            maxHeight: '280px', overflowY: 'auto',
          }}
        >
          {filtered.map((a, i) => (
            <li
              key={a.id}
              onMouseDown={() => selectAirport(a)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '0.6rem 1rem', cursor: 'pointer',
                background: i === highlighted ? 'var(--color-off-white)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <span className="badge-gov" style={{ minWidth: '2.8rem', textAlign: 'center' }}>
                {a.code}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-dark-gray)' }}>
                {a.name}
                <span style={{ color: 'var(--color-mid-gray)', marginLeft: '0.35rem' }}>
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
          zIndex: 1000,
          background: 'var(--color-white)',
          border: '1px solid var(--color-light-gray)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem', color: 'var(--color-mid-gray)',
        }}>
          No airports found for "{query}"
        </div>
      )}
    </div>
  );
}

// ── Modal Shell (matches HomePage.jsx modal styling) ────────────────────────
function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 680 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      <style>{`@keyframes modalPop{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}`}</style>
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
  );
}

// ── Success state inside modal ───────────────────────────────────────────────
function ModalSuccessState({ title, message, reference, onNew, onClose }) {
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
        <button type="button" className="btn-outline-gov" onClick={onNew}>
          <i className="bi bi-arrow-counterclockwise" /> New Request
        </button>
        <button type="button" className="btn-primary-gov" onClick={onClose}>
          <i className="bi bi-x" /> Close
        </button>
      </div>
    </div>
  );
}

function ModalAssetBanner({ asset }) {
  if (!asset) return null;
  const hourly = asset.display_hourly_rate ?? asset.hourly_rate_usd;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: '#EBF2FF',
      border: '1px solid #BED1EF',
      borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1.6rem',
    }}>
      <i className="bi bi-airplane-fill" style={{ fontSize: '1.3rem', color: '#0B1D3A', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '0.92rem' }}>
          {asset.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: 2 }}>
          {asset.category_display || CATEGORY_NAMES[asset.category] || asset.category}
          {asset.passenger_capacity ? ` · ${asset.passenger_capacity} passengers` : ''}
          {asset.range_km ? ` · ${Number(asset.range_km).toLocaleString()} km range` : ''}
          {hourly ? ` · $${parseInt(hourly).toLocaleString()}/hr` : ''}
        </div>
      </div>
    </div>
  );
}

function ModalFormSection({ icon, children }) {
  return (
    <div style={{
      fontWeight: 600, fontSize: '0.8rem', color: '#0B1D3A',
      marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem',
    }}>
      <i className={`bi ${icon}`} style={{ color: '#C9A84C' }} />
      {children}
    </div>
  );
}

function ModalErrorAlert({ error }) {
  if (!error) return null;
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
  );
}

function parseModalApiError(err) {
  if (err.response?.data) {
    console.error('[NJH API Error]', err.response.status, JSON.stringify(err.response.data));
  }
  const detail = err.response?.data;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object') {
    if (detail.detail) return detail.detail;
    return Object.entries(detail)
      .map(([field, errs]) => {
        const msg = Array.isArray(errs) ? errs.join(' ') : String(errs);
        const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `${label}: ${msg}`;
      })
      .join(' · ');
  }
  return 'Something went wrong. Please try again.';
}

function ModalSubmitRow({ loading, onClose, label = 'Submit' }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button type="button" className="btn-outline-gov" onClick={onClose} style={{ flex: '0 0 auto' }}>
        Cancel
      </button>
      <button type="submit" className="btn-primary-gov" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
        {loading
          ? <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>&nbsp; Submitting…</>
          : <><i className="bi bi-send" /> {label}</>}
      </button>
    </div>
  );
}

// ── Book This Aircraft Modal ─────────────────────────────────────────────────
// Self-contained booking modal for a specific fleet aircraft, mirrors the
// BookFlightModal pattern from HomePage.jsx. Reuses the page's already-fetched
// `airports` list rather than re-fetching, and is fully separate from the
// main multi-step booking form/flow further up the page (no shared state).
function FleetBookModal({ open, onClose, aircraft, airports, airportsLoading }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '',
    trip_type: 'one_way', passenger_count: 1,
    departure_date: '', departure_time: '', return_date: '',
    catering_requested: false, ground_transport_requested: false,
    special_requests: '',
  });

  const [form, setForm]     = useState(blank);
  const [origin, setOrigin] = useState('');
  const [dest, setDest]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState(null);

  // Reset form whenever a new aircraft is opened
  useEffect(() => {
    if (open) {
      setForm(blank());
      setOrigin('');
      setDest('');
      setSuccess(null);
      setError(null);
    }
  }, [open, aircraft]);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = ()     => { setForm(blank()); setOrigin(''); setDest(''); setSuccess(null); setError(null); };
  const close = ()     => { reset(); onClose(); };

  const submit = async e => {
    e.preventDefault();

    if (!origin || !dest) {
      setError('Please select both origin and destination airports from the dropdown.');
      return;
    }
    if (String(origin) === String(dest)) {
      setError('Origin and destination airports cannot be the same.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        guest_name:      form.guest_name,
        guest_email:     form.guest_email,
        trip_type:       form.trip_type,
        origin:          origin,
        destination:     dest,
        departure_date:  form.departure_date,
        passenger_count: form.passenger_count,
        catering_requested:         form.catering_requested,
        ground_transport_requested: form.ground_transport_requested,
      };

      if (form.guest_phone?.trim())      payload.guest_phone      = form.guest_phone.trim();
      if (form.departure_time)           payload.departure_time   = form.departure_time;
      if (form.special_requests?.trim()) payload.special_requests = form.special_requests.trim();
      if (aircraft?.id)                  payload.operator_aircraft = aircraft.id;
      if (form.trip_type === 'round_trip' && form.return_date) payload.return_date = form.return_date;

      const { data } = await bookingAPI.create(payload);
      setSuccess(data);
    } catch (err) {
      setError(parseModalApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onClose={close} icon="bi-airplane"
      title={aircraft ? `Book — ${aircraft.name}` : 'Book a Flight'}
      subtitle={aircraft ? `${aircraft.category_display || CATEGORY_NAMES[aircraft.category] || ''} · up to ${aircraft.passenger_capacity} passengers` : ''}
      maxWidth={700}
    >
      {success ? (
        <ModalSuccessState
          title="Flight Request Submitted"
          message={success.message || 'Our specialists will contact you within 2–4 hours.'}
          reference={success.booking?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          <ModalAssetBanner asset={aircraft} />
          <ModalErrorAlert error={error} />

          <ModalFormSection icon="bi-person">Your Details</ModalFormSection>
          <div className="form-row" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label-gov">Full Name <span className="required">*</span></label>
              <input className="form-input-gov" required value={form.guest_name}
                onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label-gov">Email <span className="required">*</span></label>
              <input className="form-input-gov" type="email" required value={form.guest_email}
                onChange={e => set('guest_email', e.target.value)} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label-gov">Phone</label>
              <input className="form-input-gov" value={form.guest_phone}
                onChange={e => set('guest_phone', e.target.value)} placeholder="+254 724 878 136" />
            </div>
            <div className="form-group">
              <label className="form-label-gov">Passengers <span className="required">*</span></label>
              <input className="form-input-gov" type="number" min={1}
                max={aircraft?.passenger_capacity || 400} required
                value={form.passenger_count}
                onChange={e => set('passenger_count', parseInt(e.target.value) || 1)} />
              {aircraft && <div className="form-hint">Max {aircraft.passenger_capacity} on this aircraft</div>}
            </div>
          </div>

          <ModalFormSection icon="bi-map">Route &amp; Schedule</ModalFormSection>
          <div className="tabs-gov" style={{ marginBottom: '1rem' }}>
            {TRIP_TYPES.map(([v, l]) => (
              <button key={v} type="button"
                className={`tab-btn ${form.trip_type === v ? 'active' : ''}`}
                onClick={() => set('trip_type', v)}>
                {l}
              </button>
            ))}
          </div>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label-gov">From <span className="required">*</span></label>
              <AirportCombobox
                airports={airports} airportsLoading={airportsLoading}
                value={origin} onChange={setOrigin}
                placeholder="Type city or airport code…" required
              />
            </div>
            <div className="form-group">
              <label className="form-label-gov">To <span className="required">*</span></label>
              <AirportCombobox
                airports={airports} airportsLoading={airportsLoading}
                value={dest} onChange={setDest}
                placeholder="Type city or airport code…" required
              />
            </div>
            <div className="form-group">
              <label className="form-label-gov">Departure Date <span className="required">*</span></label>
              <input className="form-input-gov" type="date" required value={form.departure_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('departure_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label-gov">Preferred Time</label>
              <input className="form-input-gov" type="time" value={form.departure_time}
                onChange={e => set('departure_time', e.target.value)} />
            </div>
          </div>

          {form.trip_type === 'round_trip' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label-gov">Return Date <span className="required">*</span></label>
              <input className="form-input-gov" type="date" required value={form.return_date}
                min={form.departure_date || new Date().toISOString().split('T')[0]}
                onChange={e => set('return_date', e.target.value)} />
            </div>
          )}

          <ModalFormSection icon="bi-stars">Add-ons</ModalFormSection>
          <div className="checkbox-group" style={{ marginBottom: '1.5rem' }}>
            {[
              ['catering_requested', 'bi-cup-hot', 'In-Flight Catering'],
              ['ground_transport_requested', 'bi-car-front', 'Ground Transport'],
            ].map(([k, icon, label]) => (
              <label key={k} className="checkbox-label">
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} />
                <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i>
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label-gov">Special Requests</label>
            <textarea className="form-input-gov" rows={3}
              value={form.special_requests}
              onChange={e => set('special_requests', e.target.value)}
              placeholder="Dietary requirements, seating preferences, special occasions…" />
          </div>

          <ModalSubmitRow loading={loading} onClose={close} label="Submit Flight Request" />
        </form>
      )}
    </Modal>
  );
}

// ── Fleet Aircraft Card (styled to match HomePage's featured-aircraft cards) ─
function FleetAircraftCard({ ac, onBook }) {
  const clientHourlyRate = ac.display_hourly_rate ?? ac.hourly_rate_usd;
  const categoryLabel = ac.category_display || CATEGORY_NAMES[ac.category] || ac.category;

  return (
    <div
      className="fleet-aircraft-card"
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(11,29,58,0.13)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(11,29,58,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div className="fleet-aircraft-card__image">
        {ac.image_url ? (
          <img src={ac.image_url} alt={`${ac.name} private jet`} loading="lazy" />
        ) : (
          <div className="fleet-aircraft-card__image-fallback">
            <i className="bi bi-airplane"></i>
          </div>
        )}

        {categoryLabel && (
          <div className="fleet-aircraft-card__badge fleet-aircraft-card__badge--category">
            {categoryLabel}
          </div>
        )}

        {clientHourlyRate != null && (
          <div className="fleet-aircraft-card__badge fleet-aircraft-card__badge--rate">
            ${parseInt(clientHourlyRate).toLocaleString()}<span>/hr</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="fleet-aircraft-card__body">
        <div className="fleet-aircraft-card__name">{ac.name}</div>

        <div className="fleet-aircraft-card__specs">
          {[
            { icon: 'bi-people',           label: 'Passengers',   value: ac.passenger_capacity ? `${ac.passenger_capacity} pax` : '—' },
            { icon: 'bi-arrow-left-right', label: 'Range',        value: ac.range_km ? `${Number(ac.range_km).toLocaleString()} km` : '—' },
            { icon: 'bi-speedometer2',     label: 'Cruise Speed', value: ac.cruise_speed_kmh ? `${Number(ac.cruise_speed_kmh).toLocaleString()} km/h` : '—' },
            { icon: ac.wifi_available ? 'bi-wifi' : 'bi-wifi-off', label: 'Wi-Fi', value: ac.wifi_available ? 'Available' : 'Not Available', dim: !ac.wifi_available },
          ].map(({ icon, label, value, dim }) => (
            <div key={label} className="fleet-aircraft-card__spec">
              <div className="fleet-aircraft-card__spec-label">
                <i className={`bi ${icon}`} style={{ color: dim ? '#cbd5e1' : 'var(--color-gold)' }}></i>
                {label}
              </div>
              <div className="fleet-aircraft-card__spec-value" style={dim ? { color: '#94a3b8' } : undefined}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="fleet-aircraft-card__divider"></div>

        {/* Button Row - Book This Aircraft & View Details */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          width: '100%'
        }}>
          <button
            className="btn-primary-gov"
            style={{ 
              flex: '1 1 0',
              minWidth: 0,
              padding: '0.6rem 0.5rem',
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem'
            }}
            onClick={() => onBook(ac)}
          >
            <i className="bi bi-airplane"></i> Book This Aircraft
          </button>
          <Link
            to={`/fleet/${ac.id}`}
            className="btn-outline-gov"
            style={{ 
              flex: '1 1 0',
              minWidth: 0,
              padding: '0.6rem 0.5rem',
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              textDecoration: 'none'
            }}
          >
            <i className="bi bi-eye"></i> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookFlightPage() {
  const [airports, setAirports]               = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [airportsError, setAirportsError]     = useState('');

  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    trip_type: 'one_way',
    origin: '', destination: '',
    departure_date: '', departure_time: '', return_date: '',
    passenger_count: 1,
    preferred_category: '',
    special_requests: '',
    catering_requested: false,
    ground_transport_requested: false,
    concierge_requested: false,
  });

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [fleetFilter, setFleetFilter] = useState('all');

  // ── Real fleet data (matches HomePage's catalogAPI.opAircraft pattern) ───
  const [fleetAircraft, setFleetAircraft] = useState([]);
  const [fleetLoading, setFleetLoading]   = useState(true);
  const [fleetError, setFleetError]       = useState('');

  // ── Fetch ALL airports once on mount (unchanged) ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadAirports = async () => {
      setAirportsLoading(true);
      setAirportsError('');
      try {
        const data = await catalogAPI.airports();
        if (!cancelled) {
          setAirports(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Airport fetch failed:', err.response?.data || err.message);
          setAirportsError('Could not load airports. You can still type your departure/destination below.');
        }
      } finally {
        if (!cancelled) setAirportsLoading(false);
      }
    };

    loadAirports();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch real approved aircraft for the fleet carousel ──────────────────
  useEffect(() => {
    let cancelled = false;

    const loadFleet = async () => {
      setFleetLoading(true);
      setFleetError('');
      try {
        const r = await catalogAPI.opAircraft({ page_size: 24, is_approved: true });
        if (!cancelled) {
          setFleetAircraft(r.data?.results || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Fleet fetch failed:', err.response?.data || err.message);
          setFleetError('Could not load the fleet right now. Please try again shortly.');
        }
      } finally {
        if (!cancelled) setFleetLoading(false);
      }
    };

    loadFleet();
    return () => { cancelled = true; };
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    const el = document.getElementById('booking-form-top');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Opens a dedicated popup modal for booking a specific fleet aircraft —
  // separate from the main multi-step form above, just like the HomePage
  // aircraft cards open their own BookFlightModal.
  const [fleetModalAircraft, setFleetModalAircraft] = useState(null);
  const bookThisAircraft = (ac) => setFleetModalAircraft(ac);
  const closeFleetModal  = () => setFleetModalAircraft(null);

  // Per-step validation before advancing — step 0 mirrors the original
  // required fields on the Flight Details card; step 1 mirrors Contact Information.
  const validateStep = () => {
    if (step === 0) {
      if (!form.origin)          return 'Please select a departure airport.';
      if (!form.destination)     return 'Please select a destination airport.';
      if (!form.departure_date)  return 'Please select a departure date.';
      if (form.trip_type === 'round_trip' && !form.return_date) return 'Please select a return date.';
      if (!form.passenger_count || form.passenger_count < 1)   return 'Please enter the number of passengers.';
    }
    if (step === 1) {
      if (!form.guest_name.trim())  return 'Please enter your full name.';
      if (!form.guest_email.trim()) return 'Please enter your email address.';
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
      const payload = { ...form };
      if (form.trip_type !== 'round_trip') delete payload.return_date;
      if (!payload.departure_time) delete payload.departure_time;
      const { data } = await bookingAPI.create(payload);
      setSuccess(data.booking?.reference);
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === 'object' && detail !== null) {
        const msgs = Object.entries(detail)
          .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(' ') : errs}`)
          .join(' | ');
        setError(msgs);
      } else {
        setError(detail?.detail || 'Submission failed. Please try again or contact us directly.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredFleet = fleetFilter === 'all'
    ? fleetAircraft
    : fleetAircraft.filter(a => a.category === fleetFilter);

  // ── Success screen (unchanged) ────────────────────────────────────────────
  if (success) {
    return (
      <>
        <Helmet>
          <title>Booking Submitted | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="booking-success">
              <div className="booking-success__icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Booking Submitted</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                Our team will contact you within 2–4 hours with a tailored quote.
              </p>
              <div className="booking-success__ref">
                <div className="booking-success__ref-label">Reference Number</div>
                <div className="booking-success__ref-value">
                  {String(success).slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div className="booking-success__actions">
                <Link to="/track" className="btn-primary-gov">
                  <i className="bi bi-search"></i> Track Your Booking
                </Link>
                <Link to="/" className="btn-outline-gov">
                  <i className="bi bi-house"></i> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />
        <SuccessStyles />
      </>
    );
  }
  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Book a Private Jet | NairobiJetHouse - Charter Request</title>
        <meta name="description" content="Request a private jet charter quote. Fill out our simple form and receive a personalised quote within 2–4 hours. Worldwide private aviation." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/book-flight" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* ============ COMPACT BOOKING FORM (2-tab) ============ */}
      <section className="booking-hero" id="booking-form-top">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--color-gold)' }}>
            <i className="bi bi-airplane"></i> Charter a Private Jet
          </span>
          <h1 className="booking-hero__title">An Enquiry to a Full Charter</h1>

          {airportsError && (
            <div className="alert-warn" style={{
              marginBottom: '1.25rem', display: 'flex',
              alignItems: 'center', gap: '0.6rem',
              background: '#fffbeb', border: '1px solid #f59e0b',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
              fontSize: '0.875rem', color: '#92400e',
            }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{airportsError}</span>
            </div>
          )}

          <div className="booking-hero__layout">

            {/* ── Form column ── */}
            <div className="booking-hero__form-col">

              {/* Tab indicator */}
              <div className="booking-tabs">
                {FORM_STEPS.map((s, i) => (
                  <div key={i} className={`booking-tab${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
                    <span className="booking-tab__num">
                      {i < step ? <i className="bi bi-check-lg"></i> : i + 1}
                    </span>
                    <span className="booking-tab__label">{s.label}</span>
                    {i < FORM_STEPS.length - 1 && <span className="booking-tab__sep"></span>}
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="booking-card booking-card--compact">

                {error && (
                  <div className="alert-error" style={{ margin: '1.25rem 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>{error}</span>
                  </div>
                )}
                {stepError && (
                  <div className="alert-error" style={{ margin: '1.25rem 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{stepError}</span>
                  </div>
                )}

                {/* ── STEP 0: Travel Details ── */}
                {step === 0 && (
                  <div className="booking-card__body">
                    <div className="tabs-gov" style={{ marginBottom: '1.25rem' }}>
                      {TRIP_TYPES.map(([v, l]) => (
                        <button
                          key={v}
                          type="button"
                          className={`tab-btn ${form.trip_type === v ? 'active' : ''}`}
                          onClick={() => set('trip_type', v)}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label-gov">
                          From <span className="required">*</span>
                        </label>
                        {airports.length > 0 || airportsLoading ? (
                          <AirportCombobox
                            airports={airports}
                            airportsLoading={airportsLoading}
                            value={form.origin}
                            onChange={v => set('origin', v)}
                            placeholder="Type city or airport code…"
                            required
                          />
                        ) : (
                          <input
                            className="form-input-gov"
                            placeholder="Origin airport / city"
                            value={form.origin}
                            onChange={e => set('origin', e.target.value)}
                            required
                          />
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label-gov">
                          To <span className="required">*</span>
                        </label>
                        {airports.length > 0 || airportsLoading ? (
                          <AirportCombobox
                            airports={airports}
                            airportsLoading={airportsLoading}
                            value={form.destination}
                            onChange={v => set('destination', v)}
                            placeholder="Type city or airport code…"
                            required
                          />
                        ) : (
                          <input
                            className="form-input-gov"
                            placeholder="Destination airport / city"
                            value={form.destination}
                            onChange={e => set('destination', e.target.value)}
                            required
                          />
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label-gov">
                          Departure Date <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-input-gov"
                          value={form.departure_date}
                          onChange={e => set('departure_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label-gov">Departure Time</label>
                        <input
                          type="time"
                          className="form-input-gov"
                          value={form.departure_time}
                          onChange={e => set('departure_time', e.target.value)}
                        />
                      </div>

                      {form.trip_type === 'round_trip' && (
                        <div className="form-group">
                          <label className="form-label-gov">
                            Return Date <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-input-gov"
                            value={form.return_date}
                            onChange={e => set('return_date', e.target.value)}
                            min={form.departure_date || new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label-gov">
                          Passengers <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          className="form-input-gov"
                          value={form.passenger_count}
                          onChange={e => set('passenger_count', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label-gov">Preferred Aircraft Category</label>
                      <select
                        className="form-input-gov"
                        value={form.preferred_category}
                        onChange={e => set('preferred_category', e.target.value)}
                      >
                        <option value="">No preference — we'll recommend the best fit</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="booking-step-nav">
                      <span></span>
                      <button type="button" className="btn-primary-gov" onClick={next}>
                        Next: Contact & Confirmation <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Contact & Confirmation ── */}
                {step === 1 && (
                  <div className="booking-card__body">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label-gov">
                          Full Name <span className="required">*</span>
                        </label>
                        <input
                          className="form-input-gov"
                          value={form.guest_name}
                          onChange={e => set('guest_name', e.target.value)}
                          required
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label-gov">
                          Email <span className="required">*</span>
                        </label>
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
                          placeholder="+254 724 878 136"
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

                    <div className="form-group" style={{ marginTop: '0.25rem' }}>
                      <label className="form-label-gov">Add-on Services</label>
                      <div className="checkbox-group">
                        {[
                          ['catering_requested',          'bi-cup-hot',   'In-Flight Catering'],
                          ['ground_transport_requested',  'bi-car-front', 'Ground Transport'],
                          ['concierge_requested',         'bi-headset',   'Concierge Service'],
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

                    <div className="form-group">
                      <label className="form-label-gov">Special Requests or Preferences</label>
                      <textarea
                        className="form-input-gov"
                        rows={3}
                        value={form.special_requests}
                        onChange={e => set('special_requests', e.target.value)}
                        placeholder="Dietary requirements, specific aircraft preferences, occasions to celebrate, or any other details we should know..."
                      />
                      <div className="form-hint">We'll do our best to accommodate all requests</div>
                    </div>

                    <div className="booking-step-nav">
                      <button type="button" className="btn-outline-gov" onClick={back}>
                        <i className="bi bi-arrow-left"></i> Back
                      </button>
                      <button
                        type="submit"
                        className="btn-primary-gov btn-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                            &nbsp; Submitting Request…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send"></i> Submit Charter Request
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-center" style={{
                      marginTop: '1rem', fontSize: '0.8rem',
                      color: 'var(--color-mid-gray)',
                    }}>
                      <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2–4 hours.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* ── Side panel: Consultant card (reference-style) ── */}
            <div className="booking-hero__side">
              <div className="consultant-card">
                <div className="consultant-card__image">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60"
                    alt="Private aviation consultant"
                  />
                  <div className="consultant-card__overlay" />
                </div>
                <div className="consultant-card__body">
                  <h3>Speak to Our Private Aviation Consultant</h3>
                  <p>Our specialists are on hand to talk through your itinerary, answer questions, and help you book with confidence.</p>
                  <a href="tel:+254724878136" className="btn-primary-gov" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="bi bi-telephone"></i> Call Now
                  </a>
                  <a href="mailto:nairobijethouse@gmail.com" className="btn-outline-gov" style={{ width: '100%',color: 'white', justifyContent: 'center', marginTop: '0.6rem' }}>
                    <i className="bi bi-envelope"></i> nairobijethouse@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>

          <p className="booking-hero__footnote">
            <i className="bi bi-shield-check"></i> We always aim to provide the best offer — our team will contact you to discuss your trip.
          </p>
        </div>
      </section>
      {/* ============ WHY CHOOSE US ============ */}
      <section className="section-padding why-us">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us for Private Jet Rental?</h2>
          <div className="why-us__grid">
            <div className="why-us__image">
              <img
                src="https://images.unsplash.com/photo-1681157405319-3040bcf2be39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fHdoeSUyMGNob29zZSUyMHVzJTIwYWlycGxhbmV8ZW58MHx8MHx8fDA%3D"
                alt="Private jet on tarmac at golden hour"
              />
            </div>
            <div className="why-us__props">
              {VALUE_PROPS.map((vp, i) => (
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

      {/* ============ FLEXIBILITY / COMFORT SPLIT ============ */}
      <section className="section-padding flex-split">
        <div className="container flex-split__grid">
          <div className="flex-split__text">
            <span className="section-label">Travel On Your Terms</span>
            <h2 className="section-title">Maximum Flexibility, Comfort and Privacy</h2>
            <p>No matter the destination or how tight a schedule you have to keep, we listen to your requirements and provide charter options that genuinely work for you.</p>
            <p>Whether for business or leisure, charter a private jet with NairobiJetHouse and experience the freedom of flying into and out of more airports worldwide than any commercial airline can reach. We help you get closer to your destination — wherever it is and whenever you need to be there.</p>
            <p>Leave the complex planning to our flight managers, and focus on what brought you to private aviation in the first place.</p>
          </div>
          <div className="flex-split__image">
            <img
              src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=700&auto=format&fit=crop&q=60"
              alt="Family relaxing aboard a private jet cabin"
            />
          </div>
        </div>
      </section>

      {/* ============ CARBON OFFSETTING ============ */}
      <section className="section-padding offset-section">
        <div className="container offset-section__grid">
          <div className="offset-section__chart">
            <h3 className="offset-section__chart-title">Carbon Offset Pricing <span>(per flight hour)</span></h3>
            {OFFSET_PRICING.map((row, i) => (
              <div key={i} className="offset-bar-row">
                <div className="offset-bar-row__label">{row.category}</div>
                <div className="offset-bar-row__track">
                  <div className="offset-bar-row__fill" style={{ width: `${row.pct}%` }}></div>
                </div>
                <div className="offset-bar-row__price">${row.price}</div>
              </div>
            ))}
          </div>
          <div className="offset-section__text">
            <span className="section-label">Sustainability</span>
            <h2 className="section-title">100% Carbon Offsetting</h2>
            <p>We're committed to more sustainable aviation. On request, we offer the option to fully offset the carbon emissions from your flight, based on aircraft size and flight duration.</p>
            <p>Offsetting costs are simple and transparent — for example, around $9 per flight hour for a turboprop or $69 per hour for a VIP airliner. Whether it's a short hop or a long haul, you can travel with confidence knowing you're helping fund verified emissions-reduction projects.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button onClick={scrollToForm} className="btn-primary-gov">
                <i className="bi bi-send"></i> Request a Quote
              </button>
              <Link to="/contact" className="btn-outline-gov">
                <i className="bi bi-envelope"></i> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* ============ SERVICE CATEGORIES GRID ============ */}
      <section className="service-categories">
        <div className="service-categories__grid">
          {SERVICE_CATEGORIES.map((cat, i) => (
            cat.isCta ? (
              <button
                key={i}
                onClick={scrollToForm}
                className="svc-cat-tile svc-cat-tile--cta"
              >
                <i className={`bi ${cat.icon}`}></i>
                <span>{cat.label}</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <div key={i} className="svc-cat-tile">
                <img src={cat.img} alt={cat.label} className="svc-cat-tile__bg" />
                <div className="svc-cat-tile__overlay" />
                <div className="svc-cat-tile__content">
                  <i className={`bi ${cat.icon}`}></i>
                  <span>{cat.label}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* ============ CABIN GALLERY BANNER ============ */}
      <section className="cabin-gallery">
        <img
          src="https://chapmanfreeborn.aero/wp-content/uploads/2023/05/Group-Air-secondary.jpg.webp"
          alt="Luxury private jet cabin interior"
        />
      </section>

      {/* ============ ABOUT + STATS SPLIT ============ */}
      <section className="section-padding about-stats">
        <div className="container about-stats__grid">
          <div className="about-stats__image">
            <div className="about-stats__stats-overlay">
              {COMPANY_STATS.map((s, i) => (
                <div key={i} className="about-stat">
                  <div className="about-stat__value">{s.value}</div>
                  <div className="about-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-stats__text">
            <span className="section-label">NairobiJetHouse</span>
            <h2 className="section-title">Experts in Luxury Private Jet Charters</h2>
            <p>We're proud to serve leading corporations, HNWIs, travel industry partners, and iconic names from the entertainment business — from medevac flights to music tours, we deliver every step with the same care.</p>
            <p>We're reachable 24 hours a day, 365 days a year, so you always have the support you need at each step of your charter. We benefit from real-time access to the latest information on aircraft availability through our network of specialist charter jet suppliers.</p>
            <p>It allows us to offer the widest range of aircraft and operator options carefully matched to your requirements. No matter your reasons for hiring a private jet, our expert team is ready to be at your service.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Link to="/about" className="btn-primary-gov">
                <i className="bi bi-info-circle"></i> More About Us
              </Link>
              <Link to="/careers" className="btn-outline-gov">
                <i className="bi bi-envelope"></i> Careers
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* ============ FLEET CAROUSEL ============ */}
      <section className="section-padding fleet-section">
        <div className="container">
          <h2 className="section-title text-center">Access to 10,000+ Private Jets Aircraft</h2>

          <div className="fleet-filters">
            <button
              className={`fleet-filter-btn${fleetFilter === 'all' ? ' active' : ''}`}
              onClick={() => setFleetFilter('all')}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`fleet-filter-btn${fleetFilter === c ? ' active' : ''}`}
                onClick={() => setFleetFilter(c)}
              >
                {CATEGORY_NAMES[c]}
              </button>
            ))}
          </div>

          {fleetLoading ? (
            <div className="fleet-status">
              <div className="spinner-gov" style={{ margin: '0 auto 0.75rem' }}></div>
              Loading fleet…
            </div>
          ) : fleetError ? (
            <div className="alert-warn" style={{
              textAlign: 'center', display: 'block',
              background: '#fffbeb', border: '1px solid #f59e0b',
              borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
              fontSize: '0.875rem', color: '#92400e',
            }}>
              <i className="bi bi-exclamation-triangle"></i> {fleetError}
            </div>
          ) : filteredFleet.length === 0 ? (
            <div className="fleet-status">
              <i className="bi bi-airplane" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', color: 'var(--color-light-gray)' }}></i>
              No aircraft found in this category right now.
            </div>
          ) : (
            <div className="fleet-aircraft-grid">
              {filteredFleet.map(ac => (
                <FleetAircraftCard key={ac.id} ac={ac} onBook={bookThisAircraft} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ POPULAR DESTINATIONS ============ */}
      <section className="section-padding destinations-section">
        <div className="container">
          <h2 className="section-title text-center">Popular Destinations</h2>
          <div className="destinations-grid">
            {DESTINATIONS.map((d, i) => (
              <Link to="/book-flight" key={i} className="destination-card" onClick={scrollToForm}>
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
            <h2>Request a Quote</h2>
            <p>With years of experience in the private jet charter market, our team of experts ensures you always get the latest prices and the perfect options to suit your itinerary.</p>
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
            <h2 className="section-title">FAQs</h2>
            <p style={{ color: 'var(--color-mid-gray)', marginTop: '0.75rem' }}>
              Thank you for your interest in private jet charter services. To assist you further, we've curated a collection of frequently asked questions addressing your initial queries. If you have any additional queries, do not hesitate to contact us.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Link to="/contact" className="btn-outline-gov">
                <i className="bi bi-chat"></i> Get in Touch
              </Link>
            </div>
          </div>
          <div className="faq-section__right">
            {FAQS.map((faq, i) => (
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

      {/* ============ RELATED NEWS & BLOGS ============ */}
      <section className="section-padding related-section">
        <div className="container">
          <h2 className="section-title">Related News & Blogs</h2>
          <div className="related-grid">
            {RELATED_POSTS.map((post, i) => (
              <div key={i} className="related-card">
                <div className="related-card__image">
                  <img src={post.img} alt={post.title} />
                  <span className="related-card__tag">{post.tag}</span>
                </div>
                <p>{post.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
      <PageStyles />

      {/* ── Book This Aircraft Modal ── */}
      <FleetBookModal
        open={!!fleetModalAircraft}
        onClose={closeFleetModal}
        aircraft={fleetModalAircraft}
        airports={airports}
        airportsLoading={airportsLoading}
      />
    </>
  );
}
// ── Extracted style blocks ────────────────────────────────────────────────────
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
      .booking-success__actions {
        display: flex; gap: 1rem;
        justify-content: center; flex-wrap: wrap;
      }
      @media (max-width: 480px) {
        .booking-success__actions { flex-direction: column; }
        .booking-success__actions a { width: 100%; justify-content: center; }
      }
    `}</style>
  );
}

function PageStyles() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }

      .text-center { text-align: center; }

      /* ============ BOOKING HERO (compact tabbed form) ============ */
      .booking-hero {
        padding: 3rem 0 2.5rem;
        background: var(--color-off-white);
      }
      .booking-hero__title {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        color: var(--color-navy);
        margin: 0.4rem 0 1.5rem;
      }
      .booking-hero__layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 2rem;
        align-items: start;
      }
      .booking-hero__form-col { min-width: 0; }
      .booking-hero__side { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 1.5rem; }
      .booking-hero__footnote {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.85rem;
        color: var(--color-mid-gray);
      }

      /* Tabs */
      .booking-tabs {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      .booking-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
      }
      .booking-tab__num {
        width: 28px; height: 28px;
        border-radius: 50%;
        border: 2px solid var(--color-light-gray);
        background: var(--color-white);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 700;
        color: var(--color-mid-gray);
        flex-shrink: 0;
        transition: all 0.25s;
      }
      .booking-tab.active .booking-tab__num {
        border-color: var(--color-navy);
        background: var(--color-navy);
        color: var(--color-white);
      }
      .booking-tab.done .booking-tab__num {
        border-color: var(--color-gold);
        background: var(--color-gold);
        color: var(--color-navy);
      }
      .booking-tab__label {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--color-mid-gray);
        font-family: var(--font-label, sans-serif);
        white-space: nowrap;
      }
      .booking-tab.active .booking-tab__label { color: var(--color-navy); }
      .booking-tab.done .booking-tab__label { color: var(--color-gold); }
      .booking-tab__sep {
        flex: 1;
        height: 1px;
        background: var(--color-light-gray);
        margin: 0 0.75rem;
      }

      .booking-card--compact { margin-bottom: 0; }
      .booking-step-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--color-light-gray);
        gap: 1rem;
      }

      /* Consultant side card */
      .consultant-card {
        background: var(--color-navy);
        border-radius: var(--radius-md);
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      .consultant-card__image {
        position: relative;
        height: 260px;
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
      }
      .consultant-card__body p {
        color: rgba(255,255,255,0.75);
        font-size: 0.85rem;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .booking-card {
        background: var(--color-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .booking-card__header {
        background: var(--color-navy);
        color: var(--color-white);
        padding: 1rem 1.5rem;
        font-family: var(--font-label);
        font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .booking-card__header i { color: var(--color-gold); font-size: 1rem; }
      .booking-card__body { padding: 1.5rem; }

      .checkbox-group { display: flex; gap: 1.5rem; flex-wrap: wrap; }
      .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--color-dark-gray); }
      .checkbox-label input[type="checkbox"] { width: 17px; height: 17px; accent-color: var(--color-navy); cursor: pointer; }


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


      .flex-split { background: var(--color-off-white); }
      .flex-split__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }
      .flex-split__text p { color: var(--color-mid-gray); line-height: 1.75; margin-bottom: 0.75rem; }
      .flex-split__image img {
        width: 100%; height: 420px;
        object-fit: cover;
        border-radius: var(--radius-md);
      }


      .offset-section__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }
      .offset-section__chart-title {
        font-size: 0.95rem; font-weight: 700;
        color: var(--color-navy);
        margin-bottom: 1.5rem;
        font-family: var(--font-label, sans-serif);
      }
      .offset-section__chart-title span { color: var(--color-mid-gray); font-weight: 400; font-size: 0.8rem; }
      .offset-bar-row {
        display: grid;
        grid-template-columns: 130px 1fr 40px;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.65rem;
      }
      .offset-bar-row__label { font-size: 0.75rem; color: var(--color-dark-gray); }
      .offset-bar-row__track {
        height: 10px;
        background: var(--color-off-white);
        border-radius: 6px;
        overflow: hidden;
      }
      .offset-bar-row__fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-navy), var(--color-navy-light));
        border-radius: 6px;
      }
      .offset-bar-row__price { font-size: 0.78rem; font-weight: 700; color: var(--color-navy); text-align: right; }
      .offset-section__text p { color: var(--color-mid-gray); line-height: 1.75; margin-bottom: 0.75rem; }


      .service-categories__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }
      .svc-cat-tile {
        position: relative;
        height: 200px;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
      }
      .svc-cat-tile__bg {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .svc-cat-tile:hover .svc-cat-tile__bg { transform: scale(1.06); }
      .svc-cat-tile__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.2) 70%);
        z-index: 1;
      }
      .svc-cat-tile__content {
        position: relative; z-index: 2;
        padding: 1.25rem;
        color: var(--color-white);
        display: flex; align-items: center; gap: 0.6rem;
        font-size: 0.95rem; font-weight: 600;
        font-family: var(--font-label, sans-serif);
      }
      .svc-cat-tile__content i { color: var(--color-gold); font-size: 1.1rem; }
      .svc-cat-tile--cta {
        background: var(--color-gold);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 0.5rem;
        color: var(--color-navy); font-weight: 700; font-size: 1rem;
        font-family: var(--font-label, sans-serif);
        border: none; cursor: pointer;
        transition: background 0.2s;
        width: 100%;
      }
      .svc-cat-tile--cta:hover { background: #e8c55a; }
      .svc-cat-tile--cta i { font-size: 1.4rem; color: var(--color-navy); }
      .svc-cat-tile--cta span { color: var(--color-navy); }


      .cabin-gallery { width: 100%; line-height: 0; }
      .cabin-gallery img {
        width: 100%; height: 460px;
        object-fit: cover;
        display: block;
      }


      .about-stats { background: var(--color-off-white); }
      .about-stats__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }
      .about-stats__image {
        background: var(--color-navy);
        border-radius: var(--radius-md);
        min-height: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .about-stats__stats-overlay {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 2rem;
        position: relative;
        z-index: 1;
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


      /* ============ FLEET SECTION (matches HomePage featured-aircraft cards) ===== */
      .fleet-filters {
        display: flex; gap: 0.6rem; flex-wrap: wrap;
        justify-content: center;
        margin: 1.75rem 0 2rem;
      }
      .fleet-filter-btn {
        padding: 0.45rem 1rem;
        border: 1.5px solid var(--color-light-gray);
        background: var(--color-white);
        border-radius: 2rem;
        font-size: 0.78rem; font-weight: 600;
        color: var(--color-mid-gray);
        cursor: pointer;
        transition: all var(--transition-fast);
        white-space: nowrap;
      }
      .fleet-filter-btn.active {
        border-color: var(--color-navy);
        background: var(--color-navy);
        color: var(--color-white);
      }

      .fleet-status {
        text-align: center;
        padding: 2.5rem 0;
        color: var(--color-mid-gray);
        font-size: 0.9rem;
      }

      .fleet-aircraft-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.75rem;
      }

      .fleet-aircraft-card {
        background: var(--color-white);
        border-radius: 12px;
        border: 1px solid #e8edf4;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 12px rgba(11,29,58,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }

      .fleet-aircraft-card__image {
        position: relative;
        height: 210px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .fleet-aircraft-card__image img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      }
      .fleet-aircraft-card__image-fallback {
        width: 100%; height: 100%;
        background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light, #1a3460) 100%);
        display: flex; align-items: center; justify-content: center;
      }
      .fleet-aircraft-card__image-fallback i {
        font-size: 3rem;
        color: rgba(201,168,76,0.4);
      }

      .fleet-aircraft-card__badge {
        position: absolute;
        top: 14px;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .fleet-aircraft-card__badge--category {
        left: 14px;
        background: rgba(11,29,58,0.82);
        backdrop-filter: blur(6px);
        color: var(--color-gold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        border: 1px solid rgba(201,168,76,0.3);
      }
      .fleet-aircraft-card__badge--rate {
        right: 14px;
        background: var(--color-gold);
        color: var(--color-navy);
      }
      .fleet-aircraft-card__badge--rate span {
        font-weight: 500;
        font-size: 0.6rem;
      }

      .fleet-aircraft-card__body {
        padding: 1.35rem 1.4rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .fleet-aircraft-card__name {
        font-family: var(--font-serif, Georgia, serif);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-navy);
        margin-bottom: 0.9rem;
        line-height: 1.25;
      }

      .fleet-aircraft-card__specs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem;
        margin-bottom: 1.1rem;
      }
      .fleet-aircraft-card__spec {
        background: var(--color-off-white);
        border-radius: 7px;
        padding: 0.55rem 0.7rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .fleet-aircraft-card__spec-label {
        display: flex; align-items: center; gap: 0.3rem;
        font-size: 0.62rem; font-weight: 600;
        color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
      }
      .fleet-aircraft-card__spec-value {
        font-size: 0.82rem; font-weight: 600;
        color: var(--color-navy);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .fleet-aircraft-card__divider {
        height: 1px;
        background: var(--color-off-white);
        margin-bottom: 1.1rem;
      }

      /* Responsive button row */
      @media (max-width: 480px) {
        .fleet-aircraft-card__body > div:last-child {
          flex-direction: column;
        }
        .fleet-aircraft-card__body > div:last-child button,
        .fleet-aircraft-card__body > div:last-child a {
          width: 100%;
        }
      }


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
      .quote-banner h2 { color: var(--color-white); margin-bottom: 0.5rem; }
      .quote-banner p { color: rgba(255,255,255,0.75); max-width: 520px; margin: 0; line-height: 1.6; }


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


      .related-section { background: var(--color-off-white); }
      .related-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-top: 1.5rem;
      }
      .related-card { cursor: pointer; }
      .related-card__image {
        position: relative;
        height: 160px;
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: 0.75rem;
      }
      .related-card__image img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.3s ease;
      }
      .related-card:hover .related-card__image img { transform: scale(1.05); }
      .related-card__tag {
        position: absolute; top: 0.75rem; left: 0.75rem;
        background: var(--color-gold);
        color: var(--color-navy);
        font-size: 0.65rem; font-weight: 700;
        letter-spacing: 0.5px;
        padding: 0.25rem 0.6rem;
        border-radius: 2px;
      }
      .related-card p {
        font-size: 0.875rem;
        color: var(--color-navy);
        font-weight: 600;
        line-height: 1.45;
        margin: 0;
      }

      @media (max-width: 1024px) {
        .booking-hero__layout { grid-template-columns: 1fr; }
        .booking-hero__side {
          position: static;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .consultant-card { grid-column: 1 / -1; }
        .why-us__grid { grid-template-columns: 1fr; }
        .why-us__image img { height: 320px; }
        .flex-split__grid,
        .offset-section__grid,
        .about-stats__grid,
        .faq-section__grid {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .about-stats__image { order: -1; min-height: 320px; }
        .service-categories__grid { grid-template-columns: repeat(2, 1fr); }
        .destinations-grid { grid-template-columns: repeat(3, 1fr); }
        .related-grid { grid-template-columns: repeat(2, 1fr); }
        .fleet-aircraft-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 768px) {
        .booking-hero__side { grid-template-columns: 1fr; }
        .booking-tab__label { display: none; }
        .booking-tab__sep { margin: 0 0.4rem; }
        .why-us__props { grid-template-columns: 1fr; }
        .service-categories__grid { grid-template-columns: 1fr; }
        .destinations-grid { grid-template-columns: repeat(2, 1fr); }
        .about-stats__stats-overlay { gap: 1.25rem; padding: 1.5rem; }
        .about-stat__value { font-size: 1.8rem; }
        .cabin-gallery img { height: 280px; }
        .quote-banner__inner { flex-direction: column; text-align: center; }
        .booking-step-nav { flex-direction: column; align-items: stretch; }
        .booking-step-nav button { width: 100%; justify-content: center; }
        .fleet-aircraft-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 600px) {
        .destinations-grid { grid-template-columns: 1fr; }
        .related-grid { grid-template-columns: 1fr; }
        .offset-bar-row { grid-template-columns: 90px 1fr 32px; gap: 0.5rem; }
        .offset-bar-row__label { font-size: 0.68rem; }
      }
    `}</style>
  );
}