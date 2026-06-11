'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', surname: '', sap_no: '', work_tel: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response: { data: { error?: string } } }).response.data?.error
        : 'Registration failed';
      setError(message || 'Registration failed');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center dark:text-white">Register</h1>
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
              <input value={form.name} onChange={update('name')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Surname</label>
              <input value={form.surname} onChange={update('surname')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">SAP No</label>
            <input value={form.sap_no} onChange={update('sap_no')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Work Tel</label>
            <input value={form.work_tel} onChange={update('work_tel')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input type="email" value={form.email} onChange={update('email')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
            <input type="password" value={form.password} onChange={update('password')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium text-base">
            Register
          </button>
        </form>
        <p className="text-center mt-5 text-sm dark:text-gray-400">
          Already registered? <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
