'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Audit, Finding } from '@/types';
import Link from 'next/link';

export default function AuditDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  const isLead = audit?.lead_auditor_id === user?.id;

  useEffect(() => {
    api.get(`/api/audits/${id}`).then((res) => setAudit(res.data));
    api.get(`/api/audits/${id}/findings`).then((res) => setFindings(res.data));
  }, [id]);

  if (!audit) return (
    <div className="min-h-dvh flex items-center justify-center dark:text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-3 sm:p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button onClick={() => router.push('/dashboard')} className="text-xs text-blue-600 dark:text-blue-400 shrink-0">&larr; Back</button>
          <div className="flex gap-2 shrink-0">
            {isLead && (
              <Link href={`/audits/${id}/edit`} className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded text-xs sm:text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-200">Edit</Link>
            )}
            <Link href={`/audits/${id}/findings/new`} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              + Finding
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-lg sm:text-2xl font-bold dark:text-white mb-2">{audit.title}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Type</span>
                <p className="font-medium dark:text-gray-200">{audit.audit_type}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Date</span>
                <p className="font-medium dark:text-gray-200">{new Date(audit.audit_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Duration</span>
                <p className="font-medium dark:text-gray-200">{audit.audit_days} day(s)</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Status</span>
                <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded font-medium ${
                  audit.status === 'open'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>{audit.status}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400 text-xs">Lead Auditor</span>
                <p className="font-medium dark:text-gray-200">{audit.lead_auditor_name}</p>
              </div>
              {audit.auditors && audit.auditors.length > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Auditors</span>
                  <p className="font-medium dark:text-gray-200">{audit.auditors.map(a => a.name).join(', ')}</p>
                </div>
              )}
            </div>
            {audit.finding_count > 0 && (
              <div className="mt-3 pt-3 border-t dark:border-gray-700 flex items-center gap-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">{audit.finding_count} finding{audit.finding_count !== 1 ? 's' : ''} ({audit.closed_count} closed)</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[200px]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${audit.completion}%`, backgroundColor: audit.completion >= 100 ? '#22c55e' : audit.completion >= 50 ? '#eab308' : '#ef4444' }} />
                </div>
                <span className={`font-medium ${audit.completion >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{audit.completion}%</span>
              </div>
            )}
            {audit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t dark:border-gray-700">{audit.description}</p>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-semibold dark:text-white">Findings ({findings.length})</h2>

          {findings.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">No findings yet.</p>
              <Link href={`/audits/${id}/findings/new`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium inline-block">
                + Create First Finding
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {findings.map((f) => (
                <Link key={f.id} href={`/findings/${f.id}`} className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base dark:text-white">{f.ncr_ref || 'NCR'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          f.priority === 'Major' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                          f.priority === 'Minor' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                          f.priority === 'Area of Concern' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                          'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        }`}>{f.priority}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          f.completion >= 100 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          f.completion >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        }`}>{f.completion}%</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{f.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {f.raised_by_name} | {f.date_raised}
                        {f.auditor_name && <span> | Auditor: {f.auditor_name}</span>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {(f.auditor_id === user?.id || isLead) && (
                        <Link href={`/findings/${f.id}/edit`} className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium hover:text-gray-900 dark:hover:text-white">Edit</Link>
                      )}
                    </div>
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
