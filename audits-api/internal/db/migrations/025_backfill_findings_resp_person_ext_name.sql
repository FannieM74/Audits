UPDATE findings f
SET resp_person_ext_name = b.responsible_person_tel
FROM businesses b
WHERE f.raised_against_business_id = b.id
  AND (f.resp_person_ext_name IS NULL OR f.resp_person_ext_name = '');
