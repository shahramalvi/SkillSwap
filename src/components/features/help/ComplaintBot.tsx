import { motion } from "framer-motion";
import { Bot, CheckCircle2, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AppPanel } from "../../layout/AppPage";
import { Button } from "../../ui/Button";
import { useAuthStore } from "../../../store/authStore";
import { COMPLAINT_CATEGORIES, type ComplaintCategory, type CreateComplaintInput } from "../../../types";
import { cn } from "../../../lib/utils";

type BotMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

type Step =
  | "category"
  | "subject"
  | "description"
  | "related"
  | "email"
  | "confirm"
  | "done";

interface ComplaintBotProps {
  onSubmit: (input: CreateComplaintInput) => Promise<string>;
  onComplete?: () => void;
}

let msgId = 0;
function nextMsgId() {
  msgId += 1;
  return `bot-${msgId}`;
}

export function ComplaintBot({ onSubmit, onComplete }: ComplaintBotProps) {
  const user = useAuthStore((s) => s.user);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>("category");
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: nextMsgId(),
      role: "bot",
      text: "Hi, I'm the SkillSwap complaint bot. I'll ask a few questions to register your complaint. What type of issue is this?",
    },
  ]);
  const [draft, setDraft] = useState<Partial<CreateComplaintInput>>({
    email: user?.email ?? "",
  });
  const [textInput, setTextInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const pushBot = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextMsgId(), role: "bot", text }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextMsgId(), role: "user", text }]);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, step]);

  useEffect(() => {
    if (step === "subject" || step === "email") inputRef.current?.focus();
    if (step === "description" || step === "related") textareaRef.current?.focus();
  }, [step]);

  const resetFlow = () => {
    setStep("category");
    setDraft({ email: user?.email ?? "" });
    setTextInput("");
    setTicketId(null);
    setMessages([
      {
        id: nextMsgId(),
        role: "bot",
        text: "Hi, I'm the SkillSwap complaint bot. I'll ask a few questions to register your complaint. What type of issue is this?",
      },
    ]);
  };

  const handleCategory = (category: ComplaintCategory, label: string) => {
    pushUser(label);
    setDraft((d) => ({ ...d, category }));
    pushBot("Got it. Briefly describe the subject of your complaint (one line).");
    setStep("subject");
  };

  const handleSubject = () => {
    const subject = textInput.trim();
    if (subject.length < 5) {
      toast.error("Subject must be at least 5 characters");
      return;
    }
    pushUser(subject);
    setDraft((d) => ({ ...d, subject }));
    setTextInput("");
    pushBot("Please describe what happened in detail. Include dates or member names if relevant.");
    setStep("description");
  };

  const handleDescription = () => {
    const description = textInput.trim();
    if (description.length < 20) {
      toast.error("Please provide at least 20 characters");
      return;
    }
    pushUser(description);
    setDraft((d) => ({ ...d, description }));
    setTextInput("");
    pushBot(
      "Is this related to a specific exchange, member, or skill? (Optional — type details or press Skip)",
    );
    setStep("related");
  };

  const handleRelated = (skip = false) => {
    const relatedTo = skip ? undefined : textInput.trim() || undefined;
    if (!skip && relatedTo) pushUser(relatedTo);
    if (skip) pushUser("Skip");
    setDraft((d) => ({ ...d, relatedTo }));
    setTextInput("");
    pushBot(`Confirm your contact email so we can follow up.`);
    setStep("email");
    setTextInput(user?.email ?? "");
  };

  const handleEmail = () => {
    const email = textInput.trim();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    pushUser(email);
    setDraft((d) => ({ ...d, email }));
    setTextInput("");
    const catLabel = COMPLAINT_CATEGORIES.find((c) => c.id === draft.category)?.label ?? draft.category;
    pushBot(
      `Here's your summary:\n\n• Type: ${catLabel}\n• Subject: ${draft.subject}\n• Email: ${email}\n\nSubmit to register this complaint?`,
    );
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!draft.category || !draft.subject || !draft.description || !draft.email) return;

    setSubmitting(true);
    pushUser("Yes, submit my complaint");
    try {
      const registeredId = await onSubmit({
        category: draft.category,
        subject: draft.subject,
        description: draft.description,
        relatedTo: draft.relatedTo,
        email: draft.email,
      });
      setTicketId(registeredId);
      pushBot(
        `Your complaint has been registered successfully.\n\nTicket reference: ${registeredId}\n\nOur team will review it and update the status here. You can track it under Pending until it's resolved.`,
      );
      setStep("done");
      onComplete?.();
    } catch {
      pushBot("Sorry, we couldn't save your complaint. Please try again.");
      setStep("confirm");
      toast.error("Failed to register complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPanel className="flex flex-col min-h-[280px] h-[min(640px,calc(100dvh-10rem))] sm:h-[min(640px,70vh)] overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 bg-navy flex items-center gap-3 shrink-0">
        <span className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </span>
        <div>
          <p className="text-sm font-bold text-on-hero">Complaint bot</p>
          <p className="text-[11px] text-on-hero-muted">Guided complaint registration</p>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#eef1f8]/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-navy text-on-hero rounded-br-md"
                  : "bg-white border border-border text-navy shadow-sm rounded-bl-md",
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {step === "done" && ticketId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-2"
          >
            <div className="bg-teal/10 border border-teal/25 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-semibold text-teal-dark">
              <CheckCircle2 size={18} />
              Complaint registered — {ticketId}
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-border/60 bg-white shrink-0">
        {step === "category" && (
          <div className="flex flex-wrap gap-2">
            {COMPLAINT_CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCategory(id, label)}
                className="text-xs font-semibold px-3 py-2 rounded-2xl bg-surface2 text-navy hover:bg-teal/10 hover:text-teal-dark border border-border transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {step === "subject" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubject();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Member did not complete agreed work"
              className="flex-1 bg-surface2 border border-border rounded-2xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/25"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-2xl bg-navy text-on-hero flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        {(step === "description" || step === "related") && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === "description") handleDescription();
              else handleRelated(false);
            }}
            className="space-y-2"
          >
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              placeholder={
                step === "description"
                  ? "Describe the issue..."
                  : "Exchange title, member name, etc."
              }
              className="w-full bg-surface2 border border-border rounded-2xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/25"
            />
            <div className="flex gap-2">
              {step === "related" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRelated(true)}>
                  Skip
                </Button>
              )}
              <Button type="submit" variant="secondary" size="sm">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === "email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmail();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="email"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-surface2 border border-border rounded-2xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/25"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-2xl bg-navy text-on-hero flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              onClick={() => void handleConfirm()}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1 inline" /> Submitting...
                </>
              ) : (
                "Submit complaint"
              )}
            </Button>
            <Button variant="ghost" size="md" disabled={submitting} onClick={() => resetFlow()}>
              Start over
            </Button>
          </div>
        )}

        {step === "done" && (
          <Button variant="secondary" size="md" onClick={resetFlow}>
            File another complaint
          </Button>
        )}
      </div>
    </AppPanel>
  );
}
