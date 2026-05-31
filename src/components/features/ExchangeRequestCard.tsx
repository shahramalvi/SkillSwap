import { Handshake, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useExchangeRequests } from "../../hooks/useExchangeRequests";
import { formatRelativeTime } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import type { CounterOfferInput, ExchangeRequest } from "../../types";
import { isDemoRequest } from "../../lib/dashboardDemoData";
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
  const [counterBarter, setCounterBarter] = useState(
    request.barterOffer?.description ?? "",
  );
  const [busy, setBusy] = useState(false);

  const isRequester = userId === request.requesterId;
  const isProvider = userId === request.providerId;
  const isDemo = isDemoRequest(request.id);
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
      barterOffer: { description: counterBarter.trim() },
    };
    void run(
      () => counterExchangeRequest(request.id, input),
      "Counter offer sent",
    );
  };

  return (
    <div className="bg-white border border-white rounded-3xl p-4 sm:p-5 shadow-card space-y-4 w-full min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-2 gap-y-3">
        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
          <p className="font-bold text-navy break-words line-clamp-2">{request.skillTitle}</p>
          <p className="text-xs text-muted mt-0.5 break-words">
            with {otherName} · {formatRelativeTime(request.updatedAt.toDate())}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0 max-w-full">
          <Badge variant="navy">
            <span className="inline-flex items-center gap-1">
              <Handshake size={11} /> Barter
            </span>
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
          {isDemo && <Badge variant="muted">Sample</Badge>}
        </div>
      </div>

      <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-0 overflow-hidden">
        <p className="text-xs font-semibold text-muted uppercase mb-1">Scope</p>
        <p className="break-words line-clamp-4">{request.scopeDescription}</p>
        {request.barterOffer && (
          <p className="mt-2 text-navy break-words line-clamp-3">
            <span className="font-semibold">Barter offer:</span>{" "}
            {request.barterOffer.skillTitle
              ? `${request.barterOffer.skillTitle} — `
              : ""}
            {request.barterOffer.description}
          </p>
        )}
      </div>

      {request.offers.length > 1 && (
        <p className="text-xs text-muted flex items-center gap-1">
          <MessageSquare size={12} /> {request.offers.length} offers in thread
        </p>
      )}

      {!isDemo && (
        <Link
          to={`/chat/${request.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark hover:underline"
        >
          <MessageSquare size={14} /> Open chat
        </Link>
      )}

      {showCounter && open && !isDemo && (
        <div className="space-y-3 border-t border-border pt-4">
          <textarea
            value={counterScope}
            onChange={(e) => setCounterScope(e.target.value)}
            rows={3}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm"
            placeholder="Revised scope..."
          />
          <textarea
            value={counterBarter}
            onChange={(e) => setCounterBarter(e.target.value)}
            rows={2}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm"
            placeholder="Revised barter offer..."
          />
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

      {!isDemo && (
      <div className="flex flex-wrap gap-2 min-w-0">
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
      </div>
      )}
    </div>
  );
}
