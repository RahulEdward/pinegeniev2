'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function AuthNav() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="flex space-x-4">
        <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Welcome, {session.user?.name || 'User'}!
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm font-medium text-gray-700 hover:text-indigo-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-700 hover:text-indigo-600"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
      >
        Sign up
      </Link>
    </div>
  );
}
