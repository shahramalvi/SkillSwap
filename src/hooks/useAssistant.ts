import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendAssistantChat, type ChatMessage } from "../lib/assistant/aiClient";
import {
  buildAssistantSystemPrompt,
  findPageByPath,
  type AssistantContext,
} from "../lib/assistant/pageIndex";
import { parseAssistantReply } from "../lib/assistant/parseResponse";
import { useAuthStore } from "../store/authStore";
import { useAssistantStore } from "../store/assistantStore";
import { useSubscription } from "./useSubscription";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  navigateTo?: string | null;
  navigateLabel?: string | null;
}

const STARTER_PROMPTS = [
  "How do I post a skill?",
  "Where are my incoming requests?",
  "What subscription plans are available?",
  "How does barter work on SkillSwap?",
];

let messageCounter = 0;
function nextId() {
  messageCounter += 1;
  return `msg-${messageCounter}-${Date.now()}`;
}

export function useAssistant() {
  const user = useAuthStore((s) => s.user);
  const { info } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  const open = useAssistantStore((s) => s.open);
  const setOpen = useAssistantStore((s) => s.setOpen);
  const toggleOpen = useAssistantStore((s) => s.toggle);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: nextId(),
      role: "assistant",
      content:
        "Hi! I'm Swap Assistant. Ask me anything about bartering, subscriptions, or where to find features — I can guide you there.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context: AssistantContext = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      currentPath: location.pathname,
      userName: user?.name,
      subscriptionLabel: info?.label,
    }),
    [user, location.pathname, info?.label],
  );

  const navigateToPath = useCallback(
    (path: string) => {
      const page = findPageByPath(path);
      if (page?.authRequired && !user) {
        navigate("/login", { state: { from: path } });
        setOpen(false);
        return;
      }
      navigate(path);
      setOpen(false);
    },
    [navigate, user],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: AssistantMessage = { id: nextId(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history: ChatMessage[] = [
          { role: "system", content: buildAssistantSystemPrompt(context) },
          ...messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-8)
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          { role: "user", content: trimmed },
        ];

        const raw = await sendAssistantChat(history);
        const parsed = parseAssistantReply(raw);

        const assistantMsg: AssistantMessage = {
          id: nextId(),
          role: "assistant",
          content: parsed.text,
          navigateTo: parsed.navigateTo,
          navigateLabel: parsed.navigateLabel,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, context],
  );

  return {
    open,
    setOpen,
    toggleOpen,
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    navigateToPath,
    starterPrompts: STARTER_PROMPTS,
  };
}
