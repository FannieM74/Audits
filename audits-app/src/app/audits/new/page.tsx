'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { User, Business } from '@/types';
import { AxiosError } from 'axios';
import Multiselect from '@/components/multiselect';

export default function NewAuditPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState({
    description: '', audit_type: 'Second Party', audit_days: 3,
    audit_date: '', business_id: '', auditor_ids: [] as string[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/users').then((res) => setUsers(res.data));
    api.get('/api/businesses').then((res) => setBusinesses(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/audits', { ...form, audit_days: Number(form.audit_days) });
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
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-6 dark:text-white">New Audit</h1>
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
            <textarea value={form.description} onChange={update('description')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" rows={3} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Audit Type</label>
              <select value={form.audit_type} onChange={update('audit_type')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base">
                <option>First Party</option>
                <option>Second Party</option>
                <option>Third Party</option>
              </select>
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Days</label>
              <select value={form.audit_days} onChange={update('audit_days')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base">
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
              <input type="date" value={form.audit_date} onChange={update('audit_date')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Business Being Audited</label>
            <select value={form.business_id} onChange={update('business_id')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base">
              <option value="">Select business...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name} &mdash; Plant {b.plant_no}</option>
              ))}
            </select>
          </div>
          <Multiselect
            label="Assign Auditors"
            options={users.filter((u) => u.id !== currentUser?.id).map((u) => ({ id: u.id, label: `${u.name} ${u.surname} (${u.sap_no})` }))}
            selected={form.auditor_ids}
            onChange={(ids) => setForm((f) => ({ ...f, auditor_ids: ids }))}
          />
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium text-base">Create</button>
            <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-4 py-2.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-base">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
