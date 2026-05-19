import { motion } from "framer-motion";
import { Coins, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Skill } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

interface UserCardProps {
  skill: Skill;
}

const CATEGORY_COLORS: Record<string, "teal" | "navy" | "gold" | "purple" | "rose" | "muted"> = {
  Design: "purple",
  Dev: "teal",
  AI: "navy",
  Writing: "gold",
  Music: "rose",
  Marketing: "teal",
  Other: "muted",
};

export function UserCard({ skill }: UserCardProps) {
  const color = CATEGORY_COLORS[skill.category] ?? "muted";

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-border rounded-2xl p-6 shadow-card flex flex-col items-center text-center gap-4 h-full hover:border-teal/40 hover:shadow-soft transition-[border-color,box-shadow] relative"
    >
      <Avatar initials={skill.userAvatar} size="lg" ring />
      <div>
        <h3 className="font-bold text-lg text-navy">{skill.userName}</h3>
        <p className="text-sm text-muted mt-1 line-clamp-1">{skill.title}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant={color}>{skill.category}</Badge>
        </div>
      </div>
      <span className="font-bold text-teal flex items-center gap-1.5 text-sm bg-teal/10 px-3 py-1.5 rounded-full">
        <Coins size={14} />
        {skill.tokenRate} tokens
      </span>
      <Link to={`/profile/${skill.userId}`} className="w-full">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-navy text-on-hero rounded-xl py-2.5 text-sm font-semibold hover:bg-navy-light transition-colors"
        >
          View profile <ExternalLink size={14} />
        </button>
      </Link>
    </motion.div>
  );
}
