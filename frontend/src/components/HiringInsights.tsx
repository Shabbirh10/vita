"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Coins, Sparkles, Award, Globe, Briefcase } from "lucide-react";

interface DomainStats {
  name: string;
  growth: string;
  demand: string;
  salary: { junior: string; mid: string; senior: string };
  trends: string[];
  skills: string[];
}

const DOMAIN_DATA: Record<string, DomainStats> = {
  "AI/ML": {
    name: "Artificial Intelligence & Machine Learning",
    growth: "+38% YoY",
    demand: "Critical",
    salary: { junior: "$110k", mid: "$165k", senior: "$240k" },
    trends: ["Large Language Models (LLMs)", "Parameter-Efficient Fine-Tuning (LoRA)", "Vector Databases (pgvector)", "Agentic RAG Workflows"],
    skills: ["PyTorch", "Hugging Face", "LangChain", "Python", "Transformers", "scikit-learn"]
  },
  "Frontend": {
    name: "Frontend Engineering",
    growth: "+12% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$115k", senior: "$160k" },
    trends: ["React Server Components (RSC)", "Tailwind CSS v4 Engine", "Micro-frontends", "Zustand State Hydration"],
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Redux"]
  },
  "Backend": {
    name: "Backend & Systems Engineering",
    growth: "+18% YoY",
    demand: "High",
    salary: { junior: "$80k", mid: "$125k", senior: "$180k" },
    trends: ["Asynchronous Event Processing", "gRPC / Protocol Buffers", "Redis Cache Replication", "Distributed DB Sharding"],
    skills: ["Django", "FastAPI", "Go", "Python", "Docker", "PostgreSQL", "Redis", "REST APIs"]
  },
  "DevOps & Infrastructure": {
    name: "DevOps & Platform Engineering",
    growth: "+26% YoY",
    demand: "Very High",
    salary: { junior: "$85k", mid: "$130k", senior: "$195k" },
    trends: ["Infrastructure as Code (IaC)", "GitOps with ArgoCD", "Cloud-native observability (Prometheus/Grafana)"],
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Linux", "GCP"]
  },
  "Mobile": {
    name: "Mobile Application Engineering",
    growth: "+14% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$120k", senior: "$170k" },
    trends: ["Declarative UI (SwiftUI / Jetpack Compose)", "Cross-platform optimization", "Offline-first architectures"],
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "Dart", "iOS", "Android"]
  },
  "Data Engineering": {
    name: "Data Analytics & Engineering",
    growth: "+15% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$115k", senior: "$160k" },
    trends: ["Apache Spark streaming", "Real-time warehouse indexing (Snowflake/BigQuery)", "Data cataloging & provenance"],
    skills: ["Pandas", "NumPy", "SQL", "Apache Spark", "Python", "R", "Hadoop"]
  }
};

export default function HiringInsights() {
  const [activeTab, setActiveTab] = useState<string>("AI/ML");
  const selectedData = DOMAIN_DATA[activeTab];

  return (
    <div className="w-full flex flex-col gap-6 pb-6">
      {/* Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40"></div>
        </div>
        <div className="relative bg-deep px-4 text-xs uppercase tracking-[0.25em] text-muted flex items-center gap-1.5 font-medium">
          <Globe size={13} className="text-amber/70" />
          <span>Global Software Hiring Insights</span>
        </div>
      </div>

      {/* General Market Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-glass rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Global Tech Growth</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-teal">+16% YoY</span>
            <TrendingUp size={12} className="text-teal" />
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Peak Hiring Domain</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-text truncate max-w-[150px]">AI & Machine Learning</span>
            <Sparkles size={12} className="text-amber" />
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Remote-First Roles</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-text">58% avg.</span>
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Interview Length</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-text">3-4 weeks</span>
            <Briefcase size={12} className="text-muted" />
          </div>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-surface border border-border p-1 rounded-2xl max-w-fit mx-auto">
        {Object.keys(DOMAIN_DATA).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 cursor-pointer ${
              activeTab === tab
                ? "bg-amber text-white shadow-sm font-bold"
                : "text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="card-glass p-6 md:p-8 flex flex-col gap-6"
        >
          <div>
            <span className="text-xs tracking-widest uppercase text-amber font-semibold">
              Specialization Benchmarks
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-text mt-0.5">
              {selectedData.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {/* Column 1: Growth & Salary */}
            <div className="flex flex-col justify-between pr-0 md:pr-6 pb-6 md:pb-0 gap-4">
              <div>
                <span className="text-xs tracking-wider uppercase text-muted font-medium">
                  Hiring Velocity
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-teal">
                    {selectedData.growth}
                  </span>
                  <span className="text-xs bg-teal/10 text-teal px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedData.demand} Demand
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs tracking-wider uppercase text-muted flex items-center gap-1.5 font-medium">
                  <Coins size={12} className="text-amber" />
                  <span>Global Salary Range</span>
                </span>
                <div className="mt-2.5">
                  <div className="flex mb-1 items-center justify-between text-xs text-muted">
                    <span>Junior</span>
                    <span>Mid</span>
                    <span>Principal</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-text mb-1">
                    <span>{selectedData.salary.junior}</span>
                    <span className="text-amber">{selectedData.salary.mid}</span>
                    <span>{selectedData.salary.senior}</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full relative overflow-hidden">
                    <div className="absolute left-[15%] right-[15%] h-full bg-amber/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Hiring Trends */}
            <div className="px-0 md:px-6 py-6 md:py-0">
              <span className="text-xs tracking-wider uppercase text-muted flex items-center gap-1.5 mb-3.5 font-medium">
                <TrendingUp size={12} className="text-teal" />
                <span>Hiring & Tech Trends</span>
              </span>
              <ul className="space-y-2.5 text-sm text-muted">
                {selectedData.trends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-teal/30" />
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: In-Demand Skills */}
            <div className="pl-0 md:pl-6 pt-6 md:pt-0">
              <span className="text-xs tracking-wider uppercase text-muted flex items-center gap-1.5 mb-3.5 font-medium">
                <Award size={12} className="text-amber" />
                <span>Most In-Demand Skills</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber/8 text-amber border border-amber/12"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
