export interface User {
  id: string;
  name: string;
  surname: string;
  sap_no: string;
  work_tel: string;
  email: string;
}

export interface AuditorInfo {
  id: string;
  name: string;
}

export interface Audit {
  id: string;
  lead_auditor_id: string;
  title: string;
  description: string;
  audit_type: string;
  audit_days: number;
  audit_date: string;
  business_id?: string | null;
  status: string;
  created_at: string;
  lead_auditor_name?: string;
  business_name?: string | null;
  auditors?: AuditorInfo[];
  finding_count: number;
  closed_count: number;
  completion: number;
  auditor_names?: string;
}

export interface Finding {
  id: string;
  audit_id: string;
  auditor_id: string;
  ncr_ref: string;
  date_raised: string;
  raised_by_name: string;
  raised_by_sap_no: string;
  contact_details: string;
  origin_ncr: string;
  type_ncr: string;
  item_no: string;
  serial_batch_no: string;
  customer_name: string;
  vendor_name: string;
  vendor_no: string;
  contravened_clause: string;
  priority: string;
  resp_person_int_name: string;
  resp_person_int_sap: string;
  resp_person_ext_name: string;
  raised_by_business_id: string | null;
  raised_against_business_id: string | null;
  description: string;
  work_type_process: string;
  immediate_action_taken: boolean;
  action_agreed_approved: boolean;
  stop_certificate_issued: boolean;
  status: string;
  completion: number;
  auditor_name?: string;
  created_at: string;
  updated_at: string;
  photos: Photo[];
  raised_by_business?: Business;
  raised_against_business?: Business;
}

export interface Photo {
  id: string;
  finding_id: string;
  url: string;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  plant_no: string;
  site: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
