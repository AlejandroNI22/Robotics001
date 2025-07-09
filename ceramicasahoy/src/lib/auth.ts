// Sistema de autenticación con almacenamiento local
import { SecurityManager } from './security';
import { SecureStorage } from './storage';

export interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  created_at: string;
  last_login?: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: string;
  created_at: string;
}

export class AuthManager {
  private static instance: AuthManager;
  private securityManager: SecurityManager;
  private currentSession: Session | null = null;

  constructor() {
    this.securityManager = SecurityManager.getInstance();
    this.loadCurrentSession();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadCurrentSession(): void {
    this.currentSession = SecureStorage.getCurrentSession();
  }

  async signIn(email: string, password: string): Promise<Session> {
    // Sanitizar entrada
    const cleanEmail = SecurityManager.sanitizeInput(email);
    const cleanPassword = SecurityManager.sanitizeInput(password);

    // Verificar intentos de login  
    const attemptCheck = this.securityManager.checkLoginAttempts(cleanEmail);
    if (!attemptCheck.allowed) {
      const lockoutTime = attemptCheck.lockoutTime ? new Date(attemptCheck.lockoutTime) : new Date();
      throw new Error(`Demasiados intentos fallidos. Intenta de nuevo después de ${lockoutTime.toLocaleTimeString()}`);
    }

    try {
      const session = SecureStorage.signIn(cleanEmail, cleanPassword);
      this.currentSession = session;
      this.securityManager.recordLoginAttempt(cleanEmail, true);
      return session;
    } catch (error) {
      this.securityManager.recordLoginAttempt(cleanEmail, false);
      throw error;
    }
  }

  async signUp(email: string, password: string, username: string, role: 'admin' | 'manager' | 'viewer' = 'viewer'): Promise<User> {
    // Validar entrada
    const cleanEmail = SecurityManager.sanitizeInput(email);
    const cleanUsername = SecurityManager.sanitizeInput(username);
    const cleanPassword = SecurityManager.sanitizeInput(password);

    // Validar email
    if (!SecurityManager.validateEmail(cleanEmail)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña
    const passwordValidation = SecurityManager.validatePassword(cleanPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    return SecureStorage.createUser({
      username: cleanUsername,
      email: cleanEmail,
      role: role
    });
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.currentSession;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentSession?.user || null;
  }

  async signOut(): Promise<void> {
    SecureStorage.signOut();
    this.currentSession = null;
  }

  async hasPermission(resource: string, action: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    return SecureStorage.hasPermission(user.role, resource, action);
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  }

  async canManageContent(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'manager';
  }

  async canManageUsers(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  }
}

// Instancia global
export const authManager = AuthManager.getInstance();

// Funciones de conveniencia
export const signIn = (email: string, password: string) => authManager.signIn(email, password);
export const signUp = (email: string, password: string, username: string, role?: 'admin' | 'manager' | 'viewer') => authManager.signUp(email, password, username, role);
export const signOut = () => authManager.signOut();
export const getCurrentUser = () => authManager.getCurrentUser();
export const getCurrentSession = () => authManager.getCurrentSession();