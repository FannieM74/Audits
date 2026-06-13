## Goal
- Build a Transnet IMS audit checklist and NCR management system with Go backend + Next.js frontend, replacing paper audit working papers and NCR forms.

## Constraints & Preferences
- Go monolith with clean package boundaries, deployed as single binary
- Next.js 16 App Router, PostgreSQL on Neon
- JWT auth, bcrypt passwords, self-registration with email/password
- Priority dropdown: Major, Minor, Area of Concern, Observation
- Businesses seeded: Germiston Wheels (Plant 1408), Germiston Wagons (Plant 1407), Facilities and Infrastructure
- Max 3 photos per finding, uploaded via file or camera
- Output must be .docx (Word) – use a pre-existing template docx filled via python-docx, labels and data in SEPARATE cells (next `<w:tc>` sibling)
- Audit types: First Party, Second Party, Third Party (dropdown); Audit days: 1-10 (dropdown)
- Creator of audit becomes Lead Auditor; any user can be Lead or Auditor per audit
- All auditors see all findings; only owner or Lead can edit/delete
- Dark mode toggle: `fixed bottom-4 right-4 z-50 rounded-full bg-gray-200 shadow-lg`
- Finding form: auto-fill "Raised By" from logged-in user, origin NCR single dropdown, type NCR single dropdown, conditional fields for Customer Complaint
- Business Being Audited selected at audit creation time; all findings within that audit inherit the business
- Root URL `/` shows landing page (no longer middleware-redirected)
- Photos stored on local filesystem, served via `/uploads/*` static file handler; `photoUrl()` helper prefixes API base URL on frontend
- Labels and data must be in separate cells (next `<w:tc>` sibling) – applies to all text fields, checkboxes, and X marks
- API deployed on Render via Docker (Python + lxml inside container); frontend on Vercel; PostgreSQL on Neon
- Completion % per finding: 0-100 input, auto-closes at 100%, Close button sets 100%
- Audit completion % = AVG of all finding completions (calculated in SQL subquery)
- Procedures.xlsx (164 items across 18 TIMS sections) is the base working paper for audits – each audit has a checklist of all procedure items with Yes/No responses
- A "No" response on a procedure item opens an inline modal to create a linked finding
- Finding has two description fields: `short_description` (for the Word doc) and `description` (for the xlsx/report)
- Report/docx generation ignored for now – focus is checklist UI and functionality, not file generation

## Progress
### Done
- All API routes wired: auth (register/login/me), users, businesses, audits CRUD + auditors assign/remove, findings CRUD + photos + docx download
- Frontend (14 routes): landing, login, register, dashboard, settings (businesses CRUD), audit create/detail/edit, finding create/detail/edit, procedure section detail page
- Landing page at `/` with dark industrial theme – "AuditFlow" branding, amber/gold accents
- Global rebrand from "Transnet NCR System" → "AuditFlow"
- Completion % field: DB migration 008, finding struct + queries updated, editable in FindingForm, auto-close/reopen logic in handler
- Audit aggregate fields (`finding_count`, `closed_count`, `completion`, `auditor_names`) added via SQL subqueries to both `ListForUser` and `GetByID`
- Dashboard cards: Lead, Auditors (own line), progress bar + finding count + % (last fields)
- Audit detail page header: full auditor list, description before finding stats, completion % bar always visible
- Finding cards on audit detail: clickable, show `auditor_name` + `procedure` badge, "Edit" only for authorized
- Finding view page: completion % as read-only badge, icon buttons (pencil, check/refresh, download, back), text hidden on mobile
- Finding edit page: Cancel → `/audits/{audit_id}`, photo upload with always-visible delete buttons and click-to-preview lightbox
- `ListByAudit` bug fixed: ambiguous columns – added `findingColsPrefixed` const with explicit `f.` prefix
- Backend static file server added at `/uploads/*` for photo serving
- Procedure field: DB migration 009, backend struct/scanner/queries, frontend dropdown (Procedure 1-18) in finding form
- Filter bar on audit detail findings list: filter by user (auditors + lead, de-duped) and by Procedure, with backend query params `?auditor_id=&procedure=`
- Procedures.xlsx parsed: 164 procedure items across 18 TIMS sections extracted to JSON
- New DB migrations: 010 (procedure_items table), 011 (audit_procedure_responses table), 012 (seed all 164 items), 013 (short_description + procedure_item_id columns on findings)
- New Go package `internal/procedure/` with repository, service, handler for procedure checklist CRUD
- Finding struct updated with `ShortDescription`, `ProcedureItemID` (nullable UUID); all scan functions, INSERT, and UPDATE queries updated
- Procedure checklist routes: GET `/api/procedures`, GET `/api/audits/{id}/procedure-sections`, GET `/api/audits/{id}/procedures/{section}`, PUT `/api/audits/{id}/responses/{itemId}`, POST `/api/audits/{id}/responses/{itemId}/finding`
- Procedure section detail page (`/audits/[id]/procedures/[section]`): list of all items with Yes/No dropdown, inline modal for creating findings from "No" responses
- Procedure section cards on audit detail page: 18 cards with progress bar, answered count, findings count, linked to section detail
- `short_description` field added to finding form (after Contravened Clause)
- `Findings INSERT/UPDATE queries` updated to include `short_description` and `procedure_item_id` (30/31 columns)
- `CreateFindingForResponse` handler: uses `middleware.GetClaims(r)` for auditor ID, upserts response as "no" before creating finding
- Go backend + Next.js frontend both build cleanly with all changes

