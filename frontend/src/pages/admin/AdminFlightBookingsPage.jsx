import { useState, useEffect, useCallback, useRef } from 'react'
import { adminAPI } from '../../services/api'

// ── npm install jspdf html2canvas qrcode ──────────────────────────────────────────────
import QRCode from 'qrcode'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: '#f59e0b',
  rfq_sent: '#0a2540',
  quoted: '#0a2540',
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
  phone: '+254 724 878 136',
  email: 'nairobijethouse@gmail.com',
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

// ── Professional QR Code Generator ────────────────────────────────────────────
async function generateQRCodeSVG(text, size = 88) {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#0a2540',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
    return qrDataUrl
  } catch (err) {
    console.error('QR generation failed:', err)
    return null
  }
}

// ── Clean Route Display ──────────────────────────────────────────────────────
function buildRouteDisplay(originCode, originCity, destCode, destCity) {
  return `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 0;">
      <div style="text-align: center; flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #0a2540; letter-spacing: 2px;">${originCode || 'NBO'}</div>
        <div style="font-size: 11px; color: #5a6e8a; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${originCity || 'Nairobi'}</div>
      </div>
      <div style="flex-shrink: 0; padding: 0 20px;">
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
          <line x1="0" y1="10" x2="45" y2="10" stroke="#c8a245" stroke-width="1.5" stroke-dasharray="4 3"/>
          <polygon points="45,6 55,10 45,14" fill="#c8a245"/>
        </svg>
      </div>
      <div style="text-align: center; flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #0a2540; letter-spacing: 2px;">${destCode || 'DWC'}</div>
        <div style="font-size: 11px; color: #5a6e8a; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${destCity || 'Dubai'}</div>
      </div>
    </div>
  `
}

