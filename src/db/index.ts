import Dexie, { type Table } from "dexie";
import {
  backupSchema,
  defaults,
  lotSchema,
  type Backup,
  type Card,
  type Lot,
  type Preferences,
  type SetInfo,
} from "../schemas/models";
class VaultDB extends Dexie {
  lots!: Table<Lot, string>;
  cards!: Table<Card, string>;
  sets!: Table<SetInfo, string>;
  settings!: Table<{ id: string; value: Preferences }, string>;
  cache!: Table<{ id: string; at: number; data: unknown }, string>;
  constructor() {
    super("phyrexian-vault");
    this.version(1).stores({
      lots: "id,cardId,set,updatedAt",
      cards: "id,set",
      sets: "code,set_type",
      settings: "id",
      cache: "id",
    });
  }
}
export const db = new VaultDB();
export async function prefs() {
  return (await db.settings.get("preferences"))?.value ?? defaults;
}
export async function savePrefs(value: Preferences) {
  await db.settings.put({ id: "preferences", value });
}
export async function saveLot(lot: Lot) {
  await db.lots.put(lotSchema.parse(lot));
}
export async function exportBackup(): Promise<Backup> {
  return backupSchema.parse({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    lots: await db.lots.toArray(),
    preferences: await prefs(),
  });
}
export async function importBackup(input: unknown, replace = false) {
  const b = backupSchema.parse(input);
  await db.transaction("rw", db.lots, db.settings, async () => {
    if (replace) await db.lots.clear();
    for (const l of b.lots) {
      const old = await db.lots.get(l.id);
      if (!old || replace || l.updatedAt > old.updatedAt) await db.lots.put(l);
    }
    const old = await prefs();
    await savePrefs(
      replace
        ? b.preferences
        : {
            ...old,
            tracked: [...new Set([...old.tracked, ...b.preferences.tracked])],
          },
    );
  });
}
export async function clearCatalog() {
  await db.transaction("rw", db.cards, db.sets, db.cache, async () => {
    await db.cards.clear();
    await db.sets.clear();
    await db.cache.clear();
  });
}
