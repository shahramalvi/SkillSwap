import { motion } from "framer-motion";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { UserCard } from "../components/features/UserCard";
import { Skeleton } from "../components/ui/Skeleton";
import { useSkills } from "../hooks/useSkills";
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "../types";
import { cn } from "../lib/utils";

const categories: (SkillCategory | "All")[] = ["All", ...SKILL_CATEGORIES];

const CATEGORY_BG: Record<string, string> = {
  All: "bg-slate-100 text-slate-600",
  Design: "bg-purple/10 text-purple",
  Dev: "bg-teal/10 text-teal-dark",
  AI: "bg-navy/10 text-navy",
  Writing: "bg-gold-light text-navy",
  Music: "bg-rose-light text-rose",
  Marketing: "bg-teal/10 text-teal-dark",
  Other: "bg-slate-100 text-slate-600",
};

export function Search() {
  const { subscribeAllSkills } = useSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SkillCategory | "All">("All");
  const [tokenRange, setTokenRange] = useState(500);

  useEffect(() => {
    const unsub = subscribeAllSkills(
      { search, category, minTokens: 10, maxTokens: tokenRange },
      (results) => { setSkills(results); setLoading(false); },
    );
    return unsub;
  }, [subscribeAllSkills, search, category, tokenRange]);

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      {/* Header */}
      <div className="bg-hero-gradient pt-24 pb-10 dot-pattern">
        <Container className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-on-hero mb-6">Find skills</h1>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-hero-muted" size={18} />
              <input
                type="text"
                placeholder="Search by skill title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass text-on-hero placeholder:text-teal/50 pl-12 pr-4 py-3.5 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-teal/50"
              />
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="pt-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 bg-white rounded-2xl border border-border shadow-card p-4 mb-6 flex flex-wrap items-center gap-3"
        >
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
                    ? "bg-navy text-on-hero shadow-none"
                    : cn(CATEGORY_BG[cat] ?? "bg-slate-100 text-slate-600", "hover:brightness-95"),
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 min-w-48">
            <span className="text-xs text-muted shrink-0">Max:</span>
            <input
              type="range" min={10} max={500} value={tokenRange}
              onChange={(e) => setTokenRange(Number(e.target.value))}
              className="flex-1 accent-teal"
            />
            <span className="text-xs font-bold text-teal w-8 shrink-0">{tokenRange}</span>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-28">
            <SearchIcon size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-navy mb-2">No matches found</p>
            <p className="text-sm text-muted">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            {skills.map((skill) => <UserCard key={skill.id} skill={skill} />)}
          </motion.div>
        )}
      </Container>
    </PageWrapper>
  );
}
