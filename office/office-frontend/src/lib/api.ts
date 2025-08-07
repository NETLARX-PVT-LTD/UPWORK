const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = true
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}