import type { Card, Lot } from "../schemas/models";
export interface PriceQuote {
  amount: number | null;
  currency: "EUR";
  source: string;
  updatedAt: number | null;
}
export interface PriceProvider {
  quote(card: Card, finish: Lot["finish"]): PriceQuote;
}
export const scryfallPriceProvider: PriceProvider = {
  quote(card, finish) {
    const raw =
      finish === "etched"
        ? null
        : finish === "foil"
          ? card.prices.eur_foil
          : card.prices.eur;
    const value = raw === null ? null : Number(raw);
    return {
      amount:
        value !== null && Number.isFinite(value) && value >= 0 ? value : null,
      currency: "EUR",
      source: "Scryfall",
      updatedAt: card.fetchedAt ?? null,
    };
  },
};
export const money = (n: number | null) =>
  n === null
    ? "N/A"
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(n);
