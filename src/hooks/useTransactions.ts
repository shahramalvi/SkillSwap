import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type { CreateTransactionInput, Transaction, User } from "../types";

export function useTransactions() {
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokenBalance = useAuthStore((s) => s.setTokenBalance);

  const subscribeMyTransactions = useCallback(
    (callback: (transactions: Transaction[]) => void): Unsubscribe | null => {
      if (!currentUser) return null;

      const sentQuery = query(
        collection(db, "transactions"),
        where("senderId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
      );

      const receivedQuery = query(
        collection(db, "transactions"),
        where("receiverId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
      );

      const sent: Transaction[] = [];
      const received: Transaction[] = [];
      let sentReady = false;
      let receivedReady = false;

      const merge = () => {
        if (!sentReady || !receivedReady) return;
        const map = new Map<string, Transaction>();
        [...sent, ...received].forEach((tx) => map.set(tx.id, tx));
        const merged = Array.from(map.values()).sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
        );
        callback(merged);
      };

      const unsubSent = onSnapshot(sentQuery, (snap) => {
        sent.length = 0;
        sent.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
        sentReady = true;
        merge();
      });

      const unsubReceived = onSnapshot(receivedQuery, (snap) => {
        received.length = 0;
        received.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
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

  const createTransaction = useCallback(
    async (data: CreateTransactionInput) => {
      if (!currentUser) throw new Error("Not authenticated");

      if (currentUser.tokenBalance < data.tokens) {
        toast.error("Insufficient tokens");
        throw new Error("Insufficient tokens");
      }

      const txRef = doc(collection(db, "transactions"));
      const senderRef = doc(db, "users", data.senderId);

      await runTransaction(db, async (transaction) => {
        const senderSnap = await transaction.get(senderRef);
        if (!senderSnap.exists()) throw new Error("Sender not found");

        const sender = senderSnap.data() as User;
        if (sender.tokenBalance < data.tokens) {
          throw new Error("Insufficient tokens");
        }

        transaction.update(senderRef, {
          tokenBalance: sender.tokenBalance - data.tokens,
        });

        transaction.set(txRef, {
          id: txRef.id,
          ...data,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      });

      const newBalance = currentUser.tokenBalance - data.tokens;
      setTokenBalance(newBalance);

      return txRef.id;
    },
    [currentUser, setTokenBalance],
  );

  const completeTransaction = useCallback(
    async (txId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const txRef = doc(db, "transactions", txId);
      const receiverRef = doc(db, "users", currentUser.uid);

      await runTransaction(db, async (transaction) => {
        const txSnap = await transaction.get(txRef);
        if (!txSnap.exists()) throw new Error("Transaction not found");

        const tx = txSnap.data() as Transaction;
        if (tx.receiverId !== currentUser.uid) {
          throw new Error("Only the receiver can complete this transaction");
        }
        if (tx.status !== "pending") throw new Error("Transaction is not pending");

        const receiverSnap = await transaction.get(receiverRef);
        if (!receiverSnap.exists()) throw new Error("Receiver not found");

        const receiver = receiverSnap.data() as User;
        transaction.update(txRef, { status: "completed" });
        transaction.update(receiverRef, {
          tokenBalance: receiver.tokenBalance + tx.tokens,
        });
      });

      const updated = await getDoc(receiverRef);
      if (updated.exists()) {
        const receiver = updated.data() as User;
        if (receiver.uid === currentUser.uid) {
          setUser(receiver);
        }
      }
    },
    [currentUser, setUser],
  );

  return {
    subscribeMyTransactions,
    createTransaction,
    completeTransaction,
  };
}
