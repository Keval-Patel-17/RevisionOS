# RevisionOS 🎓

> **"From lecture material to exam-ready revision."**  
> An AI-Powered Student Workspace built for the **PROMPT WARS** Hackathon (Category: *AI Productivity & Automation*).

---

## 1. Product Overview
**RevisionOS** is a specialized academic workspace designed to eliminate student busywork before exams. Instead of forcing students to manually condense 80-page slide decks or parse generic AI summaries, RevisionOS converts raw lecture materials (PDF, DOCX, PPTX, TXT) into a structured, exam-oriented revision environment complete with grounded revision notes, priority rankings, formula cheatsheets, and an active recall practice quiz with weak-topic detection.

---

## 2. Problem Statement
College and university students face an overwhelming volume of lecture materials before examinations:
- **Passive reading is ineffective**: Highlighting slides produces poor recall compared to testing and active recall.
- **Generic AI chat tools fail students**: Pasting slides into ChatGPT produces unstructured walls of text, introduces ungrounded external facts (hallucinations), omits source page citations, and fails to identify which formulas actually matter.
- **Disjointed study workflow**: Students bounce between note-taking apps, quiz generators, and PDF readers without a cohesive revision loop.

---

## 3. Solution
RevisionOS picks **one polished, end-to-end flow** and masters it:
`UPLOAD → UNDERSTAND → STRUCTURE → PERSONALIZE → REVISE → TEST → IDENTIFY WEAKNESS → TARGETED REVISION → EXPORT`

It provides:
- Grounded extraction with explicit citations (`Page 1`, `Slide 4`).
- Smart priority ratings (`HIGH`, `MEDIUM`, `LOW`) based on text signals (formulas, definitions, repetition).
- A 5-question active recall test with immediate feedback.
- Closed-loop micro-revision (*"Revise This Next"*) targeting missed concepts.
- 1-click exportable study packs in PDF, DOCX, and Markdown formats.

---

## 4. Core Workflow
```
[ Upload Lecture ] 
       ↓
[ Set Light Preferences ] (Course, Difficulty, Goal, Style)
       ↓
[ 7-Step AI Pipeline ] (Parse → Tokenize → Prioritize → Synthesize → Verify)
       ↓
[ Grounded Workspace ] (Cards with formulas, pitfalls, citations, review toggles)
       ↓
[ Active Recall Quiz ] (5 questions, MCQ & Short Answer, immediate citations)
       ↓
[ Weak-Area Detection ] (Identifies missed topics & creates 5-min sprint)
       ↓
[ Multi-Format Export ] (Download PDF, Word DOCX, or Markdown Pack)
```

---

## 5. Architecture
RevisionOS follows a clean decoupled client-server architecture:
- **Frontend SPA**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Canvas Confetti.
- **Backend API**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **AI Intelligence**: Google GenAI SDK (`google-genai` 2.23.0) leveraging `gemini-2.5-flash` with strict Pydantic JSON schemas.
- **Document Engine**: PyMuPDF (`fitz`), `python-docx`, `python-pptx`.
- **Export Engine**: ReportLab (PDF rendering), `python-docx` (Word documents).

See [`docs/architecture.md`](docs/architecture.md) for full architectural specifications and Mermaid diagrams.

---

## 6. Tech Stack
| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Lucide React, Canvas Confetti |
| **Backend** | FastAPI, Python 3.10+, Pydantic 2.13, Pydantic Settings, Uvicorn |
| **AI / LLM** | Google Gemini 2.5 Flash, official Google GenAI SDK (`google-genai` 2.23.0) |
| **Document Processing** | PyMuPDF (fitz), python-docx, python-pptx |
| **Export Engines** | ReportLab 5.0 (PDF), python-docx (DOCX), native Markdown generator |
| **Testing** | Pytest 9.1, AnyIO, Requests |

---

## 7. Key Features
1. **Multi-Format Ingestion**: Supports PDF, DOCX, PPTX, and TXT files up to 25MB.
2. **Instant Demo Mode**: 1-click bundled lecture asset (*"Operating Systems — CPU Scheduling"*) enabling judges to test the complete pipeline in under 30 seconds.
3. **Strict Source Grounding**: Every summary, formula, definition, and quiz question is anchored to a physical citation (`Page N` or `Slide N`).
4. **Smart Priority Engine**: Classifies topics into High, Medium, and Low revision yield using structural signals from the source text.
5. **Interactive Revision Cards**: Expandable cards featuring key definitions, formulas in code boxes, common exam pitfalls with warning badges, and a "Mark as Reviewed" toggle.
6. **Live Revision Readiness Estimate**: Visual circular gauge tracking progress based on topic coverage and quiz performance.
7. **Active Recall Quiz**: Distraction-free single-question quiz with instant explanations and citations.
8. **Adaptive Micro-Revision**: Closed-loop *"Revise This Next"* section that surfaces targeted review notes for missed questions.
9. **Multi-Format Study Pack Export**: 1-click download of PDF, DOCX, or Markdown study packs.

---

## 8. AI Architecture
RevisionOS leverages Google's **Gemini 2.5 Flash** model for sub-second document understanding, multi-turn grounding, and structured JSON output. Prompts enforce strict academic boundaries:
- The model is instructed to act as an academic revision architect.
- It is prohibited from hallucinating external theorems or introducing facts not present in the source.
- Strict Pydantic models are passed directly into the SDK's `response_schema` configuration parameter.

---

## 9. Gemini Integration
Using the modern official Google GenAI SDK:
```python
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.GEMINI_API_KEY)

response = client.models.generate_content(
    model=settings.GEMINI_MODEL,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=GeminiRevisionOutput,
        temperature=0.2, # low temperature for strict grounding
    )
)
```
- Fully configurable via `GEMINI_API_KEY` and `GEMINI_MODEL` environment variables.
- Includes a deterministic grounded heuristic fallback so the app functions gracefully offline or in judge demo environments without crashing.

---

## 10. Grounding Strategy
- Physical page and slide boundaries (`Page 1`, `Slide 3`) are preserved during document ingestion.
- The `GroundingService` cross-verifies that generated citations match chunk markers.
- RevisionOS never claims unsupported hype like "Guaranteed Exam Question"; instead, it uses evidence-based classifications such as *"High revision priority based on repetition of burst formulas on Page 2."*

---

## 11. Project Structure
```
RevisionOS/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint & middleware
│   │   ├── config.py                # Pydantic v2 settings
│   │   ├── routes/
│   │   │   ├── health.py            # GET /api/health
│   │   │   ├── upload.py            # POST /api/upload & /api/demo
│   │   │   ├── revision.py          # POST /api/generate-revision
│   │   │   ├── quiz.py              # POST /api/generate-quiz & /api/quiz/evaluate
│   │   │   └── export.py            # POST /api/export
│   │   ├── services/
│   │   │   ├── gemini_service.py    # Google GenAI SDK integration
│   │   │   ├── document_service.py  # PDF/DOCX/PPTX/TXT parser
│   │   │   ├── grounding_service.py # Citation verification engine
│   │   │   ├── quiz_service.py      # Recall evaluator & weak-area detector
│   │   │   └── export_service.py    # ReportLab PDF & DOCX generator
│   │   ├── schemas/                 # Strict Pydantic data contracts
│   │   └── utils/
│   ├── demo_assets/                 # Bundled CPU scheduling lecture PDF
│   ├── tests/                       # Pytest test suite (health, docs, quiz, export, e2e)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/              # Modular UI components (Navbar, Dropzone, TopicCard, Quiz)
│   │   ├── services/api.ts          # Clean typed API client
│   │   ├── types/index.ts           # Strict TypeScript contracts
│   │   ├── App.tsx                  # Master workflow coordinator
│   │   ├── index.css                # Tailwind design tokens & subtle glows
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── architecture.md              # System design & Mermaid diagrams
│   └── demo-script.md               # 3-minute hackathon pitch script
├── README.md
├── .gitignore
└── .env.example
```

---

## 12. Local Setup
### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### Clone Repository
```bash
git clone https://github.com/your-repo/RevisionOS.git
cd RevisionOS
```

---

## 13. Environment Variables
Create a `.env` file in the `backend/` directory (or root):
```env
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
MAX_FILE_SIZE_MB=25
```
*(A `.env.example` file is provided for reference. Never commit `.env` to version control).*

---

## 14. Running Backend
```bash
# 1. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now live at `http://127.0.0.1:8000` (Swagger docs: `/docs`).

---

## 15. Running Frontend
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```
The frontend application is now running at `http://127.0.0.1:5173`.

---

## 16. Deployment Instructions
- **Frontend (Vercel / Netlify / Cloudflare Pages)**:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Set environment variable `VITE_API_BASE_URL` pointing to your backend domain.
- **Backend (Render / Railway / Google Cloud Run)**:
  - Dockerfile or direct Python environment.
  - Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
  - Set environment variable `GEMINI_API_KEY`.

---

## 17. Screenshots & UI Walkthrough
1. **Landing & Upload Screen**: Sleek dark aesthetic with hero headline, supported format chips, and 1-click demo button.
2. **Light Personalization Modal**: Clean 4-question configuration (Course Name, Study Goal, Difficulty, Exam Style, Detail Level).
3. **7-Stage AI Processing Pipeline**: Real progress animation reflecting document parsing, concept extraction, and citation verification.
4. **Active Revision Workspace**: Circular Revision Readiness gauge, priority-filtered topic cards with formulas and pitfall warnings.
5. **Practice Recall Quiz**: Single-question distraction-free mode with immediate source explanations.
6. **Adaptive Micro-Revision**: *"Revise This Next"* 5-minute study sprint targeting missed concepts.
7. **Export Pack Modal**: 1-click downloads for PDF, DOCX, and Markdown packs.

---

## 18. Demo Instructions for Judges
1. Open `http://127.0.0.1:5173` in any browser.
2. Click **"Try Demo: CPU Scheduling"** on the upload card.
3. In the Personalization modal, keep the defaults and click **"Generate Revision Pack"**.
4. Watch the 7-step pipeline synthesize your workspace.
5. In the workspace:
   - Click **"Mark Reviewed"** on topic cards to see the readiness gauge climb.
   - Switch to **"Practice Quiz"** and answer the 5 active recall questions.
   - View your score and the tailored **"Revise This Next"** sprint.
6. Click **"Export Full Revision Pack"** to download the publication-quality PDF study pack.

See [`docs/demo-script.md`](docs/demo-script.md) for the exact 3-minute pitch timeline.

---

## 19. Limitations
- OCR for low-resolution scanned image PDFs is not performed locally; native text layers or clear slide text are required.
- File sizes are currently capped at 25MB to ensure snappy hackathon response times.

---

## 20. Future Scope
- **Audio / Lecture Podcast Generation**: Multi-speaker AI audio overview of the revision pack.
- **Spaced Repetition Schedule (SM-2)**: Export flashcards directly to Anki (.apkg).
- **LMS Integration**: 1-click sync with Canvas, Blackboard, and Google Classroom.

---

### License
MIT License. Built for the PROMPT WARS Hackathon.
