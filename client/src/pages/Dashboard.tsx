import { useState } from "react";
import { CyberpunkDashboard } from "@/components/CyberpunkDashboard";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumeHistory } from "@/components/ResumeHistory";
import { AIChatbot } from "@/components/AIChatbot";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader } from "lucide-react";

type PageType = "dashboard" | "upload" | "chatbot" | "history";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="mx-auto mb-4 text-primary neon-glow animate-spin" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "upload":
        return (
          <ResumeUpload
            onUploadSuccess={(resumeId) => {
              setSelectedResumeId(resumeId);
              setCurrentPage("history");
            }}
          />
        );
      case "chatbot":
        return selectedResumeId ? (
          <AIChatbot resumeId={selectedResumeId} />
        ) : (
          <div className="glow-box p-12 text-center rounded-sm">
            <p className="text-muted-foreground mb-4">No resume selected</p>
            <p className="text-sm text-muted-foreground">
              Please upload or select a resume to use the AI assistant
            </p>
          </div>
        );
      case "history":
        return <ResumeHistory onSelectResume={setSelectedResumeId} />;
      case "dashboard":
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="glow-box p-8 rounded-sm">
              <h1 className="text-4xl font-bold neon-glow mb-4">
                Welcome to AI Resume Analyzer
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Get instant AI-powered feedback on your resume. Improve your ATS score, readability,
                and land more interviews.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glow-box-cyan p-4 rounded-sm">
                  <h3 className="font-bold text-secondary neon-glow-cyan mb-2">📊 Smart Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get ATS scores, readability metrics, and keyword analysis
                  </p>
                </div>
                <div className="glow-box-cyan p-4 rounded-sm">
                  <h3 className="font-bold text-secondary neon-glow-cyan mb-2">🤖 AI Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive chatbot with full context of your resume
                  </p>
                </div>
                <div className="glow-box-cyan p-4 rounded-sm">
                  <h3 className="font-bold text-secondary neon-glow-cyan mb-2">📝 Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate cover letters and LinkedIn suggestions
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setCurrentPage("upload")}
                className="glow-box p-8 rounded-sm text-left hover:border-accent transition-all group"
              >
                <h3 className="text-2xl font-bold text-primary neon-glow mb-2 group-hover:text-accent">
                  📤 Upload Resume
                </h3>
                <p className="text-muted-foreground">
                  Upload a PDF or DOCX file to get instant AI-powered analysis
                </p>
              </button>

              <button
                onClick={() => setCurrentPage("history")}
                className="glow-box-cyan p-8 rounded-sm text-left hover:border-accent transition-all group"
              >
                <h3 className="text-2xl font-bold text-secondary neon-glow-cyan mb-2 group-hover:text-accent">
                  📋 Resume History
                </h3>
                <p className="text-muted-foreground">
                  View all your uploaded resumes and their analysis results
                </p>
              </button>
            </div>

            {/* Features Grid */}
            <div className="glow-box p-8 rounded-sm">
              <h2 className="text-2xl font-bold neon-glow mb-6">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border-l-2 border-primary">
                  <h4 className="font-bold text-foreground mb-2">✓ ATS Compatibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Check how well your resume works with automated systems
                  </p>
                </div>
                <div className="p-4 border-l-2 border-secondary">
                  <h4 className="font-bold text-foreground mb-2">✓ Readability Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyze clarity and professional presentation
                  </p>
                </div>
                <div className="p-4 border-l-2 border-accent">
                  <h4 className="font-bold text-foreground mb-2">✓ Skill Gap Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare your skills against job descriptions
                  </p>
                </div>
                <div className="p-4 border-l-2 border-primary">
                  <h4 className="font-bold text-foreground mb-2">✓ AI Chatbot</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized feedback with full resume context
                  </p>
                </div>
                <div className="p-4 border-l-2 border-secondary">
                  <h4 className="font-bold text-foreground mb-2">✓ Cover Letters</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate tailored cover letters for job applications
                  </p>
                </div>
                <div className="p-4 border-l-2 border-accent">
                  <h4 className="font-bold text-foreground mb-2">✓ LinkedIn Tips</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimize your LinkedIn profile with AI suggestions
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <CyberpunkDashboard
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page as PageType)}
    >
      {renderPage()}
    </CyberpunkDashboard>
  );
}
