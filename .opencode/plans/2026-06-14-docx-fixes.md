# NCR Docx Fixes Implementation Plan

**Goal:** Fix four issues in the NCR docx generation: missing auditor SAP/contact, large data font, missing business plant/site, description cell vertical alignment

**Architecture:** Changes to gen_docx.py (styling/layout), procedure handler (create-finding defaults), finding handler + struct/repo (business plant/site), and section detail page modal (pass user sap_no/work_tel)

**Tech Stack:** Python (python-docx/lxml), Go (chi router), React/Next.js

---

### Task 1: Add business site fields to Finding struct, scan, and SQL

**Files:**
- Modify: `audits-api/internal/finding/repository.go` — struct, scanners, consts

**Steps:**
1. After line 40 (`RaisedAgainstBusinessPlant`), add:
   ```go
   RaisedByBusinessSite      *string  `json:"raised_by_business_site,omitempty"`
   RaisedAgainstBusinessSite *string  `json:"raised_against_business_site,omitempty"`
   ```

2. In `ListByAudit`, after the existing 8 business COALESCE lines, add:
   ```sql
   COALESCE(rb.site, '') AS raised_by_business_site,
   COALESCE(rab.site, '') AS raised_against_business_site
   ```

3. In `GetByID`, after existing 8 business COALESCE lines, add same as above.

4. In `scanFinding`, after `&f.RaisedAgainstBusinessSapNo`, add:
   ```go
   &f.RaisedByBusinessSite, &f.RaisedAgainstBusinessSite,
   ```
   Total: 33 finding + 10 business = 43 scan targets.

5. In `scanFindingWithAuditor`, same addition after the existing business scans.

### Task 2: Fix font size and description alignment in gen_docx.py

**Files:**
- Modify: `audits-api/internal/finding/gen_docx.py`

**Steps:**
1. Modify `_set_tc_text` to add `<w:sz w:val="18"/>` (9pt) to run properties.
2. Add `_set_description_value` helper that writes description and sets `vAlign="top"` on the data cell's tcPr.
3. Replace `_set_next("NCR Description:", ...)` call with `_set_description_value(...)`.
4. Add `_find_tc_by_row` and `_set_next_in_row` helpers for disambiguating duplicate "Plant No.:" / "Name of Site:" labels in rows 12 and 13.
5. After the existing business name `_set_next` calls, add plant and site writes using `_set_next_in_row` for both raised-by (row 12) and raised-against (row 13).

### Task 3: Fix handler business query in DownloadWord

**Files:**
- Modify: `audits-api/internal/finding/handler.go`

**Steps:**
1. Change both business queries from `SELECT name, site` to `SELECT name, plant_no, site`.
2. Map `plant_no` to `RaisedByBusinessPlant` / `RaisedAgainstBusinessPlant`.
3. Map `site` to `RaisedByBusinessSite` / `RaisedAgainstBusinessSite` (new fields).

### Task 4: Fix auditor SAP No and Contact in finding creation

**Files:**
- Modify: `audits-api/internal/procedure/handler.go`
- Modify: `audits-app/src/app/audits/[id]/procedures/[section]/page.tsx`

**Steps:**
1. In backend `CreateFindingForControl`: after `raisedByName` default, add DB fallback queries for `raised_by_sap_no` (from `users.sap_no`) and `contact_details` (from `users.work_tel`) using `claims.UserID`.
2. Use the resolved `raisedBySapNo` and `contactDetails` variables in the INSERT instead of `req.RaisedBySapNo` and `req.ContactDetails`.
3. In frontend section detail page: add `raised_by_sap_no` and `contact_details` to `findingForm` state, pre-populate from `user.sap_no` / `user.work_tel` in `openFindingModal`.

### Task 5: Build, test, commit, deploy

1. Run `go build ./...` — verify no errors.
2. Generate a sample docx with test JSON — verify fonts, vAlign, fields.
3. `git add -A && git commit -m "fix: docx — auditor sap/contact defaults, font size 9pt, business plant/site, description vAlign top"`
4. `git push` — triggers Render auto-deploy.
5. Verify from browser via the finding details page → Download docx.
