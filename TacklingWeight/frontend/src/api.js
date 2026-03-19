const BASE = '/api';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Stale JWT (user deleted / re-seeded) — force a clean re-login
    if (res.status === 401 && !path.startsWith('/auth/')) {
      window.location.href = '/login';
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

  // Challenges
  getActiveChallenges: () => request('/challenges/active'),
  submitChallenge: (id, body = {}) => request(`/challenges/${id}/submit`, { method: 'POST', body }),

  // Leaderboard
  getLeaderboard: (period = 'weekly') => request(`/leaderboard?period=${encodeURIComponent(period)}`),

  // Data deletion
  deleteAllData: () => request('/user/data', { method: 'DELETE' }),
};
