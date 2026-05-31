import { Sparkles } from "lucide-react";

interface DemoDataBannerProps {
  message?: string;
}

export function DemoDataBanner({
  message = "Showing sample data — your real activity appears once you start exchanging on SkillSwap.",
}: DemoDataBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-teal/10 border border-teal/20 rounded-2xl px-4 py-3">
      <Sparkles size={18} className="text-teal shrink-0 mt-0.5" />
      <p className="text-sm text-navy font-medium leading-relaxed">{message}</p>
    </div>
  );
}
