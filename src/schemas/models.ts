import { z } from "zod";
export const lotSchema = z
  .object({
    id: z.string().uuid(),
    cardId: z.string().min(1),
    oracleId: z.string().optional(),
    name: z.string(),
    set: z.string(),
    collectorNumber: z.string(),
    language: z.string().min(2),
    finish: z.enum(["nonfoil", "foil", "etched"]),
    condition: z.enum(["MT", "NM", "EX", "GD", "LP", "PL", "PO"]),
    signed: z.boolean(),
    altered: z.boolean(),
    quantity: z.number().int().min(1),
    trade: z.number().int().min(0),
    notes: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine(
    (v) => v.trade <= v.quantity,
    "Le Trade ne peut pas dépasser la quantité possédée",
  );
export type Lot = z.infer<typeof lotSchema>;
export const preferencesSchema = z.object({
  theme: z.enum(["dark", "light"]),
  tracked: z.array(z.string()),
  metadataDays: z.number().positive(),
  priceHours: z.number().positive(),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const defaults: Preferences = {
  theme: "dark",
  tracked: [],
  metadataDays: 7,
  priceHours: 24,
};
export const backupSchema = z
  .object({
    schemaVersion: z.literal(1),
    exportedAt: z.string().datetime(),
    lots: z.array(lotSchema),
    preferences: preferencesSchema,
  })
  .superRefine((v, ctx) => {
    if (new Set(v.lots.map((l) => l.id)).size !== v.lots.length)
      ctx.addIssue({
        code: "custom",
        message: "Identifiants de lots dupliqués",
      });
  });
export type Backup = z.infer<typeof backupSchema>;
export interface Card {
  id: string;
  oracle_id?: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  lang: string;
  finishes: string[];
  colors?: string[];
  type_line: string;
  image_uris?: { normal: string; small: string };
  card_faces?: {
    name: string;
    image_uris?: { normal: string; small: string };
  }[];
  prices: { eur: string | null; eur_foil: string | null };
  fetchedAt?: number;
}
export interface SetInfo {
  id: string;
  code: string;
  name: string;
  set_type: string;
  released_at: string;
  card_count: number;
  icon_svg_uri: string;
  fetchedAt?: number;
}
export const imageUrl = (c: Card, face = 0) =>
  c.image_uris?.normal ?? c.card_faces?.[face]?.image_uris?.normal;
export function progress(lots: Lot[], set: string, total: number) {
  const owned = new Set(lots.filter((l) => l.set === set).map((l) => l.cardId))
    .size;
  return { owned, percent: total ? Math.min(100, (owned / total) * 100) : 0 };
}
export function compatible(a: Lot, b: Lot) {
  return (
    [
      "cardId",
      "language",
      "finish",
      "condition",
      "signed",
      "altered",
      "notes",
    ] as const
  ).every((k) => a[k] === b[k]);
}
