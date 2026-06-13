'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Audit } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('registered=1')) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      window.history.replaceState({}, '', '/dashboard');
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    api.get('/api/audits').then((res) => setAudits(res.data));
  }, []);

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-3 sm:p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base sm:text-xl font-bold dark:text-white truncate">Audits</h1>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/settings" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Settings</Link>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">{user?.name} {user?.surname}</span>
          <button onClick={logout} className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium px-2 py-1">Logout</button>
        </div>
      </header>

      {showWelcome && (
        <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-4 py-3 text-sm text-center font-medium animate-fade-in">
          Welcome, {user?.name}! Your account was created successfully.
        </div>
      )}

      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold dark:text-white">My Audits</h2>
            <Link href="/audits/new" className="bg-blue-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium">
              + New Audit
            </Link>
          </div>

          {audits.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No audits found. Create one to get started.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {audits.map((a) => (
                <Link key={a.id} href={`/audits/${a.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base dark:text-white truncate">{a.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{a.audit_type} &mdash; {new Date(a.audit_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Lead: {a.lead_auditor_name}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{a.finding_count} finding{a.finding_count !== 1 ? 's' : ''} ({a.closed_count} closed)</span>
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[100px]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${a.completion}%`, backgroundColor: a.completion >= 100 ? '#22c55e' : a.completion >= 50 ? '#eab308' : '#ef4444' }} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 w-8 text-right">{a.completion}%</span>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-1 rounded font-medium ${
                      a.status === 'open'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
