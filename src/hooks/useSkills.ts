import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { isDemoSkill } from "../lib/dashboardDemoData";
import { useCallback } from "react";
import { db } from "../lib/firebase";
import { stripUndefined } from "../lib/firestoreUtils";
import { useAuthStore } from "../store/authStore";
import type { CreateSkillInput, Skill, SkillCategory, SkillFilters } from "../types";

function applyClientFilters(skills: Skill[], filters?: SkillFilters): Skill[] {
  let result = skills;

  if (filters?.search?.trim()) {
    const term = filters.search.toLowerCase();
    result = result.filter((s) => s.title.toLowerCase().includes(term));
  }

  if (filters?.category && filters.category !== "All") {
    result = result.filter((s) => s.category === filters.category);
  }

  return result;
}

export function useSkills() {
  const currentUser = useAuthStore((s) => s.user);

  const subscribeAllSkills = useCallback(
    (filters: SkillFilters | undefined, callback: (skills: Skill[]) => void): Unsubscribe => {
      const constraints = [orderBy("createdAt", "desc")];

      if (filters?.category && filters.category !== "All") {
        const q = query(
          collection(db, "skills"),
          where("category", "==", filters.category as SkillCategory),
          ...constraints,
        );
        return onSnapshot(
          q,
          (snap) => {
            const skills = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Skill);
            callback(applyClientFilters(skills, filters));
          },
          () => callback([]),
        );
      }

      const q = query(collection(db, "skills"), ...constraints);
      return onSnapshot(
        q,
        (snap) => {
          const skills = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Skill);
          callback(applyClientFilters(skills, filters));
        },
        () => callback([]),
      );
    },
    [],
  );

  const fetchAllSkills = useCallback(
    (filters: SkillFilters | undefined, callback: (skills: Skill[]) => void) =>
      subscribeAllSkills(filters, callback),
    [subscribeAllSkills],
  );

  const subscribeUserSkills = useCallback(
    (userId: string, callback: (skills: Skill[]) => void): Unsubscribe => {
      const q = query(
        collection(db, "skills"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
      return onSnapshot(
        q,
        (snap) => {
          callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Skill));
        },
        () => callback([]),
      );
    },
    [],
  );

  const createSkill = useCallback(
    async (data: CreateSkillInput) => {
      if (!currentUser) throw new Error("Not authenticated");

      const docRef = await addDoc(collection(db, "skills"), {
        ...data,
        userId: currentUser.uid,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },
    [currentUser],
  );

  const updateSkill = useCallback(async (id: string, data: Partial<CreateSkillInput>) => {
    await updateDoc(doc(db, "skills", id), stripUndefined(data as Record<string, unknown>));
  }, []);

  const deleteSkill = useCallback(
    async (id: string) => {
      if (!currentUser) throw new Error("You must be signed in to delete a skill");
      if (isDemoSkill(id)) throw new Error("Sample skills cannot be deleted");

      const ref = doc(db, "skills", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Skill not found");
      if (snap.data().userId !== currentUser.uid) {
        throw new Error("You can only delete your own skill offers");
      }

      await deleteDoc(ref);
    },
    [currentUser],
  );

  return {
    fetchAllSkills,
    subscribeAllSkills,
    subscribeUserSkills,
    createSkill,
    updateSkill,
    deleteSkill,
  };
}
