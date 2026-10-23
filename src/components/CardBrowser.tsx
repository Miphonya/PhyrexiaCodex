import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CardTile } from "./CardTile";
import { Empty, useLots } from "./CollectionShared";
import { LotEditor } from "./LotEditor";
import { Button } from "./ui/button";
import type { Card } from "../schemas/models";
import { usePricing } from "../hooks/usePricing";
import { compareCollectorNumbers } from "../services/cardSort";
export default function CardBrowser({
  cards,
  markMissing = false,
}: {
  cards: Card[];
  markMissing?: boolean;
}) {
  const pricing = usePricing(),
    lots = useLots();
  const [name, setName] = useState(""),
    [ownership, setOwnership] = useState("all"),
    [edition, setEdition] = useState("all"),
    [rarity, setRarity] = useState("all"),
    [color, setColor] = useState("all"),
    [type, setType] = useState("");
  const [sort, setSort] = useState(markMissing ? "number" : "name"),
    [list, setList] = useState(false),
    [advanced, setAdvanced] = useState(false),
    [selected, setSelected] = useState<Card | null>(null);
  const quantity = (id: string) =>
    lots.filter((l) => l.cardId === id).reduce((n, l) => n + l.quantity, 0);
  const editions = [...new Set(cards.map((c) => c.set))];
  const extraCount =
    Number(color !== "all") +
    Number(Boolean(type)) +
    Number(!markMissing && edition !== "all");
  const filtered = cards
    .filter(
      (c) =>
        `${c.name} ${c.collector_number}`
          .toLowerCase()
          .includes(name.toLowerCase()) &&
        (!markMissing ||
          ownership === "all" ||
          (ownership === "owned"
            ? quantity(c.id) > 0
            : quantity(c.id) === 0)) &&
        (markMissing || edition === "all" || c.set === edition) &&
        (rarity === "all" || c.rarity === rarity) &&
        (color === "all" ||
          (color === "C" ? !c.colors?.length : c.colors?.includes(color))) &&
        c.type_line.toLowerCase().includes(type.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "number"
        ? compareCollectorNumbers(a, b)
        : sort === "value"
          ? (pricing.quote(b).amount ?? -1) - (pricing.quote(a).amount ?? -1)
          : sort === "quantity"
            ? quantity(b.id) - quantity(a.id)
            : a.name.localeCompare(b.name),
    );
  return (
    <>
      <div className="toolbar wrap">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Nom ou numéro"
            placeholder="Nom ou numéro de carte…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {markMissing && (
          <select
            aria-label="Possession"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
          >
            <option value="all">Toutes les cartes</option>
            <option value="owned">Possédées</option>
            <option value="missing">Manquantes</option>
          </select>
        )}
        <select
          aria-label="Rareté"
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
        >
          <option value="all">Toutes raretés</option>
          {["common", "uncommon", "rare", "mythic", "special", "bonus"].map(
            (r) => (
              <option key={r}>{r}</option>
            ),
          )}
        </select>
        <select
          aria-label="Tri des cartes"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="number">Numéro de carte</option>
          <option value="name">Nom</option>
          <option value="value">Valeur</option>
          <option value="quantity">Quantité</option>
        </select>
        <Button
          variant="outline"
          aria-expanded={advanced}
          aria-controls="advanced-card-filters"
          onClick={() => setAdvanced(!advanced)}
        >
          <SlidersHorizontal size={15} /> Plus de filtres
          {extraCount > 0 ? ` (${extraCount})` : ""}
        </Button>
        <Button
          variant="ghost"
          aria-label={list ? "Vue grille" : "Vue liste"}
          onClick={() => setList(!list)}
        >
          {list ? <Grid2X2 size={18} /> : <List size={18} />}
        </Button>
      </div>
      {advanced && (
        <div className="advanced-filters" id="advanced-card-filters">
          {!markMissing && editions.length > 1 && (
            <label>
              Édition
              <select
                aria-label="Édition"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              >
                <option value="all">Toutes éditions</option>
                {editions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Couleur
            <select
              aria-label="Couleur"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="all">Toutes les couleurs</option>
              {["W", "U", "B", "R", "G", "C"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Type
            <input
              aria-label="Type de carte"
              placeholder="Créature, artefact…"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </label>
          {extraCount > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                setColor("all");
                setType("");
                setEdition("all");
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      )}
      <p className="muted result-count">
        {filtered.length} impressions affichées
      </p>
      <div className={list ? "cards-list" : "cards-grid"}>
        {filtered.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            quantity={quantity(c.id)}
            missing={markMissing && quantity(c.id) === 0}
            onAdd={() => setSelected(c)}
          />
        ))}
      </div>
      {!filtered.length && (
        <Empty title="Aucune carte à afficher">
          Ajoutez une carte ou ajustez vos filtres.
        </Empty>
      )}
      {selected && (
        <LotEditor card={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
