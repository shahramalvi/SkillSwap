import { motion } from "framer-motion";
import { Coins, Handshake, Link2, Tag } from "lucide-react";
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
      className="bg-white border border-border rounded-2xl p-5 shadow-card relative group cursor-default h-full hover:border-teal/40 hover:shadow-soft transition-[border-color,box-shadow]"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant={color}>{s.category}</Badge>
        <span className="font-extrabold text-teal flex items-center gap-1 text-sm bg-teal/10 px-2.5 py-1 rounded-full">
          <Coins size={13} />
          {s.tokenRate}
        </span>
      </div>

      <h3 className="font-bold text-lg text-navy mb-1 leading-snug">{s.title}</h3>
      <p className="text-sm text-muted mb-3 line-clamp-2 leading-relaxed">{s.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {s.acceptsTokens && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-navy/10 text-navy px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
            <Coins size={10} /> Tokens
          </span>
        )}
        {s.acceptsBarter && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
            <Handshake size={10} /> Barter
          </span>
        )}
      </div>

      {s.projectLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {s.projectLinks.slice(0, 2).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-teal hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 size={10} />
              {link.title}
            </a>
          ))}
        </div>
      )}

      {s.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {s.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-muted bg-slate-100 rounded-full px-2 py-0.5"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {showRequest && onRequest && (
        <Button variant="secondary" fullWidth size="sm" onClick={onRequest}>
          Request service
        </Button>
      )}
    </motion.div>
  );
}
