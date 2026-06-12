'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Business } from '@/types';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [form, setForm] = useState({ name: '', plant_no: '', site: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get('/api/businesses');
    setBusinesses(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', plant_no: '', site: '' });
    setShowModal(true);
  }

  function openEdit(b: Business) {
    setEditing(b);
    setForm({ name: b.name, plant_no: b.plant_no, site: b.site });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.plant_no.trim() || !form.site.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/businesses/${editing.id}`, form);
      } else {
        await api.post('/api/businesses', form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      console.error('save failed', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this business?')) return;
    try {
      await api.delete(`/api/businesses/${id}`);
      await load();
    } catch (err) {
      console.error('delete failed', err);
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-3 sm:p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base sm:text-xl font-bold dark:text-white">Settings</h1>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/dashboard" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Dashboard</Link>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">{user?.name} {user?.surname}</span>
          <button onClick={logout} className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium px-2 py-1">Logout</button>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold dark:text-white">Businesses</h2>
            <button onClick={openCreate} className="bg-blue-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium">+ Add Business</button>
          </div>

          {businesses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No businesses yet.</p>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Business</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Plant</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Site</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <td className="px-4 py-3 dark:text-white">{b.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.plant_no}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.site}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(b)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs mr-3">Edit</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{editing ? 'Edit Business' : 'Add Business'}</h3>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-3 dark:bg-gray-700 dark:text-white text-sm" />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plant</label>
            <input value={form.plant_no} onChange={(e) => setForm({ ...form, plant_no: e.target.value })} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-3 dark:bg-gray-700 dark:text-white text-sm" />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site</label>
            <input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:text-white text-sm" />

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
