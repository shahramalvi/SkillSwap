import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { useCallback } from "react";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type {
  CounterOfferInput,
  CreateExchangeRequestInput,
  ExchangeOffer,
  ExchangeRequest,
  User,
} from "../types";

function lastOfferFrom(request: ExchangeRequest): ExchangeOffer | undefined {
  return request.offers[request.offers.length - 1];
}

function canAccept(request: ExchangeRequest, userId: string): boolean {
  if (!["pending", "negotiating"].includes(request.status)) return false;
  const last = lastOfferFrom(request);
  if (!last) return false;
  return last.fromUserId !== userId;
}

export function useExchangeRequests() {
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokenBalance = useAuthStore((s) => s.setTokenBalance);

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

      const unsubSent = onSnapshot(asRequester, (snap) => {
        sent.length = 0;
        sent.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ExchangeRequest));
        sentReady = true;
        merge();
      });

      const unsubReceived = onSnapshot(asProvider, (snap) => {
        received.length = 0;
        received.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ExchangeRequest));
        receivedReady = true;
        merge();
      });

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
      if (input.mode === "token") {
        if (input.proposedTokens == null || input.proposedTokens < 1) {
          throw new Error("Proposed tokens required");
        }
      } else if (!input.barterOffer?.description?.trim()) {
        throw new Error("Describe what you offer in return");
      }

      const ref = doc(collection(db, "exchangeRequests"));
      const initialOffer: Omit<ExchangeOffer, "createdAt"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
      } = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        scopeDescription: input.scopeDescription.trim(),
        createdAt: serverTimestamp(),
      };
      if (input.mode === "token") {
        initialOffer.proposedTokens = input.proposedTokens;
      } else {
        initialOffer.barterOffer = input.barterOffer;
      }

      const payload = {
        id: ref.id,
        skillId: input.skillId,
        skillTitle: input.skillTitle,
        listedTokenRate: input.listedTokenRate,
        mode: input.mode,
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        providerId: input.providerId,
        providerName: input.providerName,
        status: "pending" as const,
        scopeDescription: input.scopeDescription.trim(),
        proposedTokens: input.mode === "token" ? input.proposedTokens : undefined,
        barterOffer: input.mode === "barter" ? input.barterOffer : undefined,
        offers: [initialOffer],
        escrowStatus: "none" as const,
        requesterMarkedComplete: false,
        providerMarkedComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(ref, payload);
      return ref.id;
    },
    [currentUser],
  );

  const finalizeTokenAccept = useCallback(
    async (requestId: string, agreedTokens: number) => {
      const reqRef = doc(db, "exchangeRequests", requestId);

      let requesterId = "";

      await runTransaction(db, async (transaction) => {
        const reqSnap = await transaction.get(reqRef);
        if (!reqSnap.exists()) throw new Error("Request not found");
        const req = reqSnap.data() as ExchangeRequest;
        if (req.mode !== "token") throw new Error("Not a token request");
        if (!["pending", "negotiating"].includes(req.status)) {
          throw new Error("Request is not open for acceptance");
        }

        requesterId = req.requesterId;
        const requesterRef = doc(db, "users", req.requesterId);
        const requesterSnap = await transaction.get(requesterRef);
        if (!requesterSnap.exists()) throw new Error("Requester not found");
        const requester = requesterSnap.data() as User;
        if (requester.tokenBalance < agreedTokens) {
          throw new Error("Insufficient tokens");
        }

        transaction.update(requesterRef, {
          tokenBalance: requester.tokenBalance - agreedTokens,
        });
        transaction.update(reqRef, {
          status: "accepted",
          agreedTokens,
          escrowStatus: "held",
          updatedAt: serverTimestamp(),
        });
      });

      if (currentUser?.uid === requesterId) {
        const updated = await getDoc(doc(db, "users", requesterId));
        if (updated.exists()) {
          const u = updated.data() as User;
          setUser(u);
          setTokenBalance(u.tokenBalance);
        }
      }
    },
    [currentUser, setUser, setTokenBalance],
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

      const tokens =
        req.mode === "token"
          ? (req.proposedTokens ?? req.listedTokenRate)
          : undefined;

      if (req.mode === "token" && tokens != null) {
        await finalizeTokenAccept(requestId, tokens);
        return;
      }

      await updateDoc(reqRef, {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser, finalizeTokenAccept],
  );

  const counterExchangeRequest = useCallback(
    async (requestId: string, input: CounterOfferInput) => {
      if (!currentUser) throw new Error("Not authenticated");

      const reqRef = doc(db, "exchangeRequests", requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) throw new Error("Request not found");
      const req = snap.data() as ExchangeRequest;

      if (!["pending", "negotiating"].includes(req.status)) {
        throw new Error("Request is closed");
      }
      const isParty =
        req.requesterId === currentUser.uid || req.providerId === currentUser.uid;
      if (!isParty) throw new Error("Not a participant");

      if (req.mode === "token") {
        if (input.proposedTokens == null || input.proposedTokens < 1) {
          throw new Error("Proposed tokens required");
        }
      } else if (!input.barterOffer?.description?.trim()) {
        throw new Error("Describe your barter offer");
      }

      const offer: Omit<ExchangeOffer, "createdAt"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
      } = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        scopeDescription: input.scopeDescription.trim(),
        createdAt: serverTimestamp(),
      };
      if (req.mode === "token") {
        offer.proposedTokens = input.proposedTokens;
      } else {
        offer.barterOffer = input.barterOffer;
      }

      await updateDoc(reqRef, {
        status: "negotiating",
        scopeDescription: input.scopeDescription.trim(),
        proposedTokens: req.mode === "token" ? input.proposedTokens : undefined,
        barterOffer: req.mode === "barter" ? input.barterOffer : undefined,
        offers: arrayUnion(offer),
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser],
  );

  const refundEscrow = useCallback(
    async (requestId: string, finalStatus: "cancelled" | "rejected") => {
      const reqRef = doc(db, "exchangeRequests", requestId);
      let requesterId = "";

      await runTransaction(db, async (transaction) => {
        const reqSnap = await transaction.get(reqRef);
        if (!reqSnap.exists()) throw new Error("Request not found");
        const req = reqSnap.data() as ExchangeRequest;
        requesterId = req.requesterId;

        if (req.escrowStatus !== "held" || !req.agreedTokens) {
          transaction.update(reqRef, {
            status: finalStatus,
            updatedAt: serverTimestamp(),
          });
          return;
        }

        const requesterRef = doc(db, "users", req.requesterId);
        const requesterSnap = await transaction.get(requesterRef);
        if (!requesterSnap.exists()) throw new Error("Requester not found");
        const requester = requesterSnap.data() as User;

        transaction.update(requesterRef, {
          tokenBalance: requester.tokenBalance + req.agreedTokens,
        });
        transaction.update(reqRef, {
          status: finalStatus,
          escrowStatus: "refunded",
          updatedAt: serverTimestamp(),
        });
      });

      if (currentUser?.uid === requesterId) {
        const updated = await getDoc(doc(db, "users", requesterId));
        if (updated.exists()) {
          const u = updated.data() as User;
          setUser(u);
          setTokenBalance(u.tokenBalance);
        }
      }
    },
    [currentUser, setUser, setTokenBalance],
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

      if (req.escrowStatus === "held") {
        await refundEscrow(requestId, "rejected");
        return;
      }

      await updateDoc(reqRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser, refundEscrow],
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

      if (req.escrowStatus === "held") {
        await refundEscrow(requestId, "cancelled");
        return;
      }

      await updateDoc(reqRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser, refundEscrow],
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

      if (req.mode === "barter") {
        const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (isRequester) updates.requesterMarkedComplete = true;
        if (isProvider) updates.providerMarkedComplete = true;

        const requesterDone = isRequester || req.requesterMarkedComplete;
        const providerDone = isProvider || req.providerMarkedComplete;

        if (requesterDone && providerDone) {
          updates.status = "completed";
        }

        await updateDoc(reqRef, updates);
        return;
      }

      if (!isProvider) {
        throw new Error("Only the provider can mark token work complete");
      }
      if (req.escrowStatus !== "held" || !req.agreedTokens) {
        throw new Error("No escrow to release");
      }

      const providerRef = doc(db, "users", req.providerId);

      await runTransaction(db, async (transaction) => {
        const reqSnap = await transaction.get(reqRef);
        if (!reqSnap.exists()) throw new Error("Request not found");
        const fresh = reqSnap.data() as ExchangeRequest;

        const providerSnap = await transaction.get(providerRef);
        if (!providerSnap.exists()) throw new Error("Provider not found");
        const provider = providerSnap.data() as User;

        transaction.update(providerRef, {
          tokenBalance: provider.tokenBalance + fresh.agreedTokens!,
        });
        transaction.update(reqRef, {
          status: "completed",
          escrowStatus: "released",
          providerMarkedComplete: true,
          updatedAt: serverTimestamp(),
        });
      });

      const updated = await getDoc(providerRef);
      if (updated.exists()) {
        const u = updated.data() as User;
        setUser(u);
        setTokenBalance(u.tokenBalance);
      }
    },
    [currentUser, setUser, setTokenBalance],
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
