import { motion } from "framer-motion";
import { Coins, FileText, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RequestServiceModal } from "../components/features/RequestServiceModal";
import { SkillCard } from "../components/features/SkillCard";
import { TokenBadge } from "../components/features/TokenBadge";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { useSkills } from "../hooks/useSkills";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import { normalizeSkill, type Skill, type User } from "../types";

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const { fetchUser } = useUsers();
  const { subscribeUserSkills } = useSkills();

  const [profile, setProfile] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchUser(id).then((user) => {
      setProfile(user);
      setLoading(false);
    });
  }, [id, fetchUser]);

  useEffect(() => {
    if (!id) return;
    return subscribeUserSkills(id, setSkills);
  }, [id, subscribeUserSkills]);

  if (loading) {
    return (
      <PageWrapper className="min-h-screen bg-canvas pb-20">
        <motion.div className="bg-hero-gradient h-48 dot-pattern" />
        <Container className="-mt-16 space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </Container>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-navy font-semibold">User not found</p>
      </PageWrapper>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      <div className="bg-hero-gradient pt-24 pb-20 dot-pattern" />

      <Container className="-mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8 mb-8 flex flex-col sm:flex-row items-start gap-6"
        >
          <Avatar initials={profile.avatar} size="xl" ring />
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-navy">{profile.name}</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
              <MapPin size={13} /> Karachi, Pakistan
            </p>
            <p className="text-slate-600 text-sm mt-3 max-w-xl leading-relaxed">
              {profile.bio || "No bio yet."}
            </p>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-teal hover:underline"
              >
                <FileText size={14} /> View resume
              </a>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <TokenBadge balance={profile.tokenBalance} />
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                <Coins size={11} className="inline mr-1" />
                {skills.length} skill{skills.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-navy mb-5">Skills offered</h2>
        {skills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-card">
            <p className="text-slate-400 text-sm">No skills posted yet.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid md:grid-cols-2 gap-5"
          >
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={normalizeSkill(skill)}
                showRequest={!isOwnProfile}
                onRequest={() => setSelectedSkill(normalizeSkill(skill))}
              />
            ))}
          </motion.div>
        )}
      </Container>

      <RequestServiceModal
        skill={selectedSkill}
        providerName={profile.name}
        onClose={() => setSelectedSkill(null)}
      />
    </PageWrapper>
  );
}
