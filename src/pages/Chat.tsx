import { Lock, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useConversation, useChatMessages, useConversations } from "../hooks/useConversations";
import { useExchangeRequest, useExchangeRequests } from "../hooks/useExchangeRequests";
import { useNotifications } from "../hooks/useNotifications";
import { useAuthStore } from "../store/authStore";
import { formatRelativeTime } from "../lib/utils";
import { AppPage } from "../components/layout/AppPage";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export function Chat() {
  const { requestId } = useParams<{ requestId: string }>();
  const user = useAuthStore((s) => s.user);
  const { conversation, loading: convLoading } = useConversation(requestId);
  const { messages, loading: msgLoading } = useChatMessages(requestId);
  const { sendMessage, markRead } = useConversations();
  const { request: exchangeRequest } = useExchangeRequest(requestId);
  const { acceptExchangeRequest, completeExchangeRequest, canAccept } = useExchangeRequests();
  const { markChatNotificationsRead } = useNotifications();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requestId || !user) return;
    void markRead(requestId);
    void markChatNotificationsRead(requestId);
  }, [requestId, user, markRead, markChatNotificationsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (convLoading || msgLoading) {
    return (
      <AppPage showBack backTo="/messages">
        <p className="text-muted text-sm">Loading chat...</p>
      </AppPage>
    );
  }

  if (!conversation || !user) {
    return (
      <AppPage showBack backTo="/messages">
        <p className="text-muted">Conversation not found or you do not have access.</p>
        <Link to="/messages" className="text-teal-dark text-sm font-semibold">
          Back to messages
        </Link>
      </AppPage>
    );
  }

  const isRequester = user.uid === conversation.requesterId;
  const otherName = isRequester ? conversation.providerName : conversation.requesterName;
  const myMarkedComplete = isRequester
    ? conversation.requesterMarkedComplete
    : conversation.providerMarkedComplete;
  const canComplete =
    conversation.exchangeStatus === "accepted" && !conversation.locked && !myMarkedComplete;
  const mayAccept = user && exchangeRequest ? canAccept(exchangeRequest, user.uid) : false;

  const handleAccept = async () => {
    if (!requestId) return;
    setAccepting(true);
    try {
      await acceptExchangeRequest(requestId);
      toast.success("Barter accepted");
    } catch (err) {
      toast.error((err as Error).message || "Could not accept");
    } finally {
      setAccepting(false);
    }
  };

  const handleSend = async () => {
    if (!requestId || !text.trim() || conversation.locked) return;
    setSending(true);
    try {
      await sendMessage(requestId, text);
      setText("");
    } catch (err) {
      toast.error((err as Error).message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    if (!requestId) return;
    setCompleting(true);
    try {
      await completeExchangeRequest(requestId);
      toast.success(
        conversation.requesterMarkedComplete !== conversation.providerMarkedComplete
          ? "Marked complete — waiting for the other party"
          : "Barter complete — chat locked",
      );
    } catch (err) {
      toast.error((err as Error).message || "Could not mark complete");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <AppPage showBack backTo="/messages" className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-white shadow-card overflow-hidden flex flex-col min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-10rem)]">
        <div className="px-4 sm:px-5 py-4 border-b border-border flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-navy truncate">{conversation.skillTitle}</p>
            <p className="text-xs text-muted mt-0.5">Chat with {otherName}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={conversation.locked ? "muted" : "teal"}>
              {conversation.exchangeStatus}
            </Badge>
            {conversation.locked && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Lock size={12} /> Locked
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => {
              const mine = msg.senderId === user.uid;
              const system = msg.system || msg.senderId === "system";
              if (system) {
                return (
                  <div
                    key={msg.id}
                    className="text-center text-xs text-muted bg-white border border-dashed border-border rounded-xl px-3 py-2 max-w-md mx-auto"
                  >
                    {msg.text}
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? "bg-navy text-white rounded-br-md"
                        : "bg-white border border-border text-navy rounded-bl-md"
                    }`}
                  >
                    {!mine && (
                      <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.senderName}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${mine ? "text-white/60" : "text-muted"}`}
                    >
                      {formatRelativeTime(msg.createdAt.toDate())}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4 space-y-3 bg-white">
          {mayAccept && !conversation.locked && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              disabled={accepting}
              onClick={() => void handleAccept()}
            >
              {accepting ? "Accepting..." : "Accept barter"}
            </Button>
          )}
          {canComplete && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              disabled={completing}
              onClick={() => void handleComplete()}
            >
              {completing ? "Saving..." : "Mark barter complete"}
            </Button>
          )}
          {myMarkedComplete && !conversation.locked && (
            <p className="text-xs text-center text-muted">
              You marked complete — waiting for {otherName} to confirm
            </p>
          )}
          {conversation.locked && (
            <p className="text-xs text-center text-muted flex items-center justify-center gap-1">
              <Lock size={12} /> This chat is locked. Request each other&apos;s jobs again to start
              a new conversation.
            </p>
          )}

          {!conversation.locked ? (
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Type a message..."
                className="flex-1 resize-none border border-border rounded-xl px-3 py-2 text-sm focus:border-teal focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button
                variant="primary"
                size="sm"
                disabled={sending || !text.trim()}
                onClick={() => void handleSend()}
                className="self-end px-3"
              >
                <Send size={16} />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </AppPage>
  );
}
