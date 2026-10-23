import { Grid2X2, List, Search } from "lucide-react";
import { useState } from "react";
import { CardTile } from "../components/CardTile";
import { Empty, useLots } from "../components/CollectionShared";
import { LotEditor } from "../components/LotEditor";
import { Button } from "../components/ui/button";
import { type Card } from "../schemas/models";
import { scryfallPriceProvider } from "../services/pricing";

export default function CardBrowser({ cards }: { cards: Card[] }) {
  const lots = useLots();
  const [name, setName] = useState("");
  const [ownership, setOwnership] = useState("all");
  const [edition, setEdition] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [color, setColor] = useState("all");
  const [finish, setFinish] = useState("all");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("name");
  const [list, setList] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);
  const quantity = (id: string) =>
    lots.filter((l) => l.cardId === id).reduce((n, l) => n + l.quantity, 0);
  const filtered = cards
    .filter(
      (c) =>
        `${c.name} ${c.collector_number}`
          .toLowerCase()
          .includes(name.toLowerCase()) &&
        (ownership === "all" ||
          (ownership === "owned"
            ? quantity(c.id) > 0
            : quantity(c.id) === 0)) &&
        (edition === "all" || c.set === edition) &&
        (rarity === "all" || rarity === c.rarity) &&
        (color === "all" ||
          (color === "C" ? !c.colors?.length : c.colors?.includes(color))) &&
        (finish === "all" || c.finishes.includes(finish)) &&
        c.type_line.toLowerCase().includes(type.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "value"
        ? (scryfallPriceProvider.quote(b, "nonfoil").amount ?? -1) -
          (scryfallPriceProvider.quote(a, "nonfoil").amount ?? -1)
        : sort === "quantity"
          ? quantity(b.id) - quantity(a.id)
          : sort === "set"
            ? a.set.localeCompare(b.set)
            : sort === "rarity"
              ? a.rarity.localeCompare(b.rarity)
              : a.name.localeCompare(b.name),
    );
  return (
    <>
      <div className="toolbar wrap">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Nom ou numéro"
            placeholder="Nom ou numéro de collection…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <select
          aria-label="Possession"
          value={ownership}
          onChange={(e) => setOwnership(e.target.value)}
        >
          <option value="all">Toutes les cartes</option>
          <option value="owned">Possédées</option>
          <option value="missing">Manquantes</option>
        </select>
        <select
          aria-label="Édition"
          value={edition}
          onChange={(e) => setEdition(e.target.value)}
        >
          <option value="all">Toutes éditions</option>
          {[...new Set(cards.map((c) => c.set))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
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
          aria-label="Couleur"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          <option value="all">Couleurs</option>
          {["W", "U", "B", "R", "G", "C"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Finition"
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
        >
          <option value="all">Finitions</option>
          {["nonfoil", "foil", "etched"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <input
          className="type-filter"
          aria-label="Type de carte"
          placeholder="Type de carte…"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <select
          aria-label="Tri des cartes"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Nom</option>
          <option value="value">Valeur</option>
          <option value="quantity">Quantité</option>
          <option value="rarity">Rareté</option>
          <option value="set">Extension</option>
        </select>
        <Button
          variant="ghost"
          aria-label={list ? "Vue grille" : "Vue liste"}
          onClick={() => setList(!list)}
        >
          {list ? <Grid2X2 size={18} /> : <List size={18} />}
        </Button>
      </div>
      <p className="muted result-count">
        {filtered.length} impressions affichées
      </p>
      <div className={list ? "cards-list" : "cards-grid"}>
        {filtered.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            quantity={quantity(c.id)}
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
