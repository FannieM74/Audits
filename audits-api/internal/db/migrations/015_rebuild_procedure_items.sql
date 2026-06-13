-- Drop FK constraints before rebuilding
ALTER TABLE findings DROP CONSTRAINT IF EXISTS findings_procedure_item_id_fkey;
ALTER TABLE audit_procedure_responses DROP CONSTRAINT IF EXISTS audit_procedure_responses_procedure_item_id_fkey;

-- Null out old references on findings
UPDATE findings SET procedure_item_id = NULL;

-- Clear old data
TRUNCATE audit_procedure_responses;
DELETE FROM procedure_evidence_items;
DELETE FROM procedure_items;

-- Re-insert control questions (164 items)
INSERT INTO procedure_items (id, section_number, section_name, control_question, evidence_required, tims_ref, sort_order) VALUES
('27d26e18-9714-5b68-9648-1183d5b97b44', 1, 'Leadership', '1. How does Leadership ensures organisational structures are clearly defined and that they support the achievement of the Transnet objectives?', '', '', 101),
('c0a98fa0-f7fa-5fac-b0ab-5602d821e49a', 1, 'Leadership', '2.  How are the roles, authorities and responsibilities of leadership regarding TIMS implemented? (TIMS Element 1 Clause: 6.2)', '', '', 102),
('74a17fe7-b6f5-5ba5-b0f7-f696e0ae2f26', 1, 'Leadership', '3. Which  TIMS Appointments that are in place and what process have been followed to maintain them?', '', '', 103),
('a741d222-ee19-5de2-ad3d-1b7f30b7cd8a', 1, 'Leadership', '4. How is the Delegation of Authority maintained and monitored for all the cost center owners.', '', '', 104),
('2129e7d8-64a8-5661-a03f-c0ad77b9c751', 1, 'Leadership', '5. How is the security deployment coordinated?', '', '', 105),
('e73878e4-bf7c-5071-8956-293496305054', 1, 'Leadership', '6. How is the implementation of the TIMS monitored? TIMS Element 1 Clause: 6.8.2 Safety, Health and Quality risks', '', '', 106),
('812e4499-b5b4-5a4f-98ad-1047aad12229', 1, 'Leadership', '7. Was the suitability, effectiveness and adequacy assessed?', '', '', 107),
('0dc2df25-0912-5a13-800b-c71fbe45f49a', 1, 'Leadership', 'Management Reviews scheduled  as per the procedure TIMS Element 1 Clause: 6.8.1.3 Levels of Management reviews', '', '', 108),
('16c83290-af3c-573f-859d-486db5e085cf', 1, 'Leadership', 'Management Review Schedule is communicated', '', '', 109),
('df035058-6b28-53b0-9da5-61c34fe4f66d', 1, 'Leadership', 'Management Reviews are conducted as per schedule at Group level/OD level', '', '', 110),
('62da97ce-dba6-5161-b7b5-316242e7f0a4', 1, 'Leadership', 'All applicable  Management Review data to be made available', '', '', 111),
('21914aea-2a89-50be-a7df-3ea86349bfe9', 2, 'Policy', '1. Has top management established, implemented and maintained TIMS Policy  that:
a) is appropriate to the purpose of Transnet
b) provides a framework for setting and reviewing objectives and targets
c) includes a commitment to continual improvement
d) includes a commitment to comply with applicable legal and other requirements
e) is documented, implemented and maintained and communicated to all employees?', '', '', 201),
('2a5e3c9d-3fc7-5437-8575-1e5c76deae6a', 2, 'Policy', '2. Is the TIMS Policy being discussed in the SHEQ Committee, review meeting and other forums to reiterate top management commitment?', '', '', 202),
('2a1e1e63-756d-5073-862b-30640e0c9bb0', 2, 'Policy', '3. Is the revised TIMS Policy statement displayed in prominent common areas and notice boards? Does it have the signature of the GCEO', '', '', 203),
('f89624ff-8e7a-5894-a138-c2232a4a12b3', 2, 'Policy', '4. Has the Stakeholder TIMS Policy Commitment Statement Request Register been developed and/or updated?', '', '', 204),
('dfc2db34-9376-5b35-b597-1e54f9400e88', 3, 'General Requirements', '1. How was the identification of scope and boundaries conducted?
2.  Is the scope documented?', '', '', 301),
('2c225ac1-c448-5168-9d83-02a1864f8114', 3, 'General Requirements', '2. Does the scope state the types of products and services covered, and provide justification for the exclusion of any standard requirements?', '', '', 302),
('abcf9a5f-cae5-5373-be05-d1daff99d6fe', 3, 'General Requirements', '3. Explain and give evidence of the TIMS Scope (General requirements)?', '', '', 303),
('83d5b23d-dcba-599b-87fa-e6d15f12e57a', 4, 'Operational Risk Management', '1. Confirm if the Operational Risk Assessment Register was conducted using the latest prescribed template (SHEQ 007 or SHEQ 21)', '', '', 401),
('2fd09a71-5faa-5abb-9e8c-fcfe600e8de3', 4, 'Operational Risk Management', '2. Does the Risk Register cover all operational areas of the business including environment, health, safety and quality?', '', '', 402),
('45a99f84-bb3b-5b06-9d2a-9e2a5a0eecb0', 4, 'Operational Risk Management', '3. Adequate identification of controls to mitigate the identified risk including baseline, issue based and continual', '', '', 403),
('4659f397-7a22-51ef-9d95-15d36acd7238', 4, 'Operational Risk Management', '4. Have the top ten (10) risks/aspects been identified and management plans formulated?', '', '', 404),
('bda42250-f5ff-5099-850e-5dafeb460481', 4, 'Operational Risk Management', '5. How are the Changes identified, monitored and assessed for the risk introduced?', '', '', 405),
('460134d0-8ab4-5503-aa08-d1ef37c69654', 4, 'Operational Risk Management', '6. How are the new technology and equipment introduced, risk assessed, implemented and monitored?', '', '', 406),
('8fb2daa6-a9ec-5976-9489-4d69e6e45457', 4, 'Operational Risk Management', '7. Is the risk assessment amended after occurrences?', '', '', 407),
('7f5fc25e-b3d5-5adc-8a73-618a8e72de37', 4, 'Operational Risk Management', '8. Has the risk register been communicated to employees and interested parties?', '', '', 408),
('03c99223-3eec-53ae-a7a5-7cb6cde384a7', 4, 'Operational Risk Management', '10. Is the operational risk management from a multi-disciplinary approach?', '', '', 409),
('6b7b0de7-ddac-5688-87ce-1f39fc8dd6a4', 4, 'Operational Risk Management', '11. Is the operational risk management based on business work areas or main processes and activities?', '', '', 410),
('3e87de63-a23e-5945-89de-cf1151a5abfe', 4, 'Operational Risk Management', '12. Are opportunities explored for identification during the risk assessment?', '', '', 411),
('355fce42-8667-5e69-9eba-478b8b9bea14', 4, 'Operational Risk Management', '13. Is operational risk assessment periodically reviewed annually by a multi-disciplinary team?', '', '', 412),
('1873434d-2ff9-568e-9105-5e522c5a29b6', 4, 'Operational Risk Management', '14. Are records of risk registers, attendance registers and opportunity registers maintained?', '', '', 413),
('2a43f7c1-0e2c-586d-b272-98bb26bd2da9', 5, 'Compliance Obligations', '1. What are the inputs to the identification of the compliance obligations?', '', '', 501),
('80e7c5b2-5a73-590e-8368-10f49244f82e', 5, 'Compliance Obligations', '2. Are the compliance obligations identified, assessed and communicated?', '', '', 502),
('34f47c85-d100-58ad-ba2a-7e943be95a55', 5, 'Compliance Obligations', '3. Are the require permits identified, maintained and updated in the licence and permit register?', '', '', 503),
('cd52f90f-62a5-5cc9-b29b-33cdba9c4d7a', 5, 'Compliance Obligations', '4. How are licence conditions monitored?', '', '', 504),
('15a5d11a-df33-50d6-8bbf-1f375b5e4b84', 5, 'Compliance Obligations', '5. How are the compliance (prohibition, contraventions, improvement notices and penalty) issues been identified and addressed?', '', '', 505),
('b0e1e5f8-e26a-5c08-afda-10bc3eccb65a', 5, 'Compliance Obligations', '6. Have the RSR Permit Conditions communicated, monitored and addressed?', '', '', 506),
('6b45f333-65aa-5faf-aa69-5df65d844270', 6, 'Objectives, Targets and Programmes', '1. What inputs were used to develop the Objectives and targets?
TIMS Element 6-Clause 6.2', '', '', 601),
('2408f39b-d0fe-5a7a-8821-03ad5a535110', 6, 'Objectives, Targets and Programmes', '2. How are the Objectives and targets documented, communicated, monitored and managed?', '', '', 602),
('a81e077f-54d5-5f72-b92a-11b29a40ec27', 6, 'Objectives, Targets and Programmes', '3. Are Objectives & Targets and Management Plans   Specific, Measurable, Achievable, Realistic and Time bound (SMART)?', '', '', 603),
('6edce5bc-0f66-5f35-95c9-af8d8ad0f0cd', 6, 'Objectives, Targets and Programmes', '4. How are the progress of the Management Plans monitored? At what forums are the plans reported?', '', '', 604),
('f2ab6266-b3fc-55fe-8e55-44a79d5e31d6', 7, 'Stakeholder Management', '1. How is the Internal and External communication managed?', '', '', 701),
('6dcaf8ca-5711-5859-9013-8f477a57599c', 7, 'Stakeholder Management', '2. What process was followed to identify the internal and external stakeholders?', '', '', 702),
('f521d114-f9c3-5319-9477-981a3e1242e6', 7, 'Stakeholder Management', '3. Are the Stakeholders identified, analysed, and ranked?', '', '', 703),
('a3791ead-20de-5679-8bbb-2d363e3b3589', 7, 'Stakeholder Management', '4. Have the methods of engagement identified for each stakeholder?', '', '', 704),
('b5217bbb-47bf-5a60-9092-76b20a79f3c3', 7, 'Stakeholder Management', '5. How are the issues monitored and evaluated?', '', '', 705),
('8dff5c71-1031-5c25-a48d-9a6b2d5ae6bb', 7, 'Stakeholder Management', '6. Who is responsible to monitor and evaluate the issues?', '', '', 706),
('540c8772-8cf3-5d39-9579-8ad0248ab1e5', 7, 'Stakeholder Management', '7. Is the annual and quarterly Stakeholder Engagement and Management Report generated?', '', '', 707),
('a7a87efe-6d3f-56a6-b7a0-05d540cca368', 7, 'Stakeholder Management', '8. How is Stakeholder Improvement Plan developed, monitored and maintained?', '', '', 708),
('934e20cd-fc7f-5f4f-88cc-4872d525075a', 7, 'Stakeholder Management', '9. Which process is followed for Consultation and Participation process?', '', '', 709),
('b4db5b6d-9937-5501-89ea-37bd44a868f3', 7, 'Stakeholder Management', '10. Is the Community Grievance Mechanism being used?', '', '', 710),
('f9a2b7f2-ddaa-55bf-823e-5e0e144dac8f', 8, 'Competencies, Awareness & Training', '1. Has the Technical and compliance training skills matrix developed and maintained?', '', '', 801),
('a9a5450b-30f6-5e8f-90b7-78e34eabfc91', 8, 'Competencies, Awareness & Training', '2. How is implementation of the OBML (Artisans) being managed, monitored and maintained?', '', '', 802),
('2e5d5035-e3cf-5d48-85e4-34d5b7aada25', 8, 'Competencies, Awareness & Training', '3. How is the OBML programme being managed, monitored and improved?', '', '', 803),
('7d723160-7e10-5580-a643-2e6df659c088', 8, 'Competencies, Awareness & Training', '4. What is the process followed for the Task observation process?', '', '', 804),
('80d34bbf-2bec-5de8-8303-50715ac1e3b4', 8, 'Competencies, Awareness & Training', '5. How is overtime managed to prevent fatigue?', '', '', 805),
('7468699a-c5da-5f08-9f7b-140a8d69669f', 8, 'Competencies, Awareness & Training', '6. Are the Performance Contracts and Individual Development Plan developed, maintained and monitored?', '', '', 806),
('25b8fb40-10a8-5fcd-8f19-7e9d48ef0625', 8, 'Competencies, Awareness & Training', '7. Does the business have ongoing plans to train personnel on TIMS procedure, TIMS awareness, technical and legal training?', '', '', 807),
('cd4bd277-7633-5b31-8db4-453d4c48a68a', 8, 'Competencies, Awareness & Training', '8. During ongoing awareness, were the following communicated to the employees?
- TIMS Policy
- TIMS Requirements
- Objectives & Targets
- Organisational Roles & Responsibilities
- Significant Aspects & Impacts
- Emergency Response', '', '', 808),
('fbd97f14-aec1-5c0d-99f5-c8e487d5945b', 8, 'Competencies, Awareness & Training', '9. Does the job profiles / descriptions contains the following?
- Competencies required for each function
- Education / Training
- Skills / Experience', '', '', 809),
('8c5a083b-f209-5ea0-9d5b-c56f20c2ccb2', 9, 'Operational Planning and Control', '1. Are business processes documented, maintained, managed, available in a common platform and reviewed?', '', '', 901),
('155ebbc0-ec23-50bd-a107-c59a47068b75', 9, 'Operational Planning and Control', '2. How are the changes of the business processes being managed?', '', '', 902),
('1fcc37d9-a8ce-54e6-bae3-5d1dd3bb10c1', 9, 'Operational Planning and Control', '3. Management of the outsourced service i.e Interaction with OEM, waste and security services', '', '', 903),
('5a548f3e-44f3-5843-aba7-be17e5f9e1f0', 9, 'Operational Planning and Control', '4. Management of Speed Monitoring on motorised vehicles, plans, the implementation and monitoring thereof', '', '', 904),
('31810085-3357-57f5-9aee-af5f4c68ea7d', 9, 'Operational Planning and Control', '5. Management of the transportation of goods, material to outlying depots', '', '', 905),
('2174ed53-d3af-5ff6-9e32-7fdc77688fa4', 9, 'Operational Planning and Control', '6. Management of detonators (009-TE-MS-SAF-8077)', '', '', 906),
('158641f9-0e29-5b52-9c62-a3e46ef4d707', 9, 'Operational Planning and Control', '7. Management of the substance abuse', '', '', 907),
('7ffcfd99-2c6e-5ad7-9c17-5d584b4693bd', 9, 'Operational Planning and Control', '8. Management of overtime and call outs? Is overtime worked per employee in line with relevant legislation?', '', '', 908),
('a7e44074-1479-56b9-948b-76d9a3be8d12', 9, 'Operational Planning and Control', '9. How are the yard / siding SWP review, verification, turnaround time being managed?', '', '', 909),
('c7bc8fb9-8e58-59a4-ba6f-c7f2439e8542', 9, 'Operational Planning and Control', '10. Does the business meet its reliability and availability obligations to the customer?', '', '', 910),
('14de8ca5-5199-5d3f-8c5e-96b11a764e6f', 9, 'Operational Planning and Control', '11. Does the business have a reliable supply of material and components to deliver its service?', '', '', 911),
('38c7a910-4324-5151-895e-2d7fca981863', 9, 'Operational Planning and Control', '10. How is the PCBs, historic pollution, asbestos process managed, monitored and maintained?', '', '', 912),
('4e1e5e8f-22e6-5989-9c19-7d1b79aacb6a', 9, 'Operational Planning and Control', '12. How is waste, scrap and recycling managed in the business?', '', '', 913),
('40cc6f90-343b-5446-aa85-5f3d55c30b66', 9, 'Operational Planning and Control', '13. Does the organization preserve the outputs during production and service provision?', '', '', 914),
('4ef6f7a0-203b-58af-8f39-1dac51f9c339', 9, 'Operational Planning and Control', '14. Does the organization meet requirements for post-delivery activities associated with its products and services?', '', '', 915),
('a6b54239-9d66-5d89-aa25-fb8a3e5a4867', 9, 'Operational Planning and Control', '15. How is crime prevention managed?', '', '', 916),
('29e0d978-ed78-59c0-ab94-83fc4c0e757a', 10, 'Document, Data and Records Management', '1. Are all documents current, controlled and accessible as per the Document, Data and Records Management Procedure?', '', '', 1001),
('3362d56a-1042-5373-a93f-0fc0880d6289', 10, 'Document, Data and Records Management', 'Are the documents of external source (i.e. clients, service providers, contractors) identified, managed and controlled as per procedure?', '', '', 1002),
('4e8dd405-b6c5-5a22-b835-4156e3d12e7b', 10, 'Document, Data and Records Management', 'How are the TIMS documents and records maintained, controlled and administered with regards to archiving and disposal?', '', '', 1003),
('53e4a4a3-55f5-53b6-97cb-570146ffa92b', 11, 'Product Lifecycle Management', '1. In communicating with the customers are the following discussed and agreed upon?
- Products and services
- Statutory and regulatory requirements
- Contract / Order', '', '', 1101),
('0feb4255-4404-5a24-8976-539b54f06b83', 11, 'Product Lifecycle Management', '2. Are the following requirements for Products and services stipulated?
- Statutory and regulatory requirements acceptable?
- Requirements essential for specified or intended use?
- Resources to deliver the products / services?', '', '', 1102),
('8fcf2d36-79a5-5f2f-9544-d07a59ded5b7', 11, 'Product Lifecycle Management', '3. Are Changes of Requirements documented and discussed / Awareness conducted?', '', '', 1103),
('75345a43-f005-5f15-96e1-34cb5f34bb06', 11, 'Product Lifecycle Management', '4. Was there a project requirements gathering and analysis?', '', '', 1104),
('1b4b3f80-734d-55d1-acd8-d9f42d39f41d', 11, 'Product Lifecycle Management', '5. Were all interested parties involved in the requirements gathering and analysis?', '', '', 1105),
('37471ae1-0875-5aad-9fdd-92a8e7445e01', 11, 'Product Lifecycle Management', '6. Were all activities (minimum all mandatory) activities completed during requirements gathering and analysis?', '', '', 1106),
('a8af7e84-4b49-5398-87ec-4d79b956ee19', 11, 'Product Lifecycle Management', '7. Were all milestone activities met to proceed from project requirements gathering to design and development?', '', '', 1107),
('eeb8e2c3-75ad-5397-9572-58b8f9bb6d3b', 11, 'Product Lifecycle Management', '8. Was design and development process followed for the project?', '', '', 1108),
('dde46771-adb2-5c96-ac2f-0277f08c1d4b', 11, 'Product Lifecycle Management', '9. Was a letter of intent or authorising document available to initiate the design and development?', '', '', 1109),
('939c1a55-9dab-5a48-8dbf-7cd596aa5326', 11, 'Product Lifecycle Management', '10. Were all interested parties involved in the design and development', '', '', 1110),
('adc0aea6-21f9-53a2-8a77-382d3e6e24b0', 11, 'Product Lifecycle Management', '11. Were all activities (minimum all mandatory) activities completed during design and development?', '', '', 1111),
('e7b588c4-b162-5018-9b8b-c0d7decd0a0a', 11, 'Product Lifecycle Management', '12. Was the change management process adopted to manage changes after the design and development?', '', '', 1112),
('a924b699-4d4b-536e-a2db-adac11b1de16', 11, 'Product Lifecycle Management', '13. Was the project design validated through pilot/prototype?', '', '', 1113),
('0874f01f-2845-50f4-aca4-94cd4f881a4b', 11, 'Product Lifecycle Management', '14. Were all milestone activities met to proceed from design and development to construction / development / manufacturing?', '', '', 1114),
('187e8ad2-be57-519d-8ee9-6e951938be45', 11, 'Product Lifecycle Management', '13. Was operational readiness and commissioning sign-off before start of project operations?', '', '', 1115),
('3c78a157-2198-5d1a-9529-4fdcac20cc77', 11, 'Product Lifecycle Management', '15. Were all (minimum all mandatory) activities completed during construction/development/manufacturing?', '', '', 1116),
('b80d5ada-fa44-5d30-8bf7-e4daeac1481b', 11, 'Product Lifecycle Management', '16. Were all construction /development/ manufacturing completed before commissioning?', '', '', 1117),
('a45634dd-2ff5-5dfa-96f7-b210b0c67bb5', 11, 'Product Lifecycle Management', '17. Did end-users form part of the commissioning and acceptance process and needs were taken as input?', '', '', 1118),
('a6429faf-9a1d-5a2a-b495-8e6e1e2907c1', 11, 'Product Lifecycle Management', '18. Was a letter of intent or authorising document available to initiate the maintenance?', '', '', 1119),
('a15b0861-a561-57b1-90f8-68b5f74f3bb7', 11, 'Product Lifecycle Management', '19. Was maintenance executed as per letter of intent or authorising document strategy?', '', '', 1120),
('0e2b1fba-0333-5097-bdae-47a66834af08', 11, 'Product Lifecycle Management', '20. Did the maintenance strategy at minimum include all mandatory activities for the type of product?', '', '', 1121),
('4a9067e3-33f9-596c-80b2-9e504ea04548', 11, 'Product Lifecycle Management', '21. Was maintenance strategy applicable to the asset base with condition assessment?', '', '', 1122),
('9a368540-57eb-5e2b-aaa9-a3488e2fdb0f', 11, 'Product Lifecycle Management', '22. Are all maintenance plans managed by the approved maintenance management System?', '', '', 1123),
('4ae2f357-000a-5f6a-958e-34263eb122a1', 11, 'Product Lifecycle Management', '23. Did the decommissioning/disposal take into consideration all relevant legislative requirements?', '', '', 1124),
('f3feb007-25f7-5d3a-823e-35d75e66f19f', 11, 'Product Lifecycle Management', '24. Did the decommissioning/disposal classify the strategy as rehabilitation or disposal?', '', '', 1125),
('3fde8be6-20a7-5afc-9f46-f7bb0afd1b4a', 11, 'Product Lifecycle Management', '25. Did the decommissioning/disposal strategy at minimum include all mandatory activities for the type of product?', '', '', 1126),
('15a8489f-1288-5662-9863-b8b83e4ced1c', 11, 'Product Lifecycle Management', '26. Was decommissioning/redeployment/disposal of a product done responsibly and without impacting the environment?', '', '', 1127),
('6c528b4b-e2e8-50bf-9fc4-d4abed1b8a53', 11, 'Product Lifecycle Management', '27. Were records for Requirements Gathering and Analysis/Design and Development/Construction Development Manufacturing/Decommissioning Disposal managed and maintained?', '', '', 1128),
('41640d73-a0e3-5495-811e-74e58bf257a8', 11, 'Product Lifecycle Management', '28. Did the decommissioning/disposal classify the strategy as rehabilitation or disposal?', '', '', 1129),
('9e5eb7db-4a21-5592-8bf2-0ee605a9547f', 11, 'Product Lifecycle Management', '29. Did the decommissioning/disposal strategy at minimum include all mandatory activities for the type of product?', '', '', 1130),
('2f5150da-b3b8-51e5-9ac0-390790b4e5e3', 11, 'Product Lifecycle Management', '30. Was decommissioning/redeployment/disposal of a product done responsibly and without impacting the environment?', '', '', 1131),
('db3f98c4-4f77-5faa-90f6-c33f8c2cb572', 11, 'Product Lifecycle Management', '31. Were records for Requirements Gathering and Analysis/Design and Development/Construction Development Manufacturing/Decommissioning Disposal managed and maintained?', '', '', 1132),
('01224421-ffb2-5933-af6f-6a2b794da537', 12, 'Interface Management', '1. Identification of Interfaces amongst various ODs (e.g. Management of SLA between ODs)', '', '', 1201),
('df216810-98e7-5ca1-8470-986b3e52a160', 12, 'Interface Management', '2. Validity of Interface agreement, interface register and the monitoring of interface performance', '', '', 1202),
('edb7add5-4568-50c2-80bb-1b2ac2f0b10d', 12, 'Interface Management', 'How are the interface Management engagements coordinated, scheduled and implemented?', '', '', 1203),
('70f7aaa2-acb8-53b1-8320-40d048c1f82f', 12, 'Interface Management', '3. Alignment between iSCM and Safety i.e. availability of PPE, uniform', '', '', 1204),
('e57e391e-2c11-5a60-8269-5586b7e107ee', 12, 'Interface Management', '4. Verify if monitoring interface agreements and its frequency influenced by the requirements of the parties?', '', '', 1205),
('17bea07a-9163-53f6-8f1b-d486b2d4b200', 12, 'Interface Management', '5. How are the deviations and opportunities for improvement managed, monitored and addressed?', '', '', 1206),
('78d4b172-174d-5681-86a6-ebcc1a8df2a0', 12, 'Interface Management', '3. Does a risk assessment take place prior to the review of the interface agreement?', '', '', 1207),
('39a6d9bc-fab1-52c2-a3dd-0b7c95dbec62', 12, 'Interface Management', 'Verify if the Interface agreements were assessed, evaluated or reviewed as per schedule?', '', '', 1208),
('9a39cfc4-3df3-596c-ac8b-ac0642186851', 13, 'Occurrence & Non-Conformity Management', '1. How is the occurrence notification being reported, classified and reported to relevant stakeholders (RSR / Department of Labour / Railway Safety Regulator)?', '', '', 1301),
('8aca0915-3499-5976-9372-7ff88dc15ee5', 13, 'Occurrence & Non-Conformity Management', '2. Are draft reports for occurrences completed and circulated within in 15 calendar days?', '', '', 1302),
('ba6bf17e-d16b-5e8d-9baf-f578d1f6e4e6', 13, 'Occurrence & Non-Conformity Management', '3. Is the end to end process from the time of occurrence to the closure of the case file being implemented, monitored and reviewed?', '', '', 1303),
('402e86ce-dc35-5fca-aba7-9c58a498b2e4', 13, 'Occurrence & Non-Conformity Management', '4. Does the appointed Incident Commander take charge at occurrence scenes and communicates progress to the relevant managers?', '', '', 1304),
('20ef2b54-2e70-5e73-bccc-6eef5ae8cec7', 13, 'Occurrence & Non-Conformity Management', '5. How is the corrective and preventive action monitored? (Take a sample of 2020/21 and Q1 2021/22 occurrences)', '', '', 1305),
('cd194287-43b3-5be4-8c09-41a214f74955', 13, 'Occurrence & Non-Conformity Management', '4. Are the investigators competent? (Take a sample of 2019/20 and Q1 2020/21)', '', '', 1306),
('c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 13, 'Occurrence & Non-Conformity Management', '6. How are the investigation reports validated for correctness prior to sign-off?', '', '', 1307),
('67f28c1f-d252-5b2c-9a7b-b5bcd0690a64', 13, 'Occurrence & Non-Conformity Management', '7. What process used to manage occurrence sites?', '', '', 1308),
('bc532267-70ab-5047-aa50-43864cca83a7', 13, 'Occurrence & Non-Conformity Management', '8. How is effectiveness of the closure of incident verified? (evidence available to confirm the root cause of incident eliminated)', '', '', 1309),
('de519362-99cc-56de-aba9-0a93de7db549', 13, 'Occurrence & Non-Conformity Management', '9. Is the Risk Assessment Register reviewed after major occurrences?', '', '', 1310),
('b4cd7db2-6e3f-5a2c-bd87-7f83bc5dc16c', 14, 'Contractor Management', '1. Communication between Head Office and Areas on Contract Management - Roles and Responsibilities', '', '', 1401),
('91ad5651-3d24-5f25-8eee-9855a08a206b', 14, 'Contractor Management', '2. What process is followed for contractor management?', '', '', 1402),
('d514732c-17b8-5571-ade2-236fde97aedc', 14, 'Contractor Management', 'How are the contractors on-site being managed?', '', '', 1403),
('10e94e68-7afc-55a7-b5b9-3897e8f89de0', 14, 'Contractor Management', 'What are the key activities that are followed to conduct close-out of the contractor?', '', '', 1404),
('5c9780b2-593a-578c-96ad-34db7e75f2b2', 15, 'Integrated Assurance', '1. How is Calibration Monitored?', '', '', 1501),
('06410f47-6399-5c28-985c-db99c6c34dd9', 15, 'Integrated Assurance', '2. How is the Integrated Assurance established, monitored and gaps addressed?', '', '', 1502),
('56374cbd-059c-5a86-a0e3-3baa4b9adec0', 15, 'Integrated Assurance', '3. Verify if all the mandatory surveys are implemented and recommendations are addressed.', '', '', 1503),
('edcacc85-ec61-5d02-8096-4e4e5e29e182', 15, 'Integrated Assurance', '4. Does the business have a internal assurance schedule (Schedule of inspections)?', '', '', 1504),
('ac60be05-5a07-5fdd-8f28-435154238159', 15, 'Integrated Assurance', '4. Does the business have mechanisms to track adherence to rolling stock maintenance schedules?', '', '', 1505),
('02eb0744-a8f0-5072-a74d-152b2aa7cdb2', 15, 'Integrated Assurance', '4. Are SHE compliance inspections scheduled and executed by relevant personnel?', '', '', 1506),
('e6cce313-0a9c-5f63-aca4-01a4fe5b6e19', 15, 'Integrated Assurance', '5. Are SHE Representative monthly inspections done?', '', '', 1507),
('a34b070e-7838-55b7-9b86-af9be50c4e67', 15, 'Integrated Assurance', '10. Were all the previous audits findings of 2020/21 effectively and satisfactorily closed out?', '', '', 1508),
('d81183a0-420f-53f8-a0a1-0104b20e681e', 16, 'Business Continuity Management', '1. Is the Business Impact Analysis (BIA) conducted?', '', '', 1601),
('9d634e49-5755-580f-9ff3-4e18ad9997ae', 16, 'Business Continuity Management', '2. Business Continuity Plan documented, reviewed and signed off?', '', '', 1602),
('313e6232-60a0-52f8-9588-6e96df4a8f04', 16, 'Business Continuity Management', '3. Are the Control Self Assessment on BCM standards conducted?', '', '', 1603),
('1e63c5aa-131a-5523-aa7b-b7c7a01281e7', 16, 'Business Continuity Management', '4. How is the simulation of the BCP coordinated?', '', '', 1604),
('1c2a5657-c3bf-55ed-bdeb-3ba7863fb1e0', 16, 'Business Continuity Management', '5. Are Critical business systems identified?', '', '', 1605),
('3b1bb43c-54e8-5fca-983b-13fe2e416f33', 16, 'Business Continuity Management', '5. Verify if Critical systems are tested', '', '', 1606),
('d8252528-5010-5f56-89f5-78f98c2702f6', 16, 'Business Continuity Management', '6. Are the BCPs of suppliers of most urgent supplies or long lead time tested?', '', '', 1607),
('55f5b866-1c1e-56f4-9673-b91db11c3b46', 16, 'Business Continuity Management', '7. Has a Multi disciplinary Incident plan been developed?', '', '', 1608),
('3d73f3ab-5740-557f-97d0-1f8dac4d96db', 16, 'Business Continuity Management', '8. Verify if the Business Continuity training programme is developed, implemented and maintained?', '', '', 1609),
('be69337c-c76b-533a-9fc2-ef25f1f97ad9', 16, 'Business Continuity Management', '5. Is there an Integrated BCPs of ODs sharing the site available?', '', '', 1610),
('89c991ea-bd69-5e70-b2f2-938ebacbe50f', 17, 'Human Factors Management', '1. How is the Fitness for duty monitored?', '', '', 1701),
('19d4f8cd-561b-5e96-8432-3546743a4032', 17, 'Human Factors Management', '2. Verify if Management of the Risk profile is implemented', '', '', 1702),
('e9fd1aad-ec1c-550f-aaf5-8caf54d3ede6', 17, 'Human Factors Management', '3. What ergonomics assessments required and how are they managed?', '', '', 1703),
('3e003936-7dee-5322-9c74-742e9de981d0', 17, 'Human Factors Management', '4. Are all organisational and psychological processes in place?', '', '', 1704),
('9a2ca9b2-b54e-5f85-9fb9-1e3e92a0836d', 17, 'Human Factors Management', '5. Has the Occupational Risk Exposure Profile documented, communicated and monitored?', '', '', 1705),
('5c67ae7f-0dc0-534b-aef5-c404c1ecd992', 17, 'Human Factors Management', '6. Has the Health risk assessments been conducted by the Occupational Health Practitioner?', '', '', 1706),
('af06965c-69c6-5680-8dac-68e91ff6f453', 17, 'Human Factors Management', '7. What process is followed to manage fatigue?', '', '', 1707),
('0d6f7b73-d1a6-55be-aec3-70e85db9e8cf', 17, 'Human Factors Management', '8. How is pregnancy being managed?', '', '', 1708),
('336c371f-9c3c-5711-9516-492ff32331f0', 17, 'Human Factors Management', '9. Verify if Employee Wellness programme is integrated to address various interventions.', '', '', 1709),
('53695b46-730e-5ec1-8808-4d667b620618', 17, 'Human Factors Management', '10. What process are in place to manage stress?', '', '', 1710),
('9d6de643-7ba5-5a4b-a65f-1c88e7c6b791', 17, 'Human Factors Management', '11. What occupational health stressors are inherent to this environment?', '', '', 1711),
('a3ce3d6d-1901-5ec0-84c6-bb8c32551b93', 17, 'Human Factors Management', '12. How is overtime managed within the business to ensure management of fatigue risk and compliance with relevant legislation?', '', '', 1712),
('a555198f-0ad9-58c4-9c4c-4d6deb7bafaa', 18, 'Continual improvement', 'Which Continual Improvement Initiatives are identified and how are they monitored?', '', '', 1801);

-- Re-add FK on findings
ALTER TABLE findings ADD CONSTRAINT findings_procedure_item_id_fkey FOREIGN KEY (procedure_item_id) REFERENCES procedure_items(id) ON DELETE SET NULL;
