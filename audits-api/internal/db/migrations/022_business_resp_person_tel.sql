ALTER TABLE businesses ADD COLUMN responsible_person_tel TEXT NOT NULL DEFAULT '';
ALTER TABLE findings ADD COLUMN resp_person_int_tel TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_by_business_resp_person_tel TEXT NOT NULL DEFAULT '';
ALTER TABLE audits ADD COLUMN raised_against_business_resp_person_tel TEXT NOT NULL DEFAULT '';
