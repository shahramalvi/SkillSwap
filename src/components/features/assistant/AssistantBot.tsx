import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronRight, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAssistant } from "../../../hooks/useAssistant";
import { findPageByPath } from "../../../lib/assistant/pageIndex";
import { cn } from "../../../lib/utils";

export function AssistantBot() {
  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    navigateToPath,
    starterPrompts,
    toggleOpen,
  } = useAssistant();

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 flex flex-col overflow-hidden bg-white rounded-3xl border border-white shadow-[0_20px_60px_rgba(13,27,62,0.18)] inset-x-3 bottom-24 h-[min(70dvh,560px)] sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-[min(calc(100vw-2rem),400px)] lg:right-6"
          >
            <header className="bg-navy px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </span>
                <div>
                  <p className="text-sm font-bold text-on-hero leading-tight">Swap Assistant</p>
                  <p className="text-[11px] text-on-hero-muted">FAQs & navigation help</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-on-hero-muted hover:text-white transition-colors"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </header>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#eef1f8]/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-navy text-on-hero rounded-br-md"
                        : "bg-white border border-border text-navy shadow-sm rounded-bl-md",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && msg.navigateTo && (
                      <button
                        type="button"
                        onClick={() => navigateToPath(msg.navigateTo!)}
                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-teal-dark hover:underline"
                      >
                        {msg.navigateLabel ??
                          `Go to ${findPageByPath(msg.navigateTo)?.title ?? msg.navigateTo}`}
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-muted" />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-rose bg-rose-light/30 border border-rose/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="text-[11px] font-semibold text-navy bg-white border border-border rounded-full px-2.5 py-1 hover:border-teal/40 hover:text-teal transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-border/60 bg-white flex gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about SkillSwap..."
                disabled={loading}
                className="flex-1 bg-surface2 border border-border rounded-2xl px-3.5 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/25 focus:border-teal disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-2xl bg-navy text-on-hero flex items-center justify-center hover:bg-navy-light disabled:opacity-40 transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleOpen}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgba(13,27,62,0.2)] flex items-center justify-center transition-colors",
          "right-3 bottom-6 sm:right-4 lg:right-6",
          open ? "bg-navy-light text-on-hero" : "bg-navy text-on-hero hover:bg-navy-light",
        )}
        aria-label={open ? "Close Swap Assistant" : "Open Swap Assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </>
  );
}
