import { ListImporter } from "../components/ListImporter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import CardBrowser from "../components/CardBrowser";
import {
  Empty,
  PageHead,
  QueryState,
  useDebounced,
} from "../components/CollectionShared";
import { Scanner } from "../components/Scanner";
import { Button } from "../components/ui/button";
import { type Card } from "../schemas/models";
import { scryfallService } from "../services/scryfall";

export default function Add() {
  const [search, setSearch] = useState("");
  const [committed, setCommitted] = useState("");
  const [extra, setExtra] = useState<Card[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [moreBusy, setMoreBusy] = useState(false);
  const debounced = useDebounced(search);
  const suggestions = useQuery({
    queryKey: ["autocomplete", debounced],
    queryFn: () => scryfallService.autocomplete(debounced),
    enabled: debounced.length >= 2,
  });
  const result = useQuery({
    queryKey: ["search", committed],
    queryFn: () => scryfallService.search(committed),
    enabled: committed.length > 0,
  });
  useEffect(() => {
    setExtra([]);
    setNext(result.data?.next_page);
  }, [result.data]);
  async function more() {
    if (!next) return;
    setMoreBusy(true);
    try {
      const p = await scryfallService.next(next);
      setExtra((old) => [...old, ...p.data]);
      setNext(p.next_page);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMoreBusy(false);
    }
  }
  return (
    <>
      <PageHead
        eyebrow="AGRANDISSEZ L’ARCHIVE"
        title="Ajouter des cartes"
        description="Trouvez la bonne impression. Conservez chaque détail de vos exemplaires."
      />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setCommitted(search.trim());
        }}
      >
        <label className="search">
          <Search size={18} />
          <input
            list="suggestions"
            aria-label="Rechercher une carte Scryfall"
            placeholder="Nom ou recherche Scryfall (ex. Elesh Norn set:one)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <datalist id="suggestions">
            {suggestions.data?.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <Button type="submit" disabled={!search.trim()}>
          Rechercher <ArrowRight size={17} />
        </Button>
      </form>
      <p className="muted">
        Les résultats distinguent chaque édition et numéro. Les filtres
        ci-dessous affinent les impressions chargées.
      </p>
      <QueryState loading={result.isFetching} error={result.error} />
      {result.data && <CardBrowser cards={[...result.data.data, ...extra]} />}
      {next && (
        <Button
          disabled={moreBusy}
          variant="outline"
          onClick={() => void more()}
        >
          Charger les impressions suivantes
        </Button>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ListImporter />
      <Scanner />
      {!committed && (
        <Empty title="Quelle carte rejoint votre collection ?">
          Recherchez son nom pour voir les impressions disponibles.
        </Empty>
      )}
    </>
  );
}
