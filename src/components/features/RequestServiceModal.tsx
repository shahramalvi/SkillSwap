import { Handshake } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useExchangeRequests } from "../../hooks/useExchangeRequests";
import { useSkills } from "../../hooks/useSkills";
import { useAuthStore } from "../../store/authStore";
import type { Skill } from "../../types";
import { normalizeSkill } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface RequestServiceModalProps {
  skill: Skill | null;
  providerName: string;
  onClose: () => void;
}

export function RequestServiceModal({ skill, providerName, onClose }: RequestServiceModalProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { createExchangeRequest } = useExchangeRequests();
  const { subscribeUserSkills } = useSkills();

  const normalized = skill ? normalizeSkill(skill) : null;

  const [scope, setScope] = useState("");
  const [barterDescription, setBarterDescription] = useState("");
  const [barterSkillId, setBarterSkillId] = useState("");
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!skill) return;
    setScope("");
    setBarterDescription("");
    setBarterSkillId("");
  }, [skill]);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeUserSkills(currentUser.uid, setMySkills);
  }, [currentUser, subscribeUserSkills]);

  const handleSubmit = async () => {
    if (!skill || !currentUser || !normalized) return;
    if (!scope.trim()) {
      toast.error("Describe what you need");
      return;
    }
    if (!barterDescription.trim() && !barterSkillId) {
      toast.error("Describe what you offer in return");
      return;
    }

    setSubmitting(true);
    try {
      const selectedBarterSkill = barterSkillId
        ? mySkills.find((s) => s.id === barterSkillId)
        : undefined;
      const barterOffer: {
        description: string;
        skillId?: string;
        skillTitle?: string;
      } = {
        description:
          barterDescription.trim() ||
          selectedBarterSkill?.description ||
          selectedBarterSkill?.title ||
          "",
      };
      if (barterSkillId) barterOffer.skillId = barterSkillId;
      if (selectedBarterSkill?.title) barterOffer.skillTitle = selectedBarterSkill.title;

      const requestId = await createExchangeRequest({
        skillId: skill.id,
        skillTitle: skill.title,
        providerId: skill.userId,
        providerName,
        scopeDescription: scope.trim(),
        barterOffer,
      });
      toast.success("Barter proposal sent! Opening chat...");
      onClose();
      navigate(`/chat/${requestId}`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to send proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!skill} onClose={onClose} title="Propose barter">
      {normalized && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-border rounded-xl p-4">
            <p className="font-bold text-navy text-lg">{normalized.title}</p>
            <p className="text-sm text-muted mt-0.5 mb-3 line-clamp-2">{normalized.description}</p>
            <span className="inline-flex items-center gap-1.5 font-bold text-teal-dark bg-teal/10 px-3 py-1 rounded-full text-sm">
              <Handshake size={14} /> Skill-for-skill exchange
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              What do you need from {providerName}?
            </label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={4}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy text-sm placeholder:text-muted/50 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none"
              placeholder="Be specific about scope, deliverables, and timeline..."
            />
          </div>

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

          <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending..." : "Send barter proposal"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
