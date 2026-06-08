'use client';

import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import FindingForm from '@/components/finding-form';
import { useState } from 'react';

export default function NewFindingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await api.post(`/api/audits/${id}/findings`, data);
      router.push(`/audits/${id}`);
    } catch {
      alert('Failed to create finding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">New Finding</h1>
        <FindingForm auditId={id as string} onSave={handleSave} loading={loading} />
      </div>
    </div>
  );
}
