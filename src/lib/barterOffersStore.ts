import type { BarterOffer, ExchangeRequest } from "../types";

const STORAGE_KEY = "skillswap-barter-offers";

interface BarterOfferEntry {
  current: BarterOffer;
  offers: BarterOffer[];
}

type BarterOffersCatalog = Record<string, BarterOfferEntry>;

let catalog: BarterOffersCatalog = {};
let loadPromise: Promise<void> | null = null;

function sanitizeBarterOffer(offer: BarterOffer): BarterOffer {
  const sanitized: BarterOffer = { description: offer.description.trim() };
  if (offer.skillId) sanitized.skillId = offer.skillId;
  if (offer.skillTitle?.trim()) sanitized.skillTitle = offer.skillTitle.trim();
  return sanitized;
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  } catch {
    // localStorage may be unavailable in private mode
  }
}

export function ensureBarterOffersLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    let seed: BarterOffersCatalog = {};
    try {
      const res = await fetch("/data/barter-offers.json");
      if (res.ok) {
        seed = (await res.json()) as BarterOffersCatalog;
      }
    } catch {
      // seed file optional
    }

    let stored: BarterOffersCatalog = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as BarterOffersCatalog;
    } catch {
      // ignore corrupt localStorage
    }

    catalog = { ...seed, ...stored };
  })();

  return loadPromise;
}

export function saveInitialBarterOffer(requestId: string, offer: BarterOffer): void {
  const sanitized = sanitizeBarterOffer(offer);
  catalog[requestId] = { current: sanitized, offers: [sanitized] };
  persist();
}

export function appendCounterBarterOffer(
  requestId: string,
  offer: BarterOffer,
  offerIndex: number,
): void {
  const sanitized = sanitizeBarterOffer(offer);
  const entry = catalog[requestId] ?? { current: sanitized, offers: [] };
  entry.offers[offerIndex] = sanitized;
  entry.current = sanitized;
  catalog[requestId] = entry;
  persist();
}

export function hydrateExchangeRequest(request: ExchangeRequest): ExchangeRequest {
  const stored = catalog[request.id];

  const current = stored?.current ?? request.barterOffer;
  const offers = request.offers.map((offer, index) => ({
    ...offer,
    barterOffer: stored?.offers[index] ?? offer.barterOffer ?? current,
  }));

  return {
    ...request,
    barterOffer: current,
    offers,
  };
}
