# Audits App — Design Spec

## Overview

A digital Non-Conformance Report (NCR) management system for Transnet 2nd Party Audits. Replaces paper/PDF NCR forms with a web app where auditors log findings, attach photos, and generate formatted NCR PDFs.

**Tech Stack:** Go monolith (API) + Next.js 15 (Frontend on Vercel) + PostgreSQL

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│  Next.js 15 │─────▶│  Go API      │─────▶│ PostgreSQL │
│  (Vercel)   │      │  (Railway)   │      │  (Supabase)│
│             │      │              │      │            │
│  Pages:     │      │  internal/   │      │  Tables:   │
│  - Login    │      │  - auth/     │      │  - users   │
│  - Register │      │  - audit/    │      │  - audits  │
│  - Dashboard│      │  - finding/  │      │  - findings│
│  - Audit    │      │  - user/     │      │  - photos  │
│  - NCR Form │      │  - pdf/      │      │  - auditors│
│  - PDF View │      │  - business/  │      │  - business│
└─────────────┘      └──────────────┘      └────────────┘
```

### Principles
- Go monolith with clean package boundaries (easy to split later if needed)
- Next.js App Router (already scaffolded)
- JWT auth, PostgreSQL via pgx, PDF via go-pdf or similar
- Photos stored on S3-compatible storage (e.g., DigitalOcean Spaces, MinIO dev)

---

## Data Model

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | |
| surname | text | |
| sap_no | text | unique |
| work_tel | text | |
| email | text | unique, used for login |
| password_hash | text | bcrypt |
| created_at | timestamptz | |

### audits
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| lead_auditor_id | UUID | FK → users.id |
| title | text | |
| description | text | |
| audit_type | text | First Party / Second Party / Third Party |
| audit_days | int | 1-10 |
| audit_date | date | |
| status | text | open / closed |
| created_at | timestamptz | |

### audit_auditors (join table)
| Column | Type | Notes |
|---|---|---|
| audit_id | UUID | FK → audits.id |
| user_id | UUID | FK → users.id |
| PRIMARY KEY | (audit_id, user_id) | |

### businesses
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | e.g., Germiston Wheels |
| plant_no | text | e.g., 1408 |
| site | text | e.g., Germiston |

Seed data:
- Germiston Wheels — Plant 1408 — Germiston
- Germiston Wagons — Plant 1407 — Germiston

### findings
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| audit_id | UUID | FK → audits.id |
| auditor_id | UUID | FK → users.id (who created it) |
| ncr_ref | text | auto-generated |
| date_raised | date | |
| raised_by_name | text | |
| raised_by_sap_no | text | |
| contact_details | text | |
| origin_legal | bool | checkbox |
| origin_system | bool | checkbox |
| origin_other | bool | checkbox |
| type_env | bool | checkbox |
| type_health | bool | checkbox |
| type_railway_safety | bool | checkbox |
| type_customer_complaint | bool | checkbox |
| type_fire | bool | checkbox |
| type_maritime | bool | checkbox |
| type_vendor | bool | checkbox |
| type_system_ncr | bool | checkbox |
| type_hazmat | bool | checkbox |
| type_quality | bool | checkbox |
| type_audit | bool | checkbox |
| item_no | text | |
| serial_batch_no | text | |
| customer_name | text | |
| vendor_name | text | |
| vendor_no | text | |
| contravened_clause | text | |
| priority | text | Major / Minor / Area of Concern / Observation |
| area_of_concern | text | |
| resp_person_int_name | text | |
| resp_person_int_sap | text | |
| resp_person_ext_name | text | |
| raised_by_business_id | UUID | FK → businesses.id |
| raised_against_business_id | UUID | FK → businesses.id |
| description | text | main NCR description |
| work_type_process | text | |
| immediate_action_taken | bool | |
| action_agreed_approved | bool | |
| stop_certificate_issued | bool | |
| status | text | open / closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### finding_photos
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| finding_id | UUID | FK → findings.id |
| url | text | S3 URL or path |
| created_at | timestamptz | |

Max 3 photos per finding.

---

## API Routes (Go)

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Self-register |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Current user profile |

### Users
| Method | Path | Description |
|---|---|---|
| GET | /api/users | List all users (for auditor assignment) |

### Audits
| Method | Path | Description |
|---|---|---|
| GET | /api/audits | List audits I'm involved in (latest first) |
| POST | /api/audits | Create audit (becomes Lead Auditor) |
| GET | /api/audits/:id | Get audit detail with findings |
| PUT | /api/audits/:id | Update audit (Lead only) |
| DELETE | /api/audits/:id | Delete audit (Lead only) |
| POST | /api/audits/:id/auditors | Assign auditors (Lead only) |
| DELETE | /api/audits/:id/auditors/:userId | Remove auditor (Lead only) |

### Findings
| Method | Path | Description |
|---|---|---|
| GET | /api/audits/:id/findings | List all findings in audit |
| POST | /api/audits/:id/findings | Create finding (auth user = auditor_id) |
| GET | /api/findings/:id | Get single finding |
| PUT | /api/findings/:id | Update finding (own or Lead) |
| DELETE | /api/findings/:id | Delete finding (own or Lead) |
| POST | /api/findings/:id/photos | Upload photo (max 3) |
| DELETE | /api/findings/:id/photos/:photoId | Delete photo |

### PDF
| Method | Path | Description |
|---|---|---|
| GET | /api/findings/:id/pdf | Generate and download Transnet NCR PDF |

### Businesses
| Method | Path | Description |
|---|---|---|
| GET | /api/businesses | List businesses (for dropdown) |
| POST | /api/businesses | Add business (any user) |

---

## Frontend Pages (Next.js)

| Route | Page | Description |
|---|---|---|
| /login | Login | Email + password |
| /register | Register | Name, surname, SAP, work-tel, email, password |
| /dashboard | Dashboard | List of audits user is involved in |
| /audits/new | Create Audit | Form with title, type, days, date, auditors |
| /audits/:id | Audit Detail | Audit info + list of findings |
| /audits/:id/edit | Edit Audit | Lead only |
| /audits/:id/findings/new | New Finding | Full NCR form (excluding investigation & follow up) |
| /findings/:id/edit | Edit Finding | Own findings + Lead sees all |
| /findings/:id | Finding Detail | View finding + photos + download PDF |

---

## Authorization Rules

| Action | Lead Auditor | Assigned Auditor | Unassigned User |
|---|---|---|---|
| View audit | ✅ | ✅ | ❌ |
| Edit audit | ✅ | ❌ | ❌ |
| Delete audit | ✅ | ❌ | ❌ |
| Assign auditors | ✅ | ❌ | ❌ |
| Create finding | ✅ | ✅ | ❌ |
| View all findings in audit | ✅ | ✅ | ❌ |
| Edit own finding | ✅ | ✅ | ❌ |
| Edit others' finding | ✅ | ❌ | ❌ |
| Delete own finding | ✅ | ✅ | ❌ |
| Delete others' finding | ✅ | ❌ | ❌ |
| Generate PDF | ✅ | ✅ | ❌ |

---

## PDF Generation

The Go backend generates the Transnet NCR form PDF matching the original format:
- Header with Transnet logo and form reference
- All populated fields rendered in their positions
- Excluded sections (Investigation, Follow Up) rendered as blank/empty areas
- Photos not embedded in PDF (unless desired)

---

## Self-Review Checklist

- [ ] No placeholders or TODOs in spec
- [ ] Internal consistency — field mapping matches PDF
- [ ] Scope focused — audit finding management, not full QMS
- [ ] No ambiguity — authorization rules, field types, dropdowns are explicit
