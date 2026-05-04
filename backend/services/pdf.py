from __future__ import annotations

import asyncio
import textwrap
from pathlib import Path


async def create_pdf_from_text(text: str, output_path: Path, title: str = "Voice2PDF") -> Path:
    return await asyncio.to_thread(_create_pdf_sync, text, output_path, title)


async def extract_pdf_text(path: Path) -> str:
    return await asyncio.to_thread(_extract_pdf_text_sync, path)


def _create_pdf_sync(text: str, output_path: Path, title: str) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.units import inch
        from reportlab.pdfgen import canvas
    except Exception:
        _write_minimal_pdf(text, output_path, title)
        return output_path

    pdf = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    x = inch
    y = height - inch
    pdf.setTitle(title)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(x, y, title)
    y -= 0.35 * inch
    pdf.setFont("Helvetica", 11)

    for paragraph in text.splitlines() or [text]:
        for line in textwrap.wrap(paragraph, width=88) or [""]:
            if y <= inch:
                pdf.showPage()
                pdf.setFont("Helvetica", 11)
                y = height - inch
            pdf.drawString(x, y, line)
            y -= 15
        y -= 8

    pdf.save()
    return output_path


def _extract_pdf_text_sync(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except Exception:
        try:
            from PyPDF2 import PdfReader
        except Exception:
            return _extract_pdf_text_fallback(path)

    reader = PdfReader(str(path))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(page.strip() for page in pages if page.strip())


def _extract_pdf_text_fallback(path: Path) -> str:
    raw = path.read_bytes()
    decoded = raw.decode("latin-1", errors="ignore")
    chunks = []
    marker = "BT"
    for part in decoded.split(marker)[1:]:
        segment = part.split("ET", 1)[0]
        for token in segment.splitlines():
            if "(" in token and ")" in token:
                chunks.append(token[token.find("(") + 1 : token.rfind(")")])
    return "\n".join(chunks)


def _write_minimal_pdf(text: str, output_path: Path, title: str) -> None:
    lines = [title, "", *textwrap.wrap(text, width=78)]
    content_lines = ["BT", "/F1 18 Tf", "72 742 Td", f"({_pdf_escape(lines[0])}) Tj", "/F1 11 Tf"]
    y_step = 16
    for line in lines[1:]:
        content_lines.append(f"0 -{y_step} Td ({_pdf_escape(line)}) Tj")
    content_lines.append("ET")
    stream = "\n".join(content_lines).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    body = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(body))
        body.extend(f"{index} 0 obj\n".encode("ascii"))
        body.extend(obj)
        body.extend(b"\nendobj\n")

    xref_at = len(body)
    body.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    body.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        body.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    body.extend(
        f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_at}\n%%EOF\n".encode("ascii")
    )
    output_path.write_bytes(body)


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
