'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';
import { AxiosError } from 'axios';

export default function NewAuditPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', audit_type: 'Second Party', audit_days: 3,
    audit_date: '', auditor_ids: [] as string[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/users').then((res) => setUsers(res.data));
  }, []);

  const toggleAuditor = (id: string) => {
    setForm((f) => ({
      ...f,
      auditor_ids: f.auditor_ids.includes(id)
        ? f.auditor_ids.filter((x) => x !== id)
        : [...f.auditor_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/audits', form);
      for (const userId of form.auditor_ids) {
        await api.post(`/api/audits/${res.data.id}/auditors`, { user_id: userId });
      }
      router.push(`/audits/${res.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to create audit';
      setError(msg || 'Failed to create audit');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">New Audit</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
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
                <option>First Party</option>
                <option>Second Party</option>
                <option>Third Party</option>
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
              <input type="date" value={form.audit_date} onChange={update('audit_date')} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Assign Auditors</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded">
                  <input type="checkbox" checked={form.auditor_ids.includes(u.id)}
                    onChange={() => toggleAuditor(u.id)} />
                  {u.name} {u.surname} ({u.sap_no})
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create</button>
            <button type="button" onClick={() => router.back()} className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
