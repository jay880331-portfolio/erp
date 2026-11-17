// API 호출 유틸리티 함수들

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

export async function apiCall(url: string, options: ApiOptions = {}) {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && options.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // 토큰이 만료되었거나 유효하지 않음
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      throw new Error('Unauthorized');
    }
    
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// 편의 함수들
export const api = {
  get: (url: string, headers?: Record<string, string>) => 
    apiCall(url, { method: 'GET', headers }),
    
  post: (url: string, body: unknown, headers?: Record<string, string>) => 
    apiCall(url, { method: 'POST', body, headers }),
    
  put: (url: string, body: unknown, headers?: Record<string, string>) => 
    apiCall(url, { method: 'PUT', body, headers }),
    
  delete: (url: string, headers?: Record<string, string>) => 
    apiCall(url, { method: 'DELETE', headers }),
};