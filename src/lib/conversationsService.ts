import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { stripUndefined } from "./firestoreUtils";
import type { ExchangeStatus, NotificationType } from "../types";

export interface CreateConversationInput {
  exchangeRequestId: string;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  skillTitle: string;
  exchangeStatus: ExchangeStatus;
  initialMessage: string;
  senderId: string;
  senderName: string;
}

export async function createConversationForRequest(
  input: CreateConversationInput,
): Promise<void> {
  const convRef = doc(db, "conversations", input.exchangeRequestId);
  const now = Timestamp.now();
  const preview =
    input.initialMessage.length > 120
      ? `${input.initialMessage.slice(0, 117)}...`
      : input.initialMessage;

  await setDoc(
    convRef,
    stripUndefined({
      exchangeRequestId: input.exchangeRequestId,
      requesterId: input.requesterId,
      requesterName: input.requesterName,
      providerId: input.providerId,
      providerName: input.providerName,
      skillTitle: input.skillTitle,
      exchangeStatus: input.exchangeStatus,
      locked: false,
      requesterMarkedComplete: false,
      providerMarkedComplete: false,
      requesterUnread: 0,
      providerUnread: 1,
      lastMessageText: preview,
      lastMessageAt: now,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  await addDoc(collection(convRef, "messages"), {
    senderId: input.senderId,
    senderName: input.senderName,
    text: input.initialMessage,
    system: false,
    createdAt: Timestamp.now(),
  });
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  options?: { skipNotification?: boolean },
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  const convRef = doc(db, "conversations", conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists()) throw new Error("Conversation not found");

  const conv = convSnap.data();
  if (conv.locked) throw new Error("This chat is locked");

  const isRequester = senderId === conv.requesterId;
  const isProvider = senderId === conv.providerId;
  if (!isRequester && !isProvider) throw new Error("Not a participant");

  const preview = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
  const unreadField = isRequester ? "providerUnread" : "requesterUnread";
  const currentUnread = (conv[unreadField] as number) ?? 0;

  const batch = writeBatch(db);
  const msgRef = doc(collection(convRef, "messages"));
  batch.set(msgRef, {
    senderId,
    senderName,
    text: trimmed,
    system: false,
    createdAt: Timestamp.now(),
  });
  batch.update(convRef, {
    lastMessageText: preview,
    lastMessageAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
    [unreadField]: currentUnread + 1,
  });
  await batch.commit();

  if (!options?.skipNotification) {
    const recipientId = isRequester ? conv.providerId : conv.requesterId;
    await createNotification({
      userId: recipientId as string,
      type: "new_message",
      title: `Message from ${senderName}`,
      body: preview,
      exchangeRequestId: conversationId,
    });
  }
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const convRef = doc(db, "conversations", conversationId);
  const snap = await getDoc(convRef);
  if (!snap.exists()) return;

  const conv = snap.data();
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (userId === conv.requesterId) updates.requesterUnread = 0;
  if (userId === conv.providerId) updates.providerUnread = 0;
  if (Object.keys(updates).length > 1) {
    await updateDoc(convRef, updates);
  }
}

export async function syncConversationFromRequest(
  exchangeRequestId: string,
  data: {
    exchangeStatus: ExchangeStatus;
    requesterMarkedComplete: boolean;
    providerMarkedComplete: boolean;
  },
): Promise<void> {
  const convRef = doc(db, "conversations", exchangeRequestId);
  const snap = await getDoc(convRef);
  if (!snap.exists()) return;

  const conv = snap.data();
  const wasLocked = Boolean(conv.locked);
  const locked = data.exchangeStatus === "completed";
  await updateDoc(
    convRef,
    stripUndefined({
      exchangeStatus: data.exchangeStatus,
      requesterMarkedComplete: data.requesterMarkedComplete,
      providerMarkedComplete: data.providerMarkedComplete,
      locked,
      updatedAt: serverTimestamp(),
    }),
  );

  if (locked && !wasLocked) {
    await addDoc(collection(convRef, "messages"), {
      senderId: "system",
      senderName: "SkillSwap",
      text: "Both parties marked this barter complete. Chat is now locked. Start a new job request to open a fresh conversation.",
      system: true,
      createdAt: Timestamp.now(),
    });
  }
}

export async function updateConversationExchangeStatus(
  exchangeRequestId: string,
  exchangeStatus: ExchangeStatus,
): Promise<void> {
  const convRef = doc(db, "conversations", exchangeRequestId);
  const snap = await getDoc(convRef);
  if (!snap.exists()) return;

  await updateDoc(convRef, {
    exchangeStatus,
    updatedAt: serverTimestamp(),
  });
}

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  exchangeRequestId: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    exchangeRequestId: input.exchangeRequestId,
    read: false,
    createdAt: serverTimestamp(),
  });
}