### In Progress
- (none – all code changes committed)

### Blocked
- Render backend not redeployed with latest commits (findingColsPrefixed fix, photo serving, procedure checklist endpoints, new migrations) – needs manual deploy from Render dashboard

## Key Decisions
- **Python for docx generation** instead of Go: Go's etree mis-parses nested table XML; `python-docx` handles merged cells correctly
- **Next-`<w:tc>`-sibling approach** for cell data placement: label cell → empty data cell pattern in template XML
- **Rebrand to "AuditFlow"** – removed all Transnet references; neutral industrial branding
- **Permission-based Edit button** – finding detail page checks `auditor_id === currentUser.id || lead_auditor_id === currentUser.id`
- **Completion % auto-close logic** in handler: if `status = "closed"` → force `completion = 100`; if `completion >= 100` → force `status = "closed"`
- **Procedure checklist as core audit workflow** – instead of free-form finding creation, auditors walk through 164 procedure items, mark Yes/No, and create findings from "No" responses
- **Two descriptions on findings**: `short_description` (concise, for docx) and `description` (full, for xlsx/report)
- **Inline finding creation** from procedure response: when "No" selected, modal opens pre-filled with control question as description; on save, finding is created and linked to the response
- **Go monolith** over microservices: simpler deploy, single binary, clean package separation
- **Single text columns** `origin_ncr` and `type_ncr` instead of 14 booleans

## Next Steps
- Deploy Render backend with latest commit (includes findingColsPrefixed, photo serving, procedure package, new migrations, routes)
- Run migrations 009-013 on Neon
- Add findings count on procedure section cards (already shows in summary; linking from modal complete)
- Connect frontend finding edit page to `short_description` field in the form
- Consider CI/CD pipeline for auto-deploys on git push

## Critical Context
- Python `python-docx` and `python3-lxml` required on server (installed via apt in Dockerfile)
- Docx generation via `os/exec`: Go handler → JSON stdin → `python3 gen_docx.py` → docx bytes stdout
- Template labels and values MUST be in separate cells (next `<w:tc>` XML sibling)
- CORS origins configurable via `CORS_ORIGINS` env var (comma-separated list)
- Go binary at `/home/morema/go/bin/go`
- Go API serves on `:10000` on Render (PORT env), health check at `/health`
- `ListByAudit` query uses `findingColsPrefixed` (all `f.` prefixed) to avoid ambiguity with `LEFT JOIN users u`
- `scanFindingWithAuditor` scans 31+ columns (31 from `findingColsPrefixed` + `auditor_name`; now also `short_description`, `procedure_item_id`)
- Findings INSERT uses 30 placeholders, UPDATE uses 30 params; both include `short_description`, `procedure_item_id`
- `.next` cache clears needed after production build if using dev server (stale chunk references)
- Render deploy must be triggered manually from dashboard (not auto-deploy from git push)
- Procedure checklist: upserts response via `audit_procedure_responses` (UNIQUE(audit_id, procedure_item_id)); `LinkFinding` updates response row `finding_id` using response ID
- Migration files 001-013 must be run in order on Neon
- `SetResponse` handler returns the full `AuditProcedureResponse` (with `id`, `audit_id`, etc.) for client-side use
- `CreateFindingForResponse` handler: upserts response as "no", creates finding, links response to finding – all in one endpoint call
