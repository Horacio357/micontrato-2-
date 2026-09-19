const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('base44_token') || localStorage.getItem('token') || '';
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

const createEntityClient = (entityName) => ({
  list: async (sort, limit) => {
    const query = new URLSearchParams();
    if (sort) query.append('sort', sort);
    if (limit) query.append('limit', limit);
    return request(`/entities/${entityName}?${query.toString()}`);
  },
  filter: async (criteria = {}, sort, limit) => {
    return request(`/entities/${entityName}/filter`, {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  },
  get: async (id) => {
    return request(`/entities/${entityName}/${id}`);
  },
  create: async (payload) => {
    return request(`/entities/${entityName}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: async (id, payload) => {
    return request(`/entities/${entityName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  delete: async (id) => {
    return request(`/entities/${entityName}/${id}`, {
      method: 'DELETE',
    });
  },
});

export const base44 = {
  auth: {
    me: async () => {
      try {
        return await request('/auth/me');
      } catch {
        return null;
      }
    },
    login: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem('base44_token', data.token);
      }
      return data.user;
    },
    register: async (email, password, name) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (data.token) {
        localStorage.setItem('base44_token', data.token);
      }
      return data.user;
    },
    logout: async () => {
      localStorage.removeItem('base44_token');
      localStorage.removeItem('token');
      window.location.href = '/';
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    },
  },
  entities: new Proxy({}, {
    get: (target, entityName) => createEntityClient(entityName),
  }),
  functions: {
    invoke: async (functionName, payload) => {
      const data = await request(`/functions/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { data };
    },
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = getToken();
        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Error al subir archivo');
        }
        return response.json();
      },
    },
  },
  agents: {
    createConversation: async () => ({ id: 'conv-1' }),
    addMessage: async () => ({}),
    subscribeToConversation: () => {},
  },
};
