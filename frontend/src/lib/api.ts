const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // localStorage is only available in the browser
  // to check prevents a crash during Next.js server-side rendering where window does not exist
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('feedpulse_token');
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers, // Allow callers to override headers if needed
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}] on ${endpoint}:`, data.message);
    }

    return data;

  } catch (error) {
    console.error(`Network error on ${endpoint}:`, error);

    return {
      success: false,
      data: null,
      error: 'Network error',
      message: 'Cannot connect to the server. Please make sure the backend is running.',
    };
  }
}

// API endpoints

export const submitFeedback = (feedbackData: {
  title: string;
  description: string;
  category: string;
  submitterName?: string;
  submitterEmail?: string;
}) => {
  return fetchAPI('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
};

export const loginAdmin = (email: string, password: string) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getAllFeedback = (params: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  sort?: string;
  search?: string;
} = {}) => {
  // Converts params object to query string — undefined and empty values are excluded
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return fetchAPI(`/feedback?${searchParams.toString()}`);
};

// Get dashboard stats (totalFeedback, openItems, averagePriority, topTag)
export const getFeedbackStats = (params: {
  category?: string;
  status?: string;
  search?: string;
} = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return fetchAPI(`/feedback/stats?${searchParams.toString()}`);
};

export const getFeedbackSummary = () => {
  return fetchAPI('/feedback/summary');
};

export const reanalyseFeedback = (id: string) => {
  return fetchAPI(`/feedback/${id}/reanalyse`, {
    method: 'POST',
  });
};

export const updateFeedbackStatus = (id: string, status: string) => {
  return fetchAPI(`/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const deleteFeedback = (id: string) => {
  return fetchAPI(`/feedback/${id}`, {
    method: 'DELETE',
  });
};