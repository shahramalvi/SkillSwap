import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type { AppNotification } from "../types";

function normalizeNotification(id: string, raw: Record<string, unknown>): AppNotification {
  return {
    id,
    userId: raw.userId as string,
    type: raw.type as AppNotification["type"],
    title: raw.title as string,
    body: raw.body as string,
    exchangeRequestId: raw.exchangeRequestId as string,
    read: Boolean(raw.read),
    createdAt: raw.createdAt as Timestamp,
  };
}

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => normalizeNotification(d.id, d.data() as Record<string, unknown>)),
        );
        setLoading(false);
      },
      () => {
        setNotifications([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markRead = useCallback(async (notificationId: string) => {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  }, [notifications]);

  const markChatNotificationsRead = useCallback(
    async (exchangeRequestId: string) => {
      if (!user) return;
      const toMark = notifications.filter(
        (n) => !n.read && n.exchangeRequestId === exchangeRequestId,
      );
      if (toMark.length === 0) return;
      const batch = writeBatch(db);
      toMark.forEach((n) => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    },
    [notifications, user],
  );

  return {
    notifications,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    markChatNotificationsRead,
  };
}
