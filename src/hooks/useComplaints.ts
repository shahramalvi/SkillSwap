import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { withDemoComplaints } from "../lib/complaintDemoData";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type { Complaint, ComplaintCategory, CreateComplaintInput } from "../types";

function normalizeComplaint(id: string, raw: Record<string, unknown>): Complaint {
  return {
    id,
    userId: raw.userId as string,
    ticketId: raw.ticketId as string,
    category: raw.category as ComplaintCategory,
    subject: raw.subject as string,
    description: raw.description as string,
    relatedTo: raw.relatedTo as string | undefined,
    email: raw.email as string,
    status: (raw.status as Complaint["status"]) ?? "pending",
    createdAt: raw.createdAt as Timestamp,
    resolvedAt: raw.resolvedAt as Timestamp | undefined,
  };
}

function makeTicketId(): string {
  return `CMP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function useComplaints() {
  const user = useAuthStore((s) => s.user);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(false);

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFirestoreError(false);
        setComplaints(
          snap.docs.map((d) => normalizeComplaint(d.id, d.data() as Record<string, unknown>)),
        );
        setLoading(false);
      },
      () => {
        setFirestoreError(true);
        setComplaints([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [user]);

  const displayComplaints = useMemo(
    () => withDemoComplaints(complaints, user?.uid, firestoreError || complaints.length === 0),
    [complaints, user?.uid, firestoreError],
  );

  const createComplaint = useCallback(
    async (input: CreateComplaintInput): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const ticketId = makeTicketId();
      await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        ticketId,
        category: input.category,
        subject: input.subject.trim(),
        description: input.description.trim(),
        relatedTo: input.relatedTo?.trim() || null,
        email: input.email.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      return ticketId;
    },
    [user],
  );

  const pending = useMemo(
    () => displayComplaints.filter((c) => c.status === "pending"),
    [displayComplaints],
  );
  const resolved = useMemo(
    () => displayComplaints.filter((c) => c.status === "resolved"),
    [displayComplaints],
  );

  return {
    loading,
    complaints: displayComplaints,
    pending,
    resolved,
    createComplaint,
    isDemo: firestoreError,
  };
}