// ── Professional Invoice HTML Generator with Logo and Stamp ───────────────────
function buildInvoiceHTML(booking, invoiceNo, invoiceDate, extraNotes, bankDetails, qrDataUrl) {
  const fmt = (v) => v
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'
  const fmtLarge = (v) => v
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'

  const origin = booking.origin_detail?.code || booking.origin || '—'
  const dest = booking.destination_detail?.code || booking.destination || '—'
  const originCity = booking.origin_detail?.city || ''
  const destCity = booking.destination_detail?.city || ''
  const commission = booking.commission_usd
    ? Number(booking.commission_usd)
    : booking.quoted_price_usd && booking.commission_pct
      ? (Number(booking.quoted_price_usd) * Number(booking.commission_pct) / 100)
      : 0
  const subtotal = Number(booking.quoted_price_usd || 0)
  const ref = String(booking.reference || booking.id)

  const routeDisplay = buildRouteDisplay(origin, originCity, dest, destCity)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #e8edf2;
    color: #1a2a3e;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .invoice-container {
    max-width: 820px;
    margin: 30px auto;
    background: #ffffff;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  }
  
  .header-bar {
    height: 4px;
    background: linear-gradient(90deg, #0a2540 0%, #c8a245 50%, #0a2540 100%);
  }
  
  .invoice-header {
    padding: 32px 40px 24px;
    border-bottom: 1px solid #e8edf2;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo-img {
    height: 60px;
    width: auto;
    max-width: 200px;
    object-fit: contain;
  }
  
  .company-text h1 {
    font-size: 22px;
    font-weight: 600;
    color: #0a2540;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }
  
  .company-text .tagline {
    font-size: 10px;
    color: #c8a245;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .company-text .address {
    font-size: 9px;
    color: #6b7c93;
    line-height: 1.5;
  }
  
  .invoice-title {
    text-align: right;
  }
  
  .invoice-title .label {
    font-size: 11px;
    color: #6b7c93;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  
  .invoice-title .number {
    font-size: 20px;
    font-weight: 600;
    color: #0a2540;
    letter-spacing: 1px;
  }
  
  .invoice-title .date {
    font-size: 11px;
    color: #6b7c93;
    margin-top: 8px;
  }
  
  .status-badge {
    display: inline-block;
    margin-top: 12px;
    padding: 4px 12px;
    background: #f5f7fa;
    border-left: 3px solid #c8a245;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #0a2540;
  }
  
  .invoice-content {
    padding: 32px 40px;
  }
  
  .bill-qr-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  
  .bill-to {
    flex: 1;
  }
  
  .bill-to h3 {
    font-size: 10px;
    color: #c8a245;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .client-name {
    font-size: 18px;
    font-weight: 600;
    color: #0a2540;
    border-bottom: 2px solid #c8a245;
    padding-bottom: 6px;
    margin-bottom: 16px;
    display: inline-block;
  }
  
  .info-grid {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 8px;
    font-size: 11px;
  }
  
  .info-label {
    width: 80px;
    color: #6b7c93;
    font-weight: 500;
  }
  
  .info-value {
    color: #1a2a3e;
    flex: 1;
  }
  
  .qr-placeholder {
    text-align: center;
    margin-left: 30px;
  }
  
  .qr-code {
    width: 88px;
    height: 88px;
    background: #ffffff;
    border: 1px solid #e8edf2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  
  .qr-placeholder .qr-label {
    font-size: 8px;
    color: #6b7c93;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 6px;
  }
  
  .qr-placeholder .ref-text {
    font-size: 9px;
    color: #0a2540;
    font-family: monospace;
    margin-top: 4px;
  }
  
  .route-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px 24px;
    margin-bottom: 32px;
    border: 1px solid #e8edf2;
  }
  
  .route-label {
    font-size: 9px;
    color: #c8a245;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .route-label::before {
    content: '';
    width: 20px;
    height: 1px;
    background: #c8a245;
  }
  
  .section-title {
    font-size: 10px;
    color: #0a2540;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 2px solid #0a2540;
    margin-bottom: 20px;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 28px;
  }
  
  .data-table thead tr {
    background: #0a2540;
  }
  
  .data-table th {
    color: #ffffff;
    padding: 12px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  
  .data-table tbody tr {
    border-bottom: 1px solid #e8edf2;
  }
  
  .data-table tbody tr:last-child {
    border-bottom: none;
  }
  
  .data-table td {
    padding: 12px 14px;
    font-size: 12px;
    color: #2a3a4e;
  }
  
  .data-table td.highlight {
    color: #0a2540;
    font-weight: 600;
  }
  
  .cost-summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 32px;
  }
  
  .cost-card {
    width: 340px;
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .cost-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid #e8edf2;
  }
  
  .cost-row:last-child {
    border-bottom: none;
  }
  
  .cost-row.total {
    background: #0a2540;
  }
  
  .cost-row.total .cost-label,
  .cost-row.total .cost-value {
    color: #ffffff;
  }
  
  .cost-row.total .cost-value {
    color: #c8a245;
    font-size: 16px;
    font-weight: 700;
  }
  
  .cost-label {
    font-size: 11px;
    color: #6b7c93;
    font-weight: 500;
  }
  
  .cost-value {
    font-size: 13px;
    color: #1a2a3e;
    font-weight: 600;
  }
  
  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }
  
  .info-card {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px 20px;
  }
  
  .info-card h4 {
    font-size: 9px;
    color: #c8a245;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 600;
  }
  
  .info-card p {
    font-size: 11px;
    color: #2a3a4e;
    line-height: 1.8;
    margin-bottom: 4px;
  }
  
  .info-card .bold {
    font-weight: 600;
    color: #0a2540;
  }
  
  .terms-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 18px 22px;
    margin-bottom: 28px;
  }
  
  .terms-section h4 {
    font-size: 9px;
    color: #0a2540;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 600;
  }
  
  .terms-list {
    padding-left: 20px;
  }
  
  .terms-list li {
    font-size: 10px;
    color: #5a6e8a;
    line-height: 1.7;
    margin-bottom: 4px;
  }
  
  .signature-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 8px;
    position: relative;
  }
  
  .signature-box {
    position: relative;
  }
  
  .signature-box h4 {
    font-size: 9px;
    color: #6b7c93;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 16px;
    font-weight: 500;
  }
  
  .signature-line {
    border-bottom: 1px solid #c8a245;
    margin-bottom: 8px;
    height: 36px;
  }
  
  .signature-box p {
    font-size: 9px;
    color: #6b7c93;
    margin-top: 6px;
  }
  
  .stamp-container {
    position: absolute;
    bottom: -20px;
    right: 0;
    opacity: 0.75;
  }
  
  .stamp-img {
    width: 90px;
    height: auto;
    transform: rotate(-8deg);
  }
  
  .invoice-footer {
    background: #0a2540;
    padding: 16px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .footer-left {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
  }
  
  .footer-left i {
    margin-right: 4px;
    font-size: 8px;
  }
  
  .footer-right {
    font-size: 13px;
    font-weight: 600;
    color: #c8a245;
  }
  
  .extra-notes {
    background: #fef9e6;
    border-left: 3px solid #c8a245;
    padding: 14px 18px;
    border-radius: 8px;
    margin-bottom: 28px;
  }
  
  .extra-notes h4 {
    font-size: 9px;
    color: #c8a245;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  
  .extra-notes p {
    font-size: 11px;
    color: #5a4a1a;
    line-height: 1.5;
  }
  
  .bi {
    display: inline-block;
    font-style: normal;
  }
</style>
</head>
<body>
<div class="invoice-container">
  <div class="header-bar"></div>
  
  <div class="invoice-header">
    <div class="header-content">
      <div class="logo-section">
        <img class="logo-img" src="/NJH-LOGO.png" alt="Nairobi Jet House" onerror="this.style.display='none'" />
        <div class="company-text">
          <h1>${NJH.name}</h1>
          <div class="tagline">${NJH.tagline}</div>
          <div class="address">
            <i class="bi bi-geo-alt-fill"></i> ${NJH.address}<br>
            <i class="bi bi-telephone-fill"></i> ${NJH.phone} &nbsp;|&nbsp; <i class="bi bi-envelope-fill"></i> ${NJH.email}
          </div>
        </div>
      </div>
      <div class="invoice-title">
        <div class="label">Flight Invoice</div>
        <div class="number"><i class="bi bi-file-text-fill"></i> NJH-${invoiceNo}</div>
        <div class="date"><i class="bi bi-calendar3"></i> ${invoiceDate}</div>
        <div class="status-badge"><i class="bi bi-info-circle-fill"></i> ${STATUS_LABEL[booking.status] || booking.status || 'Quoted'}</div>
      </div>
    </div>
  </div>
  
  <div class="invoice-content">
    <div class="bill-qr-section">
      <div class="bill-to">
        <h3><i class="bi bi-person-bounding-box"></i> Bill To</h3>
        <div class="client-name">${booking.guest_name || 'Valued Client'}</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Contact</span>
            <span class="info-value"><i class="bi bi-person"></i> ${booking.guest_name || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value"><i class="bi bi-envelope"></i> ${booking.guest_email || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value"><i class="bi bi-telephone"></i> ${booking.guest_phone || 'TBC'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Company</span>
            <span class="info-value"><i class="bi bi-building"></i> ${booking.company || '—'}</span>
          </div>
        </div>
      </div>
      <div class="qr-placeholder">
        ${qrDataUrl ? `<img src="${qrDataUrl}" width="88" height="88" style="border-radius: 8px; border: 1px solid #e8edf2;" alt="QR Code"/>` : `
        <div class="qr-code">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <rect width="70" height="70" fill="#f0f4f8" rx="4"/>
            <text x="35" y="38" text-anchor="middle" fill="#6b7c93" font-size="8">${ref.slice(0, 4)}</text>
          </svg>
        </div>`}
        <div class="qr-label"><i class="bi bi-qr-code"></i> Reference Code</div>
        <div class="ref-text">${ref}</div>
      </div>
    </div>
    
    <div class="route-section">
      <div class="route-label"><i class="bi bi-diagram-3"></i> Flight Route</div>
      ${routeDisplay}
    </div>
    
    <div class="section-title"><i class="bi bi-calendar-event"></i> Flight Itinerary</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th><th>Departure</th><th>Arrival</th><th>Dep. Time</th><th>Aircraft</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="highlight"><i class="bi bi-calendar"></i> ${booking.departure_date || 'TBA'}</td>
          <td><i class="bi bi-geo-alt-fill"></i> ${origin}${originCity ? ` (${originCity})` : ''}</td>
          <td><i class="bi bi-geo-alt-fill"></i> ${dest}${destCity ? ` (${destCity})` : ''}</td>
          <td><i class="bi bi-clock"></i> ${booking.departure_time || 'TBC'}</td>
          <td><i class="bi bi-airplane"></i> ${booking.aircraft_detail?.name || booking.aircraft || 'TBC'}</td>
        </tr>
        ${booking.return_date ? `
        <tr>
          <td class="highlight"><i class="bi bi-calendar"></i> ${booking.return_date}</td>
          <td><i class="bi bi-geo-alt-fill"></i> ${dest}${destCity ? ` (${destCity})` : ''}</td>
          <td><i class="bi bi-geo-alt-fill"></i> ${origin}${originCity ? ` (${originCity})` : ''}</td>
          <td><i class="bi bi-clock"></i> TBC</td>
          <td><i class="bi bi-airplane"></i> ${booking.aircraft_detail?.name || booking.aircraft || 'TBC'}</td>
        </tr>` : ''}
      </tbody>
    </table>
    
    <div class="section-title"><i class="bi bi-info-circle"></i> Charter Details</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Aircraft Type</th><th>Registration</th><th>Class</th><th>Passengers</th><th>Trip Type</th><th>Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="highlight"><i class="bi bi-airplane-fill"></i> ${booking.aircraft_detail?.name || booking.aircraft || 'TBC'}</td>
          <td>${booking.aircraft_detail?.registration_number || '—'}</td>
          <td><i class="bi bi-star-fill"></i> ${booking.aircraft_detail?.category_display || 'Private Jet'}</td>
          <td><i class="bi bi-people-fill"></i> ${booking.passenger_count || 1} Pax</td>
          <td><i class="bi bi-arrow-left-right"></i> ${(booking.trip_type || 'one_way').replace(/_/g, ' ')}</td>
          <td class="highlight">${fmt(booking.quoted_price_usd)}</td>
        </tr>
        ${booking.catering_requested ? `<tr><td colspan="5"><i class="bi bi-cup-straw"></i> Catering Service</td><td class="highlight">Included</td>` : ''}
        ${booking.ground_transport_requested ? `<tr><td colspan="5"><i class="bi bi-car-front-fill"></i> Ground Transport</td><td class="highlight">Included</td>` : ''}
      </tbody>
    </table>
    
    <div class="cost-summary">
      <div class="cost-card">
        <div class="cost-row">
          <span class="cost-label"><i class="bi bi-airplane-engines"></i> Charter Flight Cost</span>
          <span class="cost-value">${fmt(booking.quoted_price_usd)}</span>
        </div>
        ${commission ? `
        <div class="cost-row">
          <span class="cost-label"><i class="bi bi-percent"></i> Service Fee (${booking.commission_pct || '15'}%)</span>
          <span class="cost-value">${fmt(commission)}</span>
        </div>` : ''}
        <div class="cost-row total">
          <span class="cost-label"><i class="bi bi-calculator-fill"></i> Total Due</span>
          <span class="cost-value">${fmtLarge(subtotal)}</span>
        </div>
      </div>
    </div>
    
    <div class="two-column">
      <div class="info-card">
        <h4><i class="bi bi-bank"></i> Bank Transfer (USD)</h4>
        <p><span class="bold">Account:</span> ${bankDetails?.account || NJH.bank.account}</p>
        <p><span class="bold">Bank:</span> ${bankDetails?.bankName || NJH.bank.name}</p>
        <p><span class="bold">Swift:</span> ${bankDetails?.swift || NJH.bank.swift}</p>
        <p><span class="bold">Branch:</span> ${bankDetails?.branch || NJH.bank.branch}</p>
      </div>
      <div class="info-card">
        <h4><i class="bi bi-clock-history"></i> Payment Terms</h4>
        <p>Due within <span class="bold">5 business days</span></p>
        <p>Cancellation &lt; 24h: <span class="bold">100% penalty</span></p>
        <p>Cancellation &lt; 48h: <span class="bold">50% penalty</span></p>
        <p style="margin-top: 12px;"><span class="bold"><i class="bi bi-phone"></i> M-Pesa:</span> ${NJH.mpesa}</p>
      </div>
    </div>
    
    ${extraNotes ? `
    <div class="extra-notes">
      <h4><i class="bi bi-pencil-square"></i> Additional Notes</h4>
      <p>${extraNotes}</p>
    </div>` : ''}
    
    <div class="terms-section">
      <h4><i class="bi bi-file-text"></i> Terms & Conditions</h4>
      <ul class="terms-list">
        <li>Payment is due upon receipt of this invoice.</li>
        <li>All charter bookings are subject to aircraft availability at time of confirmation.</li>
        <li>This quote does not include travel insurance, visa fees, or airport charges unless stated.</li>
        <li>Nairobi Jet House reserves the right to substitute aircraft of equal or superior specification.</li>
        <li>Confirmation by email or signed copy constitutes a binding order.</li>
        <li>Smoking is strictly prohibited on all NJH-operated flights.</li>
        <li>This document is confidential and intended solely for the named client.</li>
      </ul>
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <h4><i class="bi bi-pen"></i> For Nairobi Jet House</h4>
        <div class="signature-line"></div>
        <p>Authorized Signature</p>
      </div>
      <div class="signature-box">
        <h4><i class="bi bi-pencil"></i> Client Acceptance</h4>
        <div class="signature-line"></div>
        <p>Signature & Date</p>
        <div class="stamp-container">
          <img class="stamp-img" src="/NJH-STAMP.png" alt="NJH Official Stamp" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>
  </div>
  
  <div class="invoice-footer">
    <div class="footer-left">
      <i class="bi bi-geo-alt-fill"></i> ${NJH.address}<br>
      <i class="bi bi-envelope-fill"></i> ${NJH.email} &nbsp;|&nbsp; <i class="bi bi-globe"></i> ${NJH.website}
    </div>
    <div class="footer-right"><i class="bi bi-telephone-fill"></i> ${NJH.phone}</div>
  </div>
  <div class="header-bar"></div>
</div>
</body>
</html>`
}

// ── PDF Generation with Real QR Code ─────────────────────────────────────────
async function generateInvoicePDF(booking, invoiceForm, mode = 'download') {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const ref = String(booking.reference || booking.id)
  const qrDataUrl = await generateQRCodeSVG(ref, 88)

  const html = buildInvoiceHTML(
    booking,
    invoiceForm.invoice_no,
    invoiceForm.invoice_date,
    invoiceForm.extra_notes,
    {
      account: invoiceForm.bank_account,
      bankName: invoiceForm.bank_name,
      swift: invoiceForm.bank_swift,
      branch: invoiceForm.bank_branch,
    },
    qrDataUrl
  )

  const iframe = document.createElement('iframe')
  iframe.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 900px;
    height: 1300px;
    border: none;
    visibility: hidden;
  `
  document.body.appendChild(iframe)

  await new Promise((resolve) => {
    iframe.onload = resolve
    iframe.srcdoc = html
  })

  await new Promise(r => setTimeout(r, 800))

  const invoiceEl = iframe.contentDocument.querySelector('.invoice-container')
  
  if (invoiceEl) {
    const logoImg = invoiceEl.querySelector('.logo-img')
    const stampImg = invoiceEl.querySelector('.stamp-img')
    
    if (logoImg && !logoImg.complete) {
      await new Promise(resolve => { logoImg.onload = resolve; setTimeout(resolve, 1000) })
    }
    if (stampImg && !stampImg.complete) {
      await new Promise(resolve => { stampImg.onload = resolve; setTimeout(resolve, 1000) })
    }
  }

  const canvas = await html2canvas(invoiceEl || iframe.contentDocument.body, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 900,
  })

  document.body.removeChild(iframe)

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()
  const ratio = pdfW / canvas.width
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
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }
}

// ── Helper Components ─────────────────────────────────────────────────────────
function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.2rem 0.6rem', background: `${color}10`, color,
      border: `1px solid ${color}30`, borderRadius: '4px',
      fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize'
    }}>
      <i className={`bi ${status === 'completed' ? 'bi-check-circle' : status === 'cancelled' ? 'bi-x-circle' : 'bi-info-circle'}`} style={{ fontSize: '0.65rem' }}></i>
      {STATUS_LABEL[status] || status?.replace(/_/g, ' ')}
    </span>
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  const maxW = size === 'xl' ? '900px' : size === 'lg' ? '640px' : size === 'md' ? '480px' : '360px'
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.65)',
      backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#ffffff', borderRadius: '12px',
        width: '100%', maxWidth: maxW, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', borderBottom: '1px solid #e8edf2'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0a2540', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#6b7c93', padding: '0.25rem' }}>
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

