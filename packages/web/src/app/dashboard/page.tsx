'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">PERSEO Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                This is a protected route. You can only see this if you're authenticated.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Account Info</h3>
                <div className="text-left text-sm text-blue-800 space-y-1">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                  <p><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
                  {user?.tenantId && <p><strong>Tenant:</strong> {user.tenantId}</p>}
                </div>
              </div>

              {!user?.emailVerified && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-yellow-800">
                    <strong>Email Verification Required:</strong> Please check your email and verify your account to access all features.
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Next: Implement People Module (Phase 2)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}