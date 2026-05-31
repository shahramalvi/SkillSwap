import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  appendCounterBarterOffer,
  ensureBarterOffersLoaded,
  hydrateExchangeRequest,
  saveInitialBarterOffer,
} from "../lib/barterOffersStore";
import {
  createConversationForRequest,
  createNotification,
  sendChatMessage,
  syncConversationFromRequest,
  updateConversationExchangeStatus,
} from "../lib/conversationsService";
import { db } from "../lib/firebase";
import { stripUndefined } from "../lib/firestoreUtils";
import { useAuthStore } from "../store/authStore";
import type {
  BarterOffer,
  CounterOfferInput,
  CreateExchangeRequestInput,
  ExchangeOffer,
  ExchangeRequest,
} from "../types";

function sanitizeBarterOffer(offer: BarterOffer): BarterOffer {
  const sanitized: BarterOffer = { description: offer.description.trim() };
  if (offer.skillId) sanitized.skillId = offer.skillId;
  if (offer.skillTitle?.trim()) sanitized.skillTitle = offer.skillTitle.trim();
  return sanitized;
}

function lastOfferFrom(request: ExchangeRequest): ExchangeOffer | undefined {
  return request.offers[request.offers.length - 1];
}

function canAccept(request: ExchangeRequest, userId: string): boolean {
  if (!["pending", "negotiating"].includes(request.status)) return false;
  const last = lastOfferFrom(request);
  if (!last) return false;
  return last.fromUserId !== userId;
}

function mapDoc(id: string, data: Record<string, unknown>): ExchangeRequest {
  return hydrateExchangeRequest({ id, ...data } as ExchangeRequest);
}

export function useExchangeRequests() {
  const currentUser = useAuthStore((s) => s.user);

  const subscribeMyExchangeRequests = useCallback(
    (callback: (requests: ExchangeRequest[]) => void): Unsubscribe | null => {
      if (!currentUser) return null;

      const asRequester = query(
        collection(db, "exchangeRequests"),
        where("requesterId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
      );
      const asProvider = query(
        collection(db, "exchangeRequests"),
        where("providerId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
      );

      const sent: ExchangeRequest[] = [];
      const received: ExchangeRequest[] = [];
      let sentReady = false;
      let receivedReady = false;

      const merge = () => {
        if (!sentReady || !receivedReady) return;
        const map = new Map<string, ExchangeRequest>();
        [...sent, ...received].forEach((r) => map.set(r.id, r));
        callback(
          Array.from(map.values()).sort(
            (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
          ),
        );
      };

      void ensureBarterOffersLoaded().then(merge);

      const unsubSent = onSnapshot(
        asRequester,
        (snap) => {
          sent.length = 0;
          sent.push(
            ...snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>)),
          );
          sentReady = true;
          void ensureBarterOffersLoaded().then(merge);
        },
        () => {
          sentReady = true;
          merge();
        },
      );

      const unsubReceived = onSnapshot(
        asProvider,
        (snap) => {
          received.length = 0;
          received.push(
            ...snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>)),
          );
          receivedReady = true;
          void ensureBarterOffersLoaded().then(merge);
        },
        () => {
          receivedReady = true;
          merge();
        },
      );

      return () => {
        unsubSent();
        unsubReceived();
      };
    },
    [currentUser],
  );

  const createExchangeRequest = useCallback(
    async (input: CreateExchangeRequestInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      if (input.providerId === currentUser.uid) {
        throw new Error("Cannot request your own skill");
      }
      if (!input.barterOffer?.description?.trim()) {
        throw new Error("Describe what you offer in return");
      }

      const barterOffer = sanitizeBarterOffer(input.barterOffer);
      await ensureBarterOffersLoaded();

      const ref = doc(collection(db, "exchangeRequests"));
      const initialOffer = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        scopeDescription: input.scopeDescription.trim(),
        createdAt: Timestamp.now(),
      };

      const payload = stripUndefined({
        id: ref.id,
        skillId: input.skillId,
        skillTitle: input.skillTitle,
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        providerId: input.providerId,
        providerName: input.providerName,
        status: "pending" as const,
        scopeDescription: input.scopeDescription.trim(),
        offers: [initialOffer],
        requesterMarkedComplete: false,
        providerMarkedComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      saveInitialBarterOffer(ref.id, barterOffer);
      await setDoc(ref, payload);

      const barterSummary = barterOffer.skillTitle
        ? `${barterOffer.skillTitle}: ${barterOffer.description}`
        : barterOffer.description;
      const initialMessage = `New barter proposal for "${input.skillTitle}"\n\nScope: ${input.scopeDescription.trim()}\n\nOffer: ${barterSummary}`;

      await createConversationForRequest({
        exchangeRequestId: ref.id,
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        providerId: input.providerId,
        providerName: input.providerName,
        skillTitle: input.skillTitle,
        exchangeStatus: "pending",
        initialMessage,
        senderId: currentUser.uid,
        senderName: currentUser.name,
      });

      await createNotification({
        userId: input.providerId,
        type: "new_request",
        title: `New barter request from ${currentUser.name}`,
        body: `${input.skillTitle} — open chat to respond`,
        exchangeRequestId: ref.id,
      });

      return ref.id;
    },
    [currentUser],
  );

  const acceptExchangeRequest = useCallback(
    async (requestId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = snap.data() as ExchangeRequest;

      if (!canAccept(req, currentUser.uid)) {
        throw new Error("You cannot accept this offer");
      }

      await updateDoc(reqRef, {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      await updateConversationExchangeStatus(requestId, "accepted");

      await sendChatMessage(
        requestId,
        currentUser.uid,
        currentUser.name,
        "Accepted barter.",
        { skipNotification: true },
      );

      const notifyUserId =
        req.requesterId === currentUser.uid ? req.providerId : req.requesterId;
      await createNotification({
        userId: notifyUserId,
        type: "request_accepted",
        title: "Barter offer accepted",
        body: `${req.skillTitle} — continue in chat`,
        exchangeRequestId: requestId,
      });
    },
    [currentUser],
  );

  const counterExchangeRequest = useCallback(
    async (requestId: string, input: CounterOfferInput) => {
      if (!currentUser) throw new Error("Not authenticated");

      await ensureBarterOffersLoaded();

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = mapDoc(snap.id, snap.data() as Record<string, unknown>);

      if (!["pending", "negotiating"].includes(req.status)) {
        throw new Error("Request is closed");
      }
      const isParty =
        req.requesterId === currentUser.uid || req.providerId === currentUser.uid;
      if (!isParty) throw new Error("Not a participant");

      if (!input.barterOffer?.description?.trim()) {
        throw new Error("Describe your barter offer");
      }

      const barterOffer = sanitizeBarterOffer(input.barterOffer);
      const nextIndex = req.offers.length;

      const offer = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        scopeDescription: input.scopeDescription.trim(),
        createdAt: Timestamp.now(),
      };

      appendCounterBarterOffer(requestId, barterOffer, nextIndex);

      await updateDoc(
        reqRef,
        stripUndefined({
          status: "negotiating",
          scopeDescription: input.scopeDescription.trim(),
          offers: arrayUnion(offer),
          updatedAt: serverTimestamp(),
        }),
      );
    },
    [currentUser],
  );

  const rejectExchangeRequest = useCallback(
    async (requestId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = snap.data() as ExchangeRequest;

      if (req.providerId !== currentUser.uid && req.requesterId !== currentUser.uid) {
        throw new Error("Not a participant");
      }
      if (!["pending", "negotiating", "accepted"].includes(req.status)) {
        throw new Error("Request is closed");
      }

      await updateDoc(reqRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser],
  );

  const cancelExchangeRequest = useCallback(
    async (requestId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = snap.data() as ExchangeRequest;

      if (req.requesterId !== currentUser.uid) {
        throw new Error("Only the requester can cancel");
      }
      if (!["pending", "negotiating", "accepted"].includes(req.status)) {
        throw new Error("Cannot cancel");
      }

      await updateDoc(reqRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser],
  );

  const completeExchangeRequest = useCallback(
    async (requestId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = snap.data() as ExchangeRequest;

      if (req.status !== "accepted") {
        throw new Error("Request must be accepted first");
      }

      const isRequester = req.requesterId === currentUser.uid;
      const isProvider = req.providerId === currentUser.uid;
      if (!isRequester && !isProvider) throw new Error("Not a participant");

      const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (isRequester) updates.requesterMarkedComplete = true;
      if (isProvider) updates.providerMarkedComplete = true;

      const requesterDone = isRequester || req.requesterMarkedComplete;
      const providerDone = isProvider || req.providerMarkedComplete;

      if (requesterDone && providerDone) {
        updates.status = "completed";
      }

      await updateDoc(reqRef, stripUndefined(updates));

      const requesterMarkedComplete = Boolean(
        isRequester ? true : req.requesterMarkedComplete,
      );
      const providerMarkedComplete = Boolean(
        isProvider ? true : req.providerMarkedComplete,
      );
      const exchangeStatus = requesterMarkedComplete && providerMarkedComplete
        ? "completed"
        : req.status;

      await syncConversationFromRequest(requestId, {
        exchangeStatus,
        requesterMarkedComplete,
        providerMarkedComplete,
      });

      if (requesterMarkedComplete && providerMarkedComplete) {
        const otherId = isRequester ? req.providerId : req.requesterId;
        await createNotification({
          userId: otherId,
          type: "barter_complete",
          title: "Barter marked complete",
          body: `${req.skillTitle} — chat is now locked`,
          exchangeRequestId: requestId,
        });
      }
    },
    [currentUser],
  );

  return {
    subscribeMyExchangeRequests,
    createExchangeRequest,
    acceptExchangeRequest,
    counterExchangeRequest,
    rejectExchangeRequest,
    cancelExchangeRequest,
    completeExchangeRequest,
    canAccept,
  };
}

export function useExchangeRequest(requestId: string | undefined) {
  const [request, setRequest] = useState<ExchangeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) {
      setRequest(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "exchangeRequests", requestId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setRequest(null);
        } else {
          void ensureBarterOffersLoaded().then(() => {
            setRequest(mapDoc(snap.id, snap.data() as Record<string, unknown>));
          });
        }
        setLoading(false);
      },
      () => {
        setRequest(null);
        setLoading(false);
      },
    );

    return unsub;
  }, [requestId]);

  return { request, loading };
}
