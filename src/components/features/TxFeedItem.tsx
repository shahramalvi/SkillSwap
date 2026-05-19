import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Transaction } from "../../types";
import { formatRelativeTime } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../ui/Avatar";

interface TxFeedItemProps {
  transaction: Transaction;
  onComplete?: (id: string) => void;
}

const STATUS_ICON = {
  completed: CheckCircle,
  pending: Clock,
  disputed: AlertCircle,
};

const STATUS_COLOR = {
  completed: "text-teal",
  pending: "text-gold",
  disputed: "text-rose",
};

export function TxFeedItem({ transaction, onComplete }: TxFeedItemProps) {
  const currentUserId = useAuthStore((s) => s.user?.uid);
  const isIncoming = transaction.receiverId === currentUserId;
  const otherName = isIncoming ? transaction.senderName : transaction.receiverName;
  const initials = otherName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const StatusIcon = STATUS_ICON[transaction.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl hover:border-teal/30 transition-colors group"
    >
      <div className="relative">
        <Avatar initials={initials} size="md" />
        <div className={`absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 ${isIncoming ? "bg-teal" : "bg-rose"}`}>
          {isIncoming
            ? <ArrowDownLeft size={10} className="text-on-hero" />
            : <ArrowUpRight size={10} className="text-on-hero" />
          }
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy truncate">{transaction.description}</p>
        <p className="text-xs text-muted mt-0.5">
          {isIncoming ? "from" : "to"} <span className="font-medium">{otherName}</span>
          {" · "}{formatRelativeTime(transaction.createdAt.toDate())}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`font-bold text-sm tabular-nums ${isIncoming ? "text-teal" : "text-rose"}`}>
          {isIncoming ? "+" : "−"}{transaction.tokens}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium ${STATUS_COLOR[transaction.status]}`}>
          <StatusIcon size={11} />
          {transaction.status}
        </span>
      </div>

      {onComplete && isIncoming && transaction.status === "pending" && (
        <button
          type="button"
          onClick={() => onComplete(transaction.id)}
          className="ml-1 px-3 py-1.5 text-xs font-semibold bg-teal text-navy rounded-lg hover:bg-teal-dark transition-colors opacity-0 group-hover:opacity-100"
        >
          Complete
        </button>
      )}
    </motion.div>
  );
}
