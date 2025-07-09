import { useState, useEffect } from 'react';
import { authManager, User, Session } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    const initAuth = async () => {
      try {
        const currentSession = await authManager.getCurrentSession();
        if (currentSession) {
          const currentUser = await authManager.getCurrentUser();
          setUser(currentUser);
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // En caso de error, asegurar que el estado se resetee
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Verificar sesión cada 30 segundos
    const interval = setInterval(async () => {
      try {
        const currentSession = await authManager.getCurrentSession();
        if (currentSession) {
          const currentUser = await authManager.getCurrentUser();
          setUser(currentUser);
          setSession(currentSession);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    return await authManager.hasPermission(resource, action);
  };

  const isAdmin = async (): Promise<boolean> => {
    return await authManager.isAdmin();
  };

  const canManageContent = async (): Promise<boolean> => {
    return await authManager.canManageContent();
  };

  const canManageUsers = async (): Promise<boolean> => {
    return await authManager.canManageUsers();
  };

  // Versiones síncronas para uso inmediato en componentes
  const hasPermissionSync = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (user.role === 'manager') {
      if (resource === 'brands' && action === 'delete') return false;
      if (resource === 'users') return false;
      return ['brands', 'products', 'excel_formats'].includes(resource);
    }
    
    if (user.role === 'viewer') {
      return action === 'read';
    }
    
    return false;
  };

  const canManageUsersSync = (): boolean => {
    return user?.role === 'admin';
  };

  return {
    user,
    session,
    loading,
    userRole: user?.role || 'viewer',
    hasPermission: hasPermissionSync,
    isAdmin,
    canManageContent,
    canManageUsers: canManageUsersSync,
    useSupabase: false // Ahora usamos almacenamiento local
  };
};