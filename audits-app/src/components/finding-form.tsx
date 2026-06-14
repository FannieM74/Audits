'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Audit, Business, Finding, ProcedureItem, SectionSummary, User } from '@/types';

interface FindingFormProps {
  auditId: string;
  initial?: Partial<Finding>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  user?: User | null;
  saved?: boolean;
  renderAfterActions?: React.ReactNode;
}

const PRIORITIES = ['Major', 'Minor', 'Area of Concern', 'Observation'] as const;
const ORIGINS = ['Legal', 'System (Non-conformance)', 'Other Non-compliance'] as const;
const TYPES = ['Environment', 'Health', 'Railway Safety', 'Customer Complaint', 'Fire', 'Maritime', 'Vendor', 'System', 'HAZMAT', 'Quality', 'Audit', 'Other (Specify)'] as const;
function initForm(initial?: Partial<Finding>, user?: User | null) {
  return {
    date_raised: initial?.date_raised || new Date().toISOString().split('T')[0],
    raised_by_name: initial?.raised_by_name || (user ? `${user.name} ${user.surname}` : ''),
    procedure_item_id: initial?.procedure_item_id || '',
    raised_by_sap_no: initial?.raised_by_sap_no || user?.sap_no || '',
    contact_details: initial?.contact_details || user?.work_tel || '',
    origin_ncr: initial?.origin_ncr || '',
    type_ncr: initial?.type_ncr || '',
    item_no: initial?.item_no || '',
    serial_batch_no: initial?.serial_batch_no || '',
    customer_name: initial?.customer_name || '',
    vendor_name: initial?.vendor_name || '',
    vendor_no: initial?.vendor_no || '',
    contravened_clause: initial?.contravened_clause || '',
    priority: initial?.priority || 'Observation',
    raised_by_business_id: '',
    raised_against_business_id: initial?.raised_against_business_id || '',
    resp_person_int_name: initial?.resp_person_int_name || '',
    resp_person_int_sap: initial?.resp_person_int_sap || '',
    resp_person_ext_name: initial?.resp_person_ext_name || '',
    short_description: initial?.short_description || '',
    description: initial?.description || '',
    work_type_process: initial?.work_type_process || '',
    immediate_action_taken: initial?.immediate_action_taken || false,
    action_agreed_approved: initial?.action_agreed_approved || false,
    stop_certificate_issued: initial?.stop_certificate_issued || false,
    completion: initial?.completion ?? 0,
    procedure: initial?.procedure || '',
    procedure_item_id: initial?.procedure_item_id || '',
  };
}

type FormState = ReturnType<typeof initForm>;

function Input({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1 dark:text-gray-400">{label}</label>
      <input type={type || 'text'} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
    </div>
  );
}

function Select({ label, value, onChange, children, disabled }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
      <select value={value} onChange={onChange} disabled={disabled}
        className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed">
        {children}
      </select>
    </div>
  );
}

function Fieldset({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border dark:border-gray-600 rounded p-4">
      <legend className="text-sm font-semibold px-2 dark:text-gray-300">{label}</legend>
      {children}
    </fieldset>
  );
}

function BusinessInfoBox({ plant, site, responsiblePerson, sapNo }: {
  plant: string; site: string; responsiblePerson: string; sapNo: string;
}) {
  if (!plant && !site && !responsiblePerson && !sapNo) return null;
  return (
    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
      {plant && <span className="mr-3">Plant: {plant}</span>}
      {site && <span className="mr-3">Site: {site}</span>}
      {responsiblePerson && <span className="mr-3">Person: {responsiblePerson}</span>}
      {sapNo && <span>SAP: {sapNo}</span>}
    </div>
  );
}

