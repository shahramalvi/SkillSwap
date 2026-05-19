import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback } from "react";
import { db } from "../lib/firebase";
import { getInitials } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

export function useUsers() {
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  const fetchUser = useCallback(async (uid: string): Promise<User | null> => {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return snap.data() as User;
  }, []);

  const searchUsers = useCallback(async (searchQuery: string): Promise<User[]> => {
    if (!searchQuery.trim()) return [];

    const q = query(
      collection(db, "users"),
      where("name", ">=", searchQuery),
      where("name", "<=", searchQuery + "\uf8ff"),
      limit(20),
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as User);
  }, []);

  const updateUser = useCallback(
    async (uid: string, data: Partial<Pick<User, "name" | "bio" | "avatar">>) => {
      const ref = doc(db, "users", uid);
      const updates = { ...data };
      if (data.name) {
        updates.avatar = getInitials(data.name);
      }
      await updateDoc(ref, updates);

      if (currentUser?.uid === uid) {
        const updated = await fetchUser(uid);
        if (updated) setUser(updated);
      }

      return fetchUser(uid);
    },
    [currentUser?.uid, fetchUser, setUser],
  );

  return { fetchUser, searchUsers, updateUser };
}
