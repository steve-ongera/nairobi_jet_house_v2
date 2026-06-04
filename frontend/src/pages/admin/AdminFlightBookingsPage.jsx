import { useState, useEffect, useCallback, useRef } from 'react'
import { adminAPI } from '../../services/api'

// ── npm install jspdf html2canvas ──────────────────────────────────────────────

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: '#f59e0b',
  rfq_sent: '#0f2d5e',
  quoted: '#0f2d5e',
  confirmed: '#22c55e',
  in_flight: '#22c55e',
  completed: '#64748b',
  cancelled: '#ef4444'
}
const STATUS_LABEL = {
  inquiry: 'Inquiry', rfq_sent: 'RFQ Sent', quoted: 'Quoted',
  confirmed: 'Confirmed', in_flight: 'In Flight', completed: 'Completed', cancelled: 'Cancelled'
}

// ── NJH Company Data ──────────────────────────────────────────────────────────
const NJH = {
  name: 'Nairobi Jet House',
  tagline: 'Private Aviation & Luxury Charter Services',
  address: 'JKIA Executive Terminal, Airport North Road, Nairobi, Kenya',
  phone: '+254 700 000 000',
  email: 'charters@nairobijethouse.com',
  website: 'www.nairobijethouse.com',
  poBox: 'P.O. Box 12345 – 00100, Nairobi, Kenya',
  bank: {
    name: 'Equity Bank Kenya',
    account: '0260284168802',
    swift: 'EQBLKENA',
    branch: 'Upper Hill Branch',
  },
  mpesa: 'Paybill: 400200 | Account: NJH-CHARTER',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem', background: `${color}15`, color,
      border: `1px solid ${color}30`, borderRadius: '6px',
      fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize'
    }}>
      {STATUS_LABEL[status] || status?.replace(/_/g, ' ')}
    </span>
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  const maxW = size === 'xl' ? '900px' : size === 'lg' ? '640px' : size === 'md' ? '480px' : '360px'
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5,20,43,0.65)',
      backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)', borderRadius: '12px',
        width: '100%', maxWidth: maxW, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--color-mid-gray)', padding: '0.25rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Deterministic QR-like SVG cells ──────────────────────────────────────────
function generateQRCells(value) {
  const cells = 19
  const cellSize = Math.floor(84 / cells)
  let svg = ''
  const hash = (s, i) => {
    let h = 5381 + i
    for (let j = 0; j < s.length; j++) h = ((h << 5) + h) + s.charCodeAt(j)
    return Math.abs(h)
  }
  const inFinder = (r, c) =>
    (r <= 6 && c <= 6) || (r <= 6 && c >= cells - 7) || (r >= cells - 7 && c <= 6)
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const fill = inFinder(r, c) ? '#0f2d5e' : (hash(value, r * cells + c) % 3 !== 0 ? '#0f2d5e' : null)
      if (fill) svg += `<rect x="${c * cellSize + 2}" y="${r * cellSize + 2}" width="${cellSize}" height="${cellSize}" fill="${fill}"/>`
    }
  }
  return svg
}

