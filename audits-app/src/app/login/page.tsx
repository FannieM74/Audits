'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response: { data: { error?: string } } }).response.data?.error
        : 'Login failed';
      setError(message || 'Login failed');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center dark:text-white">Audits</h1>
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium text-base">
            Login
          </button>
        </form>
        <p className="text-center mt-5 text-sm dark:text-gray-400">
          Don&apos;t have an account? <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
