'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SectionDetailResponse } from '@/types';
import Link from 'next/link';

export default function ProcedureSectionPage() {
  const { id, section } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<SectionDetailResponse | null>(null);
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [findingModal, setFindingModal] = useState<{ controlId: string; nonCompliant: string[] } | null>(null);
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
    setData(res.data);
  };

  useEffect(() => { load(); }, [id, section]);

  const handleResponse = async (evidenceItemId: string, response: string) => {
    await api.put(`/api/audits/${id}/responses/${evidenceItemId}`, { response });
    load();
  };

  const toggleControl = (controlId: string) => {
    setExpandedControl(prev => prev === controlId ? null : controlId);
  };

  const openFindingModal = (controlId: string, nonCompliant: string[]) => {
    setFindingModal({ controlId, nonCompliant });
    setFindingForm({
      priority: 'Observation',
      short_description: '',
      description: nonCompliant.map(n => `• ${n}`).join('\n'),
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
        audit_id: id,
        date_raised: new Date().toISOString().split('T')[0],
        procedure: section,
      };
      await api.post(`/api/audits/${id}/controls/${findingModal.controlId}/finding`, body);
      setFindingModal(null);
      load();
    } catch {
      alert('Failed to create finding');
    } finally {
      setCreating(false);
    }
  };

  const desc = data?.section_description;
  const controls = data?.controls || [];

  // Count answered/total across all evidence items
  const totalEvidence = controls.reduce((sum, c) => sum + (c.evidences?.length || 0), 0);
  const answeredEvidence = controls.reduce((sum, c) =>
    sum + (c.evidences?.filter(e => e.response).length || 0), 0);

  // Parse section description into segments
  const parseDesc = (text: string) => {
    const segments: { icon: string; label: string; content: string }[] = [];
    let remaining = text;
    // Remove leading "N. Title" if present
    remaining = remaining.replace(/^\d+\.\s+[^\n]*\n?/, '').trim();

    const blocks = remaining.split(/\n(?=(?:People|Control|Safety|Process|Market|Operational|Contract|Security))/i);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const firstLine = lines[0]?.trim() || '';
      let icon = '📋';
      let label = '';
      if (/^people/i.test(firstLine)) { icon = '👥'; label = 'People'; }
      else if (/^control/i.test(firstLine)) { icon = '🎯'; label = 'Control'; }
      else if (/^safety/i.test(firstLine)) { icon = '⚠️'; label = 'Safety, Health, Environment, Quality'; }
      else if (/^process/i.test(firstLine)) { icon = '📋'; label = 'Process'; }
      else if (/^market/i.test(firstLine)) { icon = '📈'; label = 'Market Growth'; }
      else if (/^contract/i.test(firstLine)) { icon = '📝'; label = 'Contract'; }
      else if (/^security/i.test(firstLine)) { icon = '🔒'; label = 'Security'; }
      else if (/^operational/i.test(firstLine)) { icon = '⚙️'; label = 'Operational Efficiency'; }
      else { icon = '📌'; label = firstLine; }

      const rest = lines.slice(1).join('\n').trim();
      if (rest) {
        segments.push({ icon, label, content: rest });
      }
    }
    return segments;
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Link href={`/audits/${id}`} className="text-xs text-blue-600 dark:text-blue-400">&larr; Back to Audit</Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Procedure {section}</span>
        </div>

        {desc && desc.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h1 className="text-lg sm:text-xl font-bold dark:text-white mb-3">Section {section}: {data?.section_name}</h1>
            <div className="space-y-2 text-xs sm:text-sm dark:text-gray-200">
              {parseDesc(desc.description).map((seg, i) => (
                <div key={i} className="flex gap-2">
                  <span className="shrink-0 pt-0.5">{seg.icon}</span>
                  <div>
                    <span className="font-semibold">{seg.label}:</span>
                    <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">{seg.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold dark:text-white">
              Applicable Controls ({controls.length})
            </h2>
            <div className="text-right text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">{answeredEvidence}/{totalEvidence} items answered</span>
            </div>
          </div>

          <div className="space-y-2">
            {controls.map((control, ci) => {
              const evs = control.evidences || [];
              const answeredCount = evs.filter(e => e.response).length;
              const hasNo = evs.some(e => e.response === 'no');
              const nonCompliantLabels = evs
                .filter(e => e.response === 'no')
                .map(e => e.sub_label || e.evidence_text)
                .filter(Boolean);
              const isExpanded = expandedControl === control.id;

              return (
                <div key={control.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleControl(control.id)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0">{ci + 1}</span>
                      <span className="text-xs sm:text-sm font-medium dark:text-white line-clamp-2">{control.control_question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{answeredCount}/{evs.length}</span>
                      <div className="w-16 sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${evs.length ? (answeredCount / evs.length) * 100 : 0}%`,
                          backgroundColor: evs.length && answeredCount === evs.length ? '#22c55e' : answeredCount > 0 ? '#3b82f6' : '#d1d5db'
                        }} />
                      </div>
                      <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t dark:border-gray-700 px-3 sm:px-4 pb-4">
                      {evs.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 py-3">No evidence items defined.</p>
                      ) : (
                        <div className="space-y-1.5 pt-3">
                          {evs.map((ev) => {
                            const label = ev.sub_label ? `${ev.sub_label}. ` : '';
                            return (
                              <div key={ev.id} className="flex items-start gap-3 py-1.5">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono w-6 shrink-0 pt-1">
                                  {ev.sub_label || `${ci + 1}.${ev.sort_order + 1}`}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm dark:text-gray-200">{label}{ev.evidence_text}</p>
                                </div>
                                <div className="shrink-0">
                                  <select
                                    value={ev.response || ''}
                                    onChange={(e) => handleResponse(ev.id, e.target.value)}
                                    className={`text-xs border dark:border-gray-600 rounded px-2 py-1.5 dark:bg-gray-700 dark:text-white ${
                                      ev.response === 'no' ? 'border-red-400 dark:border-red-500' :
                                      ev.response === 'yes' ? 'border-green-400 dark:border-green-500' : ''
                                    }`}
                                  >
                                    <option value="">—</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        {control.has_finding ? (
                          <Link href={`/findings/${control.finding_id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                            🔍 View Finding (linked to this control)
                          </Link>
                        ) : hasNo ? (
                          <button
                            onClick={() => openFindingModal(control.id, nonCompliantLabels)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            ⚠️ Non-compliant: {nonCompliantLabels.join(', ')} — Create Finding
                          </button>
                        ) : (
                          answeredCount > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">✅ No findings required (all compliant)</p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {findingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setFindingModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold mb-1 dark:text-white">Create Finding for Control</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Non-compliant items: {findingModal.nonCompliant.join(', ')}</p>
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
