import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileText, Link2, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AppAsidePanel, AppPage, AppPageSplit, AppPanel } from "../components/layout/AppPage";
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
});

type FormData = z.infer<typeof schema>;

export function PostSkill() {
  const { user, refreshUser } = useAuth();
  const { createSkill } = useSkills();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [projectLinks, setProjectLinks] = useState<{ title: string; url: string }[]>([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "Dev" },
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

    setSubmitting(true);
    try {
      if (resumeFile) {
        try {
          await uploadUserResume(user.uid, resumeFile);
          await refreshUser();
        } catch (err) {
          toast.error(
            (err as Error).message ||
              "Resume upload failed — your skill will still be posted",
          );
        }
      }

      await createSkill({
        ...data,
        tags,
        projectLinks,
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
    <AppPage>
      <AppPageSplit
        aside={
          <>
            <AppAsidePanel title="Tips for a great listing">
              <ul className="space-y-3 text-sm text-muted leading-relaxed">
                <li>Be specific about what you offer and what you expect in return.</li>
                <li>Add tags so members can find your skill when browsing jobs.</li>
                <li>Link portfolio projects to build trust before the first exchange.</li>
                <li>Optionally add a PDF resume so members can verify your background.</li>
              </ul>
            </AppAsidePanel>
            <AppAsidePanel title="Barter only">
              <p className="text-sm text-muted leading-relaxed">
                SkillSwap is skill-for-skill exchange. No cash payments — propose a fair trade
                when you request someone&apos;s service.
              </p>
            </AppAsidePanel>
          </>
        }
        main={
          <>
            <p className="text-sm text-muted">
            Optional resume · optional project links · barter-only listings
            </p>

            <AppPanel className="p-6 sm:p-8">
              <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-border p-4 bg-surface2 space-y-3">
            <div className="flex items-center gap-2 text-navy font-bold text-sm">
              <FileText size={18} /> Resume (optional)
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
            <p className="text-xs text-muted">
              PDF up to 5 MB. You can post a skill without a resume.
            </p>
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
                "w-full bg-white border border-border rounded-2xl px-4 py-3 text-navy placeholder:text-muted/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none",
                errors.description && "border-rose",
              )}
            />
            {errors.description && (
              <p className="text-xs text-rose">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-navy focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
            >
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-navy font-bold text-sm">
              <Link2 size={18} /> Project links (optional)
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Project name"
                className="flex-1 border border-border rounded-2xl px-3 py-2 text-sm"
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 border border-border rounded-2xl px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addProjectLink}
                className="bg-navy text-on-hero px-4 rounded-2xl hover:bg-navy-light text-sm font-semibold"
              >
                Add
              </button>
            </div>
            {projectLinks.map((link, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm bg-surface2 rounded-xl px-3 py-2"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal font-medium truncate"
                >
                  {link.title}
                </a>
                <button
                  type="button"
                  onClick={() => setProjectLinks(projectLinks.filter((_, j) => j !== i))}
                >
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
                className="flex-1 bg-white border border-border rounded-2xl px-4 py-3 text-navy placeholder:text-muted/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-navy text-on-hero px-4 rounded-2xl hover:bg-navy-light transition-colors"
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
              </motion.form>
            </AppPanel>
          </>
        }
      />
    </AppPage>
  );
}
