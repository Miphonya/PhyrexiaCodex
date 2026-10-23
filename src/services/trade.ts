import type { Card, Lot } from "../schemas/models";
const normalize = (name: string) => name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
/** Derived only: disabling automation restores the stored manual trade quantities. */
export function tradeLots(lots: Lot[], automatic: boolean, cards: Card[] = []): Lot[] {
  if (!automatic) return lots;
  const oracleByCard = new Map(cards.filter(c => c.oracle_id).map(c => [c.id, c.oracle_id!]));
  const oracleByName = new Map(cards.filter(c => c.oracle_id).map(c => [normalize(c.name), c.oracle_id!]));
  for (const lot of lots) if (lot.oracleId) oracleByName.set(normalize(lot.name), lot.oracleId);
  const groups = new Map<string, Lot[]>();
  for (const lot of lots) {
    const key = lot.oracleId ?? oracleByCard.get(lot.cardId) ?? oracleByName.get(normalize(lot.name)) ?? normalize(lot.name);
    groups.set(key, [...(groups.get(key) ?? []), lot]);
  }
  const quantities = new Map<string, number>();
  for (const group of groups.values()) {
    let keep = 1;
    for (const lot of [...group].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))) {
      const kept = Math.min(keep, lot.quantity); keep -= kept;
      quantities.set(lot.id, Math.max(0, lot.quantity - kept));
    }
  }
  return lots.map(lot => ({ ...lot, trade: quantities.get(lot.id) ?? 0 }));
}
