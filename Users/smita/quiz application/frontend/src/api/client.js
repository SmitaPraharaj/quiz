const API_BASE = 'https://quiz-8skn.onrender.com';

function getToken() {
  return localStorage.getItem('quiz_token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  register: (username, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getQuestions: () => request('/questions'),

  validateAnswer: (optionId) =>
    request('/quiz/validate', {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    }),

  submitQuiz: (payload) =>
    request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  saveFeedback: (resultId, feedbackText, difficultyRating) =>
    request(`/quiz/feedback/${resultId}`, {
      method: 'PATCH',
      body: JSON.stringify({ feedbackText, difficultyRating }),
    }),
};
