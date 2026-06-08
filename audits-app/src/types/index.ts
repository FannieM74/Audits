export interface User {
  id: string;
  name: string;
  surname: string;
  sap_no: string;
  work_tel: string;
  email: string;
}

export interface Audit {
  id: string;
  lead_auditor_id: string;
  title: string;
  description: string;
  audit_type: string;
  audit_days: number;
  audit_date: string;
  status: string;
  created_at: string;
  lead_auditor_name?: string;
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
  origin_legal: boolean;
  origin_system: boolean;
  origin_other: boolean;
  type_env: boolean;
  type_health: boolean;
  type_railway_safety: boolean;
  type_customer_complaint: boolean;
  type_fire: boolean;
  type_maritime: boolean;
  type_vendor: boolean;
  type_system_ncr: boolean;
  type_hazmat: boolean;
  type_quality: boolean;
  type_audit: boolean;
  item_no: string;
  serial_batch_no: string;
  customer_name: string;
  vendor_name: string;
  vendor_no: string;
  contravened_clause: string;
  priority: string;
  area_of_concern: string;
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
