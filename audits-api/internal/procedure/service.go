package procedure

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	repo *Repository
	pool *pgxpool.Pool
}

func NewService(repo *Repository, pool *pgxpool.Pool) *Service {
	return &Service{repo: repo, pool: pool}
}

func (s *Service) GetSectionDetail(ctx context.Context, auditID uuid.UUID, sectionNumber int) (*SectionDetailResponse, error) {
	sd, err := s.repo.GetSectionDescription(ctx, sectionNumber)
	if err != nil {
		sd = nil
	}

	controls, err := s.repo.ListControlsBySection(ctx, sectionNumber)
	if err != nil {
		return nil, err
	}

	sectionName := ""
	if len(controls) > 0 {
		sectionName = controls[0].SectionName
	}

	// Collect all procedure item IDs
	procIDs := make([]uuid.UUID, len(controls))
	for i, c := range controls {
		procIDs[i] = c.ID
	}

	// Get all evidence items for these controls
	evidenceItems, err := s.repo.ListEvidenceItems(ctx, procIDs)
	if err != nil {
		return nil, err
	}

	// Build evidence-by-control map
	evMap := make(map[uuid.UUID][]ProcedureEvidenceItem)
	for _, ev := range evidenceItems {
		evMap[ev.ProcedureItemID] = append(evMap[ev.ProcedureItemID], ev)
	}

	// Collect all evidence item IDs
	var allEvIDs []uuid.UUID
	for _, evs := range evMap {
		for _, ev := range evs {
			allEvIDs = append(allEvIDs, ev.ID)
		}
	}

	// Get responses for these evidence items
	respMap := make(map[uuid.UUID]*AuditProcedureResponse)
	if len(allEvIDs) > 0 {
		responses, err := s.repo.GetEvidenceResponses(ctx, auditID, allEvIDs)
		if err != nil {
			return nil, err
		}
		for i := range responses {
			respMap[responses[i].EvidenceItemID] = &responses[i]
		}
	}

	// Build result
	result := SectionDetailResponse{
		SectionDescription: sd,
		SectionNumber:      sectionNumber,
		SectionName:        sectionName,
		Controls:           make([]ControlWithEvidence, len(controls)),
	}

	for i, ctrl := range controls {
		cwe := ControlWithEvidence{
			ProcedureItem: ctrl,
			Evidences:     nil,
		}
		evs := evMap[ctrl.ID]
		if len(evs) > 0 {
			cwe.Evidences = make([]EvidenceWithResponse, len(evs))
			for j, ev := range evs {
				ewr := EvidenceWithResponse{
					ProcedureEvidenceItem: ev,
				}
				if apr, ok := respMap[ev.ID]; ok {
					ewr.Response = apr.Response
					ewr.FindingID = apr.FindingID
				}
				cwe.Evidences[j] = ewr
			}
		}

		// Check if a finding exists for this control
		findingID, err := s.repo.GetFindingForControl(ctx, auditID, ctrl.ID)
		if err == nil && findingID != nil {
			cwe.HasFinding = true
			cwe.FindingID = findingID
		}

		result.Controls[i] = cwe
	}

	return &result, nil
}

func (s *Service) GetSectionSummaries(ctx context.Context, auditID uuid.UUID) ([]SectionSummary, error) {
	return s.repo.GetSectionSummaries(ctx, auditID)
}

func (s *Service) SetEvidenceResponse(ctx context.Context, auditID uuid.UUID, evidenceItemID uuid.UUID, response *string, notes string) (*AuditProcedureResponse, error) {
	return s.repo.UpsertEvidenceResponse(ctx, auditID, evidenceItemID, response, notes)
}

func (s *Service) GetFindingForControl(ctx context.Context, auditID uuid.UUID, controlID uuid.UUID) (*uuid.UUID, error) {
	return s.repo.GetFindingForControl(ctx, auditID, controlID)
}
