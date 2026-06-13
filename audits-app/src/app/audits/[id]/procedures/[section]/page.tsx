'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ItemWithResponse } from '@/types';
import Link from 'next/link';

export default function ProcedureSectionPage() {
  const { id, section } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ItemWithResponse[]>([]);
  const [sectionName, setSectionName] = useState('');
  const [findingModal, setFindingModal] = useState<{ item: ItemWithResponse } | null>(null);
  const [findingForm, setFindingForm] = useState({
    priority: 'Observation',
    short_description: '',
    description: '',
    contravened_clause: '',
    origin_ncr: '',
    type_ncr: '',
    ncr_ref: '',
  });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const res = await api.get(`/api/audits/${id}/procedures/${section}`);
    setItems(res.data);
    if (res.data.length > 0) {
      setSectionName(res.data[0].section_name);
    }
  };

  useEffect(() => { load(); }, [id, section]);

  const handleResponse = async (itemId: string, response: string) => {
    await api.put(`/api/audits/${id}/responses/${itemId}`, { response });
    if (response === 'yes') {
      load();
    }
  };

  const openFindingModal = (item: ItemWithResponse) => {
    setFindingModal({ item });
    setFindingForm({
      priority: 'Observation',
      short_description: '',
      description: item.control_question,
      contravened_clause: '',
      origin_ncr: '',
      type_ncr: '',
      ncr_ref: '',
    });
  };

  const createFinding = async () => {
    if (!findingModal) return;
    setCreating(true);
    try {
      const body = {
        ...findingForm,
        description: findingForm.description || findingModal.item.control_question,
        audit_id: id,
        date_raised: new Date().toISOString().split('T')[0],
      };
      await api.post(`/api/audits/${id}/responses/${findingModal.item.id}/finding`, body);
      setFindingModal(null);
      load();
    } catch {
      alert('Failed to create finding');
    } finally {
      setCreating(false);
    }
  };

  const answered = items.filter((i) => i.response).length;
  const total = items.length;

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Link href={`/audits/${id}`} className="text-xs text-blue-600 dark:text-blue-400">&larr; Back</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold dark:text-white">{sectionName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Section {section}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium dark:text-white">{answered}/{total} answered</div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${total ? (answered / total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-1 divide-y dark:divide-gray-700">
            {items.map((item, idx) => (
              <div key={item.id} className="py-3">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono w-6 shrink-0 pt-1">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-white">{item.control_question}</p>
                    {item.evidence_required && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">Evidence: {item.evidence_required}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <select
                      value={item.response || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'no') {
                          openFindingModal(item);
                        } else {
                          handleResponse(item.id, val);
                        }
                      }}
                      className="text-xs border dark:border-gray-600 rounded px-2 py-1.5 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {item.finding_id && (
                      <Link href={`/findings/${item.finding_id}`} className="text-xs text-red-600 dark:text-red-400 font-medium shrink-0">View Finding</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {findingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setFindingModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold mb-3 dark:text-white">Create Finding</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{findingModal.item.control_question}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Priority</label>
                <select value={findingForm.priority} onChange={(e) => setFindingForm({ ...findingForm, priority: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white">
                  <option>Major</option><option>Minor</option><option>Area of Concern</option><option>Observation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Short Description</label>
                <input value={findingForm.short_description} onChange={(e) => setFindingForm({ ...findingForm, short_description: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">NCR Ref</label>
                <input value={findingForm.ncr_ref} onChange={(e) => setFindingForm({ ...findingForm, ncr_ref: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Origin of NCR</label>
                <select value={findingForm.origin_ncr} onChange={(e) => setFindingForm({ ...findingForm, origin_ncr: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white">
                  <option value="">Select...</option>
                  <option>Legal</option><option>System (Non-conformance)</option><option>Other Non-compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Type of NCR</label>
                <select value={findingForm.type_ncr} onChange={(e) => setFindingForm({ ...findingForm, type_ncr: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white">
                  <option value="">Select...</option>
                  {['Environment','Health','Railway Safety','Customer Complaint','Fire','Maritime','Vendor','System','HAZMAT','Quality','Audit','Other (Specify)'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Contravened Clause</label>
                <input value={findingForm.contravened_clause} onChange={(e) => setFindingForm({ ...findingForm, contravened_clause: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Description</label>
                <textarea value={findingForm.description} onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setFindingModal(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded text-sm font-medium">Cancel</button>
              <button onClick={createFinding} disabled={creating} className="flex-1 bg-blue-600 text-white py-2.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{creating ? 'Creating...' : 'Create Finding'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
