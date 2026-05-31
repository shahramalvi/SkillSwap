import { Edit2, FileText, Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DemoDataBanner } from "../components/features/DemoDataBanner";
import { SkillCard } from "../components/features/SkillCard";
import {
  AppAsidePanel,
  AppPage,
  AppPageSplit,
  AppPanel,
  AppSectionTitle,
} from "../components/layout/AppPage";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useUserSkillsData } from "../hooks/useBrowseSkillsData";
import { useSkills } from "../hooks/useSkills";
import { useSubscription } from "../hooks/useSubscription";
import { useUsers } from "../hooks/useUsers";
import { isDemoSkill } from "../lib/dashboardDemoData";
import { useAuthStore } from "../store/authStore";

export function MyProfile() {
  const user = useAuthStore((s) => s.user);
  const { info } = useSubscription();
  const { updateUser } = useUsers();
  const { deleteSkill } = useSkills();
  const { displaySkills: skills, loading, isDemo } = useUserSkillsData(user?.uid);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser(user.uid, { name, bio });
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (isDemoSkill(id)) return;
    try {
      await deleteSkill(id);
      toast.success("Skill deleted");
    } catch {
      toast.error("Failed to delete skill");
    }
  };

  if (!user) return null;

  return (
    <AppPage>
      {isDemo && (
        <DemoDataBanner message="Sample skills on your profile — post a real skill to start receiving barter requests." />
      )}

      <AppPageSplit
        asidePosition="left"
        aside={
          <>
            <AppPanel className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar initials={user.avatar} size="xl" ring />
                {!editing && (
                  <>
                    <p className="text-xs text-muted mt-4 truncate w-full">{user.email}</p>
                    <h2 className="text-xl font-bold text-navy mt-1">{user.name}</h2>
                  </>
                )}
              </div>

              {editing ? (
                <div className="space-y-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                      Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-navy font-semibold focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tell people about yourself..."
                      className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-navy text-sm placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" onClick={handleSave} disabled={saving} size="md">
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(false)} size="md">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted mt-4 leading-relaxed text-left">
                    {user.bio || "No bio yet — add one to stand out!"}
                  </p>
                  {user.resumeUrl && (
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-teal hover:underline"
                    >
                      <FileText size={14} /> View resume
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-navy bg-surface2 hover:bg-white border border-border rounded-2xl px-3 py-2 transition-all"
                  >
                    <Edit2 size={13} /> Edit profile
                  </button>
                </>
              )}
            </AppPanel>

            <AppAsidePanel title="Account">
              <div className="space-y-2">
                {info && (
                  <Link
                    to="/plan"
                    className="block text-xs font-semibold text-navy bg-gold-light border border-gold/30 rounded-2xl px-3 py-2 text-center"
                  >
                    {info.label}
                  </Link>
                )}
                <Link
                  to="/requests"
                  className="block text-xs font-semibold text-teal border border-teal/30 rounded-2xl px-3 py-2 text-center inline-flex items-center justify-center gap-1"
                >
                  <Inbox size={12} /> Requests
                </Link>
                <p className="text-xs text-muted text-center pt-1">
                  {skills.length} skill{skills.length !== 1 ? "s" : ""} listed
                </p>
              </div>
            </AppAsidePanel>
          </>
        }
        main={
          <>
            <AppSectionTitle
              title="My skills"
              description="Skills you're offering for barter"
              action={
                <Link to="/post-skill">
                  <Button variant="secondary" size="sm">
                    <Plus size={15} className="mr-1 inline" /> Add skill
                  </Button>
                </Link>
              }
            />

            {loading && !isDemo ? (
              <Skeleton className="h-48 rounded-3xl" />
            ) : skills.length === 0 ? (
              <AppPanel className="p-12 text-center">
                <Pencil size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-muted font-medium">No skills yet</p>
                <p className="text-muted text-sm mt-1 mb-5">
                  Post your first skill to start receiving barter proposals
                </p>
                <Link to="/post-skill">
                  <Button variant="secondary" size="md">
                    Post a skill
                  </Button>
                </Link>
              </AppPanel>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                {skills.map((skill) => (
                  <div key={skill.id} className="min-w-0 flex flex-col">
                    <SkillCard skill={skill} />
                    {!isDemoSkill(skill.id) && (
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        className="mt-2"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <Trash2 size={13} className="mr-1 inline" /> Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        }
      />
    </AppPage>
  );
}
