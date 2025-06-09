'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireEmailVerification = false,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check email verification requirement
    if (requireEmailVerification && user && !user.emailVerified) {
      router.push('/verify-email-required');
      return;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, isLoading, isAuthenticated, requireEmailVerification, allowedRoles, router, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if email verification is required but not verified
  if (requireEmailVerification && user && !user.emailVerified) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}