from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlmodel import Session

from .analytics import money, monthly_data
from .settings import EXPORTS_DIR


def monthly_pdf(session: Session, year: int, month: int) -> str:
    data = monthly_data(session, year, month)
    summary = data["summary"]
    path = EXPORTS_DIR / f"reporte-financiero-{year}-{month:02d}.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CardTitle", fontSize=12, leading=14, textColor=colors.HexColor("#0F172A"), spaceAfter=6))
    styles.add(ParagraphStyle(name="Small", fontSize=9, leading=11, textColor=colors.HexColor("#6B7280")))
    elements = []

    elements.append(Paragraph("Reporte financiero mensual", styles["Title"]))
    elements.append(Paragraph("Control Financiero Rubén", styles["Heading2"]))
    elements.append(Paragraph(f"Mes analizado: {year}-{month:02d}", styles["Normal"]))
    elements.append(Paragraph(f"Fecha de generacion: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles["Small"]))
    elements.append(Spacer(1, 0.2 * inch))

    cards = [
        ["Ingresos", money(summary["total_income"]), "Gastos", money(summary["total_expense"])],
        ["Balance", money(summary["balance"]), "Ahorro real", money(summary["saving_amount"])],
        ["% ahorro", f"{summary['saving_rate']:.1f}%" if summary["saving_rate"] is not None else "Sin ingresos", "Categoria mayor", summary["top_expense_category"]["category"] if summary["top_expense_category"] else "Sin datos"],
    ]
    table = Table(cards, colWidths=[1.25 * inch, 1.65 * inch, 1.25 * inch, 1.65 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#111827")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 0.25 * inch))

    elements.append(Paragraph("Resumen ejecutivo", styles["Heading3"]))
    elements.append(
        Paragraph(
            f"Durante el mes registraste ingresos por {money(summary['total_income'])}, gastos por {money(summary['total_expense'])} y un balance de {money(summary['balance'])}.",
            styles["Normal"],
        )
    )

    elements.append(Paragraph("Gastos por categoria", styles["Heading3"]))
    category_rows = [["Categoria", "Valor"]]
    category_rows += [[item["category"], money(item["amount"])] for item in summary["category_expenses"]]
    elements.append(styled_table(category_rows))

    elements.append(Paragraph("Top 10 gastos mas altos", styles["Heading3"]))
    top_rows = [["Fecha", "Descripcion", "Valor"]]
    top_rows += [[item["date"], item["description"], money(item["amount"])] for item in summary["top_expenses"]]
    elements.append(styled_table(top_rows))

    elements.append(Paragraph("Comparativa con mes anterior", styles["Heading3"]))
    comp = data["comparison"]
    if comp.get("message"):
        elements.append(Paragraph(comp["message"], styles["Normal"]))
    else:
        var = comp["expense_variation"]
        pct = f"{var['percent']:.1f}%" if var["percent"] is not None else "No calculable"
        elements.append(Paragraph(f"Variacion de gastos: {money(var['absolute'])} ({pct}).", styles["Normal"]))

    elements.append(Paragraph("Recomendaciones automaticas", styles["Heading3"]))
    for rec in data["recommendations"]:
        elements.append(Paragraph(f"<b>{rec['title']}:</b> {rec['explanation']} Accion sugerida: {rec['suggested_action']}", styles["Normal"]))

    elements.append(Paragraph("Conclusion final", styles["Heading3"]))
    elements.append(Paragraph("Este reporte se genero con datos registrados localmente. Revisa presupuesto, categorias principales y gastos no necesarios para mejorar el siguiente mes.", styles["Normal"]))

    doc.build(elements)
    return str(path)


def styled_table(rows: list[list[str]]):
    if len(rows) == 1:
        rows.append(["Sin datos", ""])
    table = Table(rows, colWidths=[2.4 * inch, 2.4 * inch, 1.3 * inch][: len(rows[0])])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table
