"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import axios from "axios";

interface ResumeUploadProps {
  onUploadSuccess: (data: any) => void;
  jobDescription?: string;
}

export default function ResumeUpload({ onUploadSuccess, jobDescription }: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (jobDescription) {
      formData.append("job_description", jobDescription);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/resumes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadSuccess(res.data);
    } catch (err: any) {
      alert(`Upload failed: ${err.response?.data?.error || err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      whileHover={{ scale: 1.008 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl p-14 text-center cursor-pointer transition-all duration-300
        ${isDragOver
          ? "border border-amber/40 bg-amber/[0.04]"
          : "card-glass"
        }`}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
          style={{ background: "rgba(11, 11, 12, 0.85)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-amber animate-spin" />
            <span className="text-sm text-muted">Parsing...</span>
          </div>
        </motion.div>
      )}

      <input
        type="file"
        className="hidden"
        id="resume-upload"
        accept=".pdf"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      <label htmlFor="resume-upload" className="relative block cursor-pointer">
        <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber/10 border border-amber/20">
          <Upload size={22} className="text-amber" />
        </div>
        <p className="text-sm text-text mb-1 font-medium">
          {isDragOver ? "Release to upload" : "Drop your résumé here"}
        </p>
        <p className="text-xs text-muted">or click to browse | PDF</p>
      </label>
    </motion.div>
  );
}
