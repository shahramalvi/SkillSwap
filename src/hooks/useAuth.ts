import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { getInitials } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { DEFAULT_TOKEN_BALANCE, type User } from "../types";

const googleProvider = new GoogleAuthProvider();

async function fetchUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

async function createUserDoc(
  firebaseUser: FirebaseUser,
  name: string,
): Promise<User> {
  const userData: Omit<User, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: firebaseUser.uid,
    name,
    email: firebaseUser.email ?? "",
    avatar: getInitials(name),
    bio: "",
    tokenBalance: DEFAULT_TOKEN_BALANCE,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", firebaseUser.uid), userData);
  const created = await fetchUserDoc(firebaseUser.uid);
  if (!created) throw new Error("Failed to create user profile");
  return created;
}

export function useAuthInit() {
  const { setUser, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        reset();
        return;
      }

      try {
        const userDoc = await fetchUserDoc(firebaseUser.uid);
        setUser(userDoc);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading, reset]);
}

export function useAuth() {
  const { user, loading, setUser, setTokenBalance } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await fetchUserDoc(cred.user.uid);
    if (!userDoc) throw new Error("User profile not found");
    setUser(userDoc);
    return userDoc;
  }, [setUser]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userDoc = await createUserDoc(cred.user, name);
      setUser(userDoc);
      return userDoc;
    },
    [setUser],
  );

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    let userDoc = await fetchUserDoc(cred.user.uid);

    if (!userDoc) {
      const name =
        cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "User";
      userDoc = await createUserDoc(cred.user, name);
    }

    setUser(userDoc);
    return userDoc;
  }, [setUser]);

  const logout = useCallback(async () => {
    await signOut(auth);
    useAuthStore.getState().reset();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return null;
    const userDoc = await fetchUserDoc(auth.currentUser.uid);
    if (userDoc) setUser(userDoc);
    return userDoc;
  }, [setUser]);

  return {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
    setTokenBalance,
  };
}
