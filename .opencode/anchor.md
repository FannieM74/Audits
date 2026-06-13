<summary>
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
- Business Being Audited set at audit creation; findings within inherit the business
- Root URL `/` shows landing page
- Photos stored on local filesystem, served via `/uploads/*` static file handler
- Labels and data must be in separate cells (next `<w:tc>` sibling)
- Completion % per finding: 0-100 input, auto-closes at 100%, Close button sets 100%
- Audit completion % = AVG of all finding completions (SQL subquery)
- Procedures.xlsx three-level hierarchy: Section → Control card → Evidence items with Yes/No
- One finding per control question (not per evidence item)
- Finding has two desc fields: `short_description` (Word doc) + `description` (xlsx/report)

## Progress
### Done
- All API routes: auth, users, businesses, audits CRUD + auditors, findings CRUD + photos + docx
- Frontend (14 routes): landing, login, register, dashboard, settings, audit CRUD, finding CRUD, procedures section detail
- Landing at `/` with dark industrial "AuditFlow" theme
- Global rebrand "AuditFlow"
- Completion %, finding counts, progress bars throughout
- Filter bar by user + Procedure on audit detail
- Three-level hierarchy: sections → controls → evidence items with accordion UI
- Section descriptions at top of detail page (People/Control/Safety/Process blocks)
- Evidence items with Yes/No; "No" triggers finding creation at control card level
- Go backend: new structs/repo/service/handler for evidence items, responses, section detail
- DB: 18 sections, 164 controls, 262 evidence items, section_descriptions table
- Migration 016 fixed: now contains full 262 evidence items
- Backend + frontend compile clean, DB data seeded correctly

### Blocked
- Code changes not yet deployed to Render/Vercel – need git push + manual deploy
- `NEXT_PUBLIC_API_URL` env var empty in Vercel production

## Key Decisions
- Three-level hierarchy: Section (COL B) → Control question (COL K) → Evidence item (COL L)
- Evidence items as separate table, one finding per control question (not per evidence item)
- Accordion UI for control cards; section description at top with styled blocks
- Stable UUIDs from parser (uuid5) for deterministic seed data
- Python for parser (openpyxl handles xlsx/multi-line cells well)

## Relevant Files
- `audits-api/scripts/parse_procedures.py`: Parser extracting hierarchy from Procedures.xlsx
- `audits-api/scripts/run_migrations.py`: Migration runner (psycopg2, handles split SQL)
- `audits-api/internal/db/migrations/014-017`: All hierarchy schema changes
- `audits-api/internal/db/seed_procedures.sql`: Full seed output from parser
- `audits-api/internal/procedure/repository.go`: New ControlWithEvidence, EvidenceWithResponse structs
- `audits-api/internal/procedure/service.go`: GetSectionDetail assembling controls + evidence + responses
- `audits-api/internal/procedure/handler.go`: New routes for evidence responses, control finding creation
- `audits-app/src/types/index.ts`: New TS types for hierarchy
- `audits-app/src/app/audits/[id]/procedures/[section]/page.tsx`: Accordion UI with evidence items
</summary>
