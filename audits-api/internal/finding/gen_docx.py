#!/usr/bin/env python3
"""Generate NCR Word document from template and finding data (JSON on stdin).

Layout: every label has an adjacent empty cell for data — write to next <w:tc> sibling.
Header section (Row 1) is an exception: data cells are in Row 2 at same tc index.
"""
import sys
import json
import io
from lxml import etree
from docx import Document

NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


# ── helpers ──────────────────────────────────────────────────────────

def _tc_text(tc):
    """Concatenated text of all <w:t> in a <w:tc>."""
    return "".join(t.text or "" for t in tc.findall(f".//{{{NS}}}t"))


def _set_tc_text(tc, value):
    """Replace content of first <w:t> in cell, or create one."""
    t = tc.find(f".//{{{NS}}}t")
    if t is not None:
        t.text = value
        return
    p = etree.SubElement(tc, etree.QName(NS, "p"))
    r = etree.SubElement(p, etree.QName(NS, "r"))
    t = etree.SubElement(r, etree.QName(NS, "t"))
    t.text = value


def _add_x_to_tc(tc):
    """Append a <w:p><w:r><w:t>X</w:t></w:r></w:p> to the cell."""
    p = etree.SubElement(tc, etree.QName(NS, "p"))
    r = etree.SubElement(p, etree.QName(NS, "r"))
    t = etree.SubElement(r, etree.QName(NS, "t"))
    t.text = "X"


# ── cell locators ────────────────────────────────────────────────────

def _header_row(table):
    """Return (real_tcs_of_row1, real_tcs_of_row2) for the header section."""
    tr1 = table.rows[1]._tr
    tr2 = table.rows[2]._tr
    return (tr1.findall(f"{{{NS}}}tc"), tr2.findall(f"{{{NS}}}tc"))


def _find_tc(table, marker):
    """Return the first real <w:tc> whose text contains *marker*.

    Scans every row of *table* (a docx Table).  Returns (tc, next_tc)
    or (None, None).
    """
    for row in table.rows:
        tcs = row._tr.findall(f"{{{NS}}}tc")
        for i, tc in enumerate(tcs):
            if marker in _tc_text(tc):
                next_tc = tcs[i + 1] if i + 1 < len(tcs) else None
                return tc, next_tc
    return None, None


# ── main logic ───────────────────────────────────────────────────────

def esc(s):
    return str(s) if s is not None else ""


def main():
    data = json.load(sys.stdin)
    tmpl_path = data.get("template_path", "template.docx")
    f = data.get("finding", {})

    doc = Document(tmpl_path)
    table = doc.tables[0]

    # ── header (Row 1 → Row 2 at same tc index) ─────────────────────
    # Row 1 is not adjacent-data; data sits in Row 2 below.
    r1_tcs, r2_tcs = _header_row(table)

    def _header_set(col_idx, value):
        if value and col_idx < len(r2_tcs):
            _set_tc_text(r2_tcs[col_idx], value)

    _header_set(1, esc(f.get("raised_by_name", "")))
    _header_set(2, esc(f.get("raised_by_sap_no", "")))
    _header_set(3, esc(f.get("contact_details", "")))

    # ── helpers that use _find_tc ────────────────────────────────────

    def _set_next(marker, value):
        if not value:
            return
        tc, nxt = _find_tc(table, marker)
        if nxt is not None:
            _set_tc_text(nxt, value)

    def _check_next(marker):
        """Put X in the cell immediately after the cell containing *marker*."""
        tc, nxt = _find_tc(table, marker)
        if nxt is not None:
            _add_x_to_tc(nxt)

    # ── text fields (label → next cell) ──────────────────────────────
    _set_next("Customer Name:",              esc(f.get("customer_name", "")))
    _set_next("Contravened Standard Clause:", esc(f.get("contravened_clause", "")))
    _set_next("Vendor Name:",                esc(f.get("vendor_name", "")))
    _set_next("Vendor No.:",                 esc(f.get("vendor_no", "")))
    _set_next("Item No.:",                   esc(f.get("item_no", "")))
    _set_next("Serial / Batch No.:",         esc(f.get("serial_batch_no", "")))
    _set_next("NCR Description:",            esc(f.get("description", "")))
    _set_next("Type of work, processes or equipment involved:",
                                              esc(f.get("work_type_process", "")))
    _set_next("Responsible Person (Int):",   esc(f.get("resp_person_int_name", "")))
    _set_next("Responsible Person (Ext):",   esc(f.get("resp_person_ext_name", "")))
    _set_next("Date Raised:",                esc(f.get("date_raised", "")))
    _set_next("NCR Raised by which Business:", esc(f.get("raised_by_business_name", "")))
    _set_next("NCR Raised against which Business:", esc(f.get("raised_against_business_name", "")))

    # ── origin checkboxes ────────────────────────────────────────────
    origin = f.get("origin_ncr", "")
    if origin == "Legal":
        _check_next("Legal (Non-compliance)")
    elif origin == "System (Non-conformance)":
        _check_next("System (Non-conformance)")
    elif origin == "Other Non-compliance":
        _check_next("Other Non-compliance (Specify)")

    # ── type NCR checkboxes (nested table inside main table) ────────
    type_ncr = f.get("type_ncr", "")
    if type_ncr:
        # Backward compat: "System NCR" → "System"
        search = "System" if type_ncr == "System NCR" else type_ncr
        tbl_root = table._tbl
        for inner_tbl in tbl_root.findall(f".//{{{NS}}}tbl"):
            rows_inner = inner_tbl.findall(f"{{{NS}}}tr")
            for r_inner in rows_inner:
                tcs_inner = r_inner.findall(f"{{{NS}}}tc")
                for ci, tc_inner in enumerate(tcs_inner):
                    txt = _tc_text(tc_inner)
                    if search in txt and ci + 1 < len(tcs_inner):
                        _add_x_to_tc(tcs_inner[ci + 1])
                        break

    # ── priority / classification checkboxes ─────────────────────────
    priority = f.get("priority", "")
    if priority == "Major":
        _check_next("High Priority (HP) /Major (MNC)")
    elif priority == "Minor":
        _check_next("Medium Priority (MP) /Minor (NC)")
    elif priority == "Area of Concern":
        _check_next("Area of Concern")
    elif priority == "Observation":
        _check_next("Observation (OBS)")

    # ── action agreed / stop certificate (Yes / No) ──────────────────
    def _set_yes_no(section_label, is_yes):
        """Find section label row, find 'Yes' or 'No' cell → X in next cell."""
        tc, _ = _find_tc(table, section_label)
        if tc is None:
            return
        label_row = tc.getparent()
        target = "Yes" if is_yes else "No"
        # Only search the label row and the next row
        for tr in [label_row, label_row.getnext()]:
            if tr is None or tr.tag != f"{{{NS}}}tr":
                continue
            tcs = tr.findall(f"{{{NS}}}tc")
            for i, tc_in_row in enumerate(tcs):
                if target == _tc_text(tc_in_row).strip() and i + 1 < len(tcs):
                    _add_x_to_tc(tcs[i + 1])
                    return

    _set_yes_no("Action agreed / approved:", f.get("action_agreed_approved", False))
    _set_yes_no("Stop Certificate Issued:", f.get("stop_certificate_issued", False))

    # ── save ─────────────────────────────────────────────────────────
    out_buf = io.BytesIO()
    doc.save(out_buf)
    sys.stdout.buffer.write(out_buf.getvalue())


if __name__ == "__main__":
    main()
