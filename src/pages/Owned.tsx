import { Layers3, ChevronDown } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import CardBrowser from "../components/CardBrowser";
import { PageHead, Stats, useLots } from "../components/CollectionShared";
import LotsPanel from "../components/LotsPanel";
import { Button } from "../components/ui/button";
import { db } from "../db";
import { scryfallService } from "../services/scryfall";
import { useUI } from "../stores/ui";

export default function Owned() {
  const lots = useLots();
  const cards = useLiveQuery(() => db.cards.toArray(), []) ?? [];
  const notify = useUI((s) => s.notify);
  const ids = [...new Set(lots.map((l) => l.cardId))];
  const absent = ids.filter((id) => !cards.some((c) => c.id === id));
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setBusy(true);
    try {
      const n = await scryfallService.refreshOwned();
      notify(n + " impressions et prix actualisés");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    setBusy(true);
    try {
      for (const id of absent) await scryfallService.card(id);
      notify("Métadonnées restaurées");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead
        eyebrow="L’ARCHIVE COMPLÈTE"
        title="Toutes mes cartes"
        description="Toutes vos impressions et tous vos exemplaires, réunis au même endroit."
      >
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void refresh()}
        >
          Actualiser les prix
        </Button>
      </PageHead>
      <Stats />
      {absent.length > 0 && (
        <div className="notice">
          {absent.length} impression(s) à récupérer. Vos lots sont conservés
          même sans catalogue.{" "}
          <Button disabled={busy} onClick={() => void restore()}>
            Récupérer les métadonnées
          </Button>
        </div>
      )}
      <CardBrowser
        manageOwned
        showEditionFilter
        cards={cards.filter((c) => ids.includes(c.id))}
      />
      <details className="owned-lots">
        <summary>
          <Layers3 size={18} />
          <span>
            Gérer mes exemplaires<small>Quantités, langues et états</small>
          </span>
          <ChevronDown size={17} />
        </summary>
        <LotsPanel />
      </details>
    </>
  );
}
