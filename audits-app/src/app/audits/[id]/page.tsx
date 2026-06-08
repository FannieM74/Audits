'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Audit, Finding } from '@/types';
import Link from 'next/link';

export default function AuditDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  const isLead = audit?.lead_auditor_id === user?.id;

  useEffect(() => {
    api.get(`/api/audits/${id}`).then((res) => setAudit(res.data));
    api.get(`/api/audits/${id}/findings`).then((res) => setFindings(res.data));
  }, [id]);

  if (!audit) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{audit.title}</h1>
          <p className="text-sm text-gray-500">{audit.audit_type} &mdash; {audit.audit_date} ({audit.audit_days} day(s))</p>
        </div>
        <div className="flex gap-2">
          {isLead && (
            <Link href={`/audits/${id}/edit`} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Edit</Link>
          )}
          <Link href={`/audits/${id}/findings/new`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            + New Finding
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600 mb-4">{audit.description}</p>

        <h2 className="text-lg font-semibold mb-4">Findings ({findings.length})</h2>

        {findings.length === 0 ? (
          <p className="text-gray-500">No findings yet.</p>
        ) : (
          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{f.ncr_ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        f.priority === 'Major' ? 'bg-red-100 text-red-700' :
                        f.priority === 'Minor' ? 'bg-yellow-100 text-yellow-700' :
                        f.priority === 'Area of Concern' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{f.priority}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{f.description}</p>
                    <p className="text-xs text-gray-400 mt-1">By: {f.raised_by_name} | {f.date_raised}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/findings/${f.id}`} className="text-blue-600 text-sm hover:underline">View</Link>
                    {(f.auditor_id === user?.id || isLead) && (
                      <Link href={`/findings/${f.id}/edit`} className="text-gray-600 text-sm hover:underline">Edit</Link>
                    )}
                  </div>
                </div>
                {f.photos && f.photos.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {f.photos.map((p) => (
                      <img key={p.id} src={p.url} alt="Finding photo" className="w-12 h-12 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
