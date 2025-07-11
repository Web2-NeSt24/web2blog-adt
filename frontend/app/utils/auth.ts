// Authentication utilities and API calls

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  user?: User;
  error?: string;
}

/**
 * Get CSRF token from cookie
 */
const getCSRFToken = (): string | null => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

/**
 * Fetch CSRF token from Django
 */
const fetchCSRFToken = async (): Promise<void> => {
  try {
    await fetch('/api/auth/csrf/', {
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

/**
 * Make authenticated API request with CSRF token
 */
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // First ensure we have a CSRF token
  if (!getCSRFToken()) {
    await fetchCSRFToken();
  }

  const csrfToken = getCSRFToken();
  const headers = new Headers(options.headers);
  
  if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
    headers.set('X-CSRFToken', csrfToken);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

export { makeAuthenticatedRequest };

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/user/me/profile', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Login user with username and password
 */
export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await makeAuthenticatedRequest('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      return { user: await getCurrentUser() || undefined };
    } else {
      const errorData = await response.json();
      return { error: errorData.error || 'Login failed' };
    }
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
};

/**
 * Register a new user
 */
export const registerUser = async (
  username: string, 
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await makeAuthenticatedRequest('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.status === 201) {
      return { user: await getCurrentUser() || undefined };
    } else {
      const errorData = await response.json();
      return { error: errorData.error || 'Registration failed' };
    }
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await makeAuthenticatedRequest('/api/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Logout failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Change user password
 */
export const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await makeAuthenticatedRequest('/api/auth/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Password change failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Validate username format (alphanumeric)
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  if (username.length > 150) {
    return { valid: false, error: 'Username must be less than 150 characters' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return { valid: false, error: 'Username must be alphanumeric' };
  }
  return { valid: true };
};

/**
 * Validate password format
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};
