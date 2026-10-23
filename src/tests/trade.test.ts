import { it, expect } from "vitest";
import { tradeLots } from "../services/trade";
import type { Lot, Card } from "../schemas/models";
const lot = (id: string, quantity: number, extra: Partial<Lot> = {}): Lot => ({ id, cardId: id, oracleId: "oracle-norn", name: "Elesh Norn", set: "one", collectorNumber: "10", language: "fr", finish: "nonfoil", condition: "NM", signed: false, altered: false, quantity, trade: 0, notes: "", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", ...extra });
it("réserve un exemplaire et propose les suivants sans modifier les données sources", () => {
  const lots = [lot("a", 3)];
  expect(tradeLots(lots, true)[0].trade).toBe(2);
  expect(lots[0].trade).toBe(0);
  expect(tradeLots([lot("unique", 1)], true)[0].trade).toBe(0);
});
it("regroupe les impressions, langues, états et finitions par carte", () => {
  const lots = [lot("a", 1), lot("b", 2, { set: "mbs", language: "en", finish: "foil", signed: true, condition: "EX" })];
  expect(tradeLots(lots, true).map(l => l.trade)).toEqual([0, 2]);
});
it("garde le plus ancien même si les lots arrivent dans un autre ordre", () => {
  const lots = [lot("new", 2, { createdAt: "2026-02-01T00:00:00.000Z" }), lot("old", 1)];
  expect(tradeLots(lots, true).map(l => l.trade)).toEqual([2, 0]);
});
it("ne confond pas deux identités Oracle distinctes", () => {
  expect(tradeLots([lot("a", 1), lot("b", 1, { oracleId: "autre" })], true).map(l => l.trade)).toEqual([0, 0]);
});
it("réconcilie les anciens lots sans Oracle avec les noms et le catalogue", () => {
  const old = lot("old", 1, { oracleId: undefined });
  expect(tradeLots([old, lot("new", 2)], true).reduce((n, l) => n + l.trade, 0)).toBe(2);
  const card = { id: "other-print", name: "Elesh Norn", oracle_id: "oracle-norn" } as Card;
  expect(tradeLots([old, lot("other-print", 2, { oracleId: undefined })], true, [card]).reduce((n, l) => n + l.trade, 0)).toBe(2);
});
it("recalcule les doublons après une baisse de quantité ou un retrait", () => {
  expect(tradeLots([lot("a", 4), lot("b", 2)], true).reduce((n, l) => n + l.trade, 0)).toBe(5);
  expect(tradeLots([lot("b", 2)], true)[0].trade).toBe(1);
  expect(tradeLots([lot("b", 1)], true)[0].trade).toBe(0);
});
it("désactiver l’option restitue exactement les quantités manuelles", () => {
  const lots = [lot("a", 3, { trade: 1 }), lot("b", 1, { trade: 0 })];
  expect(tradeLots(lots, true).reduce((n, l) => n + l.trade, 0)).toBe(3);
  expect(tradeLots(lots, false)).toEqual(lots);
});