// ── Route Map SVG ─────────────────────────────────────────────────────────────
// Renders a mini globe-style route map: two airport pins connected by a curved
// dashed flight arc with a small aircraft icon at the midpoint.
// originCode / destCode are IATA codes for labelling.
// The "globe" is a simple SVG circle with latitude/longitude grid lines.
function buildRouteMapSVG(originCode, originCity, destCode, destCity) {
  const W = 740, H = 180
  // Pin positions — left third for origin, right third for dest
  const ox = 160, oy = 95
  const dx = W - 160, dy = 95
  // Bezier control point: arc up above midpoint
  const mx = W / 2, my = 28
  // Midpoint along cubic bezier at t=0.5 (approx)
  const bx = W / 2
  const by = (oy + dy) / 2 - 28   // just above midline

  return `
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block">
  <defs>
    <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#dde8f5"/>
      <stop offset="100%" stop-color="#b8cfe8"/>
    </radialGradient>
    <radialGradient id="globeGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#dde8f5"/>
      <stop offset="100%" stop-color="#b8cfe8"/>
    </radialGradient>
    <clipPath id="globeClip1">
      <circle cx="${ox}" cy="${oy}" r="38"/>
    </clipPath>
    <clipPath id="globeClip2">
      <circle cx="${dx}" cy="${dy}" r="38"/>
    </clipPath>
    <filter id="pinShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f2d5e" flood-opacity="0.22"/>
    </filter>
    <filter id="planeShadow">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#0f2d5e" flood-opacity="0.25"/>
    </filter>
    <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#c9a84c" opacity="0.7"/>
    </marker>
  </defs>

  <!-- ── Background track line (full width subtle) ── -->
  <line x1="${ox}" y1="${oy}" x2="${dx}" y2="${dy}"
    stroke="#d0dce8" stroke-width="1" stroke-dasharray="4 6" opacity="0.5"/>

  <!-- ── ORIGIN GLOBE ── -->
  <!-- Globe circle -->
  <circle cx="${ox}" cy="${oy}" r="38" fill="url(#globeGrad)" stroke="#7fa8cf" stroke-width="1.2"/>
  <!-- Globe grid lines clipped inside globe -->
  <g clip-path="url(#globeClip1)">
    <!-- Latitude lines -->
    <ellipse cx="${ox}" cy="${oy}" rx="38" ry="14" fill="none" stroke="#8ab0d0" stroke-width="0.6" opacity="0.7"/>
    <ellipse cx="${ox}" cy="${oy - 14}" rx="36" ry="10" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.5"/>
    <ellipse cx="${ox}" cy="${oy + 14}" rx="36" ry="10" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.5"/>
    <!-- Longitude lines -->
    <ellipse cx="${ox}" cy="${oy}" rx="14" ry="38" fill="none" stroke="#8ab0d0" stroke-width="0.6" opacity="0.7"/>
    <ellipse cx="${ox}" cy="${oy}" rx="28" ry="38" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.4"/>
    <!-- Continent blobs (abstract) -->
    <ellipse cx="${ox - 8}" cy="${oy - 6}" rx="10" ry="7" fill="#a8c5a0" opacity="0.55"/>
    <ellipse cx="${ox + 10}" cy="${oy + 5}" rx="8" ry="5" fill="#a8c5a0" opacity="0.45"/>
    <ellipse cx="${ox - 2}" cy="${oy + 12}" rx="6" ry="4" fill="#a8c5a0" opacity="0.35"/>
  </g>
  <!-- Globe border highlight -->
  <circle cx="${ox}" cy="${oy}" r="38" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>

  <!-- ── ORIGIN PIN ── -->
  <g filter="url(#pinShadow)">
    <!-- Pin body -->
    <path d="M${ox},${oy - 6} m-9,0 a9,9 0 1,1 18,0 a9,9 0 0,1 -9,13 Z"
      fill="#0f2d5e" opacity="0.95"/>
    <!-- Pin inner dot -->
    <circle cx="${ox}" cy="${oy - 6}" r="3.5" fill="white"/>
    <!-- Pin glow -->
    <circle cx="${ox}" cy="${oy - 6}" r="5" fill="none" stroke="white" stroke-width="1" opacity="0.4"/>
  </g>
  <!-- Origin pulse rings -->
  <circle cx="${ox}" cy="${oy - 6}" r="12" fill="none" stroke="#0f2d5e" stroke-width="1" opacity="0.18"/>
  <circle cx="${ox}" cy="${oy - 6}" r="17" fill="none" stroke="#0f2d5e" stroke-width="0.7" opacity="0.1"/>

  <!-- Origin label -->
  <text x="${ox}" y="${oy + 48}" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="15" font-weight="700" fill="#0f2d5e">${originCode || 'NBO'}</text>
  <text x="${ox}" y="${oy + 62}" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9.5" fill="#6b82a0">${(originCity || '').slice(0, 18)}</text>

  <!-- ── DESTINATION GLOBE ── -->
  <circle cx="${dx}" cy="${dy}" r="38" fill="url(#globeGrad2)" stroke="#7fa8cf" stroke-width="1.2"/>
  <g clip-path="url(#globeClip2)">
    <ellipse cx="${dx}" cy="${dy}" rx="38" ry="14" fill="none" stroke="#8ab0d0" stroke-width="0.6" opacity="0.7"/>
    <ellipse cx="${dx}" cy="${dy - 14}" rx="36" ry="10" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.5"/>
    <ellipse cx="${dx}" cy="${dy + 14}" rx="36" ry="10" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.5"/>
    <ellipse cx="${dx}" cy="${dy}" rx="14" ry="38" fill="none" stroke="#8ab0d0" stroke-width="0.6" opacity="0.7"/>
    <ellipse cx="${dx}" cy="${dy}" rx="28" ry="38" fill="none" stroke="#8ab0d0" stroke-width="0.5" opacity="0.4"/>
    <ellipse cx="${dx + 6}" cy="${dy - 8}" rx="9" ry="6" fill="#a8c5a0" opacity="0.55"/>
    <ellipse cx="${dx - 10}" cy="${dy + 4}" rx="7" ry="5" fill="#a8c5a0" opacity="0.45"/>
    <ellipse cx="${dx + 2}" cy="${dy + 14}" rx="5" ry="3.5" fill="#a8c5a0" opacity="0.35"/>
  </g>
  <circle cx="${dx}" cy="${dy}" r="38" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>

  <!-- ── DESTINATION PIN ── -->
  <g filter="url(#pinShadow)">
    <path d="M${dx},${dy - 6} m-9,0 a9,9 0 1,1 18,0 a9,9 0 0,1 -9,13 Z"
      fill="#c9a84c" opacity="0.97"/>
    <circle cx="${dx}" cy="${dy - 6}" r="3.5" fill="white"/>
    <circle cx="${dx}" cy="${dy - 6}" r="5" fill="none" stroke="white" stroke-width="1" opacity="0.4"/>
  </g>
  <circle cx="${dx}" cy="${dy - 6}" r="12" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.22"/>
  <circle cx="${dx}" cy="${dy - 6}" r="17" fill="none" stroke="#c9a84c" stroke-width="0.7" opacity="0.12"/>

  <!-- Destination label -->
  <text x="${dx}" y="${dy + 48}" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="15" font-weight="700" fill="#0f2d5e">${destCode || 'DWC'}</text>
  <text x="${dx}" y="${dy + 62}" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9.5" fill="#6b82a0">${(destCity || '').slice(0, 18)}</text>

  <!-- ── FLIGHT ARC ── -->
  <!-- Shadow arc -->
  <path d="M${ox + 8},${oy - 12} Q${mx},${my - 8} ${dx - 8},${dy - 12}"
    fill="none" stroke="#0f2d5e" stroke-width="2.5" stroke-dasharray="7 5"
    opacity="0.08" stroke-linecap="round"/>
  <!-- Main dashed arc -->
  <path d="M${ox + 8},${oy - 12} Q${mx},${my - 8} ${dx - 8},${dy - 12}"
    fill="none" stroke="#c9a84c" stroke-width="2" stroke-dasharray="7 5"
    opacity="0.85" stroke-linecap="round"
    marker-end="url(#arrowHead)"/>

  <!-- ── AIRCRAFT ICON at arc midpoint ── -->
  <!-- Midpoint of quadratic bezier at t=0.5: (ox/4 + mx/2 + dx/4), same for y -->
  <g transform="translate(${(ox + 2 * mx + dx) / 4 - 12}, ${(oy - 12 + 2 * (my - 8) + dy - 12) / 4 - 12}) rotate(0)"
    filter="url(#planeShadow)">
    <!-- Aircraft silhouette facing right -->
    <g transform="translate(12,12) rotate(-15) scale(1.15)">
      <!-- Fuselage -->
      <ellipse cx="0" cy="0" rx="11" ry="3" fill="#0f2d5e"/>
      <!-- Wings -->
      <path d="M-2,-2 L-8,-9 L2,-9 L4,-2 Z" fill="#0f2d5e" opacity="0.9"/>
      <path d="M-2,2 L-6,8 L2,8 L4,2 Z" fill="#0f2d5e" opacity="0.7"/>
      <!-- Tail -->
      <path d="M-9,-1 L-13,-5 L-10,-1 Z" fill="#0f2d5e" opacity="0.8"/>
      <!-- Nose highlight -->
      <ellipse cx="8" cy="0" rx="3" ry="1.5" fill="#c9a84c" opacity="0.9"/>
      <!-- Window row -->
      <rect x="-1" y="-1.2" width="2" height="1.2" rx="0.6" fill="white" opacity="0.7"/>
      <rect x="2" y="-1.2" width="2" height="1.2" rx="0.6" fill="white" opacity="0.7"/>
      <rect x="5" y="-1.2" width="2" height="1.2" rx="0.6" fill="white" opacity="0.7"/>
    </g>
  </g>

  <!-- ── DISTANCE LABEL in arc centre ── -->
  <rect x="${mx - 38}" y="${my - 30}" width="76" height="18" rx="9"
    fill="#0f2d5e" opacity="0.82"/>
  <text x="${mx}" y="${my - 17}" text-anchor="middle"
    font-family="'DM Sans',sans-serif" font-size="10" font-weight="600" fill="#c9a84c"
    letter-spacing="0.5">DIRECT FLIGHT</text>

</svg>`
}

