// ═══════════════════════════════════════════════════════════════════════════════
// NairobiJetHouse V2 — services/api.js
// Centralised Axios instance with JWT auto-refresh + all API calls
// ═══════════════════════════════════════════════════════════════════════════════
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────────
let _refreshing = false
let _queue      = []

const processQueue = (error, token = null) => {
  _queue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
  _queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error.response?.data || error)
    }
    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }
    original._retry = true
    _refreshing     = true

    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      _refreshing = false
      localStorage.removeItem('access_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh })
      localStorage.setItem('access_token', data.access)
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`
      processQueue(null, data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return api(original)
    } catch (err) {
      processQueue(err, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      _refreshing = false
    }
  }
)

// ─── Helper — unwrap data ──────────────────────────────────────────────────────
const get  = (url, params)  => api.get(url, { params }).then(r => r.data)
const post = (url, body)    => api.post(url, body).then(r => r.data)
const put  = (url, body)    => api.put(url, body).then(r => r.data)
const patch= (url, body)    => api.patch(url, body).then(r => r.data)
const del  = (url)          => api.delete(url).then(r => r.data)

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  register : (data)  => post('/auth/register/', data),
  login    : (data)  => post('/auth/login/',    data),
  refresh  : (token) => post('/auth/refresh/',  { refresh: token }),
  profile  : ()      => get('/auth/profile/'),
  update   : (data)  => patch('/auth/profile/', data),
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC CATALOG
// ═══════════════════════════════════════════════════════════════════════════════
export const searchAirports   = (q)      => get('/airports/', { search: q })
export const getAircraft      = (params) => get('/aircraft/', params)
export const getAircraftById  = (id)     => get(`/aircraft/${id}/`)
export const getYachts        = (params) => get('/yachts/', params)
export const getYachtById     = (id)     => get(`/yachts/${id}/`)

// V2 — approved operator listings
export const getOperatorAircraft     = (params) => get('/operator-aircraft/', params)
export const getOperatorAircraftById = (id)     => get(`/operator-aircraft/${id}/`)
export const getOperatorYachts       = (params) => get('/operator-yachts/', params)
export const getOperatorYachtById    = (id)     => get(`/operator-yachts/${id}/`)

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS & INQUIRIES (PUBLIC)
// ═══════════════════════════════════════════════════════════════════════════════
export const createFlightBooking = (data)  => post('/bookings/', data)
export const trackFlightBooking  = (ref)   => get(`/bookings/track/${ref}/`)
export const bookingsByEmail     = (email) => get('/bookings/by-email/', { email })

export const createYachtCharter  = (data) => post('/charters/', data)
export const trackYachtCharter   = (ref)  => get(`/charters/track/${ref}/`)

export const createLeaseInquiry  = (data) => post('/leases/', data)
export const createFlightInquiry = (data) => post('/flight-inquiries/', data)
export const createContact       = (data) => post('/contacts/', data)
export const createGroupCharter  = (data) => post('/group-charters/', data)
export const createCargo         = (data) => post('/cargo/', data)
export const createAircraftSales = (data) => post('/aircraft-sales/', data)

// ═══════════════════════════════════════════════════════════════════════════════
// JOBS (PUBLIC)
// ═══════════════════════════════════════════════════════════════════════════════
export const getJobs       = (params) => get('/jobs/', params)
export const getJobById    = (id)     => get(`/jobs/${id}/`)
export const applyForJob   = (data)   => post('/job-applications/', data)

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBERSHIP & MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════════
export const membershipApi = {
  getTiers      : ()     => get('/membership-tiers/'),
  getMy         : ()     => get('/memberships/my/'),
  create        : (data) => post('/memberships/create_membership/', data),
  getAll        : ()     => get('/memberships/'),
}

export const marketplaceApi = {
  getAircraft   : (params) => get('/marketplace-aircraft/', params),
  getAircraftById:(id)     => get(`/marketplace-aircraft/${id}/`),
  addAircraft   : (data)   => post('/marketplace-aircraft/', data),
  updateAircraft: (id, d)  => patch(`/marketplace-aircraft/${id}/`, d),
  approve       : (id)     => post(`/marketplace-aircraft/${id}/approve/`),

  getBookings   : (params) => get('/marketplace-bookings/', params),
  createBooking : (data)   => post('/marketplace-bookings/', data),

  getLogs       : (id)     => get(`/marketplace-aircraft/${id}/maintenance_logs/`),
}

export const maintenanceApi = {
  getAll  : (params) => get('/maintenance-logs/', params),
  create  : (data)   => post('/maintenance-logs/', data),
  update  : (id, d)  => patch(`/maintenance-logs/${id}/`, d),
  remove  : (id)     => del(`/maintenance-logs/${id}/`),
}

export const savedRoutesApi = {
  getAll  : ()     => get('/saved-routes/'),
  create  : (data) => post('/saved-routes/', data),
  remove  : (id)   => del(`/saved-routes/${id}/`),
}

export const paymentsApi = {
  getAll  : (params) => get('/payments/', params),
}

export const disputesApi = {
  getAll  : ()     => get('/disputes/'),
  create  : (data) => post('/disputes/', data),
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const notificationsApi = {
  getAll      : ()   => get('/notifications/'),
  unreadCount : ()   => get('/notifications/unread_count/'),
  markRead    : (id) => post(`/notifications/${id}/mark_read/`),
  markAllRead : ()   => post('/notifications/mark_all_read/'),
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════
export const documentsApi = {
  getAll  : (params) => get('/documents/', params),
  upload  : (data)   => post('/documents/', data),
  remove  : (id)     => del(`/documents/${id}/`),
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR PORTAL (V2)
// ═══════════════════════════════════════════════════════════════════════════════
export const operatorApi = {
  // Aircraft
  getMyAircraft    : (params) => get('/my-aircraft/', params),
  getAircraftById  : (id)     => get(`/my-aircraft/${id}/`),
  addAircraft      : (data)   => post('/my-aircraft/', data),
  updateAircraft   : (id, d)  => patch(`/my-aircraft/${id}/`, d),
  deleteAircraft   : (id)     => del(`/my-aircraft/${id}/`),

  // Yachts
  getMyYachts      : (params) => get('/my-yachts/', params),
  getYachtById     : (id)     => get(`/my-yachts/${id}/`),
  addYacht         : (data)   => post('/my-yachts/', data),
  updateYacht      : (id, d)  => patch(`/my-yachts/${id}/`, d),
  deleteYacht      : (id)     => del(`/my-yachts/${id}/`),

  // Availability
  getBlocks        : (params) => get('/availability-blocks/', params),
  addBlock         : (data)   => post('/availability-blocks/', data),
  updateBlock      : (id, d)  => patch(`/availability-blocks/${id}/`, d),
  deleteBlock      : (id)     => del(`/availability-blocks/${id}/`),

  // RFQ bids
  getBids          : (params) => get('/rfq-bids/', params),
  submitBid        : (data)   => post('/rfq-bids/', data),
  updateBid        : (id, d)  => patch(`/rfq-bids/${id}/`, d),

  // Bookings
  getBookings      : (params) => get('/operator-bookings/', params),
  acceptBooking    : (id, d)  => post(`/operator-bookings/${id}/accept/`, d),
  rejectBooking    : (id, d)  => post(`/operator-bookings/${id}/reject/`, d),

  // Reviews
  getReviews       : ()       => get('/operator-reviews/'),

  // Payouts (read via admin endpoint if operator)
  getPayouts       : ()       => get('/admin/payouts/'),
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — CORE
// ═══════════════════════════════════════════════════════════════════════════════
export const adminApi = {
  overview        : ()          => get('/admin/overview/'),

  // Flight bookings
  getBookings     : (params)    => get('/admin/flight-bookings/', params),
  getBookingById  : (id)        => get(`/admin/flight-bookings/${id}/`),
  updateBooking   : (id, d)     => patch(`/admin/flight-bookings/${id}/`, d),
  setPrice        : (id, d)     => post(`/admin/flight-bookings/${id}/set_price/`, d),
  sendRFQ         : (id, d)     => post(`/admin/flight-bookings/${id}/send_rfq/`, d),
  assignOperator  : (id, d)     => post(`/admin/flight-bookings/${id}/assign_operator/`, d),
  revenue         : ()          => get('/admin/flight-bookings/revenue/'),

  // Yacht charters
  getCharters     : (params)    => get('/admin/yacht-charters/', params),
  getCharterById  : (id)        => get(`/admin/yacht-charters/${id}/`),
  updateCharter   : (id, d)     => patch(`/admin/yacht-charters/${id}/`, d),
  setCharterPrice : (id, d)     => post(`/admin/yacht-charters/${id}/set_price/`, d),

  // Inquiries
  getInquiries    : ()          => get('/admin/inquiries/'),
  getLeases       : (params)    => get('/admin/leases/', params),
  replyLease      : (id, d)     => post(`/admin/leases/${id}/reply/`, d),
  getContacts     : (params)    => get('/admin/contacts/', params),
  getGroups       : (params)    => get('/admin/group-charters/', params),
  replyGroup      : (id, d)     => post(`/admin/group-charters/${id}/reply/`, d),
  getCargo        : (params)    => get('/admin/cargo/', params),
  getSales        : (params)    => get('/admin/aircraft-sales/', params),

  // Users
  getUsers        : (params)    => get('/admin/users/', params),
  getUserById     : (id)        => get(`/admin/users/${id}/`),
  updateUser      : (id, d)     => patch(`/admin/users/${id}/`, d),
  toggleActive    : (id)        => post(`/admin/users/${id}/toggle_active/`),
  changeRole      : (id, role)  => post(`/admin/users/${id}/change_role/`, { role }),

  // Marketplace
  getMarketplace  : (params)    => get('/admin/marketplace/', params),
  updateMktStatus : (id, d)     => post(`/admin/marketplace/${id}/update_status/`, d),

  // Email
  getEmailLogs    : (params)    => get('/admin/email-logs/', params),
  sendEmail       : (data)      => post('/admin/send-email/', data),

  // Commission
  getCommission   : ()          => get('/admin/commission/'),
  createCommission: (data)      => post('/admin/commission/', data),

  // Price calculator
  calculate       : (data)      => post('/admin/price-calculator/', data),

  // Jobs
  getJobs         : (params)    => get('/admin/jobs/', params),
  createJob       : (data)      => post('/admin/jobs/', data),
  updateJob       : (id, d)     => patch(`/admin/jobs/${id}/`, d),
  deleteJob       : (id)        => del(`/admin/jobs/${id}/`),
  toggleJobActive : (id)        => post(`/admin/jobs/${id}/toggle_active/`),
  getApplications : (params)    => get('/admin/job-applications/', params),
  updateAppStatus : (id, d)     => post(`/admin/job-applications/${id}/update_status/`, d),

  // V2 — Operators
  getOperators      : (params)  => get('/admin/operators/', params),
  getOperatorById   : (id)      => get(`/admin/operators/${id}/`),
  createOperator    : (data)    => post('/admin/operators/', data),
  updateOperator    : (id, d)   => patch(`/admin/operators/${id}/`, d),
  activateOperator  : (id)      => post(`/admin/operators/${id}/activate/`),
  suspendOperator   : (id)      => post(`/admin/operators/${id}/suspend/`),
  changeTier        : (id, t)   => post(`/admin/operators/${id}/change_tier/`, { tier: t }),
  getOpAircraft     : (id)      => get(`/admin/operators/${id}/aircraft/`),
  getOpYachts       : (id)      => get(`/admin/operators/${id}/yachts/`),
  getOpBookings     : (id)      => get(`/admin/operators/${id}/bookings/`),
  getOpPayouts      : (id)      => get(`/admin/operators/${id}/payouts/`),
  getOpReviews      : (id)      => get(`/admin/operators/${id}/reviews/`),
  getOpWebhooks     : (id)      => get(`/admin/operators/${id}/webhooks/`),

  approveAircraft   : (id)      => post(`/my-aircraft/${id}/approve/`),
  rejectAircraft    : (id)      => post(`/my-aircraft/${id}/reject/`),

  acceptBid         : (id)      => post(`/rfq-bids/${id}/accept/`),
  shortlistBid      : (id)      => post(`/rfq-bids/${id}/shortlist/`),

  // V2 — Commission rules
  getCommRules      : ()        => get('/admin/commission-rules/'),
  createCommRule    : (data)    => post('/admin/commission-rules/', data),
  updateCommRule    : (id, d)   => patch(`/admin/commission-rules/${id}/`, d),
  toggleCommRule    : (id)      => post(`/admin/commission-rules/${id}/toggle_active/`),

  // V2 — Payouts
  getPayouts        : (params)  => get('/admin/payouts/', params),
  markPaid          : (id, d)   => post(`/admin/payouts/${id}/mark_paid/`, d),
  markProcessing    : (id)      => post(`/admin/payouts/${id}/mark_processing/`),

  // V2 — Webhooks
  getWebhooks       : (params)  => get('/admin/webhooks/', params),
  retryWebhook      : (id)      => post(`/admin/webhooks/${id}/retry/`),
}

// ─── Dashboards ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  client : () => get('/dashboard/client/'),
  owner  : () => get('/dashboard/owner/'),
}

export default api