/**
 * API Utilities for Safe JSON Handling
 * 
 * Prevents "Unexpected token '<'" errors when APIs return HTML instead of JSON
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Safe fetch wrapper that handles HTML responses gracefully
 */
export async function safeFetch<T = any>(
  url: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (!isJson) {
      // If it's not JSON, it's probably an HTML error page
      const text = await response.text();
      console.error('API returned non-JSON response:', {
        url,
        status: response.status,
        contentType,
        text: text.substring(0, 200) + '...'
      });
      
      return {
        success: false,
        error: `API returned HTML instead of JSON. Status: ${response.status}`,
        status: response.status
      };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        status: response.status,
        data
      };
    }
    
    return {
      success: true,
      data,
      status: response.status
    };
    
  } catch (error) {
    console.error('API call failed:', { url, error });
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      return {
        success: false,
        error: 'Server returned invalid JSON (possibly an HTML error page)',
        status: 500
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
}

/**
 * Safe JSON parse that handles HTML responses
 */
export function safeJsonParse<T = any>(text: string): { success: boolean; data?: T; error?: string } {
  try {
    // Check if the text looks like HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return {
        success: false,
        error: 'Received HTML instead of JSON'
      };
    }
    
    const data = JSON.parse(text);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'JSON parse error'
    };
  }
}

/**
 * Create a safe API client with consistent error handling
 */
export class SafeApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return safeFetch<T>(`${this.baseUrl}${endpoint}`);
  }
  
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return safeFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return safeFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return safeFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
  }
}

// Default API client instance
export const apiClient = new SafeApiClient('/api');