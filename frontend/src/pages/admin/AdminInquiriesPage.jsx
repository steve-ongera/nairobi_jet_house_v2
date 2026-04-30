// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN INQUIRIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

export function AdminInquiriesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('contacts')

  useEffect(() => {
    adminAPI.getInquiries()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const TABS = [
    { key: 'contacts', label: 'Contacts', icon: 'bi-envelope', items: data?.contacts },
    { key: 'leases', label: 'Leases', icon: 'bi-file-earmark', items: data?.leases },
    { key: 'groups', label: 'Group Charters', icon: 'bi-people', items: data?.groups },
    { key: 'cargo', label: 'Air Cargo', icon: 'bi-boxes', items: data?.cargo },
    { key: 'sales', label: 'Aircraft Sales', icon: 'bi-shop', items: data?.sales },
    { key: 'flights', label: 'Flight Inquiries', icon: 'bi-airplane', items: data?.flights },
  ]

  const renderItem = (item, type) => {
    const name = item.full_name || item.guest_name || item.contact_name || '—'
    const email = item.email || item.guest_email || '—'
    const date = new Date(item.created_at).toLocaleDateString()
    return (
      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', marginBottom: '0.65rem', background: 'var(--white)', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.2rem' }}>{name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.35rem' }}>{email} · {date}</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--gray-600)' }}>
            {item.message || item.cargo_description || item.usage_description || item.additional_notes || '—'}
          </div>
        </div>
        <span className="badge badge-amber">{item.status || 'new'}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Inquiries</h2>
          <p>All incoming inquiry types</p>
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            <i className={`bi ${t.icon}`} /> {t.label}
            {t.items && <span className="badge badge-gray" style={{ marginLeft: 4 }}>{t.items.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
      ) : (
        <div>
          {TABS.find(t => t.key === tab)?.items?.length === 0 ? (
            <div className="table-empty"><i className="bi bi-inbox" />No {tab} found.</div>
          ) : (
            TABS.find(t => t.key === tab)?.items?.map(item => renderItem(item, tab))
          )}
        </div>
      )}
    </div>
  )
}