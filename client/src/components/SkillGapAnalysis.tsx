import React, { useState } from "react";
import { Loader, Target, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SkillGapAnalysisProps {
  resumeId: number;
}

export function SkillGapAnalysis({ resumeId }: SkillGapAnalysisProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeMutation = trpc.chatbot.analyzeSkillGaps.useMutation({
    onSuccess: (data: any) => {
      setResult(data);
      setLoading(false);
      toast.success("Analysis complete!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze job match");
      setLoading(false);
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setLoading(true);
    analyzeMutation.mutate({
      resumeId,
      jobDescription,
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {!result && (
        <div className="glow-box p-6 rounded-sm space-y-4">
          <h3 className="text-xl font-bold text-foreground neon-glow">Skill Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Paste a job description to see which skills you have and which ones you need to develop
          </p>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="input-neon w-full px-4 py-2 rounded-sm text-sm h-40 resize-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="btn-neon w-full py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target size={18} />
                Analyze Skills Gap
              </>
            )}
          </button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Match Percentage */}
          <div className="glow-box-cyan p-6 rounded-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-secondary neon-glow-cyan">Job Match Score</h3>
              <button
                onClick={() => setResult(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Analyze New
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-secondary neon-glow-cyan">
                {result.matchPercentage}%
              </div>
              <div className="flex-1">
                <div className="progress-bar-neon">
                  <div style={{ width: `${result.matchPercentage}%` }} className="h-full" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.matchPercentage >= 80
                    ? "Excellent match!"
                    : result.matchPercentage >= 60
                      ? "Good match"
                      : "Room for improvement"}
                </p>
              </div>
            </div>
          </div>

          {/* Matched Skills */}
          {(result.matchingSkills || result.skillMatches) && (result.matchingSkills || result.skillMatches || []).length > 0 && (
            <div className="glow-box p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-primary neon-glow" />
                <h3 className="text-lg font-bold text-foreground">Matched Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(result.matchingSkills || result.skillMatches || []).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-sm neon-glow"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                You have {result.skillMatches.length} of the required skills
              </p>
            </div>
          )}

          {/* Skill Gaps */}
          {(result.missingSkills || result.skillGaps) && (result.missingSkills || result.skillGaps || []).length > 0 && (
            <div className="glow-box-cyan p-6 rounded-sm">
              <h3 className="text-lg font-bold text-secondary neon-glow-cyan mb-4">
                Skills to Develop
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.missingSkills || result.skillGaps || []).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-sm"
                  >
                    ⚡ {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Focus on developing these {result.skillGaps.length} skills to improve your fit
              </p>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="glow-box p-6 rounded-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Recommendations</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-primary neon-glow font-bold">{idx + 1}.</span>
                    <p className="text-sm text-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
