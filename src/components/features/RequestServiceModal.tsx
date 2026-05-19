import { Coins, Handshake } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useExchangeRequests } from "../../hooks/useExchangeRequests";
import { useSkills } from "../../hooks/useSkills";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import type { ExchangeMode, Skill } from "../../types";
import { normalizeSkill, skillAcceptsMode } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface RequestServiceModalProps {
  skill: Skill | null;
  providerName: string;
  onClose: () => void;
}

export function RequestServiceModal({ skill, providerName, onClose }: RequestServiceModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { createExchangeRequest } = useExchangeRequests();
  const { subscribeUserSkills } = useSkills();

  const normalized = skill ? normalizeSkill(skill) : null;
  const canTokens = normalized?.acceptsTokens ?? false;
  const canBarter = normalized?.acceptsBarter ?? false;

  const [mode, setMode] = useState<ExchangeMode>(canTokens ? "token" : "barter");
  const [scope, setScope] = useState("");
  const [proposedTokens, setProposedTokens] = useState(50);
  const [barterDescription, setBarterDescription] = useState("");
  const [barterSkillId, setBarterSkillId] = useState("");
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!skill) return;
    setProposedTokens(skill.tokenRate);
    setScope("");
    setBarterDescription("");
    setBarterSkillId("");
    setMode(canTokens ? "token" : "barter");
  }, [skill, canTokens]);

  useEffect(() => {
    if (!currentUser || mode !== "barter") return;
    return subscribeUserSkills(currentUser.uid, setMySkills);
  }, [currentUser, mode, subscribeUserSkills]);

  const handleSubmit = async () => {
    if (!skill || !currentUser || !normalized) return;
    if (!scope.trim()) {
      toast.error("Describe what you need");
      return;
    }
    if (!skillAcceptsMode(normalized, mode)) {
      toast.error("This skill does not accept that exchange mode");
      return;
    }
    if (mode === "barter" && !barterDescription.trim() && !barterSkillId) {
      toast.error("Describe what you offer in return");
      return;
    }

    setSubmitting(true);
    try {
      const selectedBarterSkill = mySkills.find((s) => s.id === barterSkillId);
      await createExchangeRequest({
        skillId: skill.id,
        skillTitle: skill.title,
        listedTokenRate: skill.tokenRate,
        mode,
        providerId: skill.userId,
        providerName,
        scopeDescription: scope.trim(),
        proposedTokens: mode === "token" ? proposedTokens : undefined,
        barterOffer:
          mode === "barter"
            ? {
                skillId: barterSkillId || undefined,
                skillTitle: selectedBarterSkill?.title,
                description:
                  barterDescription.trim() ||
                  selectedBarterSkill?.description ||
                  selectedBarterSkill?.title ||
                  "",
              }
            : undefined,
      });
      toast.success("Request sent! Waiting for their response.");
      onClose();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== "Insufficient tokens") toast.error(msg || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!skill} onClose={onClose} title="Request service">
      {normalized && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-border rounded-xl p-4">
            <p className="font-bold text-navy text-lg">{normalized.title}</p>
            <p className="text-sm text-muted mt-0.5 mb-3 line-clamp-2">{normalized.description}</p>
            <span className="inline-flex items-center gap-1.5 font-bold text-teal bg-teal/10 px-3 py-1 rounded-full text-sm">
              <Coins size={14} /> Listed at {normalized.tokenRate} tokens (full scope)
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              How do you want to work together?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {canTokens && (
                <button
                  type="button"
                  onClick={() => setMode("token")}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all",
                    mode === "token"
                      ? "border-navy bg-navy/5"
                      : "border-border hover:border-navy/30",
                  )}
                >
                  <Coins size={20} className="text-navy" />
                  <span className="font-bold text-navy text-sm">Pay with tokens</span>
                  <span className="text-xs text-muted">Offer tokens for the work you need</span>
                </button>
              )}
              {canBarter && (
                <button
                  type="button"
                  onClick={() => setMode("barter")}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all",
                    mode === "barter"
                      ? "border-navy bg-navy/5"
                      : "border-border hover:border-navy/30",
                  )}
                >
                  <Handshake size={20} className="text-navy" />
                  <span className="font-bold text-navy text-sm">Propose barter</span>
                  <span className="text-xs text-muted">Trade your skill — no tokens</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              What do you need?
            </label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={4}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy text-sm placeholder:text-muted/50 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none"
              placeholder="Be specific — smaller scope can mean fewer tokens..."
            />
          </div>

          {mode === "token" ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Your token offer
                </label>
                <span className="font-extrabold text-teal flex items-center gap-1">
                  <Coins size={16} /> {proposedTokens}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(normalized.tokenRate, proposedTokens, 500)}
                value={proposedTokens}
                onChange={(e) => setProposedTokens(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <p className="text-xs text-muted">
                Tokens are held in escrow only after {providerName} accepts your offer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySkills.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Your skill to offer (optional)
                  </label>
                  <select
                    value={barterSkillId}
                    onChange={(e) => setBarterSkillId(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy text-sm focus:border-teal focus:outline-none"
                  >
                    <option value="">Custom offer below</option>
                    {mySkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  What you offer in return
                </label>
                <textarea
                  value={barterDescription}
                  onChange={(e) => setBarterDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy text-sm placeholder:text-muted/50 focus:border-teal focus:outline-none resize-none"
                  placeholder="e.g. I'll build your landing page if you design my logo..."
                />
              </div>
            </div>
          )}

          <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending..." : "Send request"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
