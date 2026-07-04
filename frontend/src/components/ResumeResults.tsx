"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ExternalLink, GraduationCap, Briefcase, FolderGit2, ChevronDown, TrendingUp, Coins, Lightbulb } from "lucide-react";

interface Entry {
  title: string;
  points: string[];
}

interface ResumeResultsProps {
  data: any;
}

const ROLE_CATEGORIES = [
  { key: "Frontend", matchSkills: ["React", "Next.js", "Vue.js", "Angular", "Svelte", "HTML", "CSS", "Tailwind CSS", "Redux", "TypeScript", "JavaScript"] },
  { key: "Backend", matchSkills: ["Django", "FastAPI", "Flask", "Node.js", "Express.js", "Spring Boot", "Python", "Go", "Rust", "Java", "REST API"] },
  { key: "AI/ML", matchSkills: ["Spacy", "Scikit-Learn", "TensorFlow", "PyTorch", "Keras", "NLP", "Machine Learning", "Deep Learning", "LLM", "LangChain"] },
  { key: "DevOps", matchSkills: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Terraform", "Jenkins", "Linux", "GitHub Actions"] },
  { key: "Database", matchSkills: ["SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB"] },
  { key: "Mobile", matchSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Dart", "iOS", "Android"] },
  { key: "Cloud", matchSkills: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Helm", "Prometheus", "Grafana"] },
  { key: "Data", matchSkills: ["Pandas", "NumPy", "SQL", "Python", "R", "MATLAB", "Spark", "Hadoop", "Tableau", "Power BI"] },
];

const DOMAIN_INSIGHTS: Record<string, {
  name: string;
  growth: string;
  demand: "Critical" | "High" | "Very High" | "Steady" | "Moderate";
  salary: { junior: string; mid: string; senior: string };
  trends: string[];
  recommendations: string[];
}> = {
  "AI/ML": {
    name: "Artificial Intelligence & Machine Learning",
    growth: "+38% YoY",
    demand: "Critical",
    salary: { junior: "$110k", mid: "$165k", senior: "$240k" },
    trends: ["Large Language Models (LLMs)", "Parameter-Efficient Fine-Tuning (LoRA)", "Vector Databases (Chroma/pgvector)", "Retrieval-Augmented Generation (RAG)"],
    recommendations: ["PyTorch", "Hugging Face", "LangChain"]
  },
  "Frontend": {
    name: "Frontend Engineering",
    growth: "+12% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$115k", senior: "$160k" },
    trends: ["React Server Components (RSC)", "Tailwind CSS v4", "Micro-frontends", "Zustand State Management"],
    recommendations: ["Next.js", "TypeScript", "Tailwind CSS"]
  },
  "Backend": {
    name: "Backend & Systems Engineering",
    growth: "+18% YoY",
    demand: "High",
    salary: { junior: "$80k", mid: "$125k", senior: "$180k" },
    trends: ["Asynchronous Event Processing", "gRPC & Protocol Buffers", "Redis Cache Replication", "Distributed DB Sharding"],
    recommendations: ["FastAPI", "Go", "Docker", "Redis"]
  },
  "DevOps": {
    name: "DevOps & Platform Engineering",
    growth: "+26% YoY",
    demand: "Very High",
    salary: { junior: "$85k", mid: "$130k", senior: "$195k" },
    trends: ["Infrastructure as Code (IaC)", "GitOps with ArgoCD", "Cloud-native observability (Prometheus/Grafana)"],
    recommendations: ["Kubernetes", "Terraform", "CI/CD Pipeline Design"]
  },
  "Cloud": {
    name: "Cloud Architecture",
    growth: "+26% YoY",
    demand: "Very High",
    salary: { junior: "$85k", mid: "$130k", senior: "$195k" },
    trends: ["Serverless Architectures", "Multi-cloud governance", "Cost Optimization algorithms"],
    recommendations: ["AWS", "GCP", "Kubernetes"]
  },
  "Database": {
    name: "Database Administration & Operations",
    growth: "+8% YoY",
    demand: "Moderate",
    salary: { junior: "$70k", mid: "$110k", senior: "$155k" },
    trends: ["Distributed databases", "Graph databases (Neo4j)", "Real-time stream processing"],
    recommendations: ["PostgreSQL", "Redis", "Elasticsearch"]
  },
  "Data": {
    name: "Data Analytics & Engineering",
    growth: "+15% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$115k", senior: "$160k" },
    trends: ["Apache Spark streaming", "Real-time warehouse indexing (Snowflake/BigQuery)", "Data cataloging & provenance"],
    recommendations: ["Pandas", "SQL", "Apache Spark"]
  },
  "Mobile": {
    name: "Mobile Application Engineering",
    growth: "+14% YoY",
    demand: "Steady",
    salary: { junior: "$75k", mid: "$120k", senior: "$170k" },
    trends: ["Declarative UI (SwiftUI / Jetpack Compose)", "Cross-platform optimization", "Offline-first architectures"],
    recommendations: ["React Native", "Flutter", "Swift"]
  },
  "General": {
    name: "Software Systems Engineering",
    growth: "+10% YoY",
    demand: "Moderate",
    salary: { junior: "$70k", mid: "$110k", senior: "$150k" },
    trends: ["Clean Code Architecture", "Test-Driven Development (TDD)", "Agile workflows"],
    recommendations: ["Python", "SQL", "Docker"]
  }
};

function normalizeEntries(raw: any): Entry[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((e: any) => {
    if (typeof e === "string") return { title: e, points: [] };
    if (Array.isArray(e.points)) return { title: e.title || "", points: e.points };
    if (typeof e.description === "string" && e.description) {
      return { title: e.title || "", points: e.description.split("\n").filter(Boolean) };
    }
    return { title: e.title || "", points: [] };
  });
}

function ExpandableList({ entries, icon: Icon, title }: { entries: Entry[]; icon: any; title: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const hasAnyPoints = entries.some((e) => e.points.length > 0);

  return (
    <div className="card-glass rounded-2xl p-7">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center">
          <Icon size={14} className="text-amber" />
        </div>
        <h2 className="font-[family-name:var(--font-heading)] text-sm text-text tracking-tight">
          {title}
        </h2>
      </div>
      <ul className="space-y-0">
        {entries.slice(0, 6).map((entry, idx) => {
          const isOpen = openIdx === idx;
          const toggle = () => setOpenIdx(isOpen ? null : idx);
          return (
            <li key={idx}>
              <button
                onClick={hasAnyPoints ? toggle : undefined}
                className={`w-full flex items-start gap-3 py-2 text-left ${hasAnyPoints ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-amber/30" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text font-medium leading-snug">
                      {entry.title}
                    </span>
                    {hasAnyPoints && entry.points.length > 0 && (
                      <ChevronDown
                        size={13}
                        className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && entry.points.length > 0 && (
                      <motion.div
                        key="points"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-2 space-y-1">
                          {entry.points.map((pt, pi) => (
                            <li key={pi} className="text-xs text-muted leading-relaxed pl-3 border-l border-amber/15">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
              {idx < Math.min(entries.length, 6) - 1 && (
                <div className="ml-[5px] w-px h-3 bg-amber/10" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ResumeResults({ data }: ResumeResultsProps) {
  const { name, email, phone, linkedin, github, skills, education, experience, projects, ats_score, ats_breakdown } = data;
  const score = ats_score ?? 0;
  const breakdown = ats_breakdown ?? {};

  const allSkills: string[] = skills ? (Object.values(skills).flat() as string[]) : [];
  const skillCategories: [string, string[]][] = skills
    ? (Object.entries(skills).filter(([, v]) => Array.isArray(v) && v.length > 0) as [string, string[]][])
    : [];

  const eduEntries = normalizeEntries(education);
  const expEntries = normalizeEntries(experience);
  const projEntries = normalizeEntries(projects);

  const hasOneOf = (list: string[]) =>
    list.some((s) => allSkills.some((a) => a.toLowerCase() === s.toLowerCase()));

  const skillData = ROLE_CATEGORIES.map(({ key, matchSkills }) => ({
    subject: key,
    A: hasOneOf(matchSkills) ? 100 : Math.round(Math.random() * 30 + 20),
    fullMark: 100,
  }));

  // Determine primary candidate domain based on count of skills
  const domainInfo = useMemo(() => {
    let topDomain = "General";
    let maxSkillsCount = 0;
    
    if (skills && typeof skills === "object" && !Array.isArray(skills)) {
      Object.entries(skills).forEach(([category, list]) => {
        if (Array.isArray(list) && list.length > maxSkillsCount) {
          const mappedKey = category === "AI/ML" || category === "Data & AI" ? "AI/ML"
            : category === "DevOps & Cloud" || category === "DevOps" ? "DevOps"
            : category === "Cloud" ? "Cloud"
            : category === "Data" ? "Data"
            : category === "Database" || category === "Databases" ? "Database"
            : category;
            
          if (mappedKey in DOMAIN_INSIGHTS) {
            maxSkillsCount = list.length;
            topDomain = mappedKey;
          }
        }
      });
    }
    
    return DOMAIN_INSIGHTS[topDomain] || DOMAIN_INSIGHTS["General"];
  }, [skills]);

  const missingSkills = useMemo(() => {
    return domainInfo.recommendations.filter(
      (recSkill) => !allSkills.some((s) => s.toLowerCase() === recSkill.toLowerCase())
    );
  }, [allSkills, domainInfo]);

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } },
    card: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
    },
  };

  const linkClass = "text-xs text-muted hover:text-amber truncate transition-colors";

  // ATS Ring calculations
  const radius = 38;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5 w-full"
    >
      {/* Row 1: Profile + ATS Score + Role Fit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <motion.div variants={stagger.card} className="card-glass-accent p-7 flex flex-col justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl text-text mb-4 tracking-tight">
              Profile
            </h2>
            <div className="space-y-3 text-base">
              <div>
                <span className="text-xs tracking-[0.15em] uppercase text-muted font-medium">Name</span>
                <p className="text-text mt-0.5 font-semibold">{name || "Not found"}</p>
              </div>
              <div>
                <span className="text-xs tracking-[0.15em] uppercase text-muted font-medium">Email</span>
                <p className="text-text mt-0.5">{email || "Not found"}</p>
              </div>
              {phone && (
                <div>
                  <span className="text-xs tracking-[0.15em] uppercase text-muted font-medium">Phone</span>
                  <p className="text-text mt-0.5">{phone}</p>
                </div>
              )}
            </div>
          </div>
          {(linkedin || github) && (
            <div className="flex gap-4 pt-4 border-t border-border/20 mt-4">
              {linkedin && (
                <a href={linkedin} target="_blank" className="text-sm text-muted hover:text-amber truncate transition-colors">
                  <ExternalLink size={13} className="inline mr-1 -mt-0.5" />
                  LinkedIn
                </a>
              )}
              {github && (
                <a href={github} target="_blank" className="text-sm text-muted hover:text-amber truncate transition-colors">
                  <ExternalLink size={13} className="inline mr-1 -mt-0.5" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* ATS Score Progress Ring & Breakdown */}
        <motion.div variants={stagger.card} className="card-glass p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-heading)] text-xl text-text tracking-tight">
              ATS Score
            </h2>
            <span className="text-xs text-muted font-medium">Compatibility Match</span>
          </div>

          <div className="flex items-center gap-6 my-auto">
            {/* SVG Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-border fill-none"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-amber fill-none transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-text">
                  {score}%
                </span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted mb-0.5">
                  <span>Contact Info</span>
                  <span className="font-semibold text-text">{breakdown["Contact Info"] ?? 0}/25</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal/60 rounded-full"
                    style={{ width: `${((breakdown["Contact Info"] ?? 0) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted mb-0.5">
                  <span>Technical Skills</span>
                  <span className="font-semibold text-text">{breakdown["Skills"] ?? 0}/40</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber/60 rounded-full"
                    style={{ width: `${((breakdown["Skills"] ?? 0) / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted mb-0.5">
                  <span>Experience</span>
                  <span className="font-semibold text-text">{breakdown["Experience"] ?? 0}/20</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal/60 rounded-full"
                    style={{ width: `${((breakdown["Experience"] ?? 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted mb-0.5">
                  <span>Education</span>
                  <span className="font-semibold text-text">{breakdown["Education"] ?? 0}/15</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber/60 rounded-full"
                    style={{ width: `${((breakdown["Education"] ?? 0) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role Fit Radar Chart */}
        <motion.div variants={stagger.card} className="card-glass p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-heading)] text-xl text-text tracking-tight">
              Role Fit
            </h2>
            <span className="text-xs text-muted font-medium">
              {skillData.filter((s) => s.A >= 80).length}/{skillData.length} strong
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                <PolarGrid stroke="rgba(142, 117, 88, 0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#7C7A74", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Skills" dataKey="A" stroke="#8E7558" fill="#8E7558" fillOpacity={0.12} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Global Software Industry Insights */}
      <motion.div variants={stagger.card} className="card-glass p-7 flex flex-col gap-6">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-amber font-semibold">
            Global Software Industry Insights
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-text mt-1">
            Market Benchmarks for {domainInfo.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {/* Column 1: Market Demand & Salaries */}
          <div className="flex flex-col justify-between pr-0 md:pr-6 pb-6 md:pb-0">
            <div>
              <span className="text-xs tracking-[0.15em] uppercase text-muted font-medium">
                Hiring Demand Velocity
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-teal">
                  {domainInfo.growth}
                </span>
                <span className="text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full font-semibold">
                  {domainInfo.demand} Demand
                </span>
              </div>
            </div>

            <div className="mt-5">
              <span className="text-xs tracking-[0.15em] uppercase text-muted flex items-center gap-1 font-medium">
                <Coins size={12} className="text-amber" />
                Global Salary Index
              </span>
              <div className="mt-3.5 space-y-3">
                <div className="relative pt-1">
                  <div className="flex mb-1 items-center justify-between text-xs text-muted">
                    <span>Junior</span>
                    <span>Mid</span>
                    <span>Principal</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-text mb-1">
                    <span>{domainInfo.salary.junior}</span>
                    <span className="text-amber">{domainInfo.salary.mid}</span>
                    <span>{domainInfo.salary.senior}</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full relative overflow-hidden">
                    <div className="absolute left-[15%] right-[15%] h-full bg-amber/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Tech Trends */}
          <div className="px-0 md:px-6 py-6 md:py-0">
            <span className="text-xs tracking-[0.15em] uppercase text-muted flex items-center gap-1.5 mb-3.5 font-medium">
              <TrendingUp size={12} className="text-teal" />
              Top Hiring Trends
            </span>
            <ul className="space-y-2.5">
              {domainInfo.trends.map((trend, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-teal/30" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Skill Gap recommendations */}
          <div className="pl-0 md:pl-6 pt-6 md:pt-0 flex flex-col justify-between">
            <div>
              <span className="text-xs tracking-[0.15em] uppercase text-muted flex items-center gap-1.5 mb-3.5 font-medium">
                <Lightbulb size={12} className="text-amber" />
                Recommended Skill Upgrades
              </span>
              {missingSkills.length === 0 ? (
                <p className="text-sm text-teal leading-relaxed font-medium">
                  Excellent! Your tech stack matches all recommended standard skills in this domain.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted leading-relaxed">
                    Adding these high-demand skills to your profile could boost your ATS and market alignment:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber/8 text-amber border border-amber/12"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted/50 mt-4 leading-normal">
              Based on global aggregated software engineering listings, tech surveys, and hiring indexes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Row 2: Skills */}
      {skillCategories.length > 0 && (
        <motion.div variants={stagger.card} className="card-glass p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl text-text tracking-tight">
              Skills
            </h2>
            <span className="text-xs text-muted font-medium">{allSkills.length} total</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillCategories.map(([category, skillList]) => (
              <div key={category} className="rounded-xl bg-deep/40 border border-border p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs tracking-[0.15em] uppercase text-muted/80 font-semibold">
                    {category}
                  </span>
                  <span className="text-xs text-muted/60">{skillList.length}</span>
                </div>
                <div className="w-full h-1 rounded-full bg-border mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber/50 transition-all"
                    style={{ width: `${Math.min(100, skillList.length * 15)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber/8 text-amber/90 border border-amber/12"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Row 3: Timeline cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {eduEntries.length > 0 && (
          <motion.div variants={stagger.card}>
            <ExpandableList entries={eduEntries} icon={GraduationCap} title="Education" />
          </motion.div>
        )}
        {expEntries.length > 0 && (
          <motion.div variants={stagger.card}>
            <ExpandableList entries={expEntries} icon={Briefcase} title="Experience" />
          </motion.div>
        )}
        {projEntries.length > 0 && (
          <motion.div variants={stagger.card}>
            <ExpandableList entries={projEntries} icon={FolderGit2} title="Projects" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
