import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: number) => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.resume.upload.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Resume uploaded and analyzed successfully!");
        setFile(null);
        setUploading(false);
        onUploadSuccess?.(data.resume.id);
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
      setUploading(false);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        
        // Convert ArrayBuffer to base64 using browser API (not Node.js Buffer)
        const bytes = new Uint8Array(buffer);
        let binaryString = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64String = btoa(binaryString);
        
        const fileType = file.type.includes("pdf") ? "pdf" : "docx";

        console.log("Uploading file:", {
          fileName: file.name,
          fileType,
          size: file.size,
          base64Length: base64String.length,
        });

        uploadMutation.mutate({
          fileName: file.name,
          fileBuffer: base64String,
          fileType,
        });
      } catch (error) {
        console.error("Error encoding file:", error);
        toast.error("Failed to encode file");
        setUploading(false);
      }
    };

    reader.onerror = () => {
      console.error("FileReader error");
      toast.error("Failed to read file");
      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold neon-glow mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Upload a PDF or DOCX file to get instant AI-powered analysis and feedback
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glow-box p-12 rounded-sm text-center cursor-pointer transition-all ${
          dragActive ? "bg-primary bg-opacity-20 border-accent" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          className="hidden"
        />

        {!file ? (
          <div onClick={() => fileInputRef.current?.click()} className="space-y-4">
            <div className="flex justify-center">
              <Upload size={48} className="text-secondary neon-glow-cyan" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Drag and drop your resume here
              </p>
              <p className="text-muted-foreground mb-4">or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOCX (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileText size={48} className="text-primary neon-glow" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-neon-cyan px-6 py-2 text-sm disabled:opacity-50"
              >
                Change File
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-neon px-6 py-2 text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 glow-box-cyan p-6 rounded-sm">
        <div className="flex gap-4">
          <AlertCircle size={20} className="text-secondary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">What we analyze:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ ATS Compatibility Score</li>
              <li>✓ Readability & Formatting</li>
              <li>✓ Keyword Density Analysis</li>
              <li>✓ Skill Extraction</li>
              <li>✓ Job Role Matching</li>
              <li>✓ Section-by-Section Feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
