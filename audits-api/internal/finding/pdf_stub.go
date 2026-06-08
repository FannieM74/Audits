package finding

import (
	"bytes"
	"fmt"

	"github.com/jung-kurt/gofpdf"
)

func GeneratePDF(f *Finding) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Helvetica", "B", 14)
	pdf.CellFormat(190, 10, "NON-CONFORMANCE REPORTING FORM", "", 1, "C", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(60, 6, "NCR Ref No: "+f.NcrRef, "", 0, "L", false, 0, "")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Raised by:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(95, 6, "Full Name & Surname: "+f.RaisedByName, "1", 0, "L", false, 0, "")
	pdf.CellFormat(95, 6, "SAP No: "+f.RaisedBySapNo, "1", 1, "L", false, 0, "")
	pdf.CellFormat(190, 6, "Contact Details: "+f.ContactDetails, "1", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Origin of NCR:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	origin := "[ ] Legal  [ ] System (Non-conformance)  [ ] Other Non-compliance"
	if f.OriginLegal {
		origin = "[X] Legal  [ ] System (Non-conformance)  [ ] Other Non-compliance"
	}
	if f.OriginSystem {
		origin = "[ ] Legal  [X] System (Non-conformance)  [ ] Other Non-compliance"
	}
	if f.OriginOther {
		origin = "[ ] Legal  [ ] System (Non-conformance)  [X] Other Non-compliance"
	}
	pdf.CellFormat(190, 6, origin, "1", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, fmt.Sprintf("Priority: %s", f.Priority), "1", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "NCR Description:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.MultiCell(190, 6, f.Description, "1", "L", false)
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, fmt.Sprintf("Contravened Standard Clause: %s", f.ContravenedClause), "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(190, 6, fmt.Sprintf("Area of Concern: %s", f.AreaOfConcern), "1", 1, "L", false, 0, "")
	pdf.CellFormat(95, 6, "Responsible Person (Int): "+f.RespPersonIntName, "1", 0, "L", false, 0, "")
	pdf.CellFormat(95, 6, "SAP No: "+f.RespPersonIntSap, "1", 1, "L", false, 0, "")
	pdf.CellFormat(190, 6, "Responsible Person (Ext): "+f.RespPersonExtName, "1", 1, "L", false, 0, "")
	pdf.CellFormat(190, 6, "Type of work, processes or equipment: "+f.WorkTypeProcess, "1", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Actions:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	immediate := "[ ] Immediate action taken"
	if f.ImmediateActionTaken {
		immediate = "[X] Immediate action taken"
	}
	pdf.CellFormat(60, 6, immediate, "1", 0, "L", false, 0, "")

	agreed := "[ ] Action agreed / approved"
	if f.ActionAgreedApproved {
		agreed = "[X] Action agreed / approved"
	}
	pdf.CellFormat(65, 6, agreed, "1", 0, "L", false, 0, "")

	stop := "[ ] Stop Certificate Issued"
	if f.StopCertificateIssued {
		stop = "[X] Stop Certificate Issued"
	}
	pdf.CellFormat(65, 6, stop, "1", 1, "L", false, 0, "")

	pdf.Ln(4)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Investigation:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(190, 30, "", "1", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Follow Up:", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(190, 20, "", "1", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(190, 6, "Sign-off on Completed NCR", "1", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 8)
	pdf.CellFormat(63, 6, "Designation", "1", 0, "C", false, 0, "")
	pdf.CellFormat(63, 6, "Name & Surname", "1", 0, "C", false, 0, "")
	pdf.CellFormat(64, 6, "Signature / Date", "1", 1, "C", false, 0, "")
	pdf.CellFormat(63, 10, "", "1", 0, "C", false, 0, "")
	pdf.CellFormat(63, 10, "", "1", 0, "C", false, 0, "")
	pdf.CellFormat(64, 10, "", "1", 1, "C", false, 0, "")

	pdf.SetFont("Helvetica", "I", 8)
	pdf.CellFormat(190, 5, "TRN-IMS-GRP-FRM-013.43 (c) Transnet SOC Ltd", "", 1, "R", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
