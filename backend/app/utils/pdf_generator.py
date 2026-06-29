from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def compile_pdf_report(data: dict, output_path: str):
    """
    Generates a professional-grade clinical diagnostic report using ReportLab.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom high-end styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'), # Charcoal / Slate Dark
        spaceAfter=15
    )
    
    section_style = ParagraphStyle(
        'DocSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0D9488'), # Teal Accent
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155') # Muted Slate
    )

    bold_body = ParagraphStyle(
        'DocBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # 1. Header Title
    story.append(Paragraph("HEMAVISION AI - DIAGNOSTIC SUMMARY REPORT", title_style))
    story.append(Spacer(1, 10))

    # 2. Patient Meta Info Table
    patient = data.get("patient_info", {})
    from datetime import datetime
    date_str = datetime.now().strftime("%B %d, %Y")
    patient_data = [
        [Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient.get("name", "Anonymous"), body_style),
         Paragraph("<b>Date Generated:</b>", body_style), Paragraph(date_str, body_style)],
        [Paragraph("<b>Age:</b>", body_style), Paragraph(str(patient.get("age", 30)), body_style),
         Paragraph("<b>Gender:</b>", body_style), Paragraph(patient.get("gender", "Unspecified"), body_style)]
    ]
    meta_table = Table(patient_data, colWidths=[100, 150, 100, 150])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,-1), (-1,-1), 1, colors.HexColor('#E2E8F0')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # 3. Diagnostic & Risk Status
    story.append(Paragraph("Clinical Screening Analysis", section_style))
    diag = data.get("diagnostics", {})
    
    risk_level = diag.get("final_risk_level", "Normal")
    risk_color = '#0D9488' # Teal (Normal)
    if risk_level == 'Mild':
        risk_color = '#EAB308' # Yellow
    elif risk_level == 'Moderate':
        risk_color = '#F97316' # Orange
    elif risk_level == 'Severe':
        risk_color = '#EF4444' # Red
        
    diag_data = [
        [Paragraph("Fused Modality Anemia Score", bold_body), Paragraph(f"{diag.get('final_risk_score', 0.0)}%", body_style)],
        [Paragraph("Determined Anemia Risk Tier", bold_body), Paragraph(f"<font color='{risk_color}'><b>{risk_level}</b></font>", body_style)],
        [Paragraph("Symptom Questionnaire Score", bold_body), Paragraph(f"{diag.get('symptom_score', 0.0)}%", body_style)]
    ]
    diag_table = Table(diag_data, colWidths=[250, 250])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
    ]))
    story.append(diag_table)
    story.append(Spacer(1, 15))

    # 4. Dietary Action Plan
    story.append(Paragraph("Personalized Dietary Guidelines", section_style))
    diet = data.get("dietary_recommendations", {})
    
    story.append(Paragraph(f"<b>Summary Recommendation:</b> {diet.get('summary', 'Maintain standard healthy iron intake.')}", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph(f"<b>Intake Guideline:</b> {diet.get('frequency', 'Incorporate 1-2 iron-rich foods daily.')}", body_style))
    story.append(Spacer(1, 10))

    # Iron rich foods table
    foods_headers = [Paragraph("<b>Iron-dense Foods</b>", bold_body), Paragraph("<b>Vitamin C Enhancers</b>", bold_body), Paragraph("<b>Inhibitors (Avoid During Meals)</b>", bold_body)]
    
    # Pad lists to equal size for table structure
    iron_list = diet.get("iron_sources") or []
    vitc_list = diet.get("vitamin_c_sources") or []
    inhib_list = diet.get("inhibitors_to_avoid") or []
    
    max_len = max(len(iron_list), len(vitc_list), len(inhib_list), 1)
    
    table_rows = [foods_headers]
    for idx in range(max_len):
        row = [
            Paragraph(iron_list[idx] if idx < len(iron_list) else "", body_style),
            Paragraph(vitc_list[idx] if idx < len(vitc_list) else "", body_style),
            Paragraph(inhib_list[idx] if idx < len(inhib_list) else "", body_style)
        ]
        table_rows.append(row)
        
    diet_table = Table(table_rows, colWidths=[180, 160, 160])
    diet_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(diet_table)
    story.append(Spacer(1, 20))

    # 5. Disclaimer / Signature block
    story.append(Paragraph("<b>Medical Disclaimer:</b> This report is generated dynamically by HemaVision AI based on non-invasive visual screening and self-reported symptoms. It is provided for educational and screening assistance purposes only and does NOT constitute a clinical diagnosis. Please consult a qualified practitioner for official diagnostic blood tests.", ParagraphStyle('Disclaimer', parent=body_style, fontSize=8, leading=11, textColor=colors.HexColor('#94A3B8'))))

    doc.build(story)
