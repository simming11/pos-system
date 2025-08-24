// API connection utility for POS system
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Fetches data from the API
 * @param endpoint - The API endpoint to call
 * @param options - Fetch options
 * @returns Promise with the API response
 */
export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // For responses that have no content
  if (response.status === 204) {
    return null;
  }

  // Check if response is ok
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || 'An error occurred while fetching data');
  }

  return await response.json();
}

/**
 * Wrapper for GET requests
 * @param endpoint - API endpoint
 * @returns Promise with the API response
 */
export function get(endpoint: string) {
  return fetchFromApi(endpoint);
}

/**
 * Wrapper for POST requests
 * @param endpoint - API endpoint
 * @param data - Data to send
 * @returns Promise with the API response
 */
export function post(endpoint: string, data: any) {
  return fetchFromApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Wrapper for PUT requests
 * @param endpoint - API endpoint
 * @param data - Data to send
 * @returns Promise with the API response
 */
export function put(endpoint: string, data: any) {
  return fetchFromApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Wrapper for DELETE requests
 * @param endpoint - API endpoint
 * @returns Promise with the API response
 */
export function del(endpoint: string) {
  return fetchFromApi(endpoint, {
    method: 'DELETE',
  });
}
