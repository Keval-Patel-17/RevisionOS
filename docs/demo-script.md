# RevisionOS — 3-Minute Hackathon Demo Script

**Hackathon**: PROMPT WARS  
**Category**: AI Productivity & Automation  
**Product**: RevisionOS ("From lecture material to exam-ready revision.")  
**Target Time**: 3 minutes (180 seconds)

---

### [0:00 - 0:20] 1. The Problem (20s)
> *"Judges, college students are drowning in 80-page lecture slide decks before midterm exams. Today, students try pasting PDFs into ChatGPT asking to 'summarize this' — and they get back walls of unstructured text, hallucinated outside facts, zero source citations, and zero active recall practice.*
>
> *RevisionOS solves this by converting passive lecture material into an active, exam-ready revision loop in under 30 seconds."*

---

### [0:20 - 0:35] 2. The Upload & Personalization (15s)
*(Action: Open http://127.0.0.1:5173 and click **"Try Demo (OS Scheduling)"** or drop a lecture PDF).*
> *"Here on the RevisionOS landing page, a student simply drops their lecture PDF, Word doc, or slides. For this demo, let's click 'Try Demo: CPU Scheduling' using an authentic Operating Systems lecture.*
>
> *We ask just 4 high-signal personalization questions: our Subject, our Goal (Exam Preparation), Difficulty (Intermediate), and Exam Style (Mixed). Let's click 'Generate Revision Pack'."*

---

### [0:35 - 0:55] 3. The Real AI Processing Pipeline (20s)
*(Action: Observe the 7-step animated sequence as checkmarks populate).*
> *"Notice what is happening behind the scenes: RevisionOS doesn't make a generic text summary call. Our FastAPI backend reads the raw PDF pages, tokenizes definitions and formulas, classifies revision priority based on structural signals, and verifies citations against the source.*
>
> *Everything is powered by Google's Gemini 2.5 Flash using official structured JSON schemas."*

---

### [0:55 - 1:30] 4. Grounded Revision Workspace & Readiness Gauge (35s)
*(Action: Point to the live Revision Readiness gauge, scroll through the topic cards, expand one card, click 'Mark Reviewed').*
> *"Welcome to the RevisionOS Workspace! At the top, students get an instant **Revision Readiness Estimate**. Notice how it calculates progress from topic coverage and quiz performance.*
>
> *Look at our topics: RevisionOS flagged **'FCFS Convoy Effect & SJF Optimality'** as **HIGH PRIORITY** because of repeated theorems and formulas.*
>
> *Every topic card contains:*
> * *A 3-line grounded summary*
> * *Key concepts*
> * *Mathematical formulas like `WT = TAT - BT`*
> * *Common student exam misconceptions*
> * *And look at this badge: **Source: Page 2**. Every single fact is traceable back to the student's lecture slides!*
>
> *When I click **'Mark Reviewed'**, our readiness gauge immediately updates!"*

---

### [1:30 - 2:00] 5. Active Recall Practice Quiz (30s)
*(Action: Click 'Practice Quiz' tab. Answer questions one by one).*
> *"Reading notes is passive; real learning requires active recall. Let's switch to the **Practice Quiz**.*
>
> *RevisionOS generates 5 questions directly from the uploaded text. Question 1 asks about the Convoy Effect in FCFS. I click the option, and immediately get verified feedback with an explanation citing Page 2.*
>
> *Let's answer the remaining questions and purposely miss one to demonstrate our closed-loop architecture."*

---

### [2:00 - 2:25] 6. Weak-Area Detection & 'Revise This Next' (25s)
*(Action: Submit the quiz. Confetti triggers. Point to the Weak Area card and the Micro-Revision sprint).*
> *"We scored 4 out of 5 (80%)! Our Revision Readiness Estimate climbed to 81%.*
>
> *Now, here is the real magic: **Closed-Loop Adaptation**. RevisionOS immediately detected our weak area: 'Priority Scheduling & Starvation'.*
>
> *Right below the score, it generates **'Revise This Next'**: a targeted 5-minute study sprint highlighting the exact definitions and aging techniques needed to master that missed concept."*

---

### [2:25 - 2:45] 7. Export Revision Pack & Multi-Format Output (20s)
*(Action: Click 'Export Full Revision Pack'. Download the PDF).*
> *"Finally, when a student needs to study offline on their iPad or print for an exam hall, they click **'Export Pack'**.*
>
> *With 1 click, RevisionOS generates a publication-ready PDF, an editable Word document, or clean Markdown for Notion/Obsidian — complete with notes, formula cheat sheets, quiz answer keys, and the student's personal study plan."*

---

### [2:45 - 3:00] 8. Conclusion & The Differentiator (15s)
> *"RevisionOS does not just summarize a document. It delivers a closed-loop active learning journey:
> **UPLOAD → UNDERSTAND → PRIORITIZE → REVISE → TEST → IDENTIFY WEAKNESS → TARGETED REVISION → EXPORT**.
>
> *Built with React, TypeScript, FastAPI, and Google Gemini 2.5 Flash. Thank you!"*
