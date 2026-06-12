'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Finding } from '@/types';
import PhotoUpload from '@/components/photo-upload';
import Link from 'next/link';

export default function FindingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get(`/api/findings/${id}`);
    const f: Finding = res.data;
    setFinding(f);
    if (user) {
      const auditRes = await api.get(`/api/audits/${f.audit_id}`);
      const leadId = auditRes.data.lead_auditor_id;
      setCanEdit(f.auditor_id === user.id || leadId === user.id);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  if (!finding) return (
    <div className="min-h-dvh flex items-center justify-center dark:text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push(`/audits/${finding.audit_id}`)} className="text-sm text-blue-600 dark:text-blue-400 mb-3 block">&larr; Back</button>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold dark:text-white">{finding.ncr_ref || 'Finding'}</h1>
              <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium mt-1 ${
                finding.priority === 'Major' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                finding.priority === 'Minor' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                finding.priority === 'Area of Concern' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}>{finding.priority}</span>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Date Raised</dt>
                <dd className="dark:text-white">{finding.date_raised}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Raised By</dt>
                <dd className="dark:text-white">{finding.raised_by_name} ({finding.raised_by_sap_no})</dd>
              </div>
            </div>

            {finding.origin_ncr && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Origin of NCR</dt>
                <dd className="dark:text-white">{finding.origin_ncr}</dd>
              </div>
            )}

            {finding.type_ncr && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Type of NCR</dt>
                <dd className="dark:text-white">{finding.type_ncr}</dd>
              </div>
            )}

            {finding.description && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Description</dt>
                <dd className="dark:text-white">{finding.description}</dd>
              </div>
            )}

            {finding.contravened_clause && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Contravened Clause</dt>
                <dd className="dark:text-white">{finding.contravened_clause}</dd>
              </div>
            )}

            {finding.work_type_process && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs">Work/Process Involved</dt>
                <dd className="dark:text-white">{finding.work_type_process}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Photos ({finding.photos.length}/3)</p>
            <PhotoUpload findingId={id as string} photos={finding.photos} onUpdate={load} />
          </div>

          <div className="mt-6 flex gap-3">
            {canEdit && (
              <Link href={`/findings/${id}/edit`} className="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium">Edit Finding</Link>
            )}
            <button onClick={async () => {
              try {
                const res = await api.get(`/api/findings/${id}/docx`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a');
                a.href = url;
                a.download = `ncr-${(id as string).slice(0, 8)}.docx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch { alert('Failed to download document'); }
            }} className="flex-1 text-center bg-green-600 text-white px-4 py-2.5 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-sm font-medium">Download Word</button>
            <Link href={`/audits/${finding.audit_id}`} className="flex-1 text-center bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-4 py-2.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">Back to Audit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
