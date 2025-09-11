'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GrantPremiumPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [planName, setPlanName] = useState('pro');
  const [durationMonths, setDurationMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          planName,
          durationMonths
        })
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Grant Premium Access</h1>
            <p className="text-gray-600 mt-2">Assign premium subscription to a user</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                User Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label htmlFor="planName" className="block text-sm font-medium text-gray-700">
                Plan Type
              </label>
              <select
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pro">Pro Plan</option>
                <option value="premium">Premium Plan</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (Months)
              </label>
              <input
                type="number"
                id="duration"
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                min="1"
                max="120"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Granting Access...' : 'Grant Premium Access'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <div>
                  <h3 className="text-green-800 font-medium">✅ Success!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Premium access granted to {result.user.email}
                  </p>
                  <p className="text-green-700 text-sm">
                    Plan: {result.subscription.planName}
                  </p>
                  <p className="text-green-700 text-sm">
                    Expires: {new Date(result.subscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-red-800 font-medium">❌ Error</h3>
                  <p className="text-red-700 text-sm mt-1">{result.error}</p>
                  {result.details && (
                    <p className="text-red-600 text-xs mt-1">{result.details}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}