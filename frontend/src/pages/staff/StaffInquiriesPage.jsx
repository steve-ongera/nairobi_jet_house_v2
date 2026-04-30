// ═══════════════════════════════════════════════════════════════════════════════
// STAFF INQUIRIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

export function StaffInquiriesPage() {
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
  ]

  const renderItem = (item) => {
    const name = item.full_name || item.guest_name || item.contact_name || '—'
    const email = item.email || item.guest_email || '—'
    return (
      <div key={item.id} style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', marginBottom: '0.65rem', background: 'var(--white)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.2rem' }}>{name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>
              {email} · {new Date(item.created_at).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--gray-600)' }}>
              {item.message || item.cargo_description || item.usage_description || '—'}
            </div>
          </div>
          <span className="badge badge-amber">{item.status || 'new'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Inquiries" sub="All incoming inquiry types" />
      
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
            TABS.find(t => t.key === tab)?.items?.map(renderItem)
          )}
        </div>
      )}
    </div>
  )
}

export default StaffInquiriesPage;