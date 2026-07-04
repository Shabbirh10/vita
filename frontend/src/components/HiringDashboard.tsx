"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  SlidersHorizontal,
  Award,
  Users,
  Target,
  Sparkles,
  X,
} from "lucide-react";
import axios from "axios";
import ResumeResults from "./ResumeResults";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  skills: any; // dict or list
  education: any[];
  experience: any[];
  projects: any[];
  ats_score: number;
  ats_breakdown: any;
  uploaded_at: string;
}

interface HiringDashboardProps {
  initialCandidates: Candidate[];
  onRefresh: () => Promise<void>;
}

export default function HiringDashboard({
  initialCandidates,
  onRefresh,
}: HiringDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetSkills, setTargetSkills] = useState("");
  const [selectedScoreFilter, setSelectedScoreFilter] = useState("all"); // all, high (75+), mid (50-74), low (<50)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Sync state if initialCandidates change
  useMemo(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    setIsDeletingId(id);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/resumes/${id}/`);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      await onRefresh();
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      alert("Failed to delete candidate.");
    } finally {
      setIsDeletingId(null);
    }
  };

  // Helper: Normalize skills to a flat array of lowercase strings
  const getFlatSkills = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.map((s) => s.toLowerCase());
    }
    if (typeof skills === "object") {
      return Object.values(skills)
        .flat()
        .map((s: any) => String(s).toLowerCase());
    }
    return [];
  };

  // Helper: Extract human-readable skills for display
  const getDisplaySkills = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "object") {
      return Object.values(skills).flat() as string[];
    }
    return [];
  };

  // Compute stats across all candidates
  const stats = useMemo(() => {
    if (candidates.length === 0) {
      return {
        total: 0,
        avgAts: 0,
        highFitPercent: 0,
        topSkillCategory: "N/A",
      };
    }

    const total = candidates.length;
    const sumAts = candidates.reduce((sum, c) => sum + (c.ats_score || 0), 0);
    const avgAts = Math.round(sumAts / total);

    const highFits = candidates.filter((c) => (c.ats_score || 0) >= 75).length;
    const highFitPercent = Math.round((highFits / total) * 100);

    // Compute distribution of skill categories
    const categoryCounts: Record<string, number> = {};
    candidates.forEach((c) => {
      if (c.skills && typeof c.skills === "object" && !Array.isArray(c.skills)) {
        Object.entries(c.skills).forEach(([cat, list]) => {
          if (Array.isArray(list) && list.length > 0) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + list.length;
          }
        });
      }
    });

    let topSkillCategory = "N/A";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topSkillCategory = cat;
      }
    });

    return { total, avgAts, highFitPercent, topSkillCategory };
  }, [candidates]);

  // Compute skill category distribution for Recharts
  const chartData = useMemo(() => {
    const categoryCounts: Record<string, number> = {
      Languages: 0,
      Frontend: 0,
      Backend: 0,
      "Data & AI": 0,
      Databases: 0,
      "DevOps & Cloud": 0,
      Tools: 0,
    };

    candidates.forEach((c) => {
      if (c.skills && typeof c.skills === "object" && !Array.isArray(c.skills)) {
        Object.entries(c.skills).forEach(([cat, list]) => {
          if (Array.isArray(list)) {
            // map database names to chart categories if needed
            const mappedCat = cat === "DevOps" || cat === "Cloud" ? "DevOps & Cloud"
              : cat === "Data" || cat === "AI/ML" ? "Data & AI"
              : cat;
            if (mappedCat in categoryCounts) {
              categoryCounts[mappedCat] += list.length;
            } else {
              categoryCounts[mappedCat] = (categoryCounts[mappedCat] || 0) + list.length;
            }
          }
        });
      } else if (c.skills && Array.isArray(c.skills)) {
        // Fallback for simple flat lists
        categoryCounts["Languages"] = (categoryCounts["Languages"] || 0) + c.skills.length;
      }
    });

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [candidates]);

  // Compute dynamic match scores based on recruiter's input
  const processedCandidates = useMemo(() => {
    const targetQueries = targetSkills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    return candidates.map((c) => {
      let matchScore = 0;
      if (targetQueries.length > 0) {
        const flatSkills = getFlatSkills(c.skills);
        const matches = targetQueries.filter((query) =>
          flatSkills.some((s) => s.includes(query) || query.includes(s))
        );
        matchScore = Math.round((matches.length / targetQueries.length) * 100);
      }

      // Determine top category
      let topCategory = "General";
      if (c.skills && typeof c.skills === "object" && !Array.isArray(c.skills)) {
        let maxCount = 0;
        Object.entries(c.skills).forEach(([cat, list]) => {
          if (Array.isArray(list) && list.length > maxCount) {
            maxCount = list.length;
            topCategory = cat;
          }
        });
      }

      return {
        ...c,
        matchScore,
        topCategory,
      };
    });
  }, [candidates, targetSkills]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return processedCandidates.filter((c) => {
      // 1. Search Query (Name, Email, Skills)
      const nameMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const flatSkills = getFlatSkills(c.skills);
      const skillsMatch = flatSkills.some((s) =>
        s.includes(searchQuery.toLowerCase())
      );
      const searchMatch = !searchQuery || nameMatch || emailMatch || skillsMatch;

      // 2. ATS Score Filter
      let scoreMatch = true;
      if (selectedScoreFilter === "high") scoreMatch = c.ats_score >= 75;
      else if (selectedScoreFilter === "mid") scoreMatch = c.ats_score >= 50 && c.ats_score < 75;
      else if (selectedScoreFilter === "low") scoreMatch = c.ats_score < 50;

      // 3. Category Filter
      let categoryMatch = true;
      if (selectedCategoryFilter !== "all") {
        if (c.skills && typeof c.skills === "object" && !Array.isArray(c.skills)) {
          categoryMatch = !!(c.skills[selectedCategoryFilter] && c.skills[selectedCategoryFilter].length > 0);
        } else {
          categoryMatch = false;
        }
      }

      return searchMatch && scoreMatch && categoryMatch;
    }).sort((a, b) => {
      // Sort by Match Score first (if queries active), then ATS Score
      if (targetSkills.trim() !== "") {
        return b.matchScore - a.matchScore || b.ats_score - a.ats_score;
      }
      return b.ats_score - a.ats_score;
    });
  }, [processedCandidates, searchQuery, selectedScoreFilter, selectedCategoryFilter, targetSkills]);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Dashboard Grid Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-glass rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
            <Users size={20} className="text-amber" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">Total Candidates</span>
            <p className="text-2xl text-text font-[family-name:var(--font-heading)] mt-0.5 font-bold">
              {stats.total}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-glass rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
            <Award size={20} className="text-teal" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">Avg ATS Score</span>
            <p className="text-2xl text-text font-[family-name:var(--font-heading)] mt-0.5 font-bold">
              {stats.avgAts}%
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-glass rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
            <Target size={20} className="text-amber" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">High Matches (&gt;75)</span>
            <p className="text-2xl text-text font-[family-name:var(--font-heading)] mt-0.5 font-bold">
              {stats.highFitPercent}%
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card-glass rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-rose/10 border border-rose/20 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-rose" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">Top Pipeline Skill</span>
            <p className="text-lg text-text font-medium truncate max-w-[150px] mt-1.5">
              {stats.topSkillCategory}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Charts & Target Job Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart of Skill Category counts */}
        <div className="card-glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-[family-name:var(--font-heading)] text-base text-text mb-5 tracking-tight flex items-center gap-2">
            <span>Skill Inventory Breakdown</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#9E9A90", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9E9A90", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(200, 157, 83, 0.02)" }}
                  contentStyle={{
                    background: "#161512",
                    border: "1px solid rgba(200, 157, 83, 0.12)",
                    borderRadius: "12px",
                    color: "#F4F1EA",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#C89D53" : "#4F7962"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Skill Matcher Input */}
        <div className="card-glass rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-base text-text mb-2 tracking-tight flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-amber" />
              <span>Target Role Matching</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-5">
              Enter the core skills required for your opening (comma-separated). Candidates will be ranked dynamically by match percentage.
            </p>
            <div className="relative">
              <textarea
                placeholder="e.g. Python, React, PostgreSQL, Docker"
                value={targetSkills}
                onChange={(e) => setTargetSkills(e.target.value)}
                className="w-full h-24 bg-deep/60 border border-border rounded-xl p-3 text-xs text-text placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition-colors resize-none"
              />
              {targetSkills && (
                <button
                  onClick={() => setTargetSkills("")}
                  className="absolute top-2 right-2 text-muted hover:text-text transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {targetSkills.trim() !== "" && (
            <div className="mt-4 px-3 py-2.5 rounded-xl bg-amber/5 border border-amber/10 text-[11px] text-amber/80 leading-relaxed">
              <strong>Ranking active:</strong> Candidate directory is now sorted by matching skill overlap percentage.
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Filters + Candidate Table */}
      <div className="card-glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="font-[family-name:var(--font-heading)] text-lg text-text tracking-tight">
            Candidate Directory
          </h3>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search candidate, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-deep/60 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition-colors"
              />
            </div>

            {/* ATS Score Filter */}
            <div className="flex items-center gap-1.5 bg-deep/60 border border-border rounded-xl px-3 py-2">
              <Filter size={11} className="text-muted" />
              <select
                value={selectedScoreFilter}
                onChange={(e) => setSelectedScoreFilter(e.target.value)}
                className="bg-transparent text-xs text-text border-none focus:outline-none cursor-pointer text-text"
              >
                <option value="all" className="bg-surface text-text">All Scores</option>
                <option value="high" className="bg-surface text-text">High Fit (75%+)</option>
                <option value="mid" className="bg-surface text-text">Mid Fit (50-74)</option>
                <option value="low" className="bg-surface text-text">Low Fit (&lt;50)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-deep/60 border border-border rounded-xl px-3 py-2">
              <Filter size={11} className="text-muted" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-text border-none focus:outline-none cursor-pointer text-text"
              >
                <option value="all" className="bg-surface text-text">All Roles</option>
                <option value="Languages" className="bg-surface text-text">Languages</option>
                <option value="Frontend" className="bg-surface text-text">Frontend</option>
                <option value="Backend" className="bg-surface text-text">Backend</option>
                <option value="Data & AI" className="bg-surface text-text">Data & AI</option>
                <option value="Databases" className="bg-surface text-text">Databases</option>
                <option value="DevOps & Cloud" className="bg-surface text-text">DevOps & Cloud</option>
                <option value="Tools" className="bg-surface text-text">Tools</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto w-full">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted">
              No candidates match the filter criteria.
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[10px] tracking-[0.12em] uppercase text-muted">
                  <th className="pb-3.5 pl-2 font-semibold">Candidate</th>
                  <th className="pb-3.5 font-semibold">Primary Category</th>
                  <th className="pb-3.5 font-semibold">ATS Score</th>
                  {targetSkills.trim() !== "" && <th className="pb-3.5 font-semibold text-amber">Match Score</th>}
                  <th className="pb-3.5 font-semibold">Top Skills</th>
                  <th className="pb-3.5 font-semibold text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredCandidates.map((c) => {
                  const displaySkills = getDisplaySkills(c.skills).slice(0, 4);
                  return (
                    <tr key={c.id} className="hover:bg-text/[0.015] transition-colors">
                      <td className="py-4 pl-2 font-medium">
                        <div className="flex flex-col">
                          <span className="text-text text-sm font-semibold">{c.name || "Unknown"}</span>
                          <span className="text-[10px] text-muted mt-0.5">{c.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted font-medium">{c.topCategory}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border
                            ${c.ats_score >= 75
                              ? "bg-teal/10 text-teal border-teal/20"
                              : c.ats_score >= 50
                              ? "bg-amber/10 text-amber border-amber/20"
                              : "bg-rose/10 text-rose border-rose/20"
                            }`}
                        >
                          {c.ats_score}%
                        </span>
                      </td>
                      {targetSkills.trim() !== "" && (
                        <td className="py-4 text-sm font-semibold text-amber">
                          {c.matchScore}%
                        </td>
                      )}
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {displaySkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-md text-[10px] bg-text/5 text-muted border border-border"
                            >
                              {s}
                            </span>
                          ))}
                          {getDisplaySkills(c.skills).length > 4 && (
                            <span className="text-[10px] text-muted/60 pl-1 mt-1">
                              +{getDisplaySkills(c.skills).length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="w-7 h-7 rounded-lg bg-text/5 hover:bg-amber/10 border border-border hover:border-amber/20 flex items-center justify-center text-muted hover:text-amber transition-all"
                            title="View Analysis"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isDeletingId === c.id}
                            className="w-7 h-7 rounded-lg bg-text/5 hover:bg-rose/10 border border-border hover:border-rose/20 flex items-center justify-center text-muted hover:text-rose transition-all disabled:opacity-50"
                            title="Delete Profile"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-deep/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto card-glass rounded-2xl border border-border p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-text/5 hover:bg-text/10 flex items-center justify-center border border-border text-muted hover:text-text transition-all"
              >
                <X size={15} />
              </button>

              <div className="mb-6 flex flex-col">
                <span className="text-[10px] tracking-[0.2em] uppercase text-amber font-semibold">Candidate File Profile</span>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl text-text mt-1">
                  Analysis for {selectedCandidate.name || "Unknown"}
                </h2>
              </div>

              <div className="w-full">
                <ResumeResults data={selectedCandidate} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