export default function FindingForm({ auditId, initial, onSave, onCancel, loading, user, saved, renderAfterActions }: FindingFormProps) {
  const [form, setForm] = useState<FormState>(initForm(initial, user));
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [controls, setControls] = useState<ProcedureItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [auditData, setAuditData] = useState<Audit | null>(null);

  useEffect(() => {
    api.get(`/api/audits/${auditId}`).then((res) => {
      const a = res.data as Audit;
      setAuditData(a);
      setForm((prev) => ({
        ...prev,
        raised_by_business_id: a.raised_by_business_id || prev.raised_by_business_id,
        raised_against_business_id: prev.raised_against_business_id || a.business_id || '',
        resp_person_int_name: prev.resp_person_int_name || a.raised_against_business_responsible_person || '',
        resp_person_int_sap: prev.resp_person_int_sap || a.raised_against_business_sap_no || '',
      }));
    }).catch(() => {});
    api.get('/api/businesses').then((res) => {
      setBusinesses(res.data);
    });
  }, [auditId]);

  useEffect(() => {
    api.get(`/api/audits/${auditId}/procedure-sections`).then((res) => setSections(res.data)).catch(() => {});
  }, [auditId]);

  // Fetch controls when procedure section changes
  useEffect(() => {
    const match = form.procedure.match(/^(\d+)\s/);
    const sectionNum = match ? parseInt(match[1], 10) : 0;
    if (sectionNum > 0) {
      api.get(`/api/procedures?section=${sectionNum}`).then((res) => {
        setControls(res.data);
        setForm((prev) => ({ ...prev, procedure_item_id: '' }));
      }).catch(() => setControls([]));
    } else {
      setControls([]);
      setForm((prev) => ({ ...prev, procedure_item_id: '' }));
    }
  }, [form.procedure]);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const toggle = useCallback((field: keyof FormState) => () =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] as boolean })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, audit_id: auditId } as Record<string, unknown>;
    if (!data.raised_by_business_id) data.raised_by_business_id = null;
    if (!data.raised_against_business_id) data.raised_against_business_id = null;
    if (!data.procedure_item_id) data.procedure_item_id = null;
    onSave(data);
  };

  const showCustomerFields = form.type_ncr === 'Customer Complaint';

  const handleRaisedAgainstChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bizId = e.target.value;
    setForm((prev) => {
      const biz = businesses.find((b) => b.id === bizId);
      return {
        ...prev,
        raised_against_business_id: bizId,
        resp_person_int_name: prev.resp_person_int_name || (biz?.responsible_person || ''),
        resp_person_int_sap: prev.resp_person_int_sap || (biz?.sap_no || ''),
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Date Raised" type="date" value={form.date_raised} onChange={update('date_raised')} />

      <Select label="Raised By Business" value={form.raised_by_business_id} onChange={update('raised_by_business_id')}>
        <option value="">Select business...</option>
        {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
      <BusinessInfoBox
        plant={auditData?.raised_by_business_plant || ''}
        site={auditData?.raised_by_business_site || ''}
        responsiblePerson={auditData?.raised_by_business_responsible_person || ''}
        sapNo={auditData?.raised_by_business_sap_no || ''}
      />

      <Select label="Raised Against Business" value={form.raised_against_business_id} onChange={handleRaisedAgainstChange}>
        <option value="">Select business...</option>
        {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
      <BusinessInfoBox
        plant={auditData?.raised_against_business_plant || ''}
        site={auditData?.raised_against_business_site || ''}
        responsiblePerson={auditData?.raised_against_business_responsible_person || ''}
        sapNo={auditData?.raised_against_business_sap_no || ''}
      />

      <Select label="Origin of NCR" value={form.origin_ncr} onChange={update('origin_ncr')}>
        <option value="">Select origin...</option>
        {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
      </Select>

      <Select label="Type of NCR" value={form.type_ncr} onChange={update('type_ncr')}>
        <option value="">Select type...</option>
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>

      {showCustomerFields && (
        <Fieldset label="Customer Complaint Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input label="Item No" value={form.item_no} onChange={update('item_no')} />
            <Input label="Serial / Batch No" value={form.serial_batch_no} onChange={update('serial_batch_no')} />
            <Input label="Customer Name" value={form.customer_name} onChange={update('customer_name')} />
            <Input label="Vendor Name" value={form.vendor_name} onChange={update('vendor_name')} />
            <Input label="Vendor No" value={form.vendor_no} onChange={update('vendor_no')} />
          </div>
        </Fieldset>
      )}

      <Select label="Priority" value={form.priority} onChange={update('priority')}>
        {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
      </Select>

      <Select label="Procedure Section" value={form.procedure} onChange={update('procedure')} disabled={!!initial?.procedure}>
        <option value="">Select section...</option>
        {sections.map((s) => {
          const label = `${String(s.section_number).padStart(3, '0')} ${s.section_name}`;
          return <option key={s.section_number} value={label}>{label}</option>;
        })}
      </Select>

      {controls.length > 0 && (
        <Select label="Control Question" value={form.procedure_item_id} onChange={(e) => {
          const selected = controls.find((c) => c.id === e.target.value);
          setForm((prev) => ({
            ...prev,
            procedure_item_id: e.target.value,
            procedure: selected ? `${String(selected.section_number).padStart(3, '0')} ${selected.section_name}` : prev.procedure,
          }));
        }}>
          <option value="">Select control...</option>
          {controls.map((c) => (
            <option key={c.id} value={c.id}>
              {c.sort_order}. {c.control_question}
            </option>
          ))}
        </Select>
      )}

      <Input label="Responsible Person (Int)" value={form.resp_person_int_name} onChange={update('resp_person_int_name')} />
      <Input label="Resp Person SAP No" value={form.resp_person_int_sap} onChange={update('resp_person_int_sap')} />
      <Input label="Responsible Person (Ext)" value={form.resp_person_ext_name} onChange={update('resp_person_ext_name')} />

      <Input label="Contravened Standard Clause" value={form.contravened_clause} onChange={update('contravened_clause')} />

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Short Description (for report)</label>
        <textarea value={form.short_description} onChange={update('short_description')} className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" rows={2} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">NCR Description</label>
        <textarea value={form.description} onChange={update('description')} className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" rows={4} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type of work, processes or equipment involved</label>
        <input value={form.work_type_process} onChange={update('work_type_process')} className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
      </div>

      <Fieldset label="Actions">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          {(['immediate_action_taken', 'action_agreed_approved', 'stop_certificate_issued'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form[f]} onChange={toggle(f)} className="w-4 h-4" />
              <span className="text-sm">
                {f === 'immediate_action_taken' ? 'Immediate action taken' :
                 f === 'action_agreed_approved' ? 'Action agreed / approved' :
                 'Stop Certificate Issued'}
              </span>
            </label>
          ))}
        </div>
      </Fieldset>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Completion %</label>
        <input type="number" min={0} max={100} value={form.completion}
          onChange={(e) => setForm({ ...form, completion: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
          className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
      </div>

      {renderAfterActions}

      {!saved && (
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 font-medium text-base">
            {loading ? 'Saving...' : 'Save'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-4 py-2.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-base">
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
}
