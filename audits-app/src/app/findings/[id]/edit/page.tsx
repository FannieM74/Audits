'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Finding, Photo } from '@/types';
import FindingForm from '@/components/finding-form';
import PhotoUpload from '@/components/photo-upload';

export default function EditFindingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const loadPhotos = useCallback(async () => {
    try {
      const res = await api.get(`/api/findings/${id}`);
      setPhotos(res.data.photos || []);
    } catch {
      // ignore
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/findings/${id}`);
      const f: Finding = res.data;
      setFinding(f);
      setPhotos(f.photos || []);
      if (user) {
        const auditRes = await api.get(`/api/audits/${f.audit_id}`);
        const isAuditor = f.auditor_id === user.id;
        const isLead = auditRes.data.lead_auditor_id === user.id;
        if (!isAuditor && !isLead) setUnauthorized(true);
      }
    })();
  }, [id, user]);

  const handleSave = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await api.put(`/api/findings/${id}`, data);
      router.push(`/findings/${id}`);
    } catch {
      alert('Failed to update finding');
    } finally {
      setLoading(false);
    }
  };

  if (unauthorized) {
    router.replace('/dashboard');
    return null;
  }

  if (!finding) return (
    <div className="min-h-dvh flex items-center justify-center dark:text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-6 dark:text-white">Edit Finding</h1>
        <FindingForm auditId={finding.audit_id} initial={finding} onSave={handleSave} onCancel={() => router.push('/findings/' + id)} loading={loading} />
        <div className="mt-8 pt-6 border-t dark:border-gray-700">
          <p className="text-sm font-medium mb-2 dark:text-gray-300">Photos ({photos.length}/3)</p>
          <PhotoUpload findingId={id as string} photos={photos} onUpdate={loadPhotos} />
        </div>
      </div>
    </div>
  );
}
