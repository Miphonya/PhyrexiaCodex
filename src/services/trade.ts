import type { Lot } from "../schemas/models";
/** Derived only: disabling automation restores the stored manual trade quantities. */
export function tradeLots(lots: Lot[], automatic: boolean): Lot[] {
  if (!automatic) return lots;
  const groups = new Map<string, Lot[]>();
  for (const lot of lots) {
    // Collector numbers are identifiers: retain suffixes and full-art variants.
    const set = lot.set.trim().toLowerCase();
    const number = lot.collectorNumber.trim().toLowerCase();
    const key = set && number ? JSON.stringify([set, number]) : JSON.stringify(["card", lot.cardId]);
    groups.set(key, [...(groups.get(key) ?? []), lot]);
  }
  const quantities = new Map<string, number>();
  const finishRank = (lot: Lot) => lot.finish === "nonfoil" ? 1 : 0;
  for (const group of groups.values()) {
    let keep = 1;
    const preferred = [...group].sort((a, b) => finishRank(a) - finishRank(b) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
    for (const lot of preferred) {
      const kept = Math.min(keep, lot.quantity); keep -= kept;
      quantities.set(lot.id, Math.max(0, lot.quantity - kept));
    }
  }
  return lots.map(lot => ({ ...lot, trade: quantities.get(lot.id) ?? 0 }));
}
