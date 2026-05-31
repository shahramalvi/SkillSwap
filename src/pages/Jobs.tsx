import { motion } from "framer-motion";
import { Briefcase, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { DemoDataBanner } from "../components/features/DemoDataBanner";
import { JobCard } from "../components/features/JobCard";
import { AppAsidePanel, AppPage, AppPageSplit, AppPanel } from "../components/layout/AppPage";
import { Skeleton } from "../components/ui/Skeleton";
import { useBrowseSkillsData } from "../hooks/useBrowseSkillsData";
import { cn } from "../lib/utils";
import { SKILL_CATEGORIES, type SkillCategory } from "../types";

const categories: (SkillCategory | "All")[] = ["All", ...SKILL_CATEGORIES];

const CATEGORY_BG: Record<string, string> = {
  All: "bg-surface2 text-muted",
  Design: "bg-purple/10 text-purple",
  Dev: "bg-teal/10 text-teal-dark",
  AI: "bg-navy/10 text-navy",
  Writing: "bg-gold-light text-navy",
  Music: "bg-rose-light text-rose",
  Marketing: "bg-teal/10 text-teal-dark",
  Other: "bg-surface2 text-muted",
};

export function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SkillCategory | "All">("All");

  const filters = useMemo(() => ({ search, category }), [search, category]);
  const { loading, displaySkills, isDemo } = useBrowseSkillsData(filters);

  return (
    <AppPage>
      {isDemo && (
        <DemoDataBanner message="Sample job listings from Karachi members — post your skill or wait for real listings to appear." />
      )}

      <AppPageSplit
        aside={
          <AppAsidePanel title="Category">
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold rounded-2xl transition-all text-left",
                    category === cat
                      ? "bg-navy text-on-hero"
                      : cn(CATEGORY_BG[cat] ?? "bg-surface2 text-muted", "hover:brightness-95"),
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {(!loading || isDemo) && (
              <p className="text-xs text-muted font-medium mt-4 pt-4 border-t border-border/50">
                {displaySkills.length} {displaySkills.length === 1 ? "job" : "jobs"} found
              </p>
            )}
          </AppAsidePanel>
        }
        main={
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm text-muted">Find skills to barter for</p>
              <div className="relative mt-3">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search jobs by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white text-navy placeholder:text-slate-400 pl-12 pr-4 py-3.5 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-teal/30 shadow-card"
                />
              </div>
            </motion.div>

            <AppPanel className="p-4 flex flex-wrap items-center gap-3 lg:hidden">
              <SlidersHorizontal size={16} className="text-muted shrink-0" />
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-full transition-all",
                      category === cat
                        ? "bg-navy text-on-hero"
                        : cn(CATEGORY_BG[cat] ?? "bg-surface2 text-muted", "hover:brightness-95"),
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </AppPanel>

            {loading && !isDemo ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-3xl" />
                ))}
              </div>
            ) : displaySkills.length === 0 ? (
              <AppPanel className="p-12 text-center">
                <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-xl font-bold text-navy mb-2">No jobs found</p>
                <p className="text-sm text-muted">
                  {search || category !== "All"
                    ? "Try adjusting your search or filters"
                    : "No one has posted a job yet. Be the first!"}
                </p>
              </AppPanel>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start"
              >
                {displaySkills.map((job) => (
                  <div key={job.id} className="min-w-0">
                    <JobCard skill={job} />
                  </div>
                ))}
              </motion.div>
            )}
          </>
        }
      />
    </AppPage>
  );
}
