ALTER TABLE audits ADD COLUMN raised_by_business_plant TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_by_business_site TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_by_business_responsible_person TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_by_business_sap_no TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_against_business_plant TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_against_business_site TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_against_business_responsible_person TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_against_business_sap_no TEXT NOT NULL DEFAULT '';

-- Backfill raised_by business (for audits that have raised_by_business_id)
UPDATE audits a SET
  raised_by_business_plant = COALESCE(rb.plant_no, ''),
  raised_by_business_site = COALESCE(rb.site, ''),
  raised_by_business_responsible_person = COALESCE(rb.responsible_person, ''),
  raised_by_business_sap_no = COALESCE(rb.sap_no, '')
FROM businesses rb
WHERE a.raised_by_business_id = rb.id;

-- Backfill raised_against business (for audits that have business_id)
UPDATE audits a SET
  raised_against_business_plant = COALESCE(ab.plant_no, ''),
  raised_against_business_site = COALESCE(ab.site, ''),
  raised_against_business_responsible_person = COALESCE(ab.responsible_person, ''),
  raised_against_business_sap_no = COALESCE(ab.sap_no, '')
FROM businesses ab
WHERE a.business_id = ab.id;
