import { motion } from "framer-motion";
import { Handshake, Link2, Tag } from "lucide-react";
import type { Skill } from "../../types";
import { normalizeSkill } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const CATEGORY_COLORS: Record<string, "teal" | "navy" | "gold" | "purple" | "rose" | "muted"> = {
  Design: "purple",
  Dev: "teal",
  AI: "navy",
  Writing: "gold",
  Music: "rose",
  Marketing: "teal",
  Other: "muted",
};

interface SkillCardProps {
  skill: Skill;
  onRequest?: () => void;
  showRequest?: boolean;
}

export function SkillCard({ skill, onRequest, showRequest }: SkillCardProps) {
  const s = normalizeSkill(skill);
  const color = CATEGORY_COLORS[s.category] ?? "muted";

  return (
    <motion.div
      transition={{ duration: 0.2 }}
      className="bg-white border border-white rounded-3xl p-5 shadow-card relative group cursor-default h-full w-full min-w-0 overflow-hidden flex flex-col hover:border-teal/30 transition-[border-color,box-shadow]"
    >
      <div className="flex flex-wrap items-start gap-2 mb-3">
        <Badge variant={color}>{s.category}</Badge>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0">
          <Handshake size={10} /> Barter
        </span>
      </div>

      <h3 className="font-bold text-lg text-navy mb-1 leading-snug break-words line-clamp-2">
        {s.title}
      </h3>
      <p className="text-sm text-muted mb-3 line-clamp-2 leading-relaxed break-words">{s.description}</p>

      {s.projectLinks.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-3 min-w-0">
          {s.projectLinks.slice(0, 2).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-teal hover:underline inline-flex items-center gap-1 min-w-0 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 size={10} className="shrink-0" />
              <span className="truncate">{link.title}</span>
            </a>
          ))}
        </div>
      )}

      {s.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 min-w-0">
          {s.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-muted bg-slate-100 rounded-full px-2 py-0.5 max-w-full min-w-0"
            >
              <Tag size={10} className="shrink-0" />
              <span className="truncate">{tag}</span>
            </span>
          ))}
        </div>
      )}

      {showRequest && onRequest && (
        <Button variant="secondary" fullWidth size="sm" onClick={onRequest} className="mt-auto shrink-0">
          Propose barter
        </Button>
      )}
    </motion.div>
  );
}
