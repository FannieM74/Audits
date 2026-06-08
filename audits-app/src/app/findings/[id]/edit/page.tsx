'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Finding } from '@/types';
import FindingForm from '@/components/finding-form';

export default function EditFindingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/findings/${id}`).then((res) => setFinding(res.data));
  }, [id]);

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

  if (!finding) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Finding &mdash; {finding.ncr_ref}</h1>
        <FindingForm auditId={finding.audit_id} initial={finding} onSave={handleSave} loading={loading} />
      </div>
    </div>
  );
}
