import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  markConversationRead,
  sendChatMessage,
  syncConversationFromRequest,
} from "../lib/conversationsService";
import { useAuthStore } from "../store/authStore";
import type { ChatMessage, Conversation } from "../types";

function normalizeConversation(id: string, raw: Record<string, unknown>): Conversation {
  return {
    id,
    exchangeRequestId: raw.exchangeRequestId as string,
    requesterId: raw.requesterId as string,
    requesterName: raw.requesterName as string,
    providerId: raw.providerId as string,
    providerName: raw.providerName as string,
    skillTitle: raw.skillTitle as string,
    exchangeStatus: raw.exchangeStatus as Conversation["exchangeStatus"],
    locked: Boolean(raw.locked),
    requesterMarkedComplete: Boolean(raw.requesterMarkedComplete),
    providerMarkedComplete: Boolean(raw.providerMarkedComplete),
    requesterUnread: (raw.requesterUnread as number) ?? 0,
    providerUnread: (raw.providerUnread as number) ?? 0,
    lastMessageText: (raw.lastMessageText as string) ?? "",
    lastMessageAt: raw.lastMessageAt as Timestamp,
    createdAt: raw.createdAt as Timestamp,
    updatedAt: raw.updatedAt as Timestamp,
  };
}

function normalizeMessage(id: string, raw: Record<string, unknown>): ChatMessage {
  return {
    id,
    senderId: raw.senderId as string,
    senderName: raw.senderName as string,
    text: raw.text as string,
    system: Boolean(raw.system),
    createdAt: raw.createdAt as Timestamp,
  };
}

export function useConversations() {
  const user = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const asRequester = query(
      collection(db, "conversations"),
      where("requesterId", "==", user.uid),
      orderBy("lastMessageAt", "desc"),
    );
    const asProvider = query(
      collection(db, "conversations"),
      where("providerId", "==", user.uid),
      orderBy("lastMessageAt", "desc"),
    );

    const requesterRows: Conversation[] = [];
    const providerRows: Conversation[] = [];
    let requesterReady = false;
    let providerReady = false;

    const merge = () => {
      if (!requesterReady || !providerReady) return;
      const map = new Map<string, Conversation>();
      [...requesterRows, ...providerRows].forEach((c) => map.set(c.id, c));
      setConversations(
        Array.from(map.values()).sort(
          (a, b) => b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis(),
        ),
      );
      setLoading(false);
    };

    const unsubRequester = onSnapshot(
      asRequester,
      (snap) => {
        requesterRows.length = 0;
        requesterRows.push(
          ...snap.docs.map((d) =>
            normalizeConversation(d.id, d.data() as Record<string, unknown>),
          ),
        );
        requesterReady = true;
        merge();
      },
      () => {
        requesterReady = true;
        merge();
      },
    );

    const unsubProvider = onSnapshot(
      asProvider,
      (snap) => {
        providerRows.length = 0;
        providerRows.push(
          ...snap.docs.map((d) =>
            normalizeConversation(d.id, d.data() as Record<string, unknown>),
          ),
        );
        providerReady = true;
        merge();
      },
      () => {
        providerReady = true;
        merge();
      },
    );

    return () => {
      unsubRequester();
      unsubProvider();
    };
  }, [user]);

  const unreadTotal = conversations.reduce((sum, c) => {
    if (!user) return sum;
    if (c.requesterId === user.uid) return sum + c.requesterUnread;
    if (c.providerId === user.uid) return sum + c.providerUnread;
    return sum;
  }, 0);

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      if (!user) throw new Error("Not authenticated");
      await sendChatMessage(conversationId, user.uid, user.name, text);
    },
    [user],
  );

  const markRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      await markConversationRead(conversationId, user.uid);
    },
    [user],
  );

  const syncFromRequest = useCallback(
    async (
      exchangeRequestId: string,
      data: {
        exchangeStatus: Conversation["exchangeStatus"];
        requesterMarkedComplete: boolean;
        providerMarkedComplete: boolean;
      },
    ) => {
      await syncConversationFromRequest(exchangeRequestId, data);
    },
    [],
  );

  return {
    conversations,
    loading,
    unreadTotal,
    sendMessage,
    markRead,
    syncFromRequest,
  };
}

export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => normalizeMessage(d.id, d.data() as Record<string, unknown>)),
        );
        setLoading(false);
      },
      () => {
        setMessages([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [conversationId]);

  return { messages, loading };
}

export function useConversation(conversationId: string | undefined) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "conversations", conversationId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setConversation(null);
        } else {
          setConversation(
            normalizeConversation(snap.id, snap.data() as Record<string, unknown>),
          );
        }
        setLoading(false);
      },
      () => {
        setConversation(null);
        setLoading(false);
      },
    );

    return unsub;
  }, [conversationId]);

  return { conversation, loading };
}
