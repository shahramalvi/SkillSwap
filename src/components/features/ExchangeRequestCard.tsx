import { Coins, Handshake, MessageSquare } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useExchangeRequests } from "../../hooks/useExchangeRequests";
import { formatRelativeTime } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import type { CounterOfferInput, ExchangeRequest } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface ExchangeRequestCardProps {
  request: ExchangeRequest;
}

export function ExchangeRequestCard({ request }: ExchangeRequestCardProps) {
  const userId = useAuthStore((s) => s.user?.uid);
  const {
    acceptExchangeRequest,
    counterExchangeRequest,
    rejectExchangeRequest,
    cancelExchangeRequest,
    completeExchangeRequest,
    canAccept,
  } = useExchangeRequests();

  const [showCounter, setShowCounter] = useState(false);
  const [counterScope, setCounterScope] = useState(request.scopeDescription);
  const [counterTokens, setCounterTokens] = useState(
    request.proposedTokens ?? request.listedTokenRate,
  );
  const [counterBarter, setCounterBarter] = useState(
    request.barterOffer?.description ?? "",
  );
  const [busy, setBusy] = useState(false);

  const isRequester = userId === request.requesterId;
  const isProvider = userId === request.providerId;
  const otherName = isRequester ? request.providerName : request.requesterName;
  const mayAccept = userId ? canAccept(request, userId) : false;
  const open = ["pending", "negotiating"].includes(request.status);

  const run = async (fn: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      setShowCounter(false);
    } catch (err) {
      toast.error((err as Error).message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const submitCounter = () => {
    const input: CounterOfferInput = {
      scopeDescription: counterScope,
      proposedTokens: request.mode === "token" ? counterTokens : undefined,
      barterOffer:
        request.mode === "barter"
          ? { description: counterBarter.trim() }
          : undefined,
    };
    void run(
      () => counterExchangeRequest(request.id, input),
      "Counter offer sent",
    );
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-navy">{request.skillTitle}</p>
          <p className="text-xs text-muted mt-0.5">
            with {otherName} · {formatRelativeTime(request.updatedAt.toDate())}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={request.mode === "token" ? "teal" : "navy"}>
            {request.mode === "token" ? (
              <span className="inline-flex items-center gap-1">
                <Coins size={11} /> Tokens
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Handshake size={11} /> Barter
              </span>
            )}
          </Badge>
          <Badge
            variant={
              request.status === "completed"
                ? "teal"
                : request.status === "rejected" || request.status === "cancelled"
                  ? "danger"
                  : "navy"
            }
          >
            {request.status}
          </Badge>
        </div>
      </div>

      <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs font-semibold text-muted uppercase mb-1">Scope</p>
        <p>{request.scopeDescription}</p>
        {request.mode === "token" && request.proposedTokens != null && (
          <p className="mt-2 font-bold text-teal flex items-center gap-1">
            <Coins size={14} /> Offer: {request.proposedTokens} tokens
            <span className="text-muted font-normal text-xs ml-1">
              (listed {request.listedTokenRate})
            </span>
          </p>
        )}
        {request.mode === "barter" && request.barterOffer && (
          <p className="mt-2 text-navy">
            <span className="font-semibold">Barter offer:</span>{" "}
            {request.barterOffer.skillTitle
              ? `${request.barterOffer.skillTitle} — `
              : ""}
            {request.barterOffer.description}
          </p>
        )}
        {request.escrowStatus === "held" && (
          <p className="mt-2 text-xs text-amber-700 font-medium">
            {request.agreedTokens} tokens in escrow
          </p>
        )}
      </div>

      {request.offers.length > 1 && (
        <p className="text-xs text-muted flex items-center gap-1">
          <MessageSquare size={12} /> {request.offers.length} offers in thread
        </p>
      )}

      {showCounter && open && (
        <div className="space-y-3 border-t border-border pt-4">
          <textarea
            value={counterScope}
            onChange={(e) => setCounterScope(e.target.value)}
            rows={3}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm"
            placeholder="Revised scope..."
          />
          {request.mode === "token" ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted">Tokens</label>
              <input
                type="number"
                min={1}
                max={500}
                value={counterTokens}
                onChange={(e) => setCounterTokens(Number(e.target.value))}
                className="border border-border rounded-lg px-3 py-1.5 w-24 text-sm"
              />
            </div>
          ) : (
            <textarea
              value={counterBarter}
              onChange={(e) => setCounterBarter(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm"
              placeholder="Revised barter offer..."
            />
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={submitCounter} disabled={busy}>
              Send counter
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCounter(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {open && mayAccept && (
          <Button
            size="sm"
            variant="primary"
            disabled={busy}
            onClick={() =>
              run(() => acceptExchangeRequest(request.id), "Offer accepted")
            }
          >
            Accept
          </Button>
        )}
        {open && (isProvider || isRequester) && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setShowCounter(!showCounter)}
          >
            Counter
          </Button>
        )}
        {open && isProvider && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              run(() => rejectExchangeRequest(request.id), "Request rejected")
            }
          >
            Reject
          </Button>
        )}
        {open && isRequester && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              run(() => cancelExchangeRequest(request.id), "Request cancelled")
            }
          >
            Cancel
          </Button>
        )}
        {request.status === "accepted" && (
          <>
            {request.mode === "token" && isProvider && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  run(
                    () => completeExchangeRequest(request.id),
                    "Work marked complete — tokens released",
                  )
                }
              >
                Mark complete
              </Button>
            )}
            {request.mode === "barter" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  run(() => completeExchangeRequest(request.id), "Marked your side complete")
                }
              >
                {isRequester && request.requesterMarkedComplete
                  ? "You marked done"
                  : isProvider && request.providerMarkedComplete
                    ? "You marked done"
                    : "Mark my side complete"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
