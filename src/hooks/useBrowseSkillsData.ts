import { useEffect, useMemo, useState } from "react";
import { withDemoBrowseSkills, withDemoUserSkills } from "../lib/dashboardDemoData";
import { useAuthStore } from "../store/authStore";
import type { Skill, SkillFilters } from "../types";
import { useSkills } from "./useSkills";

export function useBrowseSkillsData(filters: SkillFilters) {
  const { subscribeAllSkills } = useSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAllSkills(filters, (results) => {
      setSkills(results);
      setLoading(false);
    });
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [subscribeAllSkills, filters.search, filters.category]);

  const { skills: displaySkills, isDemo } = useMemo(
    () => withDemoBrowseSkills(skills, filters),
    [skills, filters],
  );

  return { loading, displaySkills, isDemo };
}

export function useUserSkillsData(userId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const { subscribeUserSkills } = useSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeUserSkills(userId, (s) => {
      setSkills(s);
      setLoading(false);
    });
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [subscribeUserSkills, userId]);

  const { skills: displaySkills, isDemo } = useMemo(() => {
    if (!user || userId !== user.uid) {
      return { skills, isDemo: false };
    }
    return withDemoUserSkills(user, skills);
  }, [user, userId, skills]);

  return { loading, displaySkills, isDemo };
}
