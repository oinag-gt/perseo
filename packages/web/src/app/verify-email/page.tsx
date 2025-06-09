'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="mt-8">
          {status === 'loading' && (
            <div className="rounded-md bg-blue-50 p-4 text-center">
              <div className="text-sm text-blue-800">
                Verifying your email address...
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-md bg-green-50 p-4 text-center space-y-4">
              <div className="text-sm text-green-800">{message}</div>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign in to your account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-md bg-red-50 p-4 text-center space-y-4">
              <div className="text-sm text-red-800">{message}</div>
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Back to sign in
                </Link>
                <Link
                  href="/register"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Create new account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}