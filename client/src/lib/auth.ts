import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    // Store token and user data in localStorage
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
    
    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    // Store token and user data in localStorage
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
    
    return data;
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // In a real app, you might also call a logout endpoint
    // await apiRequest("POST", "/api/auth/logout");
  }

  getCurrentUser(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(this.userKey);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Define role hierarchy
    const roleHierarchy = {
      'admin': 4,
      'manager': 3,
      'sales_rep': 2,
      'viewer': 1,
    } as const;
    
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  }

  canAccess(resource: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.isActive) return false;
    
    // Define role-based permissions
    const permissions = {
      'admin': ['calendar', 'crm', 'video', 'analytics', 'scraping', 'automations', 'files', 'settings'],
      'manager': ['calendar', 'crm', 'video', 'analytics', 'files'],
      'sales_rep': ['calendar', 'crm', 'video', 'files'],
      'viewer': ['calendar', 'crm'],
    } as const;
    
    const userPermissions = permissions[user.role as keyof typeof permissions] || [];
    return userPermissions.includes(resource as any);
  }

  updateUser(userData: Partial<AuthUser>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    }
  }

  // Utility method to get user initials for avatars
  getUserInitials(user?: AuthUser | null): string {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return 'U';
    
    return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase() || 'U';
  }

  // Utility method to get full name
  getFullName(user?: AuthUser | null): string {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return 'Unknown User';
    
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
  }

  // Check if user can perform specific actions
  canCreateEvents(): boolean {
    return this.hasRole('sales_rep');
  }

  canManageContacts(): boolean {
    return this.hasRole('sales_rep');
  }

  canAccessAnalytics(): boolean {
    return this.hasRole('manager');
  }

  canManageAutomations(): boolean {
    return this.hasRole('admin');
  }

  canAccessDataScraping(): boolean {
    return this.hasRole('admin');
  }

  canManageUsers(): boolean {
    return this.hasRole('admin');
  }

  canManageCompanySettings(): boolean {
    return this.hasRole('admin');
  }
}

export const authService = new AuthService();

// Export convenience functions
export const {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  hasRole,
  canAccess,
  updateUser,
  getUserInitials,
  getFullName,
  canCreateEvents,
  canManageContacts,
  canAccessAnalytics,
  canManageAutomations,
  canAccessDataScraping,
  canManageUsers,
  canManageCompanySettings,
} = authService;
