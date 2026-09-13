import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from docx import Document as DocxDocument
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from ..schemas.export import ExportRequest
from ..utils.logger import logger

class ExportService:
    @staticmethod
    def generate_pdf(export_data: ExportRequest) -> bytes:
        pack = export_data.revision_pack
        quiz_q = export_data.quiz_questions or []
        eval_res = export_data.quiz_evaluation
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=45,
            rightMargin=45,
            topMargin=45,
            bottomMargin=45
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        sub_style = ParagraphStyle(
            'DocSub',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )
        h1_style = ParagraphStyle(
            'SectionH1',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#4f46e5'),
            spaceBefore=14,
            spaceAfter=6
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading3'],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=8,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            'DocBody',
            parent=styles['Normal'],
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#334155'),
            spaceAfter=4
        )
        bullet_style = ParagraphStyle(
            'DocBullet',
            parent=body_style,
            leftIndent=12,
            bulletIndent=4,
            spaceAfter=2
        )
        box_style = ParagraphStyle(
            'DocBox',
            parent=body_style,
            backColor=colors.HexColor('#f8fafc'),
            borderColor=colors.HexColor('#e2e8f0'),
            borderWidth=1,
            borderPadding=6,
            spaceBefore=4,
            spaceAfter=6
        )
        pitfall_style = ParagraphStyle(
            'DocPitfall',
            parent=body_style,
            backColor=colors.HexColor('#fffbeb'),
            borderColor=colors.HexColor('#fde68a'),
            borderWidth=1,
            borderPadding=6,
            spaceBefore=4,
            spaceAfter=6
        )

        story = []
        
        # Header
        story.append(Paragraph(f"RevisionOS Pack — {pack.course_name}", title_style))
        story.append(Paragraph(f"Source: <b>{pack.source_document_name}</b> | Study Estimate: <b>{pack.study_time_estimate}</b> | High-Priority Topics: <b>{pack.high_priority_count}</b> | Coverage: <b>{pack.processed_units}/{pack.total_units} units ({pack.coverage_percentage}%)</b>", sub_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=0, spaceAfter=10))
        
        # Grounding statement
        story.append(Paragraph(f"<i>{pack.grounding_statement}</i>", sub_style))
        
        # Section 1: Topics & Notes
        story.append(Paragraph("1. High-Yield Topic Revision Notes", h1_style))
        
        for idx, topic in enumerate(pack.topics):
            p_color = '#dc2626' if topic.priority == 'HIGH' else ('#d97706' if topic.priority == 'MEDIUM' else '#2563eb')
            story.append(Paragraph(
                f"<b>{idx+1}. {topic.topic_title}</b> &nbsp;&nbsp;<font color='{p_color}'>[{topic.priority} PRIORITY]</font> &nbsp;&bull;&nbsp; <font color='#64748b'>{topic.source_reference}</font>",
                h2_style
            ))
            story.append(Paragraph(f"<b>Overview:</b> {topic.summary}", body_style))
            if topic.core_explanation and topic.core_explanation != topic.summary:
                story.append(Paragraph(f"<b>Core Concept:</b> {topic.core_explanation}", body_style))
            
            if topic.key_concepts:
                story.append(Paragraph("<b>Key Concepts:</b>", body_style))
                for c in topic.key_concepts:
                    story.append(Paragraph(f"&bull; {c}", bullet_style))
                    
            if topic.definitions:
                story.append(Paragraph("<b>Important Definitions:</b>", body_style))
                for d in topic.definitions:
                    story.append(Paragraph(f"&bull; {d}", bullet_style))

            if topic.procedures:
                story.append(Paragraph("<b>Algorithmic Procedures & Steps:</b>", body_style))
                for proc in topic.procedures:
                    story.append(Paragraph(f"&bull; {proc}", bullet_style))
                    
            if topic.formulas_or_rules:
                story.append(Paragraph("<b>Formulas & Core Rules:</b>", body_style))
                for f in topic.formulas_or_rules:
                    story.append(Paragraph(f"<code>&bull; {f}</code>", box_style))

            if topic.comparisons:
                story.append(Paragraph("<b>Key Comparisons:</b>", body_style))
                for comp in topic.comparisons:
                    story.append(Paragraph(f"&bull; <b>{comp.aspect}:</b> {comp.concept_a} vs {comp.concept_b}", bullet_style))
                    
            if topic.structured_pitfalls:
                story.append(Paragraph("<b>Common Exam Pitfalls & Misconceptions:</b>", body_style))
                for pit in topic.structured_pitfalls:
                    story.append(Paragraph(
                        f"<b>MISCONCEPTION:</b> {pit.misconception}<br/>"
                        f"<b>CORRECT UNDERSTANDING:</b> {pit.correct_understanding}<br/>"
                        f"<b>WHY IT MATTERS:</b> {pit.why_it_matters}",
                        pitfall_style
                    ))
            elif topic.common_mistakes:
                story.append(Paragraph("<b>Common Exam Pitfalls:</b>", body_style))
                for m in topic.common_mistakes:
                    story.append(Paragraph(f"&bull; {m}", bullet_style))
                    
            story.append(Spacer(1, 6))

        # Section 2: Active Recall Quiz
        if quiz_q:
            story.append(PageBreak())
            story.append(Paragraph(f"2. Active Recall Practice Quiz ({len(quiz_q)} Questions)", h1_style))
            story.append(Paragraph("Questions generated directly and strictly from your lecture source material.", sub_style))
            
            for idx, q in enumerate(quiz_q):
                story.append(Paragraph(f"<b>Q{idx+1}. [{q.question_type}] {q.question}</b> &nbsp;<font color='#64748b'>({q.source_reference})</font>", h2_style))
                if q.options:
                    for opt in q.options:
                        story.append(Paragraph(f"&bull; {opt}", bullet_style))
                story.append(Spacer(1, 4))
                
            # Quiz Answer Key
            story.append(Spacer(1, 10))
            story.append(Paragraph("3. Answer Key & Source Grounding Explanations", h1_style))
            for idx, q in enumerate(quiz_q):
                story.append(Paragraph(f"<b>Q{idx+1} Answer:</b> {q.correct_answer}", body_style))
                story.append(Paragraph(f"<b>Explanation:</b> {q.explanation} (<i>{q.source_reference}</i>)", box_style))

        # Section 3: Weak Areas & Micro-Revision if present
        if eval_res and eval_res.weak_topics:
            story.append(Spacer(1, 10))
            story.append(Paragraph("4. Weak Area Micro-Revision & Study Plan", h1_style))
            story.append(Paragraph(f"<b>Quiz Score:</b> {eval_res.score}/{eval_res.total_questions} ({eval_res.percentage}%)", body_style))
            story.append(Paragraph(f"<b>Next Action:</b> {eval_res.revise_this_next_summary}", box_style))
            
            for wt in eval_res.weak_topics:
                story.append(Paragraph(f"&bull; <b>{wt.topic_title}</b> ({wt.source_reference}) — {wt.reason}", bullet_style))
                for rec in wt.recommended_revision_points:
                    story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&bull; {rec}", bullet_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @staticmethod
    def generate_docx(export_data: ExportRequest) -> bytes:
        pack = export_data.revision_pack
        quiz_q = export_data.quiz_questions or []
        eval_res = export_data.quiz_evaluation
        
        doc = DocxDocument()
        
        # Document Title
        title_p = doc.add_heading(f"RevisionOS Pack — {pack.course_name}", level=0)
        
        p = doc.add_paragraph()
        p.add_run(f"Source Document: {pack.source_document_name} | Study Estimate: {pack.study_time_estimate} | High-Priority Topics: {pack.high_priority_count}\n")
        p.add_run(f"Document Coverage: {pack.processed_units}/{pack.total_units} units ({pack.coverage_percentage}%)\n")
        p.add_run(f"{pack.grounding_statement}").italic = True
        
        # Section 1: Notes
        doc.add_heading("1. High-Yield Topic Revision Notes", level=1)
        for idx, topic in enumerate(pack.topics):
            h = doc.add_heading(f"{idx+1}. {topic.topic_title} [{topic.priority} PRIORITY] - {topic.source_reference}", level=2)
            doc.add_paragraph(f"Overview: {topic.summary}")
            if topic.core_explanation and topic.core_explanation != topic.summary:
                doc.add_paragraph(f"Core Explanation: {topic.core_explanation}")
            
            if topic.key_concepts:
                doc.add_paragraph("Key Concepts:", style='List Bullet')
                for c in topic.key_concepts:
                    doc.add_paragraph(c, style='List Bullet 2')
                    
            if topic.definitions:
                doc.add_paragraph("Important Definitions:", style='List Bullet')
                for d in topic.definitions:
                    doc.add_paragraph(d, style='List Bullet 2')

            if topic.procedures:
                doc.add_paragraph("Algorithmic Procedures & Steps:", style='List Bullet')
                for proc in topic.procedures:
                    doc.add_paragraph(proc, style='List Bullet 2')
                    
            if topic.formulas_or_rules:
                doc.add_paragraph("Formulas & Core Rules:", style='List Bullet')
                for f in topic.formulas_or_rules:
                    doc.add_paragraph(f, style='List Bullet 2')

            if topic.comparisons:
                doc.add_paragraph("Key Comparisons:", style='List Bullet')
                for comp in topic.comparisons:
                    doc.add_paragraph(f"{comp.aspect}: {comp.concept_a} vs {comp.concept_b}", style='List Bullet 2')
                    
            if topic.structured_pitfalls:
                doc.add_paragraph("Common Exam Pitfalls & Misconceptions:", style='List Bullet')
                for pit in topic.structured_pitfalls:
                    doc.add_paragraph(f"Misconception: {pit.misconception} | Truth: {pit.correct_understanding} | Why it matters: {pit.why_it_matters}", style='List Bullet 2')
            elif topic.common_mistakes:
                doc.add_paragraph("Common Exam Pitfalls:", style='List Bullet')
                for m in topic.common_mistakes:
                    doc.add_paragraph(m, style='List Bullet 2')

        # Section 2: Quiz
        if quiz_q:
            doc.add_page_break()
            doc.add_heading(f"2. Active Recall Practice Quiz ({len(quiz_q)} Questions)", level=1)
            for idx, q in enumerate(quiz_q):
                doc.add_heading(f"Q{idx+1}. [{q.question_type}] {q.question} ({q.source_reference})", level=3)
                if q.options:
                    for opt in q.options:
                        doc.add_paragraph(opt, style='List Bullet')
                        
            doc.add_heading("3. Answer Key & Explanations", level=1)
            for idx, q in enumerate(quiz_q):
                p = doc.add_paragraph()
                p.add_run(f"Q{idx+1} Answer: ").bold = True
                p.add_run(f"{q.correct_answer}\n")
                p.add_run(f"Explanation: {q.explanation} ({q.source_reference})").italic = True

        if eval_res and eval_res.weak_topics:
            doc.add_heading("4. Weak Area Micro-Revision", level=1)
            doc.add_paragraph(f"Quiz Score: {eval_res.score}/{eval_res.total_questions} ({eval_res.percentage}%)")
            doc.add_paragraph(f"Next Action: {eval_res.revise_this_next_summary}")
            for wt in eval_res.weak_topics:
                doc.add_paragraph(f"{wt.topic_title} ({wt.source_reference}): {wt.reason}", style='List Bullet')

        buffer = io.BytesIO()
        doc.save(buffer)
        docx_bytes = buffer.getvalue()
        buffer.close()
        return docx_bytes

    @staticmethod
    def generate_markdown(export_data: ExportRequest) -> str:
        pack = export_data.revision_pack
        quiz_q = export_data.quiz_questions or []
        eval_res = export_data.quiz_evaluation
        
        md = []
        md.append(f"# RevisionOS Study Pack — {pack.course_name}\n")
        md.append(f"> **Source**: {pack.source_document_name}  \n> **Study Time Estimate**: {pack.study_time_estimate}  \n> **High-Priority Topics**: {pack.high_priority_count}  \n> **Coverage**: {pack.processed_units}/{pack.total_units} units ({pack.coverage_percentage}%)  \n> *{pack.grounding_statement}*\n")
        md.append("---\n")
        
        md.append("## 1. High-Yield Topic Revision Notes\n")
        for idx, topic in enumerate(pack.topics):
            md.append(f"### {idx+1}. {topic.topic_title} `[{topic.priority} PRIORITY]` — *{topic.source_reference}*\n")
            md.append(f"**Overview**: {topic.summary}\n")
            if topic.core_explanation and topic.core_explanation != topic.summary:
                md.append(f"**Core Concept**: {topic.core_explanation}\n")
            
            if topic.key_concepts:
                md.append("**Key Concepts**:")
                for c in topic.key_concepts:
                    md.append(f"- {c}")
                md.append("")
                
            if topic.definitions:
                md.append("**Definitions**:")
                for d in topic.definitions:
                    md.append(f"- {d}")
                md.append("")

            if topic.procedures:
                md.append("**Algorithmic Procedures & Steps**:")
                for proc in topic.procedures:
                    md.append(f"- {proc}")
                md.append("")
                
            if topic.formulas_or_rules:
                md.append("**Formulas & Core Rules**:")
                for f in topic.formulas_or_rules:
                    md.append(f"- `{f}`")
                md.append("")

            if topic.comparisons:
                md.append("**Key Comparisons**:")
                for comp in topic.comparisons:
                    md.append(f"- **{comp.aspect}**: {comp.concept_a} vs {comp.concept_b}")
                md.append("")
                
            if topic.structured_pitfalls:
                md.append("**Common Exam Pitfalls & Misconceptions**:")
                for pit in topic.structured_pitfalls:
                    md.append(f"- **MISCONCEPTION**: {pit.misconception}  \n  **CORRECT UNDERSTANDING**: {pit.correct_understanding}  \n  **WHY IT MATTERS**: {pit.why_it_matters}")
                md.append("")
            elif topic.common_mistakes:
                md.append("**Common Exam Pitfalls**:")
                for m in topic.common_mistakes:
                    md.append(f"- ⚠️ {m}")
                md.append("")
                
            md.append("")

        if quiz_q:
            md.append("---\n")
            md.append(f"## 2. Active Recall Practice Quiz ({len(quiz_q)} Questions)\n")
            for idx, q in enumerate(quiz_q):
                md.append(f"#### Q{idx+1}. `[{q.question_type}]` {q.question} *({q.source_reference})*\n")
                if q.options:
                    for opt in q.options:
                        md.append(f"- [ ] {opt}")
                    md.append("")
            
            md.append("### 3. Answer Key & Explanations\n")
            for idx, q in enumerate(quiz_q):
                md.append(f"**Q{idx+1}**: {q.correct_answer}  \n*Explanation*: {q.explanation} (*{q.source_reference}*)\n")

        if eval_res and eval_res.weak_topics:
            md.append("---\n")
            md.append("## 4. Weak Area Micro-Revision\n")
            md.append(f"**Score**: {eval_res.score}/{eval_res.total_questions} ({eval_res.percentage}%)  \n")
            md.append(f"**Next 5-Minute Sprint**: {eval_res.revise_this_next_summary}\n")
            for wt in eval_res.weak_topics:
                md.append(f"- **{wt.topic_title}** (*{wt.source_reference}*): {wt.reason}")
                for rec in wt.recommended_revision_points:
                    md.append(f"  - {rec}")
            md.append("")

        return "\n".join(md)

export_service = ExportService()
