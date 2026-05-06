import React, { useState } from "react";
import { Trash2, Eye, Download, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ScoreCard } from "./ScoreCard";

interface ResumeHistoryProps {
  onSelectResume?: (resumeId: number) => void;
}

export function ResumeHistory({ onSelectResume }: ResumeHistoryProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  const resumesQuery = trpc.resume.list.useQuery();
  const deleteResumeMutation = trpc.resume.delete.useMutation({
    onSuccess: () => {
      toast.success("Resume deleted successfully");
      resumesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete resume");
    },
  });

  const selectedResume = resumesQuery.data?.find((r) => r.id === selectedResumeId);

  const handleDelete = (resumeId: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteResumeMutation.mutate({ resumeId });
    }
  };

  if (resumesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  if (!resumesQuery.data || resumesQuery.data.length === 0) {
    return (
      <div className="glow-box p-12 text-center rounded-sm">
        <p className="text-muted-foreground mb-4">No resumes uploaded yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first resume to get started with AI-powered analysis
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resume List */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-bold text-foreground mb-4 neon-glow">Your Resumes</h3>
        <div className="space-y-2">
          {resumesQuery.data.map((resume) => (
            <button
              key={resume.id}
              onClick={() => setSelectedResumeId(resume.id)}
              className={`w-full text-left p-4 rounded-sm transition-all ${
                selectedResumeId === resume.id
                  ? "glow-box border-secondary"
                  : "glow-box hover:border-accent"
              }`}
            >
              <p className="font-semibold text-foreground truncate">{resume.fileName}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar size={12} />
                <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  ATS: {resume.atsScore}
                </span>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  Read: {resume.readabilityScore}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resume Details */}
      <div className="lg:col-span-2">
        {selectedResume ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="glow-box p-6 rounded-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground neon-glow">
                    {selectedResume.fileName}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploaded {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedResume.id)}
                  className="p-2 rounded-sm bg-destructive text-destructive-foreground hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Skills */}
              {selectedResume.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Extracted Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.slice(0, 8).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-sm neon-glow"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedResume.skills.length > 8 && (
                      <span className="text-xs text-muted-foreground px-3 py-1">
                        +{selectedResume.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scores */}
            <ScoreCard
              title="ATS Compatibility"
              score={selectedResume.atsScore || 0}
              color="primary"
            />
            <ScoreCard
              title="Readability Score"
              score={selectedResume.readabilityScore || 0}
              color="secondary"
            />

            {/* Job Roles */}
            {selectedResume.jobRoles.length > 0 && (
              <div className="glow-box-cyan p-6 rounded-sm">
                <h3 className="font-semibold text-foreground mb-3">Suggested Job Roles</h3>
                <div className="space-y-2">
                  {selectedResume.jobRoles.map((role: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <span className="text-secondary">▸</span>
                      <span>{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button className="btn-neon flex-1 py-3 rounded-sm flex items-center justify-center gap-2">
                <Eye size={18} />
                View Full Analysis
              </button>
              <button className="btn-neon-cyan flex-1 py-3 rounded-sm flex items-center justify-center gap-2">
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        ) : (
          <div className="glow-box p-12 text-center rounded-sm h-full flex items-center justify-center">
            <p className="text-muted-foreground">Select a resume to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
