import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

REPORTS_DIR = "/app/app/static/reports"
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_student_report_pdf(student_data: dict, prediction_data: dict, assignments: list, attendance_rate: float) -> str:
    """Generates a styled academic performance and risk prediction PDF report.
    Returns the file path of the generated PDF.
    """
    student_name = student_data["user"]["full_name"]
    student_id = student_data["student_id"]
    filename = f"report_{student_id}_{int(datetime.now().timestamp())}.pdf" if 'datetime' in globals() else f"report_{student_id}.pdf"
    
    # Just in case, import inside function to get current time
    from datetime import datetime
    filename = f"report_{student_id}_{int(datetime.now().timestamp())}.pdf"
    
    # We will save this locally to serve static, but we can also write to /app/app/static/reports/
    file_path = os.path.join(REPORTS_DIR, filename)
    
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#6366F1'), # Indigo
        spaceAfter=15,
        alignment=0 # Left aligned
    )
    
    section_style = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1E1B4B'), # Dark purple-blue
        spaceBefore=12,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=10.5,
        textColor=colors.HexColor('#374151'), # Dark Gray
        leading=14
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBodyDark',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    risk_color = '#EF4444' # Red
    if prediction_data.get("risk_level") == 'Low':
        risk_color = '#10B981' # Green
    elif prediction_data.get("risk_level") == 'Medium':
        risk_color = '#F59E0B' # Orange
        
    risk_style = ParagraphStyle(
        'RiskStyle',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor(risk_color)
    )

    story = []
    
    # Header Banner
    story.append(Paragraph("AI ACADEMY - STUDENT ANALYTICS PORTAL", ParagraphStyle('SubBanner', parent=body_style, fontSize=9, textColor=colors.HexColor('#9CA3AF'), spaceAfter=5)))
    story.append(Paragraph("Student Academic & Risk Report", title_style))
    story.append(Spacer(1, 10))
    
    # Metadata Table (2-column layout)
    meta_data = [
        [Paragraph("<b>Student Name:</b>", body_style), Paragraph(student_name, body_style),
         Paragraph("<b>Date Generated:</b>", body_style), Paragraph(datetime.now().strftime("%Y-%m-%d"), body_style)],
        [Paragraph("<b>Student ID:</b>", body_style), Paragraph(student_id, body_style),
         Paragraph("<b>Department:</b>", body_style), Paragraph(student_data["department"], body_style)],
        [Paragraph("<b>Course:</b>", body_style), Paragraph(student_data["course"], body_style),
         Paragraph("<b>Semester:</b>", body_style), Paragraph(f"Semester {student_data['semester']}", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[100, 160, 100, 160])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,-1), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # Section 1: AI Performance Prediction Engine
    story.append(Paragraph("AI Performance Prediction Engine", section_style))
    pred_details = [
        [Paragraph("<b>Predicted Performance Score:</b>", body_style), Paragraph(f"{prediction_data.get('predicted_score', 'N/A')}%", bold_body_style)],
        [Paragraph("<b>Academic Risk Level:</b>", body_style), Paragraph(f"{prediction_data.get('risk_level', 'N/A')}", risk_style)],
        [Paragraph("<b>Inference Confidence Score:</b>", body_style), Paragraph(f"{round(prediction_data.get('confidence_score', 0) * 100, 1)}%", body_style)],
        [Paragraph("<b>Personalized Recommendations:</b>", body_style), Paragraph(prediction_data.get('recommendations', 'None'), body_style)],
        [Paragraph("<b>Active Improvement Strategy:</b>", body_style), Paragraph(prediction_data.get('improvement_strategy', 'None'), body_style)]
    ]
    pred_table = Table(pred_details, colWidths=[180, 340])
    pred_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALLGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(pred_table)
    story.append(Spacer(1, 15))
    
    # Section 2: Core Academic Indicators
    story.append(Paragraph("Core Academic Indicators", section_style))
    indicator_data = [
        [Paragraph("<b>Attendance Rate</b>", bold_body_style), Paragraph(f"{round(attendance_rate, 1)}%", body_style), 
         Paragraph("State-target is 85% attendance minimum to qualify for final exams.")],
        [Paragraph("<b>Study Time Target</b>", bold_body_style), Paragraph(f"{prediction_data.get('study_hours', 0)} hrs/wk", body_style),
         Paragraph("Recommended independent study hours to maintain GPA is 12-15 hours.")],
        [Paragraph("<b>Class Participation</b>", bold_body_style), Paragraph(f"{prediction_data.get('participation', 0)}/100", body_style),
         Paragraph("Measured via classroom engagement and forum activity indicators.")]
    ]
    indicator_table = Table(indicator_data, colWidths=[140, 90, 290])
    indicator_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(indicator_table)
    story.append(Spacer(1, 15))
    
    # Section 3: Recent Course Assignments
    story.append(Paragraph("Recent Course Assignments", section_style))
    if not assignments:
        story.append(Paragraph("No recent assignment records found.", body_style))
    else:
        assign_rows = [[
            Paragraph("<b>Title</b>", bold_body_style),
            Paragraph("<b>Subject</b>", bold_body_style),
            Paragraph("<b>Score</b>", bold_body_style),
            Paragraph("<b>Due Date</b>", bold_body_style),
            Paragraph("<b>Status</b>", bold_body_style)
        ]]
        for a in assignments[:8]: # Limit to top 8 assignments to fit single/double pages neatly
            status_text = a.status
            status_color = '#374151' # Gray
            if a.status == 'Graded':
                status_color = '#10B981' # Green
            elif a.status == 'Pending':
                status_color = '#EF4444' # Red
                
            status_paragraph_style = ParagraphStyle(
                f"Stat_{a.id}",
                parent=body_style,
                fontName='Helvetica-Bold',
                textColor=colors.HexColor(status_color)
            )
            assign_rows.append([
                Paragraph(a.title, body_style),
                Paragraph(a.subject, body_style),
                Paragraph(f"{a.score}/{a.max_score}", body_style),
                Paragraph(str(a.due_date), body_style),
                Paragraph(status_text, status_paragraph_style)
            ])
            
        assign_table = Table(assign_rows, colWidths=[140, 120, 80, 90, 90])
        assign_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(assign_table)
        
    story.append(Spacer(1, 30))
    story.append(Paragraph("Disclaimer: This is an AI-generated progress evaluation model trained on institutional statistics. High-risk indicators should be evaluated by the respective academic mentor.", ParagraphStyle('FooterStyle', parent=body_style, fontSize=8, textColor=colors.HexColor('#9CA3AF'))))
    
    # Build Document
    doc.build(story)
    
    # Return file basename or URL relative path
    return f"/static/reports/{filename}"
