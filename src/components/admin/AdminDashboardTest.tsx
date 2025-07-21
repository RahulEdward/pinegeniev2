'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminDashboardTest() {
  const { data: session, status } = useSession();
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      setAdminInfo({
        email: session.user.email,
        name: session.user.name,
        id: session.user.id,
      });
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Loading session...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Not authenticated - logout functionality working!</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-green-800 font-medium mb-2">Session Active</h3>
      <div className="text-sm text-green-700">
        <p><strong>Email:</strong> {adminInfo?.email}</p>
        <p><strong>Name:</strong> {adminInfo?.name}</p>
        <p><strong>ID:</strong> {adminInfo?.id}</p>
      </div>
      <p className="text-xs text-green-600 mt-2">
        Logout buttons should be visible in the header and sidebar.
      </p>
    </div>
  );
}