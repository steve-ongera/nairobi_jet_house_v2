import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE });

// ── Attach access token ──────────────────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let refreshing = false;
let queue = [];

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
      }
      original._retry = true;
      refreshing = true;
      try {
        const refresh = localStorage.getItem('refresh');
        const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh });
        localStorage.setItem('access', data.access);
        queue.forEach(p => p.resolve(data.access));
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        queue.forEach(p => p.reject(e));
        queue = [];
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export const authAPI = {
  register: d => api.post('/auth/register/', d),
  login:    d => api.post('/auth/login/', d),
  refresh:  d => api.post('/auth/refresh/', d),
  profile:  ()  => api.get('/auth/profile/'),
  updateProfile: d => api.patch('/auth/profile/', d),
};

// ══════════════════════════════════════════════════════════════════════════════
// CATALOG
// ══════════════════════════════════════════════════════════════════════════════
export const catalogAPI = {
  airports:  params => api.get('/airports/', { params }),
  aircraft:  params => api.get('/aircraft/', { params }),
  yachts:    params => api.get('/yachts/', { params }),
  // V2 public operator listings
  opAircraft: params => api.get('/operator-aircraft/', { params }),
  opYachts:   params => api.get('/operator-yachts/', { params }),
  opAircraftDetail: id => api.get(`/operator-aircraft/${id}/`),
  opYachtDetail:    id => api.get(`/operator-yachts/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// BOOKINGS & INQUIRIES
// ══════════════════════════════════════════════════════════════════════════════
export const bookingAPI = {
  create:    d  => api.post('/bookings/', d),
  track:     ref => api.get(`/bookings/track/${ref}/`),
  byEmail:   email => api.get('/bookings/by-email/', { params: { email } }),
};

export const charterAPI = {
  create: d  => api.post('/charters/', d),
  track:  ref => api.get(`/charters/track/${ref}/`),
};

export const leaseAPI        = { create: d => api.post('/leases/', d) };
export const flightInqAPI    = { create: d => api.post('/flight-inquiries/', d) };
export const contactAPI      = { create: d => api.post('/contacts/', d) };
export const groupCharterAPI = { create: d => api.post('/group-charters/', d) };
export const cargoAPI        = { create: d => api.post('/cargo/', d) };
export const salesAPI        = { create: d => api.post('/aircraft-sales/', d) };

// ══════════════════════════════════════════════════════════════════════════════
// JOBS
// ══════════════════════════════════════════════════════════════════════════════
export const jobsAPI = {
  list:   params => api.get('/jobs/', { params }),
  get:    id => api.get(`/jobs/${id}/`),
  apply:  d  => api.post('/job-applications/', d),
};

// ══════════════════════════════════════════════════════════════════════════════
// MEMBERSHIP
// ══════════════════════════════════════════════════════════════════════════════
export const membershipAPI = {
  tiers:   () => api.get('/membership-tiers/'),
  my:      () => api.get('/memberships/my/'),
  create:  d  => api.post('/memberships/create_membership/', d),
  list:    () => api.get('/memberships/'),
};

// ══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE
// ══════════════════════════════════════════════════════════════════════════════
export const marketplaceAPI = {
  aircraft: params => api.get('/marketplace-aircraft/', { params }),
  book:     d      => api.post('/marketplace-bookings/', d),
  myBookings: ()   => api.get('/marketplace-bookings/'),
};

export const savedRoutesAPI = {
  list:   ()  => api.get('/saved-routes/'),
  create: d   => api.post('/saved-routes/', d),
  delete: id  => api.delete(`/saved-routes/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
export const notifAPI = {
  list:       ()  => api.get('/notifications/'),
  unread:     ()  => api.get('/notifications/unread_count/'),
  markRead:   id  => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ══════════════════════════════════════════════════════════════════════════════
export const docsAPI = {
  list:   params => api.get('/documents/', { params }),
  create: d      => api.post('/documents/', d),
  delete: id     => api.delete(`/documents/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARDS
// ══════════════════════════════════════════════════════════════════════════════
export const dashboardAPI = {
  client: () => api.get('/dashboard/client/'),
  owner:  () => api.get('/dashboard/owner/'),
};

// ══════════════════════════════════════════════════════════════════════════════
// OPERATOR PORTAL
// ══════════════════════════════════════════════════════════════════════════════
export const operatorAPI = {
  // Aircraft
  myAircraft:       params => api.get('/my-aircraft/', { params }),
  createAircraft:   d      => api.post('/my-aircraft/', d),
  updateAircraft:   (id,d) => api.patch(`/my-aircraft/${id}/`, d),
  deleteAircraft:   id     => api.delete(`/my-aircraft/${id}/`),
  // Yachts
  myYachts:         params => api.get('/my-yachts/', { params }),
  createYacht:      d      => api.post('/my-yachts/', d),
  updateYacht:      (id,d) => api.patch(`/my-yachts/${id}/`, d),
  // Availability
  blocks:           params => api.get('/availability-blocks/', { params }),
  createBlock:      d      => api.post('/availability-blocks/', d),
  deleteBlock:      id     => api.delete(`/availability-blocks/${id}/`),
  // RFQ
  rfqBids:          params => api.get('/rfq-bids/', { params }),
  submitBid:        d      => api.post('/rfq-bids/', d),
  // Bookings
  opBookings:       params => api.get('/operator-bookings/', { params }),
  acceptBooking:    (id,d) => api.post(`/operator-bookings/${id}/accept/`, d),
  rejectBooking:    (id,d) => api.post(`/operator-bookings/${id}/reject/`, d),
  // Reviews
  reviews:          params => api.get('/operator-reviews/', { params }),
};

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════════════════
export const adminAPI = {
  overview: () => api.get('/admin/overview/'),

  // Flight bookings
  bookings:        params  => api.get('/admin/flight-bookings/', { params }),
  getBooking:      id      => api.get(`/admin/flight-bookings/${id}/`),
  createBooking:   d       => api.post('/admin/flight-bookings/', d),
  updateBooking:   (id,d)  => api.patch(`/admin/flight-bookings/${id}/`, d),
  setPrice:        (id,d)  => api.post(`/admin/flight-bookings/${id}/set_price/`, d),
  assignOperator:  (id,d)  => api.post(`/admin/flight-bookings/${id}/assign_operator/`, d),
  sendRFQ:         (id,d)  => api.post(`/admin/flight-bookings/${id}/send_rfq/`, d),
  revenue:         ()      => api.get('/admin/flight-bookings/revenue/'),

  // Yacht charters
  charters:        params  => api.get('/admin/yacht-charters/', { params }),
  setCharterPrice: (id,d)  => api.post(`/admin/yacht-charters/${id}/set_price/`, d),

  // Inquiries
  inquiries:       ()      => api.get('/admin/inquiries/'),
  leases:          params  => api.get('/admin/leases/', { params }),
  replyLease:      (id,d)  => api.post(`/admin/leases/${id}/reply/`, d),
  contacts:        params  => api.get('/admin/contacts/', { params }),
  groups:          params  => api.get('/admin/group-charters/', { params }),
  cargo:           params  => api.get('/admin/cargo/', { params }),
  aircraftSales:   params  => api.get('/admin/aircraft-sales/', { params }),

  // Users
  users:           params  => api.get('/admin/users/', { params }),
  toggleUser:      id      => api.post(`/admin/users/${id}/toggle_active/`),
  changeRole:      (id,d)  => api.post(`/admin/users/${id}/change_role/`, d),

  // Marketplace
  marketplace:     params  => api.get('/admin/marketplace/', { params }),
  updateMktStatus: (id,d)  => api.post(`/admin/marketplace/${id}/update_status/`, d),

  // Email
  emailLogs:       params  => api.get('/admin/email-logs/', { params }),
  sendEmail:       d       => api.post('/admin/send-email/', d),
  priceCalc:       d       => api.post('/admin/price-calculator/', d),

  // Commission
  commission:      ()      => api.get('/admin/commission/'),
  createCommission: d      => api.post('/admin/commission/', d),

  // Jobs
  jobs:            params  => api.get('/admin/jobs/', { params }),
  createJob:       d       => api.post('/admin/jobs/', d),
  updateJob:       (id,d)  => api.patch(`/admin/jobs/${id}/`, d),
  toggleJob:       id      => api.post(`/admin/jobs/${id}/toggle_active/`),
  jobApplications: params  => api.get('/admin/job-applications/', { params }),
  updateAppStatus: (id,d)  => api.post(`/admin/job-applications/${id}/update_status/`, d),

  // V2 Operators
  operators:       params  => api.get('/admin/operators/', { params }),
  getOperator:     id      => api.get(`/admin/operators/${id}/`),
  createOperator:  d       => api.post('/admin/operators/', d),
  updateOperator:  (id,d)  => api.patch(`/admin/operators/${id}/`, d),
  activateOp:      id      => api.post(`/admin/operators/${id}/activate/`),
  suspendOp:       id      => api.post(`/admin/operators/${id}/suspend/`),
  changeTier:      (id,d)  => api.post(`/admin/operators/${id}/change_tier/`, d),
  opAircraft:      id      => api.get(`/admin/operators/${id}/aircraft/`),
  opYachts:        id      => api.get(`/admin/operators/${id}/yachts/`),
  opBookings:      id      => api.get(`/admin/operators/${id}/bookings/`),
  opPayouts:       id      => api.get(`/admin/operators/${id}/payouts/`),
  opReviews:       id      => api.get(`/admin/operators/${id}/reviews/`),
  opWebhooks:      id      => api.get(`/admin/operators/${id}/webhooks/`),

  // Approve/reject aircraft
  approveAircraft: id      => api.post(`/my-aircraft/${id}/approve/`),
  rejectAircraft:  id      => api.post(`/my-aircraft/${id}/reject/`),
  approveYacht:    id      => api.post(`/my-yachts/${id}/approve/`),

  // RFQ bids
  rfqBids:         params  => api.get('/rfq-bids/', { params }),
  acceptBid:       id      => api.post(`/rfq-bids/${id}/accept/`),
  shortlistBid:    id      => api.post(`/rfq-bids/${id}/shortlist/`),

  // Commission rules
  commissionRules: ()      => api.get('/admin/commission-rules/'),
  createRule:      d       => api.post('/admin/commission-rules/', d),
  updateRule:      (id,d)  => api.patch(`/admin/commission-rules/${id}/`, d),
  toggleRule:      id      => api.post(`/admin/commission-rules/${id}/toggle_active/`),

  // Payouts
  payouts:         params  => api.get('/admin/payouts/', { params }),
  markPaid:        (id,d)  => api.post(`/admin/payouts/${id}/mark_paid/`, d),
  markProcessing:  id      => api.post(`/admin/payouts/${id}/mark_processing/`),

  // Webhooks
  webhooks:        params  => api.get('/admin/webhooks/', { params }),
  retryWebhook:    id      => api.post(`/admin/webhooks/${id}/retry/`),

  // Documents
  documents:       params  => api.get('/admin/documents/', { params }),

  // Marketplace aircraft
  mktAircraft:     params  => api.get('/marketplace-aircraft/', { params }),
  approveMkt:      id      => api.post(`/marketplace-aircraft/${id}/approve/`),
};

export default api;