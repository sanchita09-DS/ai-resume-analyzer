# AI Resume Analyzer - Project Guide

## 🚀 Project Overview

This is a **full-stack AI-powered Resume Analyzer** built for your 4th semester AI subject project. It features a cyberpunk-themed dashboard with neon aesthetics and cutting-edge AI capabilities.

### Key Features

1. **Resume Upload & Analysis** - Upload PDF/DOCX resumes for instant AI analysis
2. **ATS Scoring** - Get compatibility scores for Applicant Tracking Systems (0-100)
3. **Readability Analysis** - Flesch-Kincaid readability scoring
4. **Keyword Density** - Analyze keyword frequency and density
5. **Skill Extraction** - Automatically extract skills from your resume
6. **Job Role Matching** - Get suggested job titles based on your resume
7. **Skill Gap Analysis** - Compare your skills against job descriptions
8. **AI Chatbot** - Interactive AI assistant with full resume context
9. **Cover Letter Generation** - AI-generated tailored cover letters
10. **LinkedIn Optimization** - Suggestions for headline, summary, and skills
11. **Resume History** - Track all uploaded resumes and analyses
12. **Cyberpunk UI** - Dark theme with neon pink/cyan glow effects

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4 with custom cyberpunk theme
- **State Management**: tRPC + React Query
- **UI Components**: shadcn/ui + custom components
- **Fonts**: Orbitron (headers), Courier Prime (body)

### Backend (Express + tRPC)
- **Server**: Express.js
- **API**: tRPC for type-safe APIs
- **Database**: MySQL with Drizzle ORM
- **AI/LLM**: Manus built-in LLM API
- **File Storage**: S3 integration
- **Authentication**: Manus OAuth

### Database Schema
- **users** - User accounts (auto-created by auth)
- **resumes** - Uploaded resumes with metadata and scores
- **analyses** - Section-by-section feedback and analysis results
- **chatHistory** - AI chatbot conversations
- **generatedContent** - Cover letters and LinkedIn suggestions

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm package manager
- Database access (MySQL/TiDB)

### Step 1: Database Setup

**CRITICAL**: Before running the app, you must create the database tables.

1. Open the **Management UI** (right panel in Manus)
2. Click the **Database** tab
3. Paste the SQL migration and click **Execute**

The migration SQL is in `/home/ubuntu/ai-resume-analyzer/drizzle/0001_shocking_marvel_apes.sql`

### Step 2: Install Dependencies

```bash
cd /home/ubuntu/ai-resume-analyzer
pnpm install
```

### Step 3: Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Step 4: Build for Production

```bash
pnpm build
pnpm start
```

## 🎨 Cyberpunk Theme

The UI uses a distinctive cyberpunk aesthetic:

- **Primary Color**: Neon Pink (oklch(0.6 0.3 290))
- **Secondary Color**: Electric Cyan (oklch(0.6 0.3 180))
- **Background**: Deep Black (oklch(0.05 0 0))
- **Text**: Bright Pink/Purple (oklch(0.9 0.1 290))

### Custom CSS Classes

- `.neon-glow` - Pink glow effect
- `.neon-glow-cyan` - Cyan glow effect
- `.glow-box` - Pink bordered card with glow
- `.glow-box-cyan` - Cyan bordered card with glow
- `.btn-neon` - Pink neon button
- `.btn-neon-cyan` - Cyan neon button
- `.input-neon` - Neon-styled input
- `.chat-bubble-user` - User message styling
- `.chat-bubble-assistant` - AI response styling

## 📁 Project Structure

```
client/
  src/
    pages/
      Dashboard.tsx          - Main dashboard with all features
      Home.tsx              - Redirect to dashboard
      NotFound.tsx          - 404 page
    components/
      CyberpunkDashboard.tsx    - Sidebar layout
      ResumeUpload.tsx          - Upload component
      ScoreCard.tsx             - Animated score display
      AIChatbot.tsx             - Chatbot interface
      ResumeHistory.tsx         - Resume list and details
      CoverLetterGenerator.tsx  - Cover letter UI
      LinkedInOptimizer.tsx     - LinkedIn suggestions
      SkillGapAnalysis.tsx      - Skill gap analyzer
    lib/
      trpc.ts               - tRPC client setup
    contexts/
      ThemeContext.tsx       - Dark theme provider
    index.css               - Global cyberpunk styles

server/
  routers/
    resumeRouter.ts        - Resume upload & analysis
    chatbotRouter.ts       - AI chatbot
    generationRouter.ts    - Cover letters & LinkedIn
  utils/
    fileParser.ts          - PDF/DOCX parsing
    scoringEngine.ts       - ATS & readability scoring
  db.resumes.ts            - Database helpers
  db.ts                    - Database connection
  routers.ts               - Main router setup

drizzle/
  schema.ts                - Database schema
  0001_*.sql              - Migration SQL

shared/
  const.ts                 - Shared constants
```

## 🔧 API Endpoints (tRPC)

### Resume Management
- `resume.upload` - Upload and analyze resume
- `resume.list` - Get all user resumes
- `resume.getDetails` - Get resume with full analysis
- `resume.delete` - Delete a resume
- `resume.analyzeJobMatch` - Analyze against job description

### Chatbot
- `chatbot.sendMessage` - Send message to AI
- `chatbot.getHistory` - Get chat history

### Generation
- `generation.generateCoverLetter` - Generate cover letter
- `generation.generateLinkedInHeadline` - Generate headline options
- `generation.generateLinkedInSummary` - Generate summary
- `generation.generateLinkedInSkills` - Generate skills suggestions
- `generation.getGenerated` - Get previously generated content

## 🧪 Testing

Run tests with:
```bash
pnpm test
```

Example test file: `server/auth.logout.test.ts`

## 📊 Scoring Algorithms

### ATS Score (0-100)
- Resume sections present (20 pts)
- Contact information (15 pts)
- Dates and formatting (10 pts)
- Action verbs (15 pts)
- Quantifiable achievements (15 pts)
- Professional formatting (10 pts)

### Readability Score (0-100)
- Based on Flesch-Kincaid Grade Level
- Adjusted for professional resume context
- Penalizes overly complex language

### Keyword Density
- Top 20 keywords by frequency
- Excludes common stopwords
- Useful for ATS optimization

## 🤖 AI Integration

The app uses the Manus built-in LLM API for:
- Resume feedback generation
- Chatbot responses
- Cover letter writing
- LinkedIn optimization

All LLM calls are server-side for security.

## 📝 File Parsing

Supports:
- **PDF**: Using `pdf-parse` library
- **DOCX**: Using `mammoth` library

Extracts:
- Full text content
- Skills (from keyword matching)
- Job role suggestions

## 🚀 Deployment

The app is ready for deployment to Manus hosting:

1. Create a checkpoint via the Management UI
2. Click the **Publish** button
3. Choose your deployment settings

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check database credentials in Management UI
- Ensure all tables are created (run migration SQL)

### File Upload Fails
- Check file size (max 5MB)
- Verify file format (PDF or DOCX)
- Check S3 storage configuration

### LLM API Errors
- Verify BUILT_IN_FORGE_API_KEY is set
- Check API endpoint configuration
- Review error logs in dev server

## 📚 Documentation

- **Frontend Workflow**: See `client/src/` for component examples
- **Backend API**: See `server/routers/` for endpoint definitions
- **Database**: See `drizzle/schema.ts` for table definitions
- **Styling**: See `client/src/index.css` for theme variables

## 🎓 Learning Resources

This project demonstrates:
- Full-stack TypeScript development
- React hooks and state management
- tRPC for type-safe APIs
- Database design with Drizzle ORM
- LLM integration
- File processing and parsing
- Responsive UI design
- Cyberpunk/neon design patterns

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the Manus documentation
4. Review error messages in dev console

## 📄 License

This project is created for educational purposes.

---

**Built with ❤️ for your AI subject project**
