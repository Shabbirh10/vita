"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AmbientParticles from "@/components/AmbientParticles";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeResults from "@/components/ResumeResults";
import HiringInsights from "@/components/HiringInsights";
import { Github, Sparkles, FileSearch, BarChart3, GitBranch, ArrowLeft, ArrowRight } from "lucide-react";

const container = {
  animate: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const item = {
  initial: { opacity: 0, y: 28 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const features = [
  { icon: FileSearch, label: "Skill Extraction" },
  { icon: BarChart3, label: "Role Analysis" },
  { icon: GitBranch, label: "Career Mapping" },
];

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [activeMode, setActiveMode] = useState<"parser" | "insights">("insights");

  return (
    <>
      <AmbientParticles />
      <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl flex justify-between items-center mb-16"
        >
          <span
            onClick={() => {
              setActiveMode("insights");
              setData(null);
            }}
            className="font-[family-name:var(--font-heading)] text-2xl text-text tracking-tight cursor-pointer font-medium"
          >
            vita
          </span>

          {/* Action Button */}
          {activeMode === "insights" ? (
            <button
              onClick={() => setActiveMode("parser")}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-amber text-surface shadow-sm hover:bg-amber/90 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Analyze Resume</span>
              <ArrowRight size={13} className="text-surface" />
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveMode("insights");
                setData(null);
              }}
              className="text-xs text-muted hover:text-text transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
            >
              <ArrowLeft size={13} />
              <span>Back to Insights</span>
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted hover:text-amber transition-colors"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
        </motion.header>

        {activeMode === "insights" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <HiringInsights />
          </motion.div>
        ) : !data ? (
          <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center w-full max-w-xl gap-8"
          >
            <div className="text-center relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-px bg-amber/40" />
              <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl leading-[1.08] tracking-tight text-balance mb-4">
                Tell your story.
              </h1>
              <p className="text-muted text-base leading-relaxed">
                Drop a résumé and let AI surface your skills, analyse role fit, and
                map your professional profile in seconds.
              </p>
            </div>

            {/* 1. Resume Parser Uploader Card */}
            <div className="w-full">
              <ResumeUpload onUploadSuccess={setData} jobDescription={jobDescription} />
            </div>
            
            {/* 2. Job Description Input Card */}
            <div className="card-glass p-6 flex flex-col gap-3 w-full">
              <div>
                <span className="text-xs tracking-[0.2em] uppercase text-amber font-semibold">
                  Target Role Matcher
                </span>
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-text mt-1 font-semibold">
                  Job Description (Optional)
                </h3>
                <p className="text-xs text-muted leading-relaxed mt-1">
                  Paste a target job description below to calculate a custom ATS score and skill-gap analysis matching the role's requirements.
                </p>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description or role requirements here..."
                className="w-full min-h-[140px] bg-deep/40 border border-border/80 rounded-xl p-3.5 text-sm text-text placeholder-muted/50 focus:outline-none focus:border-amber/50 transition-colors resize-none font-[family-name:var(--font-body)] leading-relaxed"
              />
            </div>

            {/* Clean Feature Badges underneath */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-wrap items-center justify-center gap-5">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2 text-xs text-muted"
                  >
                    <f.icon size={13} className="text-amber/70" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted/60">
                <Sparkles size={12} className="text-amber/50" />
                <span>spaCy parsing | PDF only | no storage</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl flex flex-col items-center gap-8"
          >
            <ResumeResults data={data} />
            <button
              onClick={() => setData(null)}
              className="text-sm text-muted hover:text-amber transition-colors underline underline-offset-4 cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft size={14} />
              <span>Parse another résumé</span>
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
