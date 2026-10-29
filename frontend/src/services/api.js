const BASE_URL = '/api/v1';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('dp_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'omit' // We manage token explicitly in localStorage and headers
  });

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || 'Request failed';
    const err = new Error(errorMsg);
    err.code = data.error?.code || 'API_ERROR';
    err.details = data.error?.details;
    throw err;
  }

  return data;
};

// Auth Services
export const authApi = {
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiClient('/auth/me'),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  updatePassword: (passwords) => apiClient('/auth/update-password', { method: 'PUT', body: JSON.stringify(passwords) })
};

// CRM Leads Services
export const leadsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/leads?${query}`);
  },
  getById: (id) => apiClient(`/leads/${id}`),
  create: (data) => apiClient('/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  convert: (id) => apiClient(`/leads/${id}/convert`, { method: 'POST' }),
  delete: (id) => apiClient(`/leads/${id}`, { method: 'DELETE' })
};

// Contacts Services
export const contactsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/contacts?${query}`);
  },
  getById: (id) => apiClient(`/contacts/${id}`),
  create: (data) => apiClient('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/contacts/${id}`, { method: 'DELETE' })
};

// Companies Services
export const companiesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/companies?${query}`);
  },
  getById: (id) => apiClient(`/companies/${id}`),
  create: (data) => apiClient('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/companies/${id}`, { method: 'DELETE' })
};

// Merchants Services (Delivery Operations CRM)
export const merchantsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/merchants?${query}`);
  },
  getById: (id) => apiClient(`/merchants/${id}`),
  create: (data) => apiClient('/merchants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/merchants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/merchants/${id}`, { method: 'DELETE' }),
  exportCsv: () => '/api/v1/merchants/export/csv',
  portalLogin: (credentials) => apiClient('/merchants/portal/login', { method: 'POST', body: JSON.stringify(credentials) })
};

// Opportunities & Kanban Pipeline Services
export const opportunitiesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/opportunities?${query}`);
  },
  getKanban: () => apiClient('/opportunities?view=kanban'),
  getById: (id) => apiClient(`/opportunities/${id}`),
  create: (data) => apiClient('/opportunities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStage: (id, stageData) => apiClient(`/opportunities/${id}/stage`, { method: 'PATCH', body: JSON.stringify(stageData) }),
  delete: (id) => apiClient(`/opportunities/${id}`, { method: 'DELETE' })
};

// Tasks Services
export const tasksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/tasks?${query}`);
  },
  create: (data) => apiClient('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/tasks/${id}`, { method: 'DELETE' })
};

// Quotations Services
export const quotationsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/quotations?${query}`);
  },
  getById: (id) => apiClient(`/quotations/${id}`),
  create: (data) => apiClient('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiClient(`/quotations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

// Products Services
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/products?${query}`);
  },
  create: (data) => apiClient('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/products/${id}`, { method: 'DELETE' })
};

// Support Tickets Services
export const ticketsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/tickets?${query}`);
  },
  getById: (id) => apiClient(`/tickets/${id}`),
  create: (data) => apiClient('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  addComment: (id, commentData) => apiClient(`/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify(commentData) }),
  updateStatus: (id, status) => apiClient(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

// Notifications Services
export const notificationsApi = {
  getAll: () => apiClient('/notifications'),
  markAsRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiClient('/notifications/read-all', { method: 'PATCH' })
};

// Reports & Dashboard Services
export const reportsApi = {
  getDashboardMetrics: () => apiClient('/reports/dashboard'),
  exportData: (entity) => `${BASE_URL}/reports/export?entity=${entity}`
};

// Users & Settings Services
export const usersApi = {
  getAll: () => apiClient('/users'),
  create: (data) => apiClient('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export const auditApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/audit?${query}`);
  }
};

export const settingsApi = {
  get: () => apiClient('/settings'),
  update: (data) => apiClient('/settings', { method: 'PUT', body: JSON.stringify(data) })
};

// Delivery Tasks Services (Dispatcher Center)
export const deliveryTasksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/delivery-tasks?${query}`);
  },
  getById: (id) => apiClient(`/delivery-tasks/${id}`),
  create: (data) => apiClient('/delivery-tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/delivery-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, payload) => apiClient(`/delivery-tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  assignDriver: (id, payload) => apiClient(`/delivery-tasks/${id}/assign`, { method: 'POST', body: JSON.stringify(payload) }),
  bulkActions: (payload) => apiClient('/delivery-tasks/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  getDashboardMetrics: () => apiClient('/delivery-tasks/dashboard'),
  exportCsv: () => `${BASE_URL}/delivery-tasks/export/csv`
};

// Dispatch & Telematics Services
export const dispatchApi = {
  getMapData: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/dispatch/map-data?${query}`);
  },
  recordTelemetry: (payload) => apiClient('/dispatch/telemetry', { method: 'POST', body: JSON.stringify(payload) }),
  createRoute: (payload) => apiClient('/dispatch/route', { method: 'POST', body: JSON.stringify(payload) })
};

// Teams & Fleet Services
export const teamsApi = {
  getAll: () => apiClient('/teams'),
  create: (data) => apiClient('/teams', { method: 'POST', body: JSON.stringify(data) })
};

export const vehiclesApi = {
  getAll: () => apiClient('/vehicles'),
  create: (data) => apiClient('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// Merchant Portal Tenant Services
export const merchantPortalApi = {
  getTasks: (merchantId) => {
    const query = merchantId ? `?merchantId=${merchantId}` : '';
    return apiClient(`/merchants/portal/tasks${query}`);
  },
  createTask: (data) => apiClient('/merchants/portal/tasks', { method: 'POST', body: JSON.stringify(data) }),
  cancelTask: (id, merchantId) => apiClient(`/merchants/portal/tasks/${id}`, { method: 'DELETE', body: JSON.stringify({ merchantId }) }),
  getShippingLabel: (id, merchantId) => {
    const query = merchantId ? `?merchantId=${merchantId}` : '';
    return apiClient(`/merchants/portal/tasks/${id}/label${query}`);
  }
};

