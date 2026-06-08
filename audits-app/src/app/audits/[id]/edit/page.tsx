'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Audit } from '@/types';

export default function EditAuditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', audit_type: 'Second Party', audit_days: 3,
    audit_date: '', status: 'open',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/audits/${id}`).then((res: { data: Audit }) => {
      setForm({
        title: res.data.title, description: res.data.description || '',
        audit_type: res.data.audit_type, audit_days: res.data.audit_days,
        audit_date: res.data.audit_date, status: res.data.status,
      });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/api/audits/${id}`, form);
      router.push(`/audits/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Update failed';
      setError(msg || 'Update failed');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Audit</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={form.title} onChange={update('title')} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={update('description')} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Audit Type</label>
              <select value={form.audit_type} onChange={update('audit_type')} className="w-full border rounded px-3 py-2">
                <option>First Party</option><option>Second Party</option><option>Third Party</option>
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Days</label>
              <select value={form.audit_days} onChange={update('audit_days')} className="w-full border rounded px-3 py-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={form.audit_date} onChange={update('audit_date')} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={update('status')} className="w-full border rounded px-3 py-2">
              <option value="open">Open</option><option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save</button>
            <button type="button" onClick={() => router.back()} className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
