'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Finding, SectionDetailResponse } from '@/types';
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
    raised_by_sap_no: '',
    contact_details: '',
  });
  const [creating, setCreating] = useState(false);
  const [orphanFindings, setOrphanFindings] = useState<{ id: string; short_description: string; description: string; priority: string; date_raised: string; ncr_ref: string }[]>([]);
  const [linkModal, setLinkModal] = useState<{ controlId: string; findingId: string } | null>(null);
  const [linking, setLinking] = useState(false);

  const load = async () => {
    const res = await api.get(`/api/audits/${id}/procedures/${section}`);
    setData(res.data);
  };

  useEffect(() => { load(); }, [id, section]);

  useEffect(() => {
    api.get(`/api/audits/${id}/orphan-findings`).then((res) => {
      setOrphanFindings(res.data || []);
    }).catch(() => {});
  }, [id]);

  const handleResponse = async (evidenceItemId: string, response: string, controlId: string) => {
    await api.put(`/api/audits/${id}/responses/${evidenceItemId}`, { response });
    load();
    if (response === 'no') {
      const ctrl = controls.find(c => c.id === controlId);
      const item = ctrl?.evidences?.find(e => e.id === evidenceItemId);
      if (item) {
        const label = item.sub_label ? `${item.sub_label} ${item.evidence_text}` : item.evidence_text;
        openFindingModal(controlId, [label].filter(Boolean));
      }
    }
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
      raised_by_sap_no: user?.sap_no || '',
      contact_details: user?.work_tel || '',
    });
  };

  const createFinding = async () => {
    if (!findingModal) return;
    setCreating(true);
    try {
      const auditRes = await api.get(`/api/audits/${id}`);
      const audit = auditRes.data;
      const body = {
        ...findingForm,
        audit_id: id,
        date_raised: new Date().toISOString().split('T')[0],
        procedure: `${String(section).padStart(3, '0')} ${data?.section_name || ''}`,
        raised_by_business_id: audit.raised_by_business_id || null,
        raised_against_business_id: audit.business_id || null,
      };
      await api.post(`/api/audits/${id}/controls/${findingModal.controlId}/finding`, body);
      setFindingModal(null);
      setExpandedControl(findingModal.controlId);
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
  const pendingFinding = controls.filter(c =>
    c.evidences?.some(e => e.response === 'no') && !c.has_finding
  ).length;

  // Parse section description into segments
  const parseDesc = (text: string) => {
    const segments: { icon: string; label: string; content: string }[] = [];
    let remaining = text;
    remaining = remaining.replace(/^\d+\.\s+[^\n]*\n?/, '').trim();

    const blocks = remaining.split(/\n(?=(?:People|Control|Safety|Process|Market|Contract|Security)\b)/i);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const firstLine = lines[0]?.trim() || '';
      let icon = '📋';
      let label = '';
      let rest = lines.slice(1).join('\n').trim();

      // If rest is empty, the content may be on the same line as the label
      // e.g. "Control : Implemented Integrated Management System"
      if (!rest) {
        const match = firstLine.match(/^(People|Control|Safety[^:]*|Process|Market|Contract|Security|Operational)\s*:\s*(.+)/i);
        if (match) {
          const rawLabel = match[1].toLowerCase();
          if (/^people/.test(rawLabel)) { icon = '👥'; label = 'People'; }
          else if (/^control/.test(rawLabel)) { icon = '🎯'; label = 'Control'; }
          else if (/^safety/.test(rawLabel)) { icon = '⚠️'; label = 'Safety, Health, Environment, Quality'; }
          else if (/^process/.test(rawLabel)) { icon = '📋'; label = 'Process'; }
          else if (/^market/.test(rawLabel)) { icon = '📈'; label = 'Market Growth'; }
          else if (/^contract/.test(rawLabel)) { icon = '📝'; label = 'Contract'; }
          else if (/^security/.test(rawLabel)) { icon = '🔒'; label = 'Security'; }
          else if (/^operational/.test(rawLabel)) { icon = '⚙️'; label = 'Operational Efficiency'; }
          rest = match[2].trim();
        }
      }

      if (!label) {
        if (/^people/i.test(firstLine)) { icon = '👥'; label = 'People'; }
        else if (/^control/i.test(firstLine)) { icon = '🎯'; label = 'Control'; }
        else if (/^safety/i.test(firstLine)) { icon = '⚠️'; label = 'Safety, Health, Environment, Quality'; }
        else if (/^process/i.test(firstLine)) { icon = '📋'; label = 'Process'; }
        else if (/^market/i.test(firstLine)) { icon = '📈'; label = 'Market Growth'; }
        else if (/^contract/i.test(firstLine)) { icon = '📝'; label = 'Contract'; }
        else if (/^security/i.test(firstLine)) { icon = '🔒'; label = 'Security'; }
        else if (/^operational/i.test(firstLine)) { icon = '⚙️'; label = 'Operational Efficiency'; }
        else { icon = '📌'; label = firstLine; }
      }

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
          <span className="text-xs text-gray-600 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">{String(section).padStart(3, '0')}</strong> {data?.section_name}</span>
        </div>

        {desc && desc.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h1 className="mb-3"><span className="text-2xl font-bold dark:text-white">{String(section).padStart(3, '0')}</span><span className="text-lg sm:text-xl dark:text-gray-300 ml-2">{data?.section_name}</span></h1>
            <div className="space-y-2 text-sm dark:text-gray-200">
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
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold dark:text-white">
              Applicable Controls ({controls.length})
            </h2>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {answeredEvidence}/{totalEvidence} items answered
              {pendingFinding > 0 && <span className="text-orange-500 dark:text-orange-400 font-medium ml-2">{pendingFinding} pending</span>}
            </div>
          </div>

          <div className="space-y-2">
            {controls.map((control, ci) => {
              const evs = control.evidences || [];
              const answeredCount = evs.filter(e => e.response).length;
              const hasNo = evs.some(e => e.response === 'no');
              const nonCompliantLabels = evs
                .filter(e => e.response === 'no')
                .map(e => e.sub_label ? `${e.sub_label} ${e.evidence_text}` : e.evidence_text)
                .filter(Boolean);
              const isExpanded = expandedControl === control.id;

              return (
                <div key={control.id} className={`border dark:border-gray-700 rounded-lg overflow-hidden ${hasNo && !control.has_finding ? 'border-l-2 border-l-orange-400 dark:border-l-orange-500' : ''}`}>
                  <button
                    onClick={() => toggleControl(control.id)}
                    className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center justify-between p-3 sm:p-4 pb-1 sm:pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0">{ci + 1}</span>
                        {control.has_finding && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          (control.finding_completion ?? 0) >= 100
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                        }`}>NCR {control.finding_completion ?? 0}%</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasNo && !control.has_finding && <span className="text-orange-500 text-[10px]">⚠️</span>}
                        <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{answeredCount}/{evs.length}</span>
                        <div className="w-16 sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${evs.length ? (answeredCount / evs.length) * 100 : 0}%`,
                            backgroundColor: control.has_finding ? '#22c55e' : hasNo ? '#f97316' : evs.length && answeredCount === evs.length ? '#22c55e' : answeredCount > 0 ? '#3b82f6' : '#d1d5db'
                          }} />
                        </div>
                        <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </div>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm font-medium dark:text-white leading-relaxed">
                      {control.control_question}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t dark:border-gray-700 px-3 sm:px-4 pb-4">
                      {evs.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 py-3">No evidence items defined.</p>
                      ) : (
                        <div className="space-y-3 pt-3">
                          {evs.map((ev) => (
                            <div key={ev.id}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                  {ev.sub_label || `${ci + 1}.${ev.sort_order + 1}`}.
                                </span>
                                <select
                                  value={ev.response || ''}
                                  onChange={(e) => handleResponse(ev.id, e.target.value, control.id)}
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
                              <p className="text-xs sm:text-sm dark:text-gray-200 leading-relaxed">
                                {ev.evidence_text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t dark:border-gray-700 flex flex-wrap items-center gap-2">
                        {control.has_finding ? (
                          <Link href={`/findings/${control.finding_id}`}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                            🔍 View Finding #{control.finding_id?.slice(0, 8)}
                          </Link>
                        ) : hasNo ? (
                          <button
                            onClick={() => openFindingModal(control.id, nonCompliantLabels)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                          >
                            ⚠️ Non-compliant — Create Finding
                          </button>
                        ) : (
                          answeredCount > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">✅ All items compliant</p>
                          )
                        )}
                        {!control.has_finding && orphanFindings.length > 0 && (
                          <button
                            onClick={() => setLinkModal({ controlId: control.id, findingId: '' })}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            🔗 Link Finding
                          </button>
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

      {linkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setLinkModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold mb-3 dark:text-white">Link Orphan Finding</h2>
            {orphanFindings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No orphan findings available.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orphanFindings.map((of) => (
                  <label key={of.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    linkModal.findingId === of.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}>
                    <input
                      type="radio" name="orphan" value={of.id}
                      checked={linkModal.findingId === of.id}
                      onChange={() => setLinkModal({ ...linkModal, findingId: of.id })}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          of.priority === 'Major' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                          of.priority === 'Minor' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>{of.priority}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{of.ncr_ref}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{of.date_raised}</span>
                      </div>
                      <p className="text-xs font-medium dark:text-gray-200 line-clamp-1">{of.short_description}</p>
                      {of.description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{of.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setLinkModal(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded text-sm font-medium">Cancel</button>
              <button
                onClick={async () => {
                  if (!linkModal.findingId) return;
                  setLinking(true);
                  try {
                    await api.post(`/api/audits/${id}/controls/${linkModal.controlId}/link-finding`, { finding_id: linkModal.findingId });
                    setLinkModal(null);
                    load();
                    api.get(`/api/audits/${id}/orphan-findings`).then((res) => setOrphanFindings(res.data || [])).catch(() => {});
                  } catch (e: any) {
                    alert(e?.response?.data?.error || 'Failed to link finding');
                  } finally {
                    setLinking(false);
                  }
                }}
                disabled={!linkModal.findingId || linking}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >{linking ? 'Linking...' : 'Link Finding'}</button>
            </div>
          </div>
        </div>
      )}

      {findingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setFindingModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold mb-1 dark:text-white">Create Finding for Control</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Non-compliant items: {findingModal.nonCompliant.join(', ')}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1 dark:text-gray-400">Procedure</label>
                <input value={`${String(section).padStart(3, '0')} ${data?.section_name || ''}`} disabled
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-70" />
              </div>
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
                <label className="block text-xs mb-1 dark:text-gray-400">Contravened Standard Clause</label>
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
