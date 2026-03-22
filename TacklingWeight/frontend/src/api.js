// In production, set VITE_API_URL to your deployed backend URL (e.g. https://your-backend.vercel.app)
const BASE = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'tw_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const token = tokenStore.get();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Stale JWT (user deleted / re-seeded) — force a clean re-login,
    // but only when we're already inside the app (not on auth pages).
    if (res.status === 401 && !path.startsWith('/auth/')) {
      const onAuthPage = ['/login', '/register'].some((p) =>
        window.location.pathname.startsWith(p)
      );
      if (!onAuthPage) {
        window.location.href = '/login';
      }
      return;
    }
    const msg = data.error || data.errors?.join(', ') || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (body) => request('/profile', { method: 'PATCH', body }),

  // Weigh-ins
  getWeighIns: () => request('/weighins'),
  addWeighIn: (body) => request('/weighins', { method: 'POST', body }),

  // Progress
  getSummary: () => request('/progress/summary'),

  // Advice
  getAdvice: (body) => request('/advice', { method: 'POST', body }),
  chatAdvice: (body) => request('/advice/chat', { method: 'POST', body }),

  // Challenges
  getActiveChallenges: () => request('/challenges/active'),
  submitChallenge: (id, body = {}) => request(`/challenges/${id}/submit`, { method: 'POST', body }),

  // Leaderboard
  getLeaderboard: (period = 'weekly') => request(`/leaderboard?period=${encodeURIComponent(period)}`),

  // Data deletion
  deleteAllData: () => request('/user/data', { method: 'DELETE' }),
};
