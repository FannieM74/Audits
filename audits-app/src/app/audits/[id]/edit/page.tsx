'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Audit, User, Business } from '@/types';

export default function EditAuditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    description: '', audit_type: 'Second Party', audit_days: 3,
    audit_date: '', status: 'open', business_id: '',
  });
  const [auditors, setAuditors] = useState<{ id: string; name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/api/users').then((res: { data: User[] }) => setAllUsers(res.data));
    api.get('/api/businesses').then((res: { data: Business[] }) => setBusinesses(res.data));
    api.get('/api/auth/me').then((res: { data: User }) => setCurrentUser(res.data));
    api.get(`/api/audits/${id}`).then((res: { data: Audit }) => {
      setForm({
        description: res.data.description || '',
        audit_type: res.data.audit_type, audit_days: res.data.audit_days,
        audit_date: res.data.audit_date, status: res.data.status,
        business_id: res.data.business_id || '',
      });
      setAuditors(res.data.auditors || []);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/api/audits/${id}`, { ...form, audit_days: Number(form.audit_days) });
      router.push(`/audits/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Update failed';
      setError(msg || 'Update failed');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const addAuditor = async () => {
    if (!selectedUserId) return;
    try {
      await api.post(`/api/audits/${id}/auditors`, { user_id: selectedUserId });
      const user = allUsers.find(u => u.id === selectedUserId);
      if (user) {
        setAuditors(prev => [...prev, { id: user.id, name: `${user.name} ${user.surname}` }]);
      }
      setSelectedUserId('');
    } catch {
      alert('Failed to assign auditor');
    }
  };

  const removeAuditor = async (userId: string) => {
    try {
      await api.delete(`/api/audits/${id}/auditors/${userId}`);
      setAuditors(prev => prev.filter(a => a.id !== userId));
    } catch {
      alert('Failed to remove auditor');
    }
  };

  const availableUsers = allUsers.filter(
    u => u.id !== currentUser?.id && !auditors.some(a => a.id === u.id)
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-6 dark:text-white">Edit Audit</h1>
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
                <option>First Party</option><option>Second Party</option><option>Third Party</option>
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
              <input type="date" value={form.audit_date} onChange={update('audit_date')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base" />
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
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
            <select value={form.status} onChange={update('status')} className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base">
              <option value="open">Open</option><option value="closed">Closed</option>
            </select>
          </div>
          <div className="pt-2 border-t dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Auditors</label>
            {auditors.length > 0 ? (
              <ul className="space-y-1 mb-3">
                {auditors.map(a => (
                  <li key={a.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded text-sm">
                    <span className="dark:text-gray-200">{a.name}</span>
                    <button type="button" onClick={() => removeAuditor(a.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium">Remove</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No auditors assigned.</p>
            )}
            <div className="flex gap-2">
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="flex-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white text-sm">
                <option value="">Add an auditor...</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} {u.surname} ({u.sap_no})</option>
                ))}
              </select>
              <button type="button" onClick={addAuditor} disabled={!selectedUserId} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">Add</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium text-base">Save</button>
            <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-4 py-2.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-base">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
