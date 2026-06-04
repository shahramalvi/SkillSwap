import { motion } from "framer-motion";
import { FileText, Handshake, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeleteSkillButton } from "../components/features/DeleteSkillButton";
import { DemoDataBanner } from "../components/features/DemoDataBanner";
import { RequestServiceModal } from "../components/features/RequestServiceModal";
import { SkillCard } from "../components/features/SkillCard";
import {
  AppAsidePanel,
  AppPage,
  AppPageSplit,
  AppPanel,
  AppSectionTitle,
} from "../components/layout/AppPage";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { useSkills } from "../hooks/useSkills";
import { useUsers } from "../hooks/useUsers";
import {
  getDemoMemberProfile,
  getDemoMemberSkills,
  isDemoMemberId,
} from "../lib/dashboardDemoData";
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
  const isDemoProfile = id ? isDemoMemberId(id) : false;

  useEffect(() => {
    if (!id) return;
    if (isDemoMemberId(id)) {
      setProfile(getDemoMemberProfile(id));
      setSkills(getDemoMemberSkills(id));
      setLoading(false);
      return;
    }
    fetchUser(id).then((user) => {
      setProfile(user);
      setLoading(false);
    });
  }, [id, fetchUser]);

  useEffect(() => {
    if (!id || isDemoMemberId(id)) return;
    return subscribeUserSkills(id, setSkills);
  }, [id, subscribeUserSkills]);

  if (loading) {
    return (
      <AppPage showBack backTo="/jobs">
        <div className="grid xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </div>
      </AppPage>
    );
  }

  if (!profile) {
    return (
      <AppPage showBack backTo="/jobs">
        <AppPanel className="p-12 text-center">
          <p className="text-navy font-semibold">User not found</p>
        </AppPanel>
      </AppPage>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;

  return (
    <AppPage showBack backTo="/jobs">
      {isDemoProfile && (
        <DemoDataBanner message="Sample member profile — request real skills from live members once they post." />
      )}

      <AppPageSplit
        asidePosition="left"
        aside={
          <>
            <AppPanel className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar initials={profile.avatar} size="xl" ring />
                <h2 className="text-xl font-bold text-navy mt-4">{profile.name}</h2>
                <p className="text-sm text-muted mt-1 flex items-center justify-center gap-1.5">
                  <MapPin size={13} /> Karachi, Pakistan
                </p>
              </div>
              <p className="text-sm text-muted mt-4 leading-relaxed">
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
            </AppPanel>
            <AppAsidePanel title="Skills">
              <p className="text-sm text-muted flex items-center gap-1.5">
                <Handshake size={14} />
                {skills.length} skill{skills.length !== 1 ? "s" : ""} available for barter
              </p>
            </AppAsidePanel>
          </>
        }
        main={
          <>
            <AppSectionTitle
              title="Skills offered"
              description={
                isOwnProfile
                  ? "Manage or remove your barter listings"
                  : "Available for barter exchange"
              }
            />

            {skills.length === 0 ? (
              <AppPanel className="p-12 text-center text-muted text-sm">
                No skills posted yet.
              </AppPanel>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-start"
              >
                {skills.map((skill) => (
                  <div key={skill.id} className="min-w-0 flex flex-col">
                    <SkillCard
                      skill={normalizeSkill(skill)}
                      showRequest={!isOwnProfile && !isDemoProfile}
                      onRequest={() => setSelectedSkill(normalizeSkill(skill))}
                    />
                    {isOwnProfile && (
                      <DeleteSkillButton
                        skillId={skill.id}
                        skillTitle={skill.title}
                        fullWidth
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </>
        }
      />

      <RequestServiceModal
        skill={selectedSkill}
        providerName={profile.name}
        onClose={() => setSelectedSkill(null)}
      />
    </AppPage>
  );
}