// ── Invoice HTML Generator ────────────────────────────────────────────────────
// CHANGES vs previous version:
//   1. Logo: <img src="/NJH-LOGO.png"> instead of text-only name
//   2. Stamp: <img src="/NJH-STAMP.png"> overlaid on signature block
//   3. Route map: inline SVG globe + arc inserted between itinerary sections
//   4. Image error handling: onError hides the img if file not found
function buildInvoiceHTML(booking, invoiceNo, invoiceDate, extraNotes, bankDetails) {
  const fmt = (v) => v
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionizedDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
    : '—'

  const origin     = booking.origin_detail?.code || booking.origin || '—'
  const dest       = booking.destination_detail?.code || booking.destination || '—'
  const originCity = booking.origin_detail?.city || ''
  const destCity   = booking.destination_detail?.city || ''
  const commission = booking.commission_usd
    ? Number(booking.commission_usd)
    : booking.quoted_price_usd && booking.commission_pct
      ? (Number(booking.quoted_price_usd) * Number(booking.commission_pct) / 100)
      : 0
  const subtotal  = Number(booking.quoted_price_usd || 0)
  const ref       = String(booking.reference || booking.id)

  // Route map SVG — inline so html2canvas captures it
  const routeMap = buildRouteMapSVG(origin, originCity, dest, destCity)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;background:#f4f1eb;color:#1a1a1a;font-size:13px}
  .page{max-width:820px;margin:0 auto;background:#fff;position:relative;overflow:hidden}
  .top-bar{height:6px;background:linear-gradient(90deg,#0f2d5e 0%,#c9a84c 50%,#0f2d5e 100%)}
  .header{padding:28px 40px 22px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e5e0d5}
  /* ── LOGO image — falls back gracefully if file missing ── */
  .logo-img{height:56px;width:auto;max-width:200px;object-fit:contain;display:block}
  .logo-fallback{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#0f2d5e;letter-spacing:0.5px}
  .logo-tagline{font-size:10px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;margin-top:4px;font-weight:600}
  .logo-sub{font-size:10px;color:#888;margin-top:6px;max-width:260px;line-height:1.5}
  .header-right{text-align:right}
  .inv-number{font-family:'Playfair Display',serif;font-size:18px;color:#0f2d5e;font-weight:700}
  .inv-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:3px}
  .inv-date{font-size:11px;color:#555;margin-top:6px}
  .watermark{
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);
    font-family:'Playfair Display',serif;font-size:90px;font-weight:700;
    color:rgba(15,45,94,0.04);pointer-events:none;white-space:nowrap;z-index:0;letter-spacing:8px
  }
  .content{padding:24px 40px;position:relative;z-index:1}
  .bill-qr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .bill-to h3{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;font-weight:600;margin-bottom:10px}
  .bill-to .client-name{font-family:'Playfair Display',serif;font-size:20px;color:#0f2d5e;font-weight:700;border-bottom:2px solid #c9a84c;padding-bottom:4px;margin-bottom:10px;display:inline-block}
  .bill-box{border:1px solid #e0d9cc;border-radius:6px;padding:12px 16px;min-width:240px;background:#faf8f4}
  .bill-box div{font-size:11.5px;color:#333;line-height:1.8}
  .bill-box span{color:#888;font-size:10.5px}
  .qr-section{text-align:center}
  .qr-section .qr-label{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-top:6px;font-weight:600}
  .qr-section .ref-text{font-family:monospace;font-size:8px;color:#0f2d5e;margin-top:2px}
  .section-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#0f2d5e;font-weight:700;
    padding:8px 0;border-bottom:2px solid #0f2d5e;margin-bottom:12px}
  /* ── Route map wrapper ── */
  .route-map-wrap{
    border:1px solid #dce8f0;border-radius:10px;overflow:hidden;
    margin-bottom:20px;background:linear-gradient(135deg,#eef4fb 0%,#f4f8fc 100%);
    padding:16px 20px 8px
  }
  .route-map-label{
    font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#0f2d5e;
    font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px
  }
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  thead tr{background:#0f2d5e}
  thead th{color:#fff;padding:9px 12px;text-align:left;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;font-weight:600}
  tbody tr{background:#faf8f4}
  tbody tr:nth-child(even){background:#f1ede4}
  tbody td{padding:10px 12px;font-size:12px;color:#333;border-bottom:1px solid #e5e0d5;vertical-align:middle}
  .td-gold{color:#c9a84c;font-weight:700}
  .cost-wrap{display:flex;justify-content:flex-end;margin-bottom:24px}
  .cost-table{width:340px;border:1px solid #e0d9cc;border-radius:8px;overflow:hidden}
  .cost-row{display:flex;justify-content:space-between;padding:9px 16px;border-bottom:1px solid #e0d9cc}
  .cost-row:last-child{border-bottom:none}
  .cost-row.total{background:#0f2d5e;color:#fff}
  .cost-row.total span:last-child{font-family:'Playfair Display',serif;font-size:16px;color:#c9a84c}
  .cost-label{font-size:11px;color:#555}
  .cost-val{font-size:12px;color:#1a1a1a;font-weight:600}
  .cost-row.sub{background:#faf8f4}
  .cost-row.comm{background:#f1ede4}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
  .info-box{border:1px solid #e0d9cc;border-radius:6px;padding:14px 16px;background:#faf8f4}
  .info-box h4{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:10px}
  .info-box div{font-size:11px;color:#444;line-height:2}
  .terms{border:1px solid #e5e0d5;border-radius:6px;padding:14px 16px;background:#faf8f4;margin-bottom:20px}
  .terms h4{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#0f2d5e;font-weight:700;margin-bottom:8px}
  .terms ol{padding-left:16px}
  .terms ol li{font-size:10.5px;color:#555;line-height:1.7;margin-bottom:2px}
  /* ── Signature block with stamp overlay ── */
  .sig-section{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:24px}
  .sig-box{position:relative}
  .sig-box h4{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:16px;font-weight:600}
  .sig-line{border-bottom:1px solid #333;margin-bottom:6px;height:40px}
  .sig-box p{font-size:10px;color:#888}
  /* NJH stamp image — positioned bottom-right of the NJH sig box */
  .stamp-img{
    position:absolute;bottom:-8px;right:0;
    width:90px;height:90px;object-fit:contain;
    opacity:0.82;pointer-events:none
  }
  .footer{background:#0f2d5e;color:#fff;padding:14px 40px;display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-size:10px;line-height:1.8;color:rgba(255,255,255,0.7)}
  .footer-right{font-size:14px;font-weight:700;color:#c9a84c;letter-spacing:0.5px}
  .status-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:1px;border:1.5px solid #c9a84c;color:#c9a84c;background:transparent}
</style>
</head>
<body>
<div class="page">
  <div class="watermark">CONFIDENTIAL</div>
  <div class="top-bar"></div>

  <!-- ══ HEADER with logo image ══ -->
  <div class="header">
    <div class="logo-section">
      <!-- Primary: PNG logo from /public/NJH-LOGO.png -->
      <img
        class="logo-img"
        src="/NJH-LOGO.png"
        alt="Nairobi Jet House"
        onerror="this.style.display='none';document.getElementById('logo-fallback').style.display='block'"
      />
      <!-- Fallback text if image fails to load -->
      <div id="logo-fallback" class="logo-fallback" style="display:none">&#9992; Nairobi Jet House</div>
      <div class="logo-tagline">Private Aviation &amp; Luxury Charter</div>
      <div class="logo-sub">${NJH.address}<br>${NJH.phone} &nbsp;|&nbsp; ${NJH.email}</div>
    </div>
    <div class="header-right">
      <div class="inv-label">Flight Invoice</div>
      <div class="inv-number">NJH-${invoiceNo}</div>
      <div class="inv-date">Date: ${invoiceDate}</div>
      <div style="margin-top:10px">
        <span class="status-pill">${STATUS_LABEL[booking.status] || booking.status || 'Quoted'}</span>
      </div>
    </div>
  </div>

  <div class="content">
    <!-- ══ BILL TO + QR ══ -->
    <div class="bill-qr">
      <div class="bill-to">
        <h3>Bill To</h3>
        <div class="client-name">${booking.guest_name || 'Client'}</div>
        <div class="bill-box">
          <div><span>Contact: </span>${booking.guest_name || '—'}</div>
          <div><span>Email: </span>${booking.guest_email || '—'}</div>
          <div><span>Phone: </span>${booking.guest_phone || 'TBC'}</div>
          <div><span>Company: </span>${booking.company || 'N/A'}</div>
          <div><span>Passport / ID: </span>TBC</div>
        </div>
      </div>
      <div class="qr-section">
        <div style="width:88px;height:88px;border:2px solid #0f2d5e;display:flex;align-items:center;justify-content:center;background:#f4f1eb">
          <svg viewBox="0 0 88 88" width="88" height="88" xmlns="http://www.w3.org/2000/svg">
            ${generateQRCells(ref)}
          </svg>
        </div>
        <div class="qr-label">Scan to Verify</div>
        <div class="ref-text">${ref.slice(0, 16)}…</div>
      </div>
    </div>

    <!-- ══ ROUTE MAP ══ -->
    <div class="route-map-wrap">
      <div class="route-map-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#0f2d5e" stroke-width="1.5"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#0f2d5e" stroke-width="1.2"/>
        </svg>
        Flight Route
      </div>
      ${routeMap}
    </div>

    <!-- ══ ITINERARY TABLE ══ -->
    <div class="section-title">Flight Itinerary</div>
    <table>
      <thead>
        <tr>
          <th>Date of Flight</th><th>Departure Airport</th><th>Arrival Airport</th>
          <th>Flight Duration</th><th>Dep. Time</th><th>Arr. Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-gold">${booking.departure_date || 'TBA'}</td>
          <td>${origin}${originCity ? ` — ${originCity}` : ''}</td>
          <td>${dest}${destCity ? ` — ${destCity}` : ''}</td>
          <td>TBC</td>
          <td>${booking.departure_time || 'TBC'}</td>
          <td>TBC</td>
        </tr>
        ${booking.return_date ? `<tr>
          <td class="td-gold">${booking.return_date}</td>
          <td>${dest}${destCity ? ` — ${destCity}` : ''}</td>
          <td>${origin}${originCity ? ` — ${originCity}` : ''}</td>
          <td>TBC</td><td>TBC</td><td>TBC</td>
        </tr>` : ''}
      </tbody>
    </table>

    <!-- ══ AIRCRAFT TABLE ══ -->
    <div class="section-title">Aircraft Details &amp; Charter Costs</div>
    <table>
      <thead>
        <tr>
          <th>Aircraft Type</th><th>Registration</th><th>Class</th>
          <th>Passengers</th><th>Trip Type</th><th>Amount USD</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-gold">${booking.aircraft_detail?.name || booking.aircraft || 'TBC'}</td>
          <td>${booking.aircraft_detail?.registration_number || 'TBC'}</td>
          <td>${booking.aircraft_detail?.category_display || 'Private Jet'}</td>
          <td>${booking.passenger_count || 1} Pax</td>
          <td style="text-transform:capitalize">${(booking.trip_type || 'one_way').replace(/_/g, ' ')}</td>
          <td class="td-gold" style="font-weight:700">${fmt(booking.quoted_price_usd)}</td>
        </tr>
        ${booking.catering_requested ? `<tr><td colspan="5">Catering &amp; Cabin Service</td><td class="td-gold">Included</td></tr>` : ''}
        ${booking.ground_transport_requested ? `<tr><td colspan="5">Ground Transportation</td><td class="td-gold">Included</td></tr>` : ''}
      </tbody>
    </table>

    <!-- ══ COST SUMMARY ══ -->
    <div class="cost-wrap">
      <div class="cost-table">
        <div class="cost-row sub">
          <span class="cost-label">Charter Flight Cost</span>
          <span class="cost-val">${fmt(booking.quoted_price_usd)}</span>
        </div>
        ${commission ? `<div class="cost-row comm">
          <span class="cost-label">NJH Service Fee (${booking.commission_pct || '15'}%)</span>
          <span class="cost-val">${fmt(commission)}</span>
        </div>` : ''}
        <div class="cost-row sub">
          <span class="cost-label">VAT</span>
          <span class="cost-val">—</span>
        </div>
        <div class="cost-row total">
          <span style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Grand Total</span>
          <span>${fmt(subtotal)}</span>
        </div>
      </div>
    </div>

    <!-- ══ PAYMENT DETAILS ══ -->
    <div class="two-col">
      <div class="info-box">
        <h4>Bank Transfer (USD)</h4>
        <div><strong>Account Name:</strong> ${NJH.name}</div>
        <div><strong>Account No:</strong> ${bankDetails?.account || NJH.bank.account}</div>
        <div><strong>Bank:</strong> ${bankDetails?.bankName || NJH.bank.name}</div>
        <div><strong>Swift:</strong> ${bankDetails?.swift || NJH.bank.swift}</div>
        <div><strong>Branch:</strong> ${bankDetails?.branch || NJH.bank.branch}</div>
      </div>
      <div class="info-box">
        <h4>M-Pesa / Mobile Pay</h4>
        <div>${NJH.mpesa}</div>
        <h4 style="margin-top:12px">Payment Terms</h4>
        <div>Payment due within <strong>5 business days</strong> of invoice date.</div>
        <div>Cancellation &lt;24h: <strong>100% penalty</strong></div>
        <div>Cancellation &lt;48h: <strong>50% penalty</strong></div>
      </div>
    </div>

    ${extraNotes ? `<div class="info-box" style="margin-bottom:20px">
      <h4>Additional Notes</h4>
      <div style="font-size:12px;line-height:1.7;color:#444">${extraNotes}</div>
    </div>` : ''}

    <!-- ══ TERMS ══ -->
    <div class="terms">
      <h4>Terms &amp; Conditions</h4>
      <ol>
        <li>Payment is due upon receipt of this invoice.</li>
        <li>All charter bookings are subject to aircraft availability at time of confirmation.</li>
        <li>This quote does not include travel insurance, visa fees, or airport passenger service charges unless stated.</li>
        <li>Nairobi Jet House reserves the right to substitute aircraft of equal or superior specification where necessary.</li>
        <li>All changes to itinerary must be approved in writing by Nairobi Jet House.</li>
        <li>Confirmation by email, LPO, or signed copy of this invoice constitutes a binding order.</li>
        <li>War risk insurance is excluded and will be billed separately if required.</li>
        <li>Smoking is strictly prohibited on all NJH-operated flights.</li>
        <li>Credit card payments incur a 3.5% processing surcharge.</li>
        <li>This document is <strong>CONFIDENTIAL</strong> and intended solely for the named client.</li>
      </ol>
    </div>

    <!-- ══ SIGNATURE BLOCK with NJH-STAMP.png overlay ══ -->
    <div class="sig-section">
      <!-- NJH side — stamp image overlaid bottom-right -->
      <div class="sig-box">
        <h4>For: Nairobi Jet House (Authorized)</h4>
        <div class="sig-line"></div>
        <p>Name: ________________________________</p>
        <p style="margin-top:6px">Position: Operations Director</p>
        <!-- Stamp image from /public/NJH-STAMP.png — rotated slightly like a real stamp -->
        <img
          class="stamp-img"
          src="/NJH-STAMP.png"
          alt="NJH Official Stamp"
          style="transform:rotate(-8deg)"
          onerror="this.style.display='none'"
        />
      </div>
      <!-- Client side -->
      <div class="sig-box">
        <h4>Client Acceptance</h4>
        <div class="sig-line"></div>
        <p>Name: ________________________________</p>
        <p style="margin-top:6px">Date: __________________ &nbsp; Stamp: ___________</p>
      </div>
    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="footer-left">
      &#128205; ${NJH.address}<br>
      &#9993; ${NJH.email} &nbsp;|&nbsp; &#127760; ${NJH.website}
    </div>
    <div class="footer-right">${NJH.phone}</div>
  </div>
  <div class="top-bar"></div>
</div>
</body>
</html>`
}

// ── PDF Generation ────────────────────────────────────────────────────────────
// IMPORTANT: html2canvas runs inside a hidden iframe that is served from the
// same origin as the app. Images in /public (NJH-LOGO.png, NJH-STAMP.png) are
// therefore same-origin and will be captured without CORS issues.
async function generateInvoicePDF(booking, invoiceForm, mode = 'download') {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const html = buildInvoiceHTML(
    booking,
    invoiceForm.invoice_no,
    invoiceForm.invoice_date,
    invoiceForm.extra_notes,
    {
      account:  invoiceForm.bank_account,
      bankName: invoiceForm.bank_name,
      swift:    invoiceForm.bank_swift,
      branch:   invoiceForm.bank_branch,
    }
  )

  // Hidden fixed-width iframe for accurate rendering
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `
    position:fixed; top:-9999px; left:-9999px;
    width:900px; height:1400px; border:none; visibility:hidden;
  `
  document.body.appendChild(iframe)

  await new Promise((resolve) => {
    iframe.onload = resolve
    iframe.srcdoc = html
  })

  // Wait for Google Fonts + images (logo, stamp) to load inside iframe
  // We wait for all <img> elements to settle before capturing
  await new Promise(r => setTimeout(r, 900))

  // Extra wait: ensure images inside iframe are loaded
  await new Promise(resolve => {
    const imgs = Array.from(iframe.contentDocument.querySelectorAll('img'))
    if (!imgs.length) { resolve(); return }
    let loaded = 0
    const done = () => { if (++loaded === imgs.length) resolve() }
    imgs.forEach(img => {
      if (img.complete) { done() }
      else { img.onload = done; img.onerror = done }
    })
    // Fallback timeout
    setTimeout(resolve, 1500)
  })

  const invoiceEl = iframe.contentDocument.querySelector('.page')

  const canvas = await html2canvas(invoiceEl, {
    scale:           2,
    useCORS:         true,
    allowTaint:      true,
    backgroundColor: '#ffffff',
    logging:         false,
    windowWidth:     900,
    // Tell html2canvas to use the iframe's document origin for image loading
    proxy:           undefined,
  })

  document.body.removeChild(iframe)

  const imgData = canvas.toDataURL('image/jpeg', 0.97)
  const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pdfW    = pdf.internal.pageSize.getWidth()   // 210 mm
  const pdfH    = pdf.internal.pageSize.getHeight()  // 297 mm
  const ratio   = pdfW / canvas.width
  const scaledH = canvas.height * ratio

  let yOffset = 0
  while (yOffset < scaledH) {
    if (yOffset > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, scaledH)
    yOffset += pdfH
  }

  const filename = `NJH-Invoice-${invoiceForm.invoice_no || booking.id}.pdf`

  if (mode === 'download') {
    pdf.save(filename)
  } else {
    const blob = pdf.output('blob')
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }
}

// ══ Main Component ════════════════════════════════════════════════════════════
export default function AdminFlightBookingsPage() {
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [status, setStatus]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [modal, setModal]               = useState(null)

  // Price form
  const [priceForm, setPriceForm]       = useState({
    quoted_price_usd: '', operator_cost_usd: '', commission_pct: '15',
    status: 'quoted', send_email: true, email_message: ''
  })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr]         = useState('')

  // RFQ form
  const [rfqIds, setRfqIds]             = useState('')
  const [rfqLoading, setRfqLoading]     = useState(false)
  const [rfqErr, setRfqErr]             = useState('')

  // Invoice form
  const [invoiceForm, setInvoiceForm]   = useState({
    invoice_no: '', invoice_date: new Date().toISOString().slice(0, 10),
    extra_notes: '', send_email: true, email_subject: '', email_body: '',
    bank_account: NJH.bank.account, bank_name: NJH.bank.name,
    bank_swift: NJH.bank.swift, bank_branch: NJH.bank.branch
  })
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceErr, setInvoiceErr]         = useState('')
  const [invoiceSent, setInvoiceSent]       = useState(false)

  // PDF generation states
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfMode, setPdfMode]       = useState(null)   // 'preview' | 'download'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.bookings(params)
      const data = response?.data || response
      setBookings(data.results || data || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const openPrice = (b) => {
    setSelected(b)
    setPriceForm({
      quoted_price_usd: b.quoted_price_usd || '', operator_cost_usd: b.operator_cost_usd || '',
      commission_pct: b.commission_pct || '15', status: b.status, send_email: true, email_message: ''
    })
    setPriceErr('')
    setModal('price')
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setPriceLoading(true); setPriceErr('')
    try {
      await adminAPI.setPrice(selected.id, priceForm)
      await load(); setModal(null)
    } catch (err) {
      const d = err?.response?.data
      setPriceErr(d?.detail || d?.message || JSON.stringify(d) || 'Failed to update price')
    } finally { setPriceLoading(false) }
  }

  const openRFQ = (b) => { setSelected(b); setRfqIds(''); setRfqErr(''); setModal('rfq') }

  const submitRFQ = async (e) => {
    e.preventDefault(); setRfqLoading(true); setRfqErr('')
    try {
      const ids = rfqIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
      if (!ids.length) { setRfqErr('Please enter at least one valid operator ID'); return }
      await adminAPI.sendRFQ(selected.id, { operator_ids: ids })
      await load(); setModal(null)
    } catch (err) {
      const d = err?.response?.data
      setRfqErr(d?.detail || d?.message || 'Failed to send RFQ')
    } finally { setRfqLoading(false) }
  }

  const openInvoice = (b) => {
    setSelected(b)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const ref     = String(b.reference || b.id).slice(0, 6).toUpperCase()
    setInvoiceForm({
      invoice_no:    `${ref}-${dateStr}`,
      invoice_date:  new Date().toISOString().slice(0, 10),
      extra_notes:   '',
      send_email:    true,
      email_subject: `Flight Charter Invoice — NJH-${ref} | Nairobi Jet House`,
      email_body:    `Dear ${b.guest_name || 'Valued Client'},\n\nPlease find attached your flight charter invoice from Nairobi Jet House.\n\nInvoice No: NJH-${ref}\nRoute: ${b.origin_detail?.code || b.origin || '—'} → ${b.destination_detail?.code || b.destination || '—'}\nDate: ${b.departure_date || 'TBA'}\nAmount: $${Number(b.quoted_price_usd || 0).toLocaleString()}\n\nPayment is due within 5 business days. For any queries, contact us at ${NJH.email}.\n\nWarm regards,\nNairobi Jet House Operations`,
      bank_account:  NJH.bank.account,
      bank_name:     NJH.bank.name,
      bank_swift:    NJH.bank.swift,
      bank_branch:   NJH.bank.branch,
    })
    setInvoiceErr(''); setInvoiceSent(false); setPdfLoading(false); setPdfMode(null)
    setModal('invoice')
  }

  const handlePreviewPDF = async () => {
    setPdfLoading(true); setPdfMode('preview'); setInvoiceErr('')
    try {
      await generateInvoicePDF(selected, invoiceForm, 'preview')
    } catch (err) {
      console.error('PDF preview error:', err)
      setInvoiceErr('Failed to generate PDF preview. Please try again.')
    } finally { setPdfLoading(false); setPdfMode(null) }
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true); setPdfMode('download'); setInvoiceErr('')
    try {
      await generateInvoicePDF(selected, invoiceForm, 'download')
    } catch (err) {
      console.error('PDF download error:', err)
      setInvoiceErr('Failed to generate PDF. Please try again.')
    } finally { setPdfLoading(false); setPdfMode(null) }
  }

  const submitInvoice = async (e) => {
    e.preventDefault()
    setInvoiceLoading(true); setInvoiceErr('')
    try {
      if (invoiceForm.send_email && selected?.guest_email) {
        const html = buildInvoiceHTML(
          selected, invoiceForm.invoice_no, invoiceForm.invoice_date,
          invoiceForm.extra_notes,
          { account: invoiceForm.bank_account, bankName: invoiceForm.bank_name, swift: invoiceForm.bank_swift, branch: invoiceForm.bank_branch }
        )
        await adminAPI.sendEmail({
          to_email:     selected.guest_email,
          to_name:      selected.guest_name || '',
          subject:      invoiceForm.email_subject,
          body:         invoiceForm.email_body + '\n\n--- HTML Invoice attached below ---\n\n' + html,
          inquiry_type: 'flight_booking',
          related_id:   selected.id,
        })
      }
      setInvoiceSent(true)
    } catch (err) {
      const d = err?.response?.data
      setInvoiceErr(d?.detail || d?.message || JSON.stringify(d) || 'Failed to send invoice')
    } finally { setInvoiceLoading(false) }
  }

  const fmt = (v) => v ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'

  const inp = (extra = {}) => ({
    style: {
      width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)',
      borderRadius: '6px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', ...extra
    },
    onFocus: e => e.currentTarget.style.borderColor = 'var(--color-navy)',
    onBlur:  e => e.currentTarget.style.borderColor = 'var(--color-light-gray)',
  })

  const label = (text, required) => (
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
      {text} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
    </label>
  )

  const Spinner = ({ size = 16, color = '#fff' }) => (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}40`,
      borderTopColor: color,
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  )

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Flight Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage all flight booking requests, RFQs and invoices</p>
        </div>
        <button onClick={load}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }} />
            <input
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              placeholder="Name, email, reference…" value={search} onChange={e => setSearch(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'} />
          </div>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', outline: 'none', cursor: 'pointer' }}
            value={status} onChange={e => setStatus(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        {(search || status) && (
          <button style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => { setSearch(''); setStatus('') }}>
            <i className="bi bi-x-lg"></i> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>No bookings found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  {['Reference', 'Guest', 'Route', 'Date', 'Pax', 'Quoted', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Pax' || h === 'Status' || h === 'Actions' ? 'center' : h === 'Quoted' ? 'right' : 'left', fontWeight: 600, color: 'var(--color-navy)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,45,94,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {String(b.reference || b.id).slice(0, 8)}…
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.guest_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.guest_email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-navy)' }}>
                        {b.origin_detail?.code || b.origin || '—'} → {b.destination_detail?.code || b.destination || '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                        {b.origin_detail?.city || ''}{b.destination_detail?.city ? ` → ${b.destination_detail.city}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{b.departure_date || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{b.passenger_count || 1}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{fmt(b.quoted_price_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}><Badge status={b.status} /></td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button title="Set price"
                          style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openPrice(b)}>
                          <i className="bi bi-currency-dollar" />
                        </button>
                        <button title="Send RFQ"
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openRFQ(b)}>
                          <i className="bi bi-send" />
                        </button>
                        <button title="Generate Invoice"
                          style={{ padding: '0.3rem 0.6rem', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => openInvoice(b)}>
                          <i className="bi bi-file-earmark-pdf" />
                        </button>
                        <button title="View details"
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-mid-gray)', border: '1px solid var(--color-light-gray)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => { setSelected(b); setModal('detail') }}>
                          <i className="bi bi-eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && bookings.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}{(search || status) && ' with current filters'}
        </div>
      )}

      {/* ══ INVOICE MODAL ══════════════════════════════════════════════════════ */}
      <Modal open={modal === 'invoice'} onClose={() => setModal(null)} size="xl"
        title={<><i className="bi bi-file-earmark-pdf" style={{ color: '#c9a84c' }}></i> Generate PDF Invoice — {selected?.guest_name}</>}>
        {selected && (
          <div>
            {/* Info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <i className="bi bi-file-earmark-pdf-fill" style={{ color: '#c9a84c', fontSize: '1.1rem' }} />
              <div style={{ fontSize: '0.8rem', color: '#8a6d00' }}>
                Invoice includes your <strong>NJH-LOGO.png</strong> + <strong>NJH-STAMP.png</strong> from <code>/public</code>
                and a route map with globe markers and flight arc.
              </div>
            </div>

            {pdfLoading && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: 'rgba(15,45,94,0.06)', border: '1px solid rgba(15,45,94,0.18)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                <Spinner size={18} color="var(--color-navy)" />
                <span>
                  {pdfMode === 'preview' ? 'Rendering PDF preview…' : 'Generating PDF for download…'}
                  <span style={{ color: 'var(--color-mid-gray)', marginLeft: '0.5rem', fontSize: '0.78rem' }}>
                    Loading logo, stamp &amp; route map — usually 2–4 seconds
                  </span>
                </span>
              </div>
            )}

            {invoiceSent && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px', color: '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-check-circle-fill" /> Invoice emailed successfully to <strong>{selected.guest_email}</strong>
              </div>
            )}
            {invoiceErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle" /> {invoiceErr}
              </div>
            )}

            <form onSubmit={submitInvoice}>
              {/* Invoice meta */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  Invoice Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>{label('Invoice Number', true)}<input {...inp()} value={invoiceForm.invoice_no} onChange={e => setInvoiceForm(f => ({ ...f, invoice_no: e.target.value }))} required /></div>
                  <div>{label('Invoice Date', true)}<input {...inp()} type="date" value={invoiceForm.invoice_date} onChange={e => setInvoiceForm(f => ({ ...f, invoice_date: e.target.value }))} required /></div>
                </div>
              </div>

              {/* Booking summary */}
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(15,45,94,0.04)', border: '1px solid rgba(15,45,94,0.12)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Booking Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {[
                    ['Route', `${selected.origin_detail?.code || selected.origin || '—'} → ${selected.destination_detail?.code || selected.destination || '—'}`],
                    ['Date', selected.departure_date || 'TBA'],
                    ['Pax', selected.passenger_count || 1],
                    ['Amount', fmt(selected.quoted_price_usd)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ color: 'var(--color-mid-gray)', fontSize: '0.7rem', marginBottom: '2px' }}>{k}</div>
                      <div style={{ color: 'var(--color-navy)', fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank details */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  Bank Details (on Invoice)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>{label('Bank Name')}<input {...inp()} value={invoiceForm.bank_name} onChange={e => setInvoiceForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                  <div>{label('Account Number')}<input {...inp()} value={invoiceForm.bank_account} onChange={e => setInvoiceForm(f => ({ ...f, bank_account: e.target.value }))} /></div>
                  <div>{label('Swift Code')}<input {...inp()} value={invoiceForm.bank_swift} onChange={e => setInvoiceForm(f => ({ ...f, bank_swift: e.target.value }))} /></div>
                  <div>{label('Branch')}<input {...inp()} value={invoiceForm.bank_branch} onChange={e => setInvoiceForm(f => ({ ...f, bank_branch: e.target.value }))} /></div>
                </div>
              </div>

              {/* Additional notes */}
              <div style={{ marginBottom: '1rem' }}>
                {label('Additional Notes (optional)')}
                <textarea rows={2} {...inp({ resize: 'vertical' })} value={invoiceForm.extra_notes}
                  onChange={e => setInvoiceForm(f => ({ ...f, extra_notes: e.target.value }))}
                  placeholder="e.g. Visa assistance provided, VVIP handling included…" />
              </div>

              {/* Email section */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: '8px', border: '1px solid var(--color-light-gray)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="checkbox" id="inv_send_email" checked={invoiceForm.send_email}
                    onChange={e => setInvoiceForm(f => ({ ...f, send_email: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="inv_send_email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', cursor: 'pointer' }}>
                    <i className="bi bi-envelope" style={{ marginRight: '0.4rem' }}></i>
                    Send invoice by email to {selected.guest_email || 'client'}
                  </label>
                </div>
                {invoiceForm.send_email && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      {label('Email Subject')}
                      <input {...inp()} value={invoiceForm.email_subject}
                        onChange={e => setInvoiceForm(f => ({ ...f, email_subject: e.target.value }))} />
                    </div>
                    <div>
                      {label('Email Body')}
                      <textarea rows={5} {...inp({ resize: 'vertical' })} value={invoiceForm.email_body}
                        onChange={e => setInvoiceForm(f => ({ ...f, email_body: e.target.value }))} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem', display: 'block' }}>
                        The full invoice HTML will be appended automatically.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handlePreviewPDF} disabled={pdfLoading}
                    style={{
                      padding: '0.6rem 1.1rem',
                      background: pdfLoading && pdfMode === 'preview' ? 'rgba(15,45,94,0.08)' : 'transparent',
                      color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)',
                      borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      opacity: pdfLoading && pdfMode !== 'preview' ? 0.5 : 1,
                    }}>
                    {pdfLoading && pdfMode === 'preview'
                      ? <><Spinner size={14} color="var(--color-navy)" /> Rendering…</>
                      : <><i className="bi bi-eye" /> Preview PDF</>}
                  </button>

                  <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                    style={{
                      padding: '0.6rem 1.1rem',
                      background: pdfLoading && pdfMode === 'download' ? 'rgba(201,168,76,0.12)' : 'transparent',
                      color: '#c9a84c', border: '1.5px solid #c9a84c',
                      borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      opacity: pdfLoading && pdfMode !== 'download' ? 0.5 : 1,
                    }}>
                    {pdfLoading && pdfMode === 'download'
                      ? <><Spinner size={14} color="#c9a84c" /> Generating…</>
                      : <><i className="bi bi-file-earmark-pdf" /> Download PDF</>}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setModal(null)}
                    style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={invoiceLoading || !invoiceForm.send_email}
                    style={{ padding: '0.6rem 1.3rem', background: invoiceForm.send_email ? 'var(--color-navy)' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: invoiceForm.send_email ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {invoiceLoading
                      ? <><Spinner /> Sending…</>
                      : <><i className="bi bi-send-fill" /> Send Invoice</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* ── Price Modal ── */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar"></i> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem' }}><i className="bi bi-exclamation-triangle" /> {priceErr}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>{label('Client Price (USD)', true)}<input type="number" step="0.01" value={priceForm.quoted_price_usd} onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} placeholder="25000.00" required {...inp()} /></div>
            <div>{label('Operator Cost (USD)')}<input type="number" step="0.01" value={priceForm.operator_cost_usd} onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd: e.target.value }))} placeholder="20000.00" {...inp()} /></div>
            <div>{label('Commission %')}<input type="number" step="0.01" value={priceForm.commission_pct} onChange={e => setPriceForm(f => ({ ...f, commission_pct: e.target.value }))} {...inp()} /></div>
            <div>{label('Update Status')}<select value={priceForm.status} onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))} {...inp()}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            {label('Email Message')}
            <textarea rows={3} value={priceForm.email_message} onChange={e => setPriceForm(f => ({ ...f, email_message: e.target.value }))} placeholder="Leave blank for auto-generated…" {...inp({ resize: 'vertical' })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" id="send_email" checked={priceForm.send_email} onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
            <label htmlFor="send_email" style={{ fontSize: '0.84rem', color: 'var(--color-dark-gray)', cursor: 'pointer' }}>Send quote email to client</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={priceLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {priceLoading ? <><Spinner /> Saving…</> : <><i className="bi bi-check-lg" /> Save Quote</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── RFQ Modal ── */}
      <Modal open={modal === 'rfq'} onClose={() => setModal(null)} title={<><i className="bi bi-send"></i> Send RFQ — {selected?.guest_name}</>}>
        <form onSubmit={submitRFQ}>
          {rfqErr && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem' }}><i className="bi bi-exclamation-triangle" /> {rfqErr}</div>}
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-dark-gray)' }}>Enter operator IDs (comma-separated) to dispatch this RFQ.</p>
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(15,92,164,0.08)', border: '1px solid rgba(15,92,164,0.22)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-info)' }}>
            <strong>Route:</strong> {selected?.origin_detail?.code || selected?.origin} → {selected?.destination_detail?.code || selected?.destination} &nbsp;|&nbsp;
            <strong>Date:</strong> {selected?.departure_date} &nbsp;|&nbsp;
            <strong>Pax:</strong> {selected?.passenger_count || 1}
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            {label('Operator IDs', true)}
            <input value={rfqIds} onChange={e => setRfqIds(e.target.value)} placeholder="e.g. 1, 3, 7" required {...inp()} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={rfqLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {rfqLoading ? <><Spinner /> Sending…</> : <><i className="bi bi-send" /> Send RFQ</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-airplane"></i> Booking Details</>} size="lg">
        {selected && (
          <div>
            {[
              ['Reference',       selected.reference || selected.id],
              ['Guest',           `${selected.guest_name || '—'} — ${selected.guest_email || '—'}`],
              ['Phone',           selected.guest_phone || '—'],
              ['Route',           `${selected.origin_detail?.code || selected.origin} → ${selected.destination_detail?.code || selected.destination}`],
              ['Date & Time',     `${selected.departure_date || '—'}${selected.departure_time ? ` at ${selected.departure_time}` : ''}`],
              ['Passengers',      selected.passenger_count || 1],
              ['Trip Type',       `${(selected.trip_type || 'one_way').replace(/_/g, ' ')}${selected.return_date ? ` (Return: ${selected.return_date})` : ''}`],
              ['Catering',        selected.catering_requested ? 'Yes' : 'No'],
              ['Ground Transport',selected.ground_transport_requested ? 'Yes' : 'No'],
              ['Special Requests',selected.special_requests || '—'],
              ['Submitted',       new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{k}</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{v}</div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div><Badge status={selected.status} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Pricing</div>
              <div>
                <div>Quoted: {fmt(selected.quoted_price_usd)}</div>
                <div>Operator Cost: {fmt(selected.operator_cost_usd)}</div>
                <div>Commission: {fmt(selected.commission_usd)} ({selected.commission_pct}%)</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setModal(null); openInvoice(selected) }}
                style={{ padding: '0.6rem 1.2rem', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-file-earmark-pdf" /> Generate PDF Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}