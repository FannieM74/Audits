'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Audit } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    api.get('/api/audits').then((res) => setAudits(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Audits Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name} {user?.surname}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">My Audits</h2>
          <Link href="/audits/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + New Audit
          </Link>
        </div>

        {audits.length === 0 ? (
          <p className="text-gray-500">No audits found. Create one to get started.</p>
        ) : (
          <div className="space-y-4">
            {audits.map((a) => (
              <Link key={a.id} href={`/audits/${a.id}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.audit_type} &mdash; {a.audit_date}</p>
                    <p className="text-xs text-gray-400">Lead: {a.lead_auditor_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${a.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {a.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
