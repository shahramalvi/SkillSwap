import { motion } from "framer-motion";
import { ExternalLink, Handshake, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { isDemoSkill } from "../../lib/dashboardDemoData";
import { formatRelativeTime } from "../../lib/utils";
import type { Skill } from "../../types";
import { normalizeSkill } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

const CATEGORY_COLORS: Record<string, "teal" | "navy" | "gold" | "purple" | "rose" | "muted"> = {
  Design: "purple",
  Dev: "teal",
  AI: "navy",
  Writing: "gold",
  Music: "rose",
  Marketing: "teal",
  Other: "muted",
};

interface JobCardProps {
  skill: Skill;
}

export function JobCard({ skill }: JobCardProps) {
  const s = normalizeSkill(skill);
  const color = CATEGORY_COLORS[s.category] ?? "muted";
  const isDemo = isDemoSkill(s.id);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-white rounded-3xl p-5 shadow-card flex flex-col h-full w-full min-w-0 overflow-hidden hover:border-teal/30 transition-[border-color,box-shadow]"
    >
      <div className="flex flex-wrap items-start gap-2 mb-3">
        <Badge variant={color}>{s.category}</Badge>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <span className="text-[10px] font-bold uppercase tracking-wide bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0">
            <Handshake size={10} /> Barter
          </span>
          {isDemo && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-muted px-2 py-0.5 rounded-full shrink-0">
              Sample
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-lg text-navy mb-1 leading-snug break-words line-clamp-2">
        {s.title}
      </h3>
      <p className="text-sm text-muted mb-3 line-clamp-3 leading-relaxed flex-1 break-words">
        {s.description}
      </p>

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

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-auto">
        <Link
          to={`/profile/${s.userId}`}
          className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
        >
          <Avatar initials={s.userAvatar} size="sm" />
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-navy truncate">{s.userName}</p>
            <p className="text-xs text-muted">
              Posted {formatRelativeTime(s.createdAt.toDate())}
            </p>
          </div>
        </Link>
        <Link
          to={`/profile/${s.userId}`}
          className="shrink-0 flex items-center gap-1.5 bg-navy text-on-hero rounded-xl px-3 py-2 text-xs font-semibold hover:bg-navy-light transition-colors"
        >
          View <ExternalLink size={12} />
        </Link>
      </div>
    </motion.div>
  );
}
