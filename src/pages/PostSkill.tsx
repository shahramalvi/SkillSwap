import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Coins, FileText, Link2, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useSkills } from "../hooks/useSkills";
import { uploadUserResume } from "../lib/resumeUpload";
import { SKILL_CATEGORIES } from "../types";
import { cn } from "../lib/utils";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Design", "Dev", "AI", "Writing", "Music", "Marketing", "Other"] as const),
  tokenRate: z.number().min(10).max(500),
});

type FormData = z.infer<typeof schema>;

export function PostSkill() {
  const { user, refreshUser } = useAuth();
  const { createSkill } = useSkills();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tokenRate, setTokenRate] = useState(50);
  const [acceptsTokens, setAcceptsTokens] = useState(true);
  const [acceptsBarter, setAcceptsBarter] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [projectLinks, setProjectLinks] = useState<{ title: string; url: string }[]>([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "Dev", tokenRate: 50 },
  });

  const hasResume = Boolean(user?.resumeUrl);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const addProjectLink = () => {
    const title = linkTitle.trim();
    const url = linkUrl.trim();
    if (!title || !url) {
      toast.error("Project title and URL required");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    if (projectLinks.length >= 5) {
      toast.error("Maximum 5 project links");
      return;
    }
    setProjectLinks([...projectLinks, { title, url }]);
    setLinkTitle("");
    setLinkUrl("");
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    if (!acceptsTokens && !acceptsBarter) {
      toast.error("Enable at least one exchange type (tokens or barter)");
      return;
    }
    if (!hasResume && !resumeFile) {
      toast.error("Upload your resume (PDF) to post a skill");
      return;
    }

    setSubmitting(true);
    try {
      if (resumeFile) {
        await uploadUserResume(user.uid, resumeFile);
        await refreshUser();
      }

      await createSkill({
        ...data,
        tokenRate,
        tags,
        projectLinks,
        acceptsTokens,
        acceptsBarter,
      });
      toast.success("Skill posted!");
      navigate("/profile/me");
    } catch (err) {
      toast.error((err as Error).message || "Failed to post skill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      <div className="bg-hero-gradient pt-24 pb-10 dot-pattern mb-6">
        <Container size="narrow" className="relative z-10">
          <h1 className="text-3xl font-extrabold text-on-hero">Post a skill</h1>
          <p className="text-on-hero-muted text-sm mt-1">
            Resume required · optional project links · choose tokens and/or barter
          </p>
        </Container>
      </div>

      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border shadow-soft p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-xl border border-border p-4 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-navy font-bold text-sm">
                <FileText size={18} /> Resume (required)
              </div>
              {hasResume ? (
                <p className="text-sm text-muted">
                  On file:{" "}
                  <a
                    href={user!.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal font-semibold hover:underline"
                  >
                    {user!.resumeFileName ?? "View resume"}
                  </a>
                </p>
              ) : null}
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="text-sm text-navy w-full"
              />
              {!hasResume && !resumeFile && (
                <p className="text-xs text-rose">PDF required before posting</p>
              )}
            </div>

            <Input
              label="Skill title"
              placeholder="e.g. Logo design, React development..."
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Describe what you offer in detail..."
                className={cn(
                  "w-full bg-white border border-border rounded-xl px-4 py-3 text-navy placeholder:text-muted/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none transition-all",
                  errors.description && "border-rose focus:border-rose focus:ring-rose/20",
                )}
              />
              {errors.description && (
                <p className="text-xs text-rose">{errors.description.message}</p>
              )}
            </div>

            <motion.div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                How you accept work
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsTokens}
                  onChange={(e) => setAcceptsTokens(e.target.checked)}
                  className="accent-navy w-4 h-4"
                />
                <span className="text-sm font-medium text-navy">Pay with tokens</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsBarter}
                  onChange={(e) => setAcceptsBarter(e.target.checked)}
                  className="accent-navy w-4 h-4"
                />
                <span className="text-sm font-medium text-navy">Skill barter (no tokens)</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                  Default token rate (full project)
                </label>
                <span className="flex items-center gap-1.5 text-lg font-extrabold text-teal">
                  <Coins size={18} />
                  {tokenRate}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                value={tokenRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTokenRate(v);
                  setValue("tokenRate", v);
                }}
                className="w-full accent-teal"
              />
              <p className="text-xs text-muted">
                Requesters can negotiate a lower amount for smaller scope.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <motion.div className="flex items-center gap-2 text-navy font-bold text-sm">
                <Link2 size={18} /> Project links (optional)
              </motion.div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Project name"
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm"
                />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addProjectLink}
                  className="bg-teal text-on-hero px-4 rounded-xl hover:opacity-90 text-sm font-semibold"
                >
                  Add
                </button>
              </div>
              {projectLinks.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal font-medium truncate"
                  >
                    {link.title}
                  </a>
                  <button type="button" onClick={() => setProjectLinks(projectLinks.filter((_, j) => j !== i))}>
                    <X size={14} className="text-muted" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                Tags (press Enter)
              </label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g. react, logo, music..."
                  className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-navy placeholder:text-muted/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-teal text-on-hero px-4 rounded-xl hover:opacity-90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 bg-teal/10 text-teal-dark text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" disabled={submitting}>
              {submitting ? "Posting..." : "Post skill"}
            </Button>
          </form>
        </motion.div>
      </Container>
    </PageWrapper>
  );
}