// ══ Main Component ════════════════════════════════════════════════════════════
export default function AdminFlightBookingsPage() {
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [status, setStatus]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [modal, setModal]               = useState(null)

  const [priceForm, setPriceForm]       = useState({
    quoted_price_usd: '', operator_cost_usd: '', commission_pct: '15',
    status: 'quoted', send_email: true, email_message: ''
  })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr]         = useState('')

  const [rfqIds, setRfqIds]             = useState('')
  const [rfqLoading, setRfqLoading]     = useState(false)
  const [rfqErr, setRfqErr]             = useState('')

  const [invoiceForm, setInvoiceForm]   = useState({
    invoice_no: '', invoice_date: new Date().toISOString().slice(0, 10),
    extra_notes: '', send_email: true, email_subject: '', email_body: '',
    bank_account: NJH.bank.account, bank_name: NJH.bank.name,
    bank_swift: NJH.bank.swift, bank_branch: NJH.bank.branch
  })
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceErr, setInvoiceErr]         = useState('')
  const [invoiceSent, setInvoiceSent]       = useState(false)

  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfMode, setPdfMode]       = useState(null)

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
    const ref = String(b.reference || b.id).slice(0, 6).toUpperCase()
    setInvoiceForm({
      invoice_no: `${ref}-${dateStr}`,
      invoice_date: new Date().toISOString().slice(0, 10),
      extra_notes: '',
      send_email: true,
      email_subject: `Flight Charter Invoice — NJH-${ref} | Nairobi Jet House`,
      email_body: `Dear ${b.guest_name || 'Valued Client'},\n\nPlease find attached your flight charter invoice from Nairobi Jet House.\n\nInvoice No: NJH-${ref}\nRoute: ${b.origin_detail?.code || b.origin || '—'} → ${b.destination_detail?.code || b.destination || '—'}\nDate: ${b.departure_date || 'TBA'}\nAmount: $${Number(b.quoted_price_usd || 0).toLocaleString()}\n\nPayment is due within 5 business days. For any queries, contact us at ${NJH.email}.\n\nWarm regards,\nNairobi Jet House Operations`,
      bank_account: NJH.bank.account,
      bank_name: NJH.bank.name,
      bank_swift: NJH.bank.swift,
      bank_branch: NJH.bank.branch,
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
        const qrDataUrl = await generateQRCodeSVG(String(selected.reference || selected.id), 88)
        const html = buildInvoiceHTML(
          selected, invoiceForm.invoice_no, invoiceForm.invoice_date,
          invoiceForm.extra_notes,
          { account: invoiceForm.bank_account, bankName: invoiceForm.bank_name, swift: invoiceForm.bank_swift, branch: invoiceForm.bank_branch },
          qrDataUrl
        )
        await adminAPI.sendEmail({
          to_email: selected.guest_email,
          to_name: selected.guest_name || '',
          subject: invoiceForm.email_subject,
          body: invoiceForm.email_body,
          inquiry_type: 'flight_booking',
          related_id: selected.id,
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
      width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2',
      borderRadius: '6px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
      transition: 'border-color 0.2s', ...extra
    },
    onFocus: e => e.currentTarget.style.borderColor = '#0a2540',
    onBlur: e => e.currentTarget.style.borderColor = '#e8edf2',
  })

  const label = (text, required) => (
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0a2540', marginBottom: '0.25rem' }}>
      {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  )

  const Spinner = ({ size = 16, color = '#ffffff' }) => (
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
    <div style={{ padding: '1rem', maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0a2540', marginBottom: '0.25rem', letterSpacing: '-0.3px' }}>
            
            Flight Bookings
          </h2>
          <p style={{ color: '#6b7c93', fontSize: '0.875rem' }}>Manage all flight booking requests, RFQs and invoices</p>
        </div>
        <button onClick={load}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', color: '#0a2540', border: '1.5px solid #0a2540', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0a2540'; e.currentTarget.style.color = '#ffffff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0a2540' }}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7c93', marginBottom: '0.25rem' }}>
            <i className="bi bi-search"></i> Search
          </label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7c93', fontSize: '0.9rem' }}></i>
            <input
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }}
              placeholder="Name, email, reference…" value={search} onChange={e => setSearch(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#0a2540'}
              onBlur={e => e.currentTarget.style.borderColor = '#e8edf2'} />
          </div>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7c93', marginBottom: '0.25rem' }}>
            <i className="bi bi-funnel"></i> Status
          </label>
          <select
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#ffffff', outline: 'none', cursor: 'pointer' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        {(search || status) && (
          <button style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#6b7c93', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => { setSearch(''); setStatus('') }}>
            <i className="bi bi-x-lg"></i> Clear
          </button>
        )}
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid #e8edf2', borderTopColor: '#0a2540', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7c93' }}>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', color: '#cbd5e1', display: 'block', marginBottom: '1rem' }}></i>
              <p style={{ color: '#6b7c93' }}>No bookings found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>
                  {['Reference', 'Guest', 'Route', 'Date', 'Pax', 'Quoted', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Pax' || h === 'Status' || h === 'Actions' ? 'center' : h === 'Quoted' ? 'right' : 'left', fontWeight: 600, color: '#0a2540', whiteSpace: 'nowrap', fontSize: '0.75rem', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #e8edf2' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#2a3a4e' }}>
                      {String(b.reference || b.id).slice(0, 8)}…
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: '#0a2540' }}>{b.guest_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7c93' }}>{b.guest_email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0a2540' }}>
                        {b.origin_detail?.code || b.origin || '—'} <i className="bi bi-arrow-right"></i> {b.destination_detail?.code || b.destination || '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7c93' }}>
                        {b.origin_detail?.city || ''}{b.destination_detail?.city ? ` → ${b.destination_detail.city}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#2a3a4e' }}>{b.departure_date || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#2a3a4e' }}>{b.passenger_count || 1}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#0a2540' }}>{fmt(b.quoted_price_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}><Badge status={b.status} /></td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button title="Set price"
                          style={{ padding: '0.3rem 0.6rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openPrice(b)}>
                          <i className="bi bi-currency-dollar"></i>
                        </button>
                        <button title="Send RFQ"
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: '#0a2540', border: '1px solid #0a2540', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openRFQ(b)}>
                          <i className="bi bi-send"></i>
                        </button>
                        <button title="Generate Invoice"
                          style={{ padding: '0.3rem 0.6rem', background: '#c8a245', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => openInvoice(b)}>
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button title="View details"
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: '#6b7c93', border: '1px solid #e8edf2', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => { setSelected(b); setModal('detail') }}>
                          <i className="bi bi-eye"></i>
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
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7c93', textAlign: 'center' }}>
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}{(search || status) && ' with current filters'}
        </div>
      )}

      {/* INVOICE MODAL */}
      <Modal open={modal === 'invoice'} onClose={() => setModal(null)} size="xl"
        title={<><i className="bi bi-file-earmark-pdf" style={{ color: '#c8a245' }}></i> Generate PDF Invoice — {selected?.guest_name}</>}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(200,162,69,0.08)', border: '1px solid rgba(200,162,69,0.25)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <i className="bi bi-info-circle-fill" style={{ color: '#c8a245', fontSize: '1.1rem' }}></i>
              <div style={{ fontSize: '0.8rem', color: '#5a4a1a' }}>
                Professional invoice with QR code verification, company logo, and official stamp.
              </div>
            </div>

            {pdfLoading && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: 'rgba(10,37,64,0.04)', border: '1px solid rgba(10,37,64,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#0a2540' }}>
                <Spinner size={18} color="#0a2540" />
                <span>
                  {pdfMode === 'preview' ? 'Rendering PDF preview...' : 'Generating PDF for download...'}
                </span>
              </div>
            )}

            {invoiceSent && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', color: '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-check-circle-fill"></i> Invoice emailed successfully to <strong>{selected.guest_email}</strong>
              </div>
            )}
            {invoiceErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle-fill"></i> {invoiceErr}
              </div>
            )}

            <form onSubmit={submitInvoice}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e8edf2' }}>
                  <i className="bi bi-file-text"></i> Invoice Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>{label('Invoice Number', true)}<input {...inp()} value={invoiceForm.invoice_no} onChange={e => setInvoiceForm(f => ({ ...f, invoice_no: e.target.value }))} required /></div>
                  <div>{label('Invoice Date', true)}<input {...inp()} type="date" value={invoiceForm.invoice_date} onChange={e => setInvoiceForm(f => ({ ...f, invoice_date: e.target.value }))} required /></div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e8edf2', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  <i className="bi bi-airplane"></i> Booking Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {[
                    ['Route', `${selected.origin_detail?.code || selected.origin || '—'} → ${selected.destination_detail?.code || selected.destination || '—'}`],
                    ['Date', selected.departure_date || 'TBA'],
                    ['Pax', selected.passenger_count || 1],
                    ['Amount', fmt(selected.quoted_price_usd)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ color: '#6b7c93', fontSize: '0.7rem', marginBottom: '2px' }}>{k}</div>
                      <div style={{ color: '#0a2540', fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a2540', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e8edf2' }}>
                  <i className="bi bi-bank"></i> Bank Details (on Invoice)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>{label('Bank Name')}<input {...inp()} value={invoiceForm.bank_name} onChange={e => setInvoiceForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                  <div>{label('Account Number')}<input {...inp()} value={invoiceForm.bank_account} onChange={e => setInvoiceForm(f => ({ ...f, bank_account: e.target.value }))} /></div>
                  <div>{label('Swift Code')}<input {...inp()} value={invoiceForm.bank_swift} onChange={e => setInvoiceForm(f => ({ ...f, bank_swift: e.target.value }))} /></div>
                  <div>{label('Branch')}<input {...inp()} value={invoiceForm.bank_branch} onChange={e => setInvoiceForm(f => ({ ...f, bank_branch: e.target.value }))} /></div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                {label('Additional Notes (optional)')}
                <textarea rows={2} {...inp({ resize: 'vertical' })} value={invoiceForm.extra_notes}
                  onChange={e => setInvoiceForm(f => ({ ...f, extra_notes: e.target.value }))}
                  placeholder="e.g. Visa assistance provided, VVIP handling included…" />
              </div>

              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e8edf2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="checkbox" id="inv_send_email" checked={invoiceForm.send_email}
                    onChange={e => setInvoiceForm(f => ({ ...f, send_email: e.target.checked }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="inv_send_email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a2540', cursor: 'pointer' }}>
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
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handlePreviewPDF} disabled={pdfLoading}
                    style={{
                      padding: '0.6rem 1.1rem',
                      background: pdfLoading && pdfMode === 'preview' ? '#e8edf2' : 'transparent',
                      color: '#0a2540', border: '1.5px solid #0a2540',
                      borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                    {pdfLoading && pdfMode === 'preview'
                      ? <><Spinner size={14} color="#0a2540" /> Rendering...</>
                      : <><i className="bi bi-eye"></i> Preview PDF</>}
                  </button>

                  <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                    style={{
                      padding: '0.6rem 1.1rem',
                      background: pdfLoading && pdfMode === 'download' ? '#e8edf2' : 'transparent',
                      color: '#c8a245', border: '1.5px solid #c8a245',
                      borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                    {pdfLoading && pdfMode === 'download'
                      ? <><Spinner size={14} color="#c8a245" /> Generating...</>
                      : <><i className="bi bi-file-earmark-pdf"></i> Download PDF</>}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setModal(null)}
                    style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={invoiceLoading || !invoiceForm.send_email}
                    style={{ padding: '0.6rem 1.3rem', background: invoiceForm.send_email ? '#0a2540' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: invoiceForm.send_email ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {invoiceLoading
                      ? <><Spinner /> Sending...</>
                      : <><i className="bi bi-send-fill"></i> Send Invoice</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar"></i> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem' }}><i className="bi bi-exclamation-triangle-fill"></i> {priceErr}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>{label('Client Price (USD)', true)}<input type="number" step="0.01" value={priceForm.quoted_price_usd} onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} placeholder="25000.00" required {...inp()} /></div>
            <div>{label('Operator Cost (USD)')}<input type="number" step="0.01" value={priceForm.operator_cost_usd} onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd: e.target.value }))} placeholder="20000.00" {...inp()} /></div>
            <div>{label('Commission %')}<input type="number" step="0.01" value={priceForm.commission_pct} onChange={e => setPriceForm(f => ({ ...f, commission_pct: e.target.value }))} {...inp()} /></div>
            <div>{label('Update Status')}<select value={priceForm.status} onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))} {...inp()}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            {label('Email Message')}
            <textarea rows={3} value={priceForm.email_message} onChange={e => setPriceForm(f => ({ ...f, email_message: e.target.value }))} placeholder="Leave blank for auto-generated..." {...inp({ resize: 'vertical' })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" id="send_email" checked={priceForm.send_email} onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
            <label htmlFor="send_email" style={{ fontSize: '0.84rem', color: '#2a3a4e', cursor: 'pointer' }}>Send quote email to client</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={priceLoading} style={{ padding: '0.6rem 1.2rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {priceLoading ? <><Spinner /> Saving...</> : <><i className="bi bi-check-lg"></i> Save Quote</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* RFQ Modal */}
      <Modal open={modal === 'rfq'} onClose={() => setModal(null)} title={<><i className="bi bi-send"></i> Send RFQ — {selected?.guest_name}</>}>
        <form onSubmit={submitRFQ}>
          {rfqErr && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem' }}><i className="bi bi-exclamation-triangle-fill"></i> {rfqErr}</div>}
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#2a3a4e' }}>Enter operator IDs (comma-separated) to dispatch this RFQ.</p>
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.8rem', color: '#0a2540' }}>
            <strong>Route:</strong> {selected?.origin_detail?.code || selected?.origin} → {selected?.destination_detail?.code || selected?.destination} &nbsp;|&nbsp;
            <strong>Date:</strong> {selected?.departure_date} &nbsp;|&nbsp;
            <strong>Pax:</strong> {selected?.passenger_count || 1}
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            {label('Operator IDs', true)}
            <input value={rfqIds} onChange={e => setRfqIds(e.target.value)} placeholder="e.g. 1, 3, 7" required {...inp()} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={rfqLoading} style={{ padding: '0.6rem 1.2rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {rfqLoading ? <><Spinner /> Sending...</> : <><i className="bi bi-send-fill"></i> Send RFQ</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-airplane"></i> Booking Details</>} size="lg">
        {selected && (
          <div>
            {[
              ['Reference', selected.reference || selected.id],
              ['Guest', `${selected.guest_name || '—'} — ${selected.guest_email || '—'}`],
              ['Phone', selected.guest_phone || '—'],
              ['Route', `${selected.origin_detail?.code || selected.origin} → ${selected.destination_detail?.code || selected.destination}`],
              ['Date & Time', `${selected.departure_date || '—'}${selected.departure_time ? ` at ${selected.departure_time}` : ''}`],
              ['Passengers', selected.passenger_count || 1],
              ['Trip Type', `${(selected.trip_type || 'one_way').replace(/_/g, ' ')}${selected.return_date ? ` (Return: ${selected.return_date})` : ''}`],
              ['Catering', selected.catering_requested ? 'Yes' : 'No'],
              ['Ground Transport', selected.ground_transport_requested ? 'Yes' : 'No'],
              ['Special Requests', selected.special_requests || '—'],
              ['Submitted', new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #e8edf2' }}>
                <div style={{ fontWeight: 600, color: '#0a2540' }}>{k}</div>
                <div style={{ color: '#2a3a4e' }}>{v}</div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #e8edf2' }}>
              <div style={{ fontWeight: 600, color: '#0a2540' }}>Status</div>
              <div><Badge status={selected.status} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0' }}>
              <div style={{ fontWeight: 600, color: '#0a2540' }}>Pricing</div>
              <div>
                <div>Quoted: {fmt(selected.quoted_price_usd)}</div>
                <div>Operator Cost: {fmt(selected.operator_cost_usd)}</div>
                <div>Commission: {fmt(selected.commission_usd)} ({selected.commission_pct}%)</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setModal(null); openInvoice(selected) }}
                style={{ padding: '0.6rem 1.2rem', background: '#c8a245', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-file-earmark-pdf"></i> Generate PDF Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}