'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to PERSEO
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Platform for Educational Resources, Services, Enrollment & Operations
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Phase 1 Complete! 🎉</h2>
            <p className="text-blue-800 text-sm">
              Authentication system is now fully implemented with email verification, 
              password reset, and multi-tenant support.
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
              <p className="text-gray-600 text-sm">
                Complete auth system with JWT tokens, email verification, and password reset
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Multi-tenant</h3>
              <p className="text-gray-600 text-sm">
                Schema-based multi-tenancy for isolated organization data
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">API Ready</h3>
              <p className="text-gray-600 text-sm">
                RESTful API with Swagger documentation at /api/docs
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>
              API Documentation: <a href="http://localhost:3001/api/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">localhost:3001/api/docs</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}