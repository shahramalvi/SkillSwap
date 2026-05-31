import { Lock, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useConversations } from "../hooks/useConversations";
import { useAuthStore } from "../store/authStore";
import { formatRelativeTime } from "../lib/utils";
import { AppPage } from "../components/layout/AppPage";
import { Badge } from "../components/ui/Badge";

export function Messages() {
  const user = useAuthStore((s) => s.user);
  const { conversations, loading } = useConversations();

  return (
    <AppPage>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Messages</h2>
          <p className="text-sm text-muted">Chats for your barter requests</p>
        </div>
        <MessageSquare size={20} className="text-muted shrink-0" />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-white shadow-card p-8 text-center">
          <MessageSquare size={32} className="mx-auto text-muted mb-3" />
          <p className="font-semibold text-navy">No conversations yet</p>
          <p className="text-sm text-muted mt-1">
            Send a barter request from a job profile to open a chat with the provider.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-4 text-sm font-semibold text-teal-dark hover:underline"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {conversations.map((c) => {
            const unread =
              user?.uid === c.requesterId
                ? c.requesterUnread
                : user?.uid === c.providerId
                  ? c.providerUnread
                  : 0;
            const otherName =
              user?.uid === c.requesterId ? c.providerName : c.requesterName;

            return (
              <li key={c.id}>
                <Link
                  to={`/chat/${c.id}`}
                  className="block bg-white rounded-2xl border border-white shadow-card p-4 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy truncate">{c.skillTitle}</p>
                      <p className="text-xs text-muted mt-0.5">with {otherName}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {c.lastMessageText || "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] text-muted">
                        {formatRelativeTime(c.lastMessageAt.toDate())}
                      </span>
                      {unread > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-teal text-white text-[10px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                      <Badge variant={c.locked ? "muted" : "navy"}>{c.exchangeStatus}</Badge>
                      {c.locked && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                          <Lock size={10} /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppPage>
  );
}
