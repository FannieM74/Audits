-- Add default evidence items for controls that never had any defined
-- These controls (1705-1712, 1801) had no procedure_evidence_items in the original seed

INSERT INTO procedure_evidence_items (id, procedure_item_id, evidence_text, sub_label, sort_order) VALUES
('9a87cb98-671d-4625-b717-29cb0c7593d0', '9a2ca9b2-b54e-5f85-9fb9-1e3e92a0836d', 'Occupational Risk Exposure Profile', '5', 0),
('bb9b1d9e-40d7-46ea-a6c6-7e78c403b2eb', '5c67ae7f-0dc0-534b-aef5-c404c1ecd992', 'Health risk assessments conducted by Occupational Health Practitioner', '6', 0),
('037aabf5-3280-424f-a755-2e42e28fcd49', 'af06965c-69c6-5680-8dac-68e91ff6f453', 'Fatigue management process', '7', 0),
('d1361bf9-61ab-48ea-88eb-48f43384b5c5', '0d6f7b73-d1a6-55be-aec3-70e85db9e8cf', 'Pregnancy management process', '8', 0),
('84b21c19-08d5-4841-a7a9-781574c490e9', '336c371f-9c3c-5711-9516-492ff32331f0', 'Employee Wellness programme integration', '9', 0),
('e417c7e2-33fe-4150-8e77-b5d05bcd450c', '53695b46-730e-5ec1-8808-4d667b620618', 'Stress management process', '10', 0),
('9efce256-4c27-4821-9311-8f3f65cbc0c6', '9d6de643-7ba5-5a4b-a65f-1c88e7c6b791', 'Occupational health stressor identification', '11', 0),
('28dd7cd7-5963-4905-98b8-efaa3189582e', 'a3ce3d6d-1901-5ec0-84c6-bb8c32551b93', 'Overtime management and fatigue risk compliance', '12', 0),
('2c7c9dd9-2850-45ac-8086-5851e0a396ac', 'a555198f-0ad9-58c4-9c4c-4d6deb7bafaa', 'Continual Improvement Initiatives monitoring', '', 0);
