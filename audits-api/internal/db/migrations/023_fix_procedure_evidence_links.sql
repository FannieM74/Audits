-- Fix procedure evidence items to reference correct procedure_item UUIDs from 015_rebuild_procedure_items.sql
-- Old evidence items reference UUIDs from 012_seed_procedures.sql (auto-generated)
-- which were replaced by 015_rebuild_procedure_items.sql with different explicit UUIDs

DELETE FROM procedure_evidence_items;

INSERT INTO procedure_evidence_items (id, procedure_item_id, evidence_text, sub_label, sort_order) VALUES
('c9c60a30-9f67-5b81-9d4d-f0e1418a36a0', '27d26e18-9714-5b68-9648-1183d5b97b44', 'Organisational Structures Maintained  and Approved', '1.1', 0),
('6d701053-213c-5896-93b8-298b9bcad5e9', '27d26e18-9714-5b68-9648-1183d5b97b44', 'Vacancy plan developed, implemented, monitored and maintained.', '1.2', 1),
('46f1706f-31c2-52f5-97c2-4a4259a70a04', 'c0a98fa0-f7fa-5fac-b0ab-5602d821e49a', '2. Job description include TIMS requirements', '', 0),
('c6308f1a-a020-5760-90ac-888dd97d4865', '74a17fe7-b6f5-5ba5-b0f7-f696e0ae2f26', '3. Statutory and other Operational Appointments  letters in place and maintained according to the relevant requirements.                                                -IMS Administrator;
-IMS Coordinator;
-SHE Committee Co-opted Member                                                             - First Aider                                                                 -SHE REP: Section 17 of the OHSA (Act 85 of 1993) by the IMS Coordinator                                                           -General Machinery Regulation 2 (7)                                                             -etc', '', 0),
('bc3e7dfa-2d2b-5506-bc12-9cf28ecb5273', 'a741d222-ee19-5de2-ad3d-1b7f30b7cd8a', '4. Approved current Delegation of Authority and Matrix for all the cost center owners.', '', 0),
('da5d66c6-63ab-573b-852c-ea48bffe3338', '2129e7d8-64a8-5661-a03f-c0ad77b9c751', 'Deployment plan based on risk / hot spots', '', 0),
('a5e9f9a7-0271-5526-94e3-3afe3bd66a44', 'e73878e4-bf7c-5071-8956-293496305054', 'SHEQ Meeting minutes, adherence to agenda and attendance registers (Schedules and adherance)', '', 0),
('0ef1a651-1444-5664-8f88-66c6239d04d1', '812e4499-b5b4-5a4f-98ad-1047aad12229', 'SHEQ Meeting minutes and attendance registers', '', 0),
('a7e9b93d-8f58-5912-bab9-6d7d1e735188', '0dc2df25-0912-5a13-800b-c71fbe45f49a', 'Meeting Schedule available on TIMS Sharepoint Workspace', '', 0),
('b3afcc12-8d2b-5056-b9ac-1e788274876d', '16c83290-af3c-573f-859d-486db5e085cf', 'Communication Memo available on TIMS Sharepoint Workspace', '', 0),
('e44d731d-7830-547b-9f50-7df83de3cb92', 'df035058-6b28-53b0-9da5-61c34fe4f66d', 'Attendance Registers, Minutes and Management Review Meetings Pack/Report available on Sharepoint', '', 0),
('16717e8b-e74f-5384-81b3-10b6393cc13e', '62da97ce-dba6-5161-b7b5-316242e7f0a4', 'Attendance Registers, Minutes and Management Review Meetings Pack/Report available on Sharepoint', '', 0),
('a78e99e6-c11f-5305-813a-63067a49d78f', '21914aea-2a89-50be-a7df-3ea86349bfe9', 'Available and displayed Policy', '', 0),
('b1966a9a-2f43-5c7f-8c1a-5cd0d7adb976', '2a5e3c9d-3fc7-5437-8575-1e5c76deae6a', 'Minutes of Meeting and Attendance Registers', '', 0),
('a0ba5738-dd99-5cdf-ae4b-e82266eaf258', '2a1e1e63-756d-5073-862b-30640e0c9bb0', 'Check notice boards and common areas
Assess the level of unuderstanding of the policy?', '', 0),
('9cef6b71-a20d-5182-a3d2-a57f434a6e3d', 'f89624ff-8e7a-5894-a138-c2232a4a12b3', 'Updated Stakeholder TIMS Policy Commitment Statement Request Register', '', 0),
('ef613b6b-8843-52cb-b6e0-efad7c6bff64', 'dfc2db34-9376-5b35-b597-1e54f9400e88', '1. Business unit scope documented', '', 0),
('46b2b9dd-fd61-5f13-9363-a4569ecffcf0', '2c225ac1-c448-5168-9d83-02a1864f8114', 'Business unit scope documented stating product and services covered.', '1', 0),
('a6c73a70-4974-53d9-b989-56b21e7eba1f', '2c225ac1-c448-5168-9d83-02a1864f8114', 'Justification evidence where standard requirements is not applicable to the scope.', '2', 1),
('5621d351-2ace-51d6-8f5b-8312bb164f29', 'abcf9a5f-cae5-5373-be05-d1daff99d6fe', 'Mandate, context of organisation, physical boundaries  (area, depot, business unit, specialist unit or departmental, business activities, exclusion etc)', '', 0),
('ba852c4d-4ffd-5d00-96ab-830bb94d41b1', '83d5b23d-dcba-599b-87fa-e6d15f12e57a', '1. Final Operational Risk Assessment register for the year under review in the latest Risk Assessment Register Format.
Compliance to the process and quality of the input.', '', 0),
('8718148b-b411-5dc3-b47e-e995775fb41b', '2fd09a71-5faa-5abb-9e8c-fcfe600e8de3', '1. Documented work areas verification', '', 0),
('32a68b70-b0dd-5cea-a5aa-5acf14e8ee44', '45a99f84-bb3b-5b06-9d2a-9e2a5a0eecb0', 'Updated risk register, attendance register as proof of involvement of relevant stakeholders', '1', 0),
('5458b9d2-dd15-5ddd-ade6-61bf2bea3f08', '45a99f84-bb3b-5b06-9d2a-9e2a5a0eecb0', 'Control Assessments through inspection reports, PJOs, etc.', '2', 1),
('676e143d-6d47-5c08-879c-2b833ec0f77f', '45a99f84-bb3b-5b06-9d2a-9e2a5a0eecb0', 'All risk register fields completed', '3', 2),
('b56ea9a6-6b44-5154-8d04-10dae23bc0a1', '4659f397-7a22-51ef-9d95-15d36acd7238', '3. Documented management plans for the identified top 10 significant risks including evidence of implementation.', '', 0),
('1d8d76c2-d3fa-519c-b6b2-7a83fe6edb03', 'bda42250-f5ff-5099-850e-5dafeb460481', '1. Any record of changes within the review period. Adherence to the Management of Change Procedure. Issue based Risk Register for the change. (These are at local level, where applicable)', '', 0),
('6d4609fc-7dd7-56aa-8878-89cfee07192a', '460134d0-8ab4-5503-aa08-d1ef37c69654', '1. Any record of new equipment, technology within the review period. Issue based Risk Register for the introduced equipment of technology.', '', 0),
('8c660fbb-2a1d-5841-843e-8dd02ef12155', '8fb2daa6-a9ec-5976-9489-4d69e6e45457', '1. Amendment made after an occurrences and records of that amendment.', '', 0),
('2bb60a1e-967f-5879-b6e0-243b1bbdac0a', '7f5fc25e-b3d5-5adc-8a73-618a8e72de37', '4. Attendance register with signatures or e-mails', '', 0),
('9cd1dc5d-468f-5934-9d33-fb9da96e218d', '03c99223-3eec-53ae-a7a5-7cb6cde384a7', 'Attendance register with multi-disciplinary team', '1', 0),
('0a859a6b-974e-5def-bd3c-5cd7dfbe468c', '03c99223-3eec-53ae-a7a5-7cb6cde384a7', 'Risk Register with various catergories per applicable risk', '2', 1),
('90b5af44-95ef-53d3-b897-ff2feef354cd', '6b7b0de7-ddac-5688-87ce-1f39fc8dd6a4', 'Work areas or main processes and activities/services process flow', '1', 0),
('637b3519-7b01-5142-b6e9-9907353b21c8', '6b7b0de7-ddac-5688-87ce-1f39fc8dd6a4', 'Risk Register linked to the process flow', '2', 1),
('50d65cca-6b6e-590b-8fad-8506f1b68811', '3e87de63-a23e-5945-89de-cf1151a5abfe', '1. Opportunities Register', '', 0),
('2ef60e72-5b92-5615-90ea-0bc50e525503', '355fce42-8667-5e69-9eba-478b8b9bea14', '1. Operational risk assessment review schedule    2. Attendance register of multi-disciplinary team', '', 0),
('e7edf77b-d638-571f-b4b3-1d12202b56a1', '1873434d-2ff9-568e-9105-5e522c5a29b6', '1. Records of at least 3 years', '', 0),
('f35008d1-7590-5e86-ac78-47975c5a47f4', '2a43f7c1-0e2c-586d-b272-98bb26bd2da9', '1. Applicable national and international regulatory requirements
2.Applicable by laws
3. Applicable Codes and Standards 
4. Transnet codes, processes, systems, activities, people, products and services', '', 0),
('ae057ddb-561b-5d7c-9327-929e8c85e3fc', '80e7c5b2-5a73-590e-8368-10f49244f82e', 'Compliance Obligation universe
Compliance register', '', 0),
('3083abb5-75eb-57e8-97af-a1636982875c', '34f47c85-d100-58ad-ba2a-7e943be95a55', 'Licence and permit register
 (e.g. Environmental permits, Compliance to conditions of permits, COP 29 certificates and licences, Railway operations permits, Gas Store, Flammable store, Affluent Plant, Spray Booth, etc.)', '', 0),
('d55a1a97-ef08-590b-bf04-9362d4751ec7', 'cd52f90f-62a5-5cc9-b29b-33cdba9c4d7a', 'Action plans', '', 0),
('fb2bda90-85df-5711-831d-43057625974b', '15a5d11a-df33-50d6-8bbf-1f375b5e4b84', 'Compliance exposure report', '1', 0),
('bb267145-4c60-56f9-9f0e-fcdbe3fe01a7', '15a5d11a-df33-50d6-8bbf-1f375b5e4b84', 'Implementations of actions and assess effectiveness (improvement directives, contraventions and prohibitions)', '2', 1),
('3b32d1e4-d88d-5ea6-9879-fa503ccc1c93', '15a5d11a-df33-50d6-8bbf-1f375b5e4b84', 'Reporting of Compliance exposure report to the governance committees', '3', 2),
('61088086-90da-504d-9676-09b89e529219', 'b0e1e5f8-e26a-5c08-afda-10bc3eccb65a', 'Register / email / Governance forum minutes
Implementations of action plan', '', 0),
('7f9c899d-2f82-5abf-96ed-cfc8a65d3123', '6b45f333-65aa-5faf-aa69-5df65d844270', '1. Objectives and Targets developed in relation with the significant/very high SHEQ risks or opportunities derived from;
Overall business strategy and context;
Stakeholders (customers, employees, etc.) requirements and expectations;
Compliance obligation (legislation, standards, etc.)
 TIMS Operational Risk assessments;
 Past performance against established Key Performance Indicators;
 Occurrences, noncompliance, directives from authorities;
 Outcomes of internal and external audits;
 Resources capacity (technology, finance, human capital, etc.) and etc.', '', 0),
('2c1a8438-6499-5041-956d-399e7372e71a', '2408f39b-d0fe-5a7a-8821-03ad5a535110', 'Management Plans (e.g SIP, Environmental programme, operational plans) 
Meeting minutes and attendance register
Status report (e.g Performance Report)
Three yearly review cycle and annual progress review', '', 0),
('42c6300b-a99a-537a-a2ab-952854b8a459', 'a81e077f-54d5-5f72-b92a-11b29a40ec27', 'SMART Objectives and Targets,   - , allocated sufficient resources, and delegated to responsible persons.', '', 0),
('041c55ec-4405-578a-ad04-f6dfbe3c56db', '6edce5bc-0f66-5f35-95c9-af8d8ad0f0cd', '4. Management Plan reports', '', 0),
('08554422-9d42-5f6b-976b-be4d629317da', 'f2ab6266-b3fc-55fe-8e55-44a79d5e31d6', '1. Internal Communication: newsletters, notice board, emails, meetings,  ‘Toolbox talks’, digital signboard, social media, Teleconference, Suggestion box, Intercom system, Events, Reports, Phone Calls, Internal Magazine and Management Review Meetings
External Communication:  Media Relations, Reports of incidents to Authorities, Designated appointed personnel', '', 0),
('9eda70e9-f24b-528d-b9de-2dc192b9d84c', '6dcaf8ca-5711-5859-9013-8f477a57599c', 'Stakeholders with influence/impact on the organisation', '1', 0),
('1342f6e6-d24a-5bf1-b7d0-8d243572d05a', '6dcaf8ca-5711-5859-9013-8f477a57599c', 'Stakeholders importance to the organisation', '2', 1),
('4e20d9f1-ab62-52a7-b3d3-3b9a50c830ea', 'f521d114-f9c3-5319-9477-981a3e1242e6', 'Completed Ranking Matrix', '', 0),
('62a29815-ed26-59b0-9553-ecb4bf871716', 'a3791ead-20de-5679-8bbb-2d363e3b3589', 'Stakeholder Engagement Plan', '', 0),
('49e28e22-a281-5bfc-ac41-3ebb4dc13527', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Review and assessment of information received from stakeholders pertaining to real and perceived impacts on our business.', '1', 0),
('ec7ba159-4b96-5ece-b22c-ca46b1a30537', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Materiality determined for issues', '2', 1),
('5e249392-756d-5921-adcf-8bc89a990030', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Rating of the issues are rated ( scale of 1-10, 1 being low and 10 being high).', '3', 2),
('8e9e1839-f4c6-54f6-b8ff-d0734fe251d0', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Grouping of the issues into 4 levels of materiality', '4', 3),
('5669381f-2363-59ec-b200-5a46f1a7d768', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Proactive identification of potential impacts to business as part of stakeholder analysis, and identify feasible solutions to reduce impacts as far as practicable.', '5', 4),
('43f32d49-3be8-5576-acdb-fbf69ee2c9ee', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Identification and evaluation of potential issues with stakeholders', '6', 5),
('7008071d-fdb0-5009-8cf6-68e8d184444c', 'b5217bbb-47bf-5a60-9092-76b20a79f3c3', 'Escalation of the relationships that pose a high risk to Top Management and reporting of this risks to the relevant governance committee', '7', 6),
('1ba10999-402f-5107-8f19-c1b45e364f37', '8dff5c71-1031-5c25-a48d-9a6b2d5ae6bb', 'Appointed Stakeholder Relationship Officer', '', 0),
('0f9d500d-f263-539c-a9af-fc157cd6349e', '540c8772-8cf3-5d39-9579-8ad0248ab1e5', 'Report shall include, but not limited to:
· List of stakeholders for the reporting cycle;
· Method and frequency of engagements for the reporting cycle;
· Objectives of the engagements;
· Issues raised, responses to those issues as well as actions taken;
· Potential impacts to business and
· Areas of improvement;', '', 0),
('d94623da-2650-5393-ba5a-731732da00a2', 'a7a87efe-6d3f-56a6-b7a0-05d540cca368', 'Completed Stakeholder Improvement plans', '', 0),
('e31a28bb-d8c2-528f-92a6-3a3e187f1c9a', '934e20cd-fc7f-5f4f-88cc-4872d525075a', '1. Define Strategy defined as follows:
- Define the objectives of the consultation and participation
- Stakeholder mapping
- Selection of the most appropriate methods and tools for consultation and participation
- Define the timing and duration of consultation and participation
2. Run a Consultation and Participation Process:
- Select the Consultation and Participation Medium and Space 
– Announcement/ Communication of consultation and participation 
– Undertake the consultation and participation process
- Acknowledge receipt of contributions received
3. Analyse Results:
- Analyse the responses
- Reporting on the results and providing feedback 
– Evaluation of consultation and participation exercise', '', 0),
('b47f4c27-3162-5fcb-b801-05f749f4ed97', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Log a Case', '1', 0),
('ab81d5a8-faee-5f65-bc86-c1bb3d134183', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Assign a Case', '2', 1),
('6f04233d-36e5-53d7-912e-bf13b4c2e1ca', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Investigate/Compile a Case', '3', 2),
('4a5efada-8c05-5937-923f-428a6379b748', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Finalise a Case', '4', 3),
('736334fd-2ae5-5f0b-83c4-09aded59b088', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Report on Community Grievance Outcomes', '5', 4),
('d3554a7b-d7eb-5b6c-8a72-1ea7eb8c8e67', 'b4db5b6d-9937-5501-89ea-37bd44a868f3', 'Submit for Integrated Reporting', '6', 5),
('5386ee43-d3ea-5adb-9574-109dab69efe0', 'f9a2b7f2-ddaa-55bf-823e-5e0e144dac8f', 'Completed skills matrix
Training plan 
Status report', '', 0),
('3231ea36-5654-50db-8353-458f7de861ca', 'a9a5450b-30f6-5e8f-90b7-78e34eabfc91', 'OBML Matrix and schedule', '1', 0),
('3919f707-6800-55e3-9417-275d7a8975c0', 'a9a5450b-30f6-5e8f-90b7-78e34eabfc91', 'Update the Candidate’s Profile (theoretical assessment, practical assessment, and comprehensive assessments)', '2', 1),
('134a5c68-9ca8-5f20-939b-88632e090796', 'a9a5450b-30f6-5e8f-90b7-78e34eabfc91', 'Status report of the OBML assessment', '3', 2),
('6135db7f-1381-5d27-84ca-3f16ca141991', 'a9a5450b-30f6-5e8f-90b7-78e34eabfc91', 'Completed Assessment Effectiveness Evaluation', '4', 3),
('d54aa456-731d-524d-874a-150b2ff2411f', '2e5d5035-e3cf-5d48-85e4-34d5b7aada25', 'Task Observation schedule', '1', 0),
('adfb78d5-75b8-560c-bba1-53829d6f4395', '2e5d5035-e3cf-5d48-85e4-34d5b7aada25', 'Status update of the task observation plan', '2', 1),
('65f209a8-86dc-52dc-b74b-f5bfbe829987', '2e5d5035-e3cf-5d48-85e4-34d5b7aada25', 'Management of actions identified', '3', 2),
('6366e8d1-94f7-520e-8d26-4a34e829a8d0', '7d723160-7e10-5580-a643-2e6df659c088', 'Overtime report
Resoultion of the deviations', '', 0),
('cbcca52e-245f-5a2a-ae9a-b89c84952343', '80d34bbf-2bec-5de8-8303-50715ac1e3b4', 'Employee Balanced Scorecard
(BSC) and Individual Development Plan (IDP).
BSC’s and 
IDP’s maintained on SAP.', '', 0),
('1e175fc2-33dc-540d-932a-9513ca6be189', '7468699a-c5da-5f08-9f7b-140a8d69669f', 'Training and awareness plans, and attendance registers. 
Posters and flyers', '', 0),
('ef1d7df2-e8c6-5ec6-8d87-8e456fa8bb05', '25b8fb40-10a8-5fcd-8f19-7e9d48ef0625', 'Applicable Training / Attendance  registers', '', 0),
('359e5e09-0e94-5152-bf73-d020043f7c7a', 'cd4bd277-7633-5b31-8db4-453d4c48a68a', 'Job descriptions', '', 0),
('64ec421a-2c32-56e1-9d2b-cc655cd8bf2e', 'fbd97f14-aec1-5c0d-99f5-c8e487d5945b', 'Business Process Register', '', 0),
('9093f74b-85d7-5530-b717-9af622583827', '8c5a083b-f209-5ea0-9d5b-c56f20c2ccb2', 'Change Register', '', 0),
('9a05a3e1-9696-53d2-b178-1588b59cf61d', '155ebbc0-ec23-50bd-a107-c59a47068b75', 'Communication of the plans', '1', 0),
('f2a81a9c-83cf-5ba0-bade-ef9a469a3147', '155ebbc0-ec23-50bd-a107-c59a47068b75', 'Monitoring of the plans', '2', 1),
('07b65cbf-b623-5a06-9455-16ddad7a59b2', '155ebbc0-ec23-50bd-a107-c59a47068b75', 'Addressing the gaps where plan was not met', '3', 2),
('296c9c3b-ce02-50e8-9133-fb81bdc4d55d', '1fcc37d9-a8ce-54e6-bae3-5d1dd3bb10c1', 'Schedule', '1', 0),
('9ee66bb2-128b-560f-ac92-645f805a8fee', '1fcc37d9-a8ce-54e6-bae3-5d1dd3bb10c1', 'Status report', '2', 1),
('8409d97d-8c0a-57a4-9f2b-6a4b4e0c405e', '1fcc37d9-a8ce-54e6-bae3-5d1dd3bb10c1', 'Action plans', '3', 2),
('b20a435d-45be-5502-99dc-845f32d8e688', '5a548f3e-44f3-5843-aba7-be17e5f9e1f0', 'Loading profiles', '1', 0),
('63429f53-581b-55ae-af3c-a84cc65da584', '5a548f3e-44f3-5843-aba7-be17e5f9e1f0', 'MSDS availability', '2', 1),
('9f7a6d7d-1311-58fe-8f53-16b165d5e291', '5a548f3e-44f3-5843-aba7-be17e5f9e1f0', 'Route risk assessment', '3', 2),
('cf6a5321-64a9-5c58-bc55-d830b7135450', '5a548f3e-44f3-5843-aba7-be17e5f9e1f0', 'Training of the personnel handling', '4', 3),
('2ef6e65f-5fa5-5cea-9535-e464e2240110', '31810085-3357-57f5-9aee-af5f4c68ea7d', 'Storage', '1', 0),
('29529dc2-f173-54c0-91a3-d020f1eaa40f', '31810085-3357-57f5-9aee-af5f4c68ea7d', 'Permit', '2', 1),
('4b440774-69af-5685-afb8-29330e2bb88a', '31810085-3357-57f5-9aee-af5f4c68ea7d', 'Training of the personnel handling the detonators', '3', 2),
('af48ce64-6593-56ae-8b1e-d6e783fbc63d', '2174ed53-d3af-5ff6-9e32-7fdc77688fa4', 'Random alcohol testing', '1', 0),
('fd9413e0-847d-5d1e-b126-430cb694f72b', '2174ed53-d3af-5ff6-9e32-7fdc77688fa4', 'Drug testing', '2', 1),
('39f56aa7-fa1b-5f8a-8257-4c9c9e1178cc', '2174ed53-d3af-5ff6-9e32-7fdc77688fa4', 'Disciplinary statistics', '3', 2),
('924a19c4-486e-5a54-ad62-723ff208c9e5', '158641f9-0e29-5b52-9c62-a3e46ef4d707', 'Approved overtime memoranda', '1', 0),
('6ad8e03b-0c0a-55ac-8654-aacdc3396cd1', '158641f9-0e29-5b52-9c62-a3e46ef4d707', 'Overtime report and employees working excessive overtime', '2', 1),
('b335a435-3425-56ab-a2a6-c3f5ddbe246c', '7ffcfd99-2c6e-5ad7-9c17-5d584b4693bd', 'Vacancies report', '1', 0),
('3849f8b9-7fc4-53cd-aad6-6c9ff7dff970', '7ffcfd99-2c6e-5ad7-9c17-5d584b4693bd', 'Cycles times reports', '2', 1),
('76406715-2629-5546-9c06-13eb36173580', 'a7e44074-1479-56b9-948b-76d9a3be8d12', 'Availability and Reliability Statistics', '1', 0),
('cac22f74-eb9a-5dfa-9b38-47e5c8acedcb', 'a7e44074-1479-56b9-948b-76d9a3be8d12', 'Action plans to address deviations', '2', 1),
('337fbb4b-73fb-5b71-a27b-cc5517a169e3', 'c7bc8fb9-8e58-59a4-ba6f-c7f2439e8542', '1. List of critical components and current stock levels (you can also check past history)', '', 0),
('8c2c7bbc-ded6-566a-a9f1-cfa616c3405c', '14de8ca5-5199-5d3f-8c5e-96b11a764e6f', 'Historic pollution, asbestos, PCB management programme (plan, testing reports etc)', '1', 0),
('b0118858-0c1a-55ac-9fe0-90e053cbe37d', '14de8ca5-5199-5d3f-8c5e-96b11a764e6f', 'Programme Status report', '2', 1),
('04d4a027-baff-5c95-a037-39c3f4113c76', '14de8ca5-5199-5d3f-8c5e-96b11a764e6f', 'Action plans', '3', 2),
('8a036fe3-dd84-5fbb-af00-c97c5087dcbb', '38c7a910-4324-5151-895e-2d7fca981863', 'Waste separation programme (colored binse)', '1', 0),
('8fd372f9-aa72-5253-b874-d6c4550c0a22', '38c7a910-4324-5151-895e-2d7fca981863', 'Check adherence', '2', 1),
('b633e70e-7268-580f-8bbe-e0e41e716078', '38c7a910-4324-5151-895e-2d7fca981863', 'Recycling records and safe storage of scrap in the premises', '3', 2),
('e3b24597-461a-5329-9334-e9e759b0b7f9', '4e1e5e8f-22e6-5989-9c19-7d1b79aacb6a', 'Preservation can include identification, handling, contamination control, packaging, storage, transmission or transportation, and protection', '', 0),
('fbea156f-4864-5931-b3a1-5a18cac84081', '40cc6f90-343b-5446-aa85-5f3d55c30b66', 'Post-delivery activities can include actions under warranty provisions, contractual obligations such as maintenance services, and supplementary services such as recycling or final disposal.', '', 0),
('4447c50b-4e76-57b0-bb1c-3078e2ed92c9', '4ef6f7a0-203b-58af-8f39-1dac51f9c339', 'Identification of hot spots', '1', 0),
('aca6ed1d-25ba-5886-8ea0-3a35b9b7b3ec', '4ef6f7a0-203b-58af-8f39-1dac51f9c339', 'Preventive and response plan', '2', 1),
('e7accfc6-4a7f-53a7-887a-1f648ccca75d', '4ef6f7a0-203b-58af-8f39-1dac51f9c339', 'Risk arising from theft (analysis security incidents)', '3', 2),
('e7e3f513-2348-59f4-b0e7-e656294d1fd9', 'a6b54239-9d66-5d89-aa25-fb8a3e5a4867', '1. Current documents and available at the point of use.', '', 0),
('7c025ad1-af09-5a24-9315-0d01dfacd3aa', '29e0d978-ed78-59c0-ab94-83fc4c0e757a', '1. Document register
2. Electronic copies of the original paper documents managed within the
approved system.
3. Links added in an applicable software system to the electronic scanned copies.
4. Descriptive details (metadata) of these documents are captured on the applicable
Transnet document management system.', '', 0),
('217014b7-5e02-5bd0-8b01-16bf02025d5d', '3362d56a-1042-5373-a93f-0fc0880d6289', 'Communication of the approved New or Updated Procedures', '1', 0),
('1ea2839b-4904-5183-aea4-c9dabd8d92c4', '3362d56a-1042-5373-a93f-0fc0880d6289', 'Records Disposal Register', '2', 1),
('07a1c6ad-78ee-5662-b55d-195b2056f2b8', '3362d56a-1042-5373-a93f-0fc0880d6289', 'Completed document Control Change Request', '3', 2),
('97a2713d-c82e-5f1e-ba54-2b5f15ead0a0', '3362d56a-1042-5373-a93f-0fc0880d6289', 'Records Retention Guide.', '4', 3),
('dc76cfd0-6232-50e5-b719-76556e3c25f8', '3362d56a-1042-5373-a93f-0fc0880d6289', 'Certificate of secure and compliant destruction', '5', 4),
('703f5129-5a34-5259-ae3e-a003d1c4fd7b', '4e8dd405-b6c5-5a22-b835-4156e3d12e7b', 'Statement of work (SOW)', '1', 0),
('a1a6fbc2-3c6f-5d69-8901-f8961a156f41', '4e8dd405-b6c5-5a22-b835-4156e3d12e7b', 'Specifications, etc', '2', 1),
('c09f980f-c82d-58e9-abf0-c52bcb7bc491', '4e8dd405-b6c5-5a22-b835-4156e3d12e7b', 'Customer Surveys', '3', 2),
('b1b3af08-8f59-5ff8-9945-716c94044757', '53e4a4a3-55f5-53b6-97cb-570146ffa92b', '1. Requirements noted / listed / communicated', '', 0),
('a21c8067-f046-5a74-a9a1-5d8849780eb1', '0feb4255-4404-5a24-8976-539b54f06b83', 'Change documentation and records', '1', 0),
('b0bffd76-5016-5e42-b68a-052140fe53a6', '0feb4255-4404-5a24-8976-539b54f06b83', 'Attendance Registers', '2', 1),
('dcd0b88c-d3a8-5ec3-959c-81c27b72d645', '8fcf2d36-79a5-5f2f-9544-d07a59ded5b7', 'Project File', '1', 0),
('3799c6be-ae59-52da-8e72-1d163c206dda', '8fcf2d36-79a5-5f2f-9544-d07a59ded5b7', 'Project meeting agenda and minutes', '2', 1),
('b9dc565a-b9aa-5558-8bba-d145dd8e8aa5', '75345a43-f005-5f15-96e1-34cb5f34bb06', 'Meeting invite', '1', 0),
('28d19140-a5d3-5d35-afbf-279497a41acc', '75345a43-f005-5f15-96e1-34cb5f34bb06', 'Meeting attendance register', '2', 1),
('32f33106-1f8c-5c2d-9638-7d8962f8065b', '1b4b3f80-734d-55d1-acd8-d9f42d39f41d', 'Meeting minutes', '1', 0),
('43ed42d8-a06e-5e5c-af20-488029933521', '1b4b3f80-734d-55d1-acd8-d9f42d39f41d', 'Action plans with responsibility, due date and status', '2', 1),
('8d3d494b-ed31-5cd7-a514-b70cec614e6a', '37471ae1-0875-5aad-9fdd-92a8e7445e01', '1. Signed-off user requirements specification for the project.', '', 0),
('97b8ec0c-0e85-5edb-a476-d33b04bcb589', 'a8af7e84-4b49-5398-87ec-4d79b956ee19', 'Project File', '1', 0),
('ad59e463-31b9-502e-9c71-5504bed47c74', 'a8af7e84-4b49-5398-87ec-4d79b956ee19', 'Project meeting agenda and minutes', '2', 1),
('740efb35-c85d-5c2e-a14a-d54f0e5f61f5', 'eeb8e2c3-75ad-5397-9572-58b8f9bb6d3b', 'Letter of Intent/ authorising document date', '1', 0),
('9cff1d0e-5d84-55ac-b386-2743653915cf', 'eeb8e2c3-75ad-5397-9572-58b8f9bb6d3b', 'Meeting minutes/Action plans', '2', 1),
('445ffd83-6ce2-5d16-a022-b67ee37ed156', 'dde46771-adb2-5c96-ac2f-0277f08c1d4b', 'Meeting invite', '1', 0),
('b6e685c7-8de5-5ef6-afd5-40dc8af49ebd', 'dde46771-adb2-5c96-ac2f-0277f08c1d4b', 'Meeting attendance register', '2', 1),
('de86cea3-6849-54d2-bd86-eedc56c8b27e', '939c1a55-9dab-5a48-8dbf-7cd596aa5326', 'Meeting minutes', '1', 0),
('3d191c16-83b1-51b7-988d-a27d7d3c7a1a', '939c1a55-9dab-5a48-8dbf-7cd596aa5326', 'Action plans with responsibility, due date and status', '2', 1),
('436693a8-3ae8-5c80-a541-ba3b52722cfc', 'adc0aea6-21f9-53a2-8a77-382d3e6e24b0', 'Change management process', '1', 0),
('c8580c38-4047-5d96-8b77-6078e83a671f', 'adc0aea6-21f9-53a2-8a77-382d3e6e24b0', 'Design change tracking sheet', '2', 1),
('5a0c32d1-e273-5e44-8c98-4705a51716c5', 'e7b588c4-b162-5018-9b8b-c0d7decd0a0a', 'Pilot/Prototype approval', '1', 0),
('61d8a1dd-457a-59da-977e-e597b8bc7b7f', 'e7b588c4-b162-5018-9b8b-c0d7decd0a0a', 'Date of Pilot/Prototype approval', '2', 1),
('9ec34ba7-4b89-504e-945d-feb47ce6fefe', 'a924b699-4d4b-536e-a2db-adac11b1de16', '1. Operational readiness and commissioning sign-off.', '', 0),
('1755016e-d252-5b06-9f22-6b009a8d3b1e', '0874f01f-2845-50f4-aca4-94cd4f881a4b', 'Operational readiness and commissioning sign-off.', '1', 0),
('0a048c39-ffd0-5512-bf2d-efb128890cee', '0874f01f-2845-50f4-aca4-94cd4f881a4b', 'Project plan', '2', 1),
('43b22581-be9a-5a78-8830-d7c11ffd5b2a', '187e8ad2-be57-519d-8ee9-6e951938be45', 'Project plan', '1', 0),
('574435f7-b962-5feb-9f70-28d62e2dedd0', '187e8ad2-be57-519d-8ee9-6e951938be45', 'Project Status reports', '2', 1),
('b237fcf9-96d3-5049-a434-9430d595a335', '3c78a157-2198-5d1a-9529-4fdcac20cc77', 'Project plan', '1', 0),
('b1752ec9-aa73-58a1-bbf3-fddfeeeba504', '3c78a157-2198-5d1a-9529-4fdcac20cc77', 'Project Status reports', '2', 1),
('175ddceb-70c0-53ab-b0f8-32dc7609cf67', 'b80d5ada-fa44-5d30-8bf7-e4daeac1481b', 'Commissioning report', '1', 0),
('de99db6c-7a3d-51f2-bf56-6148afa98d24', 'b80d5ada-fa44-5d30-8bf7-e4daeac1481b', 'Project NCR information', '2', 1),
('34f5a152-a6ae-5e75-a094-91fb7d7bee65', 'a45634dd-2ff5-5dfa-96f7-b210b0c67bb5', '1. Letter of intent or authorising document', '', 0),
('4014f230-78b7-50cc-b6c7-6084e6475df9', 'a6429faf-9a1d-5a2a-b495-8e6e1e2907c1', '1. Letter of intent or authorising document              2. Billing information', '', 0),
('bd793eb1-935c-55e9-9234-a5399947c314', 'a15b0861-a561-57b1-90f8-68b5f74f3bb7', '1. Condition assessment report', '', 0),
('67c87ffc-ebf7-5d0a-a4ee-4714387f283f', '0e2b1fba-0333-5097-bdae-47a66834af08', '1. Approved maintenance plans in the system', '', 0),
('048f7f83-179e-55e9-b2db-73f673facbbf', '4a9067e3-33f9-596c-80b2-9e504ea04548', 'Disposal documents', '1', 0),
('ac993352-cec4-5773-8a78-6053e6741b83', '4a9067e3-33f9-596c-80b2-9e504ea04548', 'Scrappring documents', '2', 1),
('0bcfef7d-c8f3-5bdf-94ce-c00cccd1ddfa', '9a368540-57eb-5e2b-aaa9-a3488e2fdb0f', '1. Records of at least 3 years for each of the Life Cycle stages.', '', 0),
('a4fc1868-185d-52e5-9db8-40d72f47eb9c', '4ae2f357-000a-5f6a-958e-34263eb122a1', '1. Records of at least 3 years for each of the Life Cycle stages.', '', 0),
('07f7bac1-9c81-5a4a-a4a6-6095d3363208', 'f3feb007-25f7-5d3a-823e-35d75e66f19f', '1. Service Level Agreements;
· Siding Agreements;
· Section 56 Agreements & 57 Licenses (NPA);
· Access Agreements; Service Level Agreements;
2. Interface register and agreements.', '', 0),
('3db7e940-2205-5122-a456-652587c77e6f', '3fde8be6-20a7-5afc-9f46-f7bb0afd1b4a', 'Interface Agreements Register.', '', 0),
('afcbba77-3e21-5996-8044-3d4eb1cad209', '15a8489f-1288-5662-9863-b8b83e4ced1c', 'Engagement schedule', '1', 0),
('73817654-3579-5788-a4c4-1e0f6961053f', '15a8489f-1288-5662-9863-b8b83e4ced1c', 'Minutes and attendance register', '2', 1),
('5531a791-c201-51e2-90b6-6159cf7c963b', '6c528b4b-e2e8-50bf-9fc4-d4abed1b8a53', '· Audits/inspections
· Meetings
· Workshops
· Awareness
· BCM/Emergency Situations/JOCs
· Informal Engagements', '', 0),
('70c65b97-00d2-5094-a9ad-78c6394cc421', '41640d73-a0e3-5495-811e-74e58bf257a8', 'Non-conformance report
Action plan status report', '', 0),
('82f64469-59df-5f76-9484-cf85c197c680', '9e5eb7db-4a21-5592-8bf2-0ee605a9547f', 'Risk register', '', 0),
('76bd9c18-af7e-5ae1-9117-31d71a259e9f', '2f5150da-b3b8-51e5-9ac0-390790b4e5e3', 'Revised / updated Interface agreement
Triggers for change of interface agreements include but not limited to the following:
· New or amendments of the operational processes;
· Occurrences and Lessons learnt;
· Compliance Obligations (New or revised standards, legislation, internal policies and procedures; etc.)', '', 0),
('ca2e6bd1-03cf-5039-99ce-5d90d5bfd326', 'db3f98c4-4f77-5faa-90f6-c33f8c2cb572', 'Railway Occurrence: Annexure 8.8, Railway Occurrence Management Process Flow;
Injury on Duty: Annexure 8.9 Injury on Duty Management Process Flow;
Occupational Diseases and Illnesses: Annexure 8.10 Occupational Diseases & Illnesses Occurrence Management Process Flow;
Environmental Occurrence: Annexure 8.11 Environmental Occurrence Management Process Flow;
Asset and Property Damage (including Motor Vehicle) Occurrence: Annexure 8.13 Asset and Property Damage (including Motor Vehicle) Occurrence Management Process Flow;
Security Occurrence: Annexure 8.14 Security Occurrence Management Process Flow;
HAZMAT, Fire, Explosion and Other Safety Occurrences:  Annexure 8.15 HAZMAT Fire, Explosion and Other Safety Occurrences Management Process Flow', '', 0),
('0380bba6-86c2-59ba-9499-f6792f39f8f1', '01224421-ffb2-5933-af6f-6a2b794da537', 'Sample recent occurences (Level 1 & 2)', '', 0),
('2c47cccf-27d0-5aa9-b914-585e6ee7b70f', 'df216810-98e7-5ca1-8470-986b3e52a160', '1. Check completion of the occurance notifications reports (Level 1 & 2), preliminary reports, investigation reports, CAP Register, NCRs and Action plans', '', 0),
('0f42b15b-2045-59fe-8486-04e7bde839aa', 'edb7add5-4568-50c2-80bb-1b2ac2f0b10d', 'Appointments letter and training certificate of the Incident Commander', '', 0),
('65c0503c-1f9c-5437-97ff-004c4e41b053', '70f7aaa2-acb8-53b1-8320-40d048c1f82f', 'Effective close out of the findings in the systems with the objective evidence.', '1', 0),
('f577dc4e-b406-58b8-8e24-187905cb5bfb', '70f7aaa2-acb8-53b1-8320-40d048c1f82f', 'Status report from IsoMetrix', '2', 1),
('fa0a9040-be59-54f1-b850-8a0515e64a16', '70f7aaa2-acb8-53b1-8320-40d048c1f82f', 'Records on TIMS SharePoint', '3', 2),
('927c7e12-0866-5252-813e-025cd8740097', 'e57e391e-2c11-5a60-8269-5586b7e107ee', 'Training Certificates', '', 0),
('e3c34bd0-cf41-5d8f-b00d-ab271bc0a93b', '17bea07a-9163-53f6-8f1b-d486b2d4b200', 'Investigation report', '', 0),
('5580fe26-74de-52f2-bc18-0d5ac1ffe89f', '78d4b172-174d-5681-86a6-ebcc1a8df2a0', 'Preservation of evidence in line with Section 24 of the OHS Act 85 of 1992, Clearance of the occurrence site e.g. rehabilitationof the incident site', '', 0),
('d9ab8bf1-cd61-5abb-bb6e-8c7c638d8de2', '39a6d9bc-fab1-52c2-a3dd-0b7c95dbec62', 'Closed investigation report', '', 0),
('b68a939f-7490-5d06-9da3-23870477efde', '9a39cfc4-3df3-596c-ac8b-ac0642186851', 'Proof of Risk Assessment Register review as a result of an occurance', '1', 0),
('8eb22b09-8292-5a10-ace8-d765ae70ffa5', '9a39cfc4-3df3-596c-ac8b-ac0642186851', 'Attendance register', '2', 1),
('d61d7116-800e-569a-99d7-c15bcf222dff', '8aca0915-3499-5976-9372-7ff88dc15ee5', '1. Interface agreements (SLA''''s).', '', 0),
('6def7589-67e5-5d0a-97d7-ab768b1e1acc', 'ba6bf17e-d16b-5e8d-9baf-f578d1f6e4e6', 'Appointment of the Contract Manager
Risk register
Contract Classification Category
specifications
Evaluation Criteria
approved list of contractors/suppliers
Pricing Schedule
roles and responsibilities are clearly defined
signed Agreement
project is insured
Contractor Execution Plan
Approved Contractor Compliance File
Contractor InductionAttendance Register.
Employee Profile Dossier
Completed Induction Indemnity Form
Applicable permits and authorisations
Completed Pre-site handover inspection
Completed Site Access Certificate
Progress Meeting minutes', '', 0),
('85c31ca2-afff-5574-93b2-02c5268f05f8', '402e86ce-dc35-5fca-aba7-9c58a498b2e4', 'Contractor Induction', '1', 0),
('9e66f0b1-544a-5f07-945c-d52b9f492d69', '402e86ce-dc35-5fca-aba7-9c58a498b2e4', 'Inspection and Audit reports and management of actions', '2', 1),
('8d3eb6ee-f197-569c-a41c-37a319f0958d', '402e86ce-dc35-5fca-aba7-9c58a498b2e4', 'Performance on-site', '3', 2),
('1ba20698-6ac6-5dec-946d-f38e2bc3406f', '402e86ce-dc35-5fca-aba7-9c58a498b2e4', 'Deviation Management', '4', 3),
('48dc4050-8921-524d-82c9-2698e3c69c56', '402e86ce-dc35-5fca-aba7-9c58a498b2e4', 'Operational permits  / licence issued e.g. Hotwork permit', '5', 4),
('e72c0f53-022f-57bc-911e-0bf8e01795da', '20ef2b54-2e70-5e73-bccc-6eef5ae8cec7', '1) Site inspection 
2) Signed Final Handover and Close-out Inspection                                               3) Completed Contractor Compliance
File 
4) post-contract evaluation meeting minutes (performance statistics analysed to determine trends, lessons learnt, summary of the findings and future corrective actions) 
5) Communicated findings and lessons learnt to the project initiator.
6) Updated contract register reflecting closing of project
7) Release of retention monies and performance bonds at the expiry', '', 0),
('ebc0915c-0ceb-5051-bcce-a0215f4f45d4', 'cd194287-43b3-5be4-8c09-41a214f74955', 'Calibration register and the schedule.', '1', 0),
('f36997fd-f005-50cc-8e5e-4aea47df4079', 'cd194287-43b3-5be4-8c09-41a214f74955', 'IsoMetrix status report.', '2', 1),
('8eeb5b8d-c6e2-5ead-ab2e-542872b6f4ed', 'cd194287-43b3-5be4-8c09-41a214f74955', 'Report on IsoMetrix.', '3', 2),
('7b9f5900-bbb1-51d2-a041-de0b774fca8d', 'c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 'Integrated Assurance universe and plan status report', '1', 0),
('54f46d56-341e-5494-8516-a310245b1935', 'c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 'Assurance reports', '2', 1),
('eabbaa46-2778-5421-9291-671548a87bd3', 'c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 'Assurance oversight meeting report', '3', 2),
('2cc554c4-616b-522b-bedc-5b8b8f08c17d', 'c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 'IsoMetrix status report', '4', 3),
('0836d34e-e877-59ca-9b56-82844b2880c7', 'c2fcd81d-d9c2-5ae0-acff-6f7d59c5aad1', 'Trend analysis report', '5', 4),
('11f2b30c-63a5-5b6f-9d51-667eedeea4a6', '67f28c1f-d252-5b2c-9a7b-b5bcd0690a64', 'Status report', '', 0),
('cbad73a0-27cc-54fd-80cf-f1aef98ea8b1', 'bc532267-70ab-5047-aa50-43864cca83a7', 'Scheduling of audits/inspections', '1', 0),
('dc223934-9cf3-5acf-882a-614fbb30c7b8', 'bc532267-70ab-5047-aa50-43864cca83a7', 'Audit/inspection reports', '2', 1),
('e819d2e4-03d1-5e8e-a991-f6200a618ded', 'de519362-99cc-56de-aba9-0a93de7db549', '1. Maintanance Engineering Stats and reports', '', 0),
('f1a3e545-2d90-5092-b1ab-913275b2cdd7', 'b4cd7db2-6e3f-5a2c-bd87-7f83bc5dc16c', '1. Actions plans and progress report (status)', '', 0),
('af3b822f-ce2e-5049-b7ee-03449e1cade8', '91ad5651-3d24-5f25-8eee-9855a08a206b', 'Inspection reports signed off by the employer/chairperson of the SHE Committee', '1', 0),
('782dcd16-e003-577d-9e1c-36077932843d', '91ad5651-3d24-5f25-8eee-9855a08a206b', 'Idenfied deviations receive attention from management (status)', '2', 1),
('fd593862-4eef-5ab8-b5e0-3f454aff8d31', '91ad5651-3d24-5f25-8eee-9855a08a206b', 'Interview a SHE Representative', '3', 2),
('f64a72e4-7e6a-5049-92d1-9ce24961247c', 'd514732c-17b8-5571-ade2-236fde97aedc', 'Evidence made available
Repeat findings
Ownership of the audit reports', '', 0),
('c7e46473-3782-5a46-bcca-db8166322a62', '10e94e68-7afc-55a7-b5b9-3897e8f89de0', '1. Signed off Business Impact Analysis', '', 0),
('83752fd7-5fa7-58db-b980-de4fb64b746b', '5c9780b2-593a-578c-96ad-34db7e75f2b2', '1. Signed off BCP', '', 0),
('7a3ba68c-ab30-5eb1-bab1-d9bf6776a759', '06410f47-6399-5c28-985c-db99c6c34dd9', 'Annual Schedule', '1', 0),
('f734b517-ff93-5826-91df-9a2dbbb3d7c8', '06410f47-6399-5c28-985c-db99c6c34dd9', 'Control Self Assessment Report', '2', 1),
('ee92d5e2-1487-554b-9023-e6b783aa2c97', '06410f47-6399-5c28-985c-db99c6c34dd9', 'Action plan with status', '3', 2),
('e0e18d28-b115-5a00-92e7-f80543810362', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Simulation plan', '1', 0),
('6ef85085-0829-58a1-8510-3f0a40e819cf', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Meeting minutes of the simulation planning', '2', 1),
('f0f8fac8-257c-59b4-92fb-2025a5419e3e', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Attendance register', '3', 2),
('dc15fcf1-ac3c-58de-a9f2-dde37077f7c3', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Simulation report', '4', 3),
('5e1d0280-8ef0-5d3d-8276-ff1a430d34b7', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Debrief session meeting minutes and report', '5', 4),
('4d10d116-5f30-55b2-a790-1699a2a476bd', '56374cbd-059c-5a86-a0e3-3baa4b9adec0', 'Simulation results captured on IsoMetrix and report loaded on Sharepoint', '6', 5),
('f9784103-e638-593d-a582-047aaf809e16', 'edcacc85-ec61-5d02-8096-4e4e5e29e182', 'List of critical systems', '', 0),
('d9d51f45-2cbf-5e1f-b22c-eab9c2cbad73', 'ac60be05-5a07-5fdd-8f28-435154238159', 'Test report', '', 0),
('f3e5f97f-5b4c-5b2f-b2ad-465a350f433d', '02eb0744-a8f0-5072-a74d-152b2aa7cdb2', 'Test report', '', 0),
('2bdac3a3-f8c0-57b3-a84a-033edfaa8bdc', 'e6cce313-0a9c-5f63-aca4-01a4fe5b6e19', 'Integrated disaster management plan', '', 0),
('756ba451-c6aa-5306-8daf-c9f228b0e260', 'a34b070e-7838-55b7-9b86-af9be50c4e67', 'Needs analysis', '1', 0),
('078cebd9-bde6-575b-b846-d2e8db4c33d0', 'a34b070e-7838-55b7-9b86-af9be50c4e67', 'Training plan', '2', 1),
('ae20e96e-6614-5515-a469-c3a69c728c92', 'a34b070e-7838-55b7-9b86-af9be50c4e67', 'Attendance registers', '3', 2),
('b68094ec-185f-5722-9cb9-ca69421cd02d', 'a34b070e-7838-55b7-9b86-af9be50c4e67', 'Training programme evaluation report', '4', 3),
('226a8aa2-581b-5e65-9cdc-d556ee76568e', 'd81183a0-420f-53f8-a0a1-0104b20e681e', 'Integrated BCP', '', 0),
('9d8d6e8e-9703-584e-af9a-8b583279240e', '9d634e49-5755-580f-9ff3-4e18ad9997ae', 'Alignment on medical surveillance and employment of employees on chronic medication.', '1', 0),
('921918b8-9958-5c1f-9942-e2b8e6b4147b', '9d634e49-5755-580f-9ff3-4e18ad9997ae', 'Adherence to the Medical surveillance plan', '2', 1),
('d883608b-2718-58fb-aace-17d857c21c4a', '9d634e49-5755-580f-9ff3-4e18ad9997ae', 'Compliance to Fit for duty declaration', '3', 2),
('41a79ace-e252-5eb9-97dd-b96f99624e24', '9d634e49-5755-580f-9ff3-4e18ad9997ae', 'Management of employees with chronic conditions', '4', 3),
('192aec10-0f65-595a-b092-375eab64fafa', '313e6232-60a0-52f8-9588-6e96df4a8f04', '1. Adherence to Quarterly review                 2. Management of risk pool personnel', '', 0),
('bdd0879a-c4ae-57df-ab7e-403e9c9be88d', '1e63c5aa-131a-5523-aa7b-b7c7a01281e7', 'Human Factor in design', '1', 0),
('52a544ae-a827-5d7c-81ac-c741a9667409', '1e63c5aa-131a-5523-aa7b-b7c7a01281e7', 'Ergonomics assessment schedule and status', '2', 1),
('b9ef0e32-33b5-5d89-9cb3-d4ab6703d4e7', '1e63c5aa-131a-5523-aa7b-b7c7a01281e7', 'Ergonomins assesment report', '3', 2),
('54c8dec7-45ce-5bae-96cf-2ae30dbb15e1', '1e63c5aa-131a-5523-aa7b-b7c7a01281e7', 'Corrective action plan monitoring status', '4', 3),
('551ea9a0-c30c-5182-90f6-bd6e77ffe2d5', '1c2a5657-c3bf-55ed-bdeb-3ba7863fb1e0', '1. Recruitment and Selection (psychometric
test, interview, experience and competence) 2. Wellness programme
3. Man-job specifications
4. Defined job classifications and additional checks required', '', 0),
('8f414b1a-02f4-5894-aaa5-db4112810cc6', '3b1bb43c-54e8-5fca-983b-13fe2e416f33', 'Employee Occupational Risk Exposure Profile', '1', 0),
('224d3f39-e2ce-5829-9f90-86a8f656dd2c', '3b1bb43c-54e8-5fca-983b-13fe2e416f33', 'Status report on Occupational Risk Exposure Profile', '2', 1),
('6c4385b4-0a8f-58d6-938e-7cafb7ad346b', 'd8252528-5010-5f56-89f5-78f98c2702f6', 'Health Risk register', '', 0),
('6d402821-8b89-59c8-8d80-2b7fc8dd2ad2', '55f5b866-1c1e-56f4-9673-b91db11c3b46', 'Identified fatigue risks and recommended controls', '1', 0),
('b743da77-bc47-5b3b-9b2c-8497d17c79d2', '55f5b866-1c1e-56f4-9673-b91db11c3b46', 'Communication of the fatigue risks and controls', '2', 1),
('54962c05-b3e3-5ba1-9916-4c57efb4da2c', '3d73f3ab-5740-557f-97d0-1f8dac4d96db', 'Identified Risk associated with pregancy', '1', 0),
('30f22b15-a3fb-5257-912c-c5248898ee9c', '3d73f3ab-5740-557f-97d0-1f8dac4d96db', 'Recommendations for alternative placement if applicable dependent on the risk', '2', 1),
('edcedcd5-6ab0-59ec-ae35-93a51f0edfb4', 'be69337c-c76b-533a-9fc2-ef25f1f97ad9', '1. Completed Return to Work Interview
2. Work life balance awareness
3. Absenteeism management
programme ( trends analysis and case
management)
4. Implementation plan of the Safety Behavioural Risk Assessment
5. Wellness events', '', 0),
('227bf206-346c-5009-b6d3-242601478c16', '89c991ea-bd69-5e70-b2f2-938ebacbe50f', 'Health assessments;', '1', 0),
('315ae816-0e1c-5bf6-910a-87041769d16c', '89c991ea-bd69-5e70-b2f2-938ebacbe50f', 'Employee referral programs;', '2', 1),
('0d232c24-7683-56ae-99d6-50173e20ce68', '89c991ea-bd69-5e70-b2f2-938ebacbe50f', 'Rehabilitation; and', '3', 2),
('3277a325-b019-5d87-a9b4-900b7079130e', '89c991ea-bd69-5e70-b2f2-938ebacbe50f', 'Return to work programs', '4', 3),
('2070ddc2-e327-5f6e-ad98-f2aefb467b6d', '19d4f8cd-561b-5e96-8432-3546743a4032', 'Noise, illumination, radiation, thermal stress, ventilation, dust, fumes, etc.', '1', 0),
('cf43053e-05ba-5499-929c-19ae6aa95976', '19d4f8cd-561b-5e96-8432-3546743a4032', 'Frequency of the survey', '2', 1),
('f3485af3-c9d6-5226-8cbb-4629200433ba', '19d4f8cd-561b-5e96-8432-3546743a4032', 'Corrective Action Plans', '3', 2),
('a648378c-0431-532b-873b-2c0f594a9b07', 'e9fd1aad-ec1c-550f-aaf5-8caf54d3ede6', 'Overtime report (highest overtime earners)', '', 0),
('02592337-1439-50a2-b936-1d286bbd651b', '3e003936-7dee-5322-9c74-742e9de981d0', 'List with Continual Improvement initiatives and Project Plans.     
- Examples of improvement can include correction, corrective action, continual improvement, breakthrough change, innovation and re-organization', '', 0);
