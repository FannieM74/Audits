'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Business, Finding } from '@/types';

interface FindingFormProps {
  auditId: string;
  initial?: Partial<Finding>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

const PRIORITIES = ['Major', 'Minor', 'Area of Concern', 'Observation'] as const;
const AUDIT_TYPES = ['Environment', 'Health', 'Railway Safety', 'Customer Complaint', 'Fire', 'Maritime', 'Vendor', 'System NCR', 'HAZMAT', 'Quality', 'Audit'] as const;

function initForm(initial?: Partial<Finding>) {
  return {
    ncr_ref: initial?.ncr_ref || '',
    date_raised: initial?.date_raised || new Date().toISOString().split('T')[0],
    raised_by_name: initial?.raised_by_name || '',
    raised_by_sap_no: initial?.raised_by_sap_no || '',
    contact_details: initial?.contact_details || '',
    origin_legal: initial?.origin_legal || false,
    origin_system: initial?.origin_system || false,
    origin_other: initial?.origin_other || false,
    type_env: initial?.type_env || false,
    type_health: initial?.type_health || false,
    type_railway_safety: initial?.type_railway_safety || false,
    type_customer_complaint: initial?.type_customer_complaint || false,
    type_fire: initial?.type_fire || false,
    type_maritime: initial?.type_maritime || false,
    type_vendor: initial?.type_vendor || false,
    type_system_ncr: initial?.type_system_ncr || false,
    type_hazmat: initial?.type_hazmat || false,
    type_quality: initial?.type_quality || false,
    type_audit: initial?.type_audit || false,
    item_no: initial?.item_no || '',
    serial_batch_no: initial?.serial_batch_no || '',
    customer_name: initial?.customer_name || '',
    vendor_name: initial?.vendor_name || '',
    vendor_no: initial?.vendor_no || '',
    contravened_clause: initial?.contravened_clause || '',
    priority: initial?.priority || 'Observation',
    area_of_concern: initial?.area_of_concern || '',
    resp_person_int_name: initial?.resp_person_int_name || '',
    resp_person_int_sap: initial?.resp_person_int_sap || '',
    resp_person_ext_name: initial?.resp_person_ext_name || '',
    raised_by_business_id: initial?.raised_by_business_id || '',
    raised_against_business_id: initial?.raised_against_business_id || '',
    description: initial?.description || '',
    work_type_process: initial?.work_type_process || '',
    immediate_action_taken: initial?.immediate_action_taken || false,
    action_agreed_approved: initial?.action_agreed_approved || false,
    stop_certificate_issued: initial?.stop_certificate_issued || false,
  };
}

type FormState = ReturnType<typeof initForm>;

export default function FindingForm({ auditId, initial, onSave, loading }: FindingFormProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState<FormState>(initForm(initial));

  useEffect(() => {
    api.get('/api/businesses').then((res) => setBusinesses(res.data));
  }, []);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const toggle = useCallback((field: keyof FormState) => () =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] as boolean })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, audit_id: auditId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">NCR Ref No</label>
          <input value={form.ncr_ref} onChange={update('ncr_ref')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date Raised</label>
          <input type="date" value={form.date_raised} onChange={update('date_raised')} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-semibold px-2">Raised By</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Full Name & Surname</label>
            <input value={form.raised_by_name} onChange={update('raised_by_name')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">SAP No</label>
            <input value={form.raised_by_sap_no} onChange={update('raised_by_sap_no')} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">Contact Details</label>
            <input value={form.contact_details} onChange={update('contact_details')} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
      </fieldset>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-semibold px-2">Origin of NCR</legend>
        <div className="flex gap-6">
          {(['origin_legal', 'origin_system', 'origin_other'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input type="checkbox" checked={form[f]} onChange={toggle(f)} />
              <span className="text-sm">
                {f === 'origin_legal' ? 'Legal (Non-compliance)' : f === 'origin_system' ? 'System (Non-conformance)' : 'Other Non-compliance'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-semibold px-2">Type of NCR</legend>
        <div className="grid grid-cols-3 gap-3">
          {AUDIT_TYPES.map((t) => {
            const fieldKey = `type_${t.toLowerCase().replace(/ /g, '_')}` as keyof FormState;
            return (
              <label key={t} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form[fieldKey]} onChange={toggle(fieldKey)} />
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select value={form.priority} onChange={update('priority')} className="w-full border rounded px-3 py-2">
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Area of Concern</label>
          <input value={form.area_of_concern} onChange={update('area_of_concern')} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contravened Standard Clause</label>
          <input value={form.contravened_clause} onChange={update('contravened_clause')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Item No</label>
          <input value={form.item_no} onChange={update('item_no')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Serial / Batch No</label>
          <input value={form.serial_batch_no} onChange={update('serial_batch_no')} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input value={form.customer_name} onChange={update('customer_name')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vendor Name</label>
          <input value={form.vendor_name} onChange={update('vendor_name')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vendor No</label>
          <input value={form.vendor_no} onChange={update('vendor_no')} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-semibold px-2">Responsible Person</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Internal - Name</label>
            <input value={form.resp_person_int_name} onChange={update('resp_person_int_name')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Internal - SAP No</label>
            <input value={form.resp_person_int_sap} onChange={update('resp_person_int_sap')} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">External - Name</label>
            <input value={form.resp_person_ext_name} onChange={update('resp_person_ext_name')} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Raised By Business</label>
          <select value={form.raised_by_business_id} onChange={update('raised_by_business_id')} className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name} &mdash; Plant {b.plant_no}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Raised Against Business</label>
          <select value={form.raised_against_business_id} onChange={update('raised_against_business_id')} className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name} &mdash; Plant {b.plant_no}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">NCR Description</label>
        <textarea value={form.description} onChange={update('description')} className="w-full border rounded px-3 py-2" rows={4} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type of work, processes or equipment involved</label>
        <input value={form.work_type_process} onChange={update('work_type_process')} className="w-full border rounded px-3 py-2" />
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-semibold px-2">Actions</legend>
        <div className="flex gap-6">
          {(['immediate_action_taken', 'action_agreed_approved', 'stop_certificate_issued'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input type="checkbox" checked={form[f]} onChange={toggle(f)} />
              <span className="text-sm">
                {f === 'immediate_action_taken' ? 'Immediate action taken' :
                 f === 'action_agreed_approved' ? 'Action agreed / approved' :
                 'Stop Certificate Issued'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Finding'}
      </button>
    </form>
  );
}
