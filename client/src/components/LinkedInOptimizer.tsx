import React, { useState } from "react";
import { Copy, Loader, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LinkedInOptimizerProps {
  resumeId: number;
}

export function LinkedInOptimizer({ resumeId }: LinkedInOptimizerProps) {
  const [targetRole, setTargetRole] = useState("");
  const [activeTab, setActiveTab] = useState<"headline" | "summary" | "skills">("headline");
  const [loading, setLoading] = useState(false);

  const headlineMutation = trpc.generation.generateLinkedInHeadline.useMutation({
    onSuccess: () => {
      toast.success("Headlines generated!");
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate headlines");
      setLoading(false);
    },
  });

  const summaryMutation = trpc.generation.generateLinkedInSummary.useMutation({
    onSuccess: () => {
      toast.success("Summary generated!");
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate summary");
      setLoading(false);
    },
  });

  const skillsMutation = trpc.generation.generateLinkedInSkills.useMutation({
    onSuccess: () => {
      toast.success("Skills suggestions generated!");
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate skills");
      setLoading(false);
    },
  });

  const handleGenerateHeadlines = () => {
    setLoading(true);
    headlineMutation.mutate({
      resumeId,
      targetRole: targetRole || undefined,
    });
  };

  const handleGenerateSummary = () => {
    setLoading(true);
    summaryMutation.mutate({
      resumeId,
    });
  };

  const handleGenerateSkills = () => {
    setLoading(true);
    skillsMutation.mutate({
      resumeId,
      targetRole: targetRole || undefined,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Target Role Input */}
      <div className="glow-box p-6 rounded-sm">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Target Role (Optional)
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g., Senior Software Engineer, Product Manager"
          className="input-neon w-full px-4 py-2 rounded-sm text-sm"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Specify a target role to get more tailored suggestions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-primary">
        <button
          onClick={() => setActiveTab("headline")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "headline"
              ? "text-primary neon-glow border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Headline
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "summary"
              ? "text-primary neon-glow border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "skills"
              ? "text-primary neon-glow border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Skills
        </button>
      </div>

      {/* Content */}
      <div className="glow-box-cyan p-6 rounded-sm space-y-4">
        {activeTab === "headline" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-secondary neon-glow-cyan">
              LinkedIn Headline Suggestions
            </h3>
            <p className="text-sm text-muted-foreground">
              Get 5 compelling headline options optimized for discoverability and engagement
            </p>
            <button
              onClick={handleGenerateHeadlines}
              disabled={loading}
              className="btn-neon-cyan w-full py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate Headlines
                </>
              )}
            </button>
            {headlineMutation.data?.headlines && (
              <div className="space-y-2">
                {headlineMutation.data.headlines.map((headline: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-card p-3 rounded-sm flex items-center justify-between group hover:border-accent"
                  >
                    <p className="text-sm text-foreground flex-1">{headline}</p>
                    <button
                      onClick={() => handleCopy(headline)}
                      className="text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-secondary neon-glow-cyan">
              LinkedIn Summary
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate a professional summary that highlights your achievements and value
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="btn-neon-cyan w-full py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate Summary
                </>
              )}
            </button>
            {summaryMutation.data?.summary && (
              <div className="bg-card p-4 rounded-sm max-h-64 overflow-y-auto border border-secondary">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {summaryMutation.data.summary}
                </p>
                <button
                  onClick={() => handleCopy(summaryMutation.data.summary)}
                  className="mt-4 btn-neon px-4 py-2 rounded-sm flex items-center gap-2 text-sm w-full justify-center"
                >
                  <Copy size={16} />
                  Copy Summary
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-secondary neon-glow-cyan">
              Skills Recommendations
            </h3>
            <p className="text-sm text-muted-foreground">
              Get suggestions for skills to add to your LinkedIn profile
            </p>
            <button
              onClick={handleGenerateSkills}
              disabled={loading}
              className="btn-neon-cyan w-full py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate Skills
                </>
              )}
            </button>
            {skillsMutation.data?.skills && (
              <div className="space-y-3">
                {Object.entries(skillsMutation.data.skills).map(([category, skills]: any) => (
                  <div key={category}>
                    <h4 className="font-semibold text-foreground mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleCopy(skill)}
                          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-sm hover:bg-accent transition-colors neon-glow"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
