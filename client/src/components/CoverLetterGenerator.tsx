import React, { useState } from "react";
import { Copy, Download, Loader, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface CoverLetterGeneratorProps {
  resumeId: number;
}

export function CoverLetterGenerator({ resumeId }: CoverLetterGeneratorProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMutation = trpc.generation.generateCoverLetter.useMutation({
    onSuccess: (data) => {
      setGeneratedLetter(data.coverLetter);
      setLoading(false);
      toast.success("Cover letter generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate cover letter");
      setLoading(false);
    },
  });

  const handleGenerate = () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setLoading(true);
    generateMutation.mutate({
      resumeId,
      jobDescription,
      companyName: companyName || undefined,
    });
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      toast.success("Cover letter copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (generatedLetter) {
      const element = document.createElement("a");
      const file = new Blob([generatedLetter], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `cover-letter-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Cover letter downloaded!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {!generatedLetter && (
        <div className="glow-box p-6 rounded-sm space-y-4">
          <h3 className="text-xl font-bold text-foreground neon-glow">Generate Cover Letter</h3>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Microsoft, Startup Inc."
              className="input-neon w-full px-4 py-2 rounded-sm text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="input-neon w-full px-4 py-2 rounded-sm text-sm h-32 resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The more detailed the job description, the better the cover letter
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription.trim()}
            className="btn-neon w-full py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>
      )}

      {/* Generated Letter Display */}
      {generatedLetter && (
        <div className="glow-box-cyan p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-secondary neon-glow-cyan">
              Your Cover Letter
            </h3>
            <button
              onClick={() => setGeneratedLetter(null)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Generate New
            </button>
          </div>

          <div className="bg-card p-4 rounded-sm max-h-96 overflow-y-auto border border-secondary">
            <Streamdown>{generatedLetter}</Streamdown>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="btn-neon flex-1 py-2 rounded-sm flex items-center justify-center gap-2 text-sm"
            >
              <Copy size={16} />
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="btn-neon-cyan flex-1 py-2 rounded-sm flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
