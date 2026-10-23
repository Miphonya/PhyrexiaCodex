import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { imageUrl, type Card } from "../schemas/models";
import { money, scryfallPriceProvider } from "../services/pricing";
export function CardTile({
  card,
  quantity = 0,
  onAdd,
}: {
  card: Card;
  quantity?: number;
  onAdd: () => void;
}) {
  const [face, setFace] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = imageUrl(card, face);
  return (
    <article className="card-tile">
      <div className="card-art">
        {src && !failed ? (
          <img
            src={src}
            alt={card.card_faces?.[face]?.name ?? card.name}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="art-placeholder">
            {card.name}
            <small>Image indisponible</small>
          </div>
        )}
        <span className="price">
          {money(scryfallPriceProvider.quote(card, "nonfoil").amount)}
        </span>
        {card.card_faces?.[1]?.image_uris && (
          <button
            className="flip"
            aria-label="Voir l’autre face"
            onClick={() => setFace(face ? 0 : 1)}
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      <div className="card-caption">
        <span className={"rarity " + card.rarity}>{card.rarity}</span>
        <span>#{card.collector_number}</span>
      </div>
      <h3>{card.name}</h3>
      <div className="card-footer">
        <span>
          {card.set.toUpperCase()}{" "}
          <b>
            · {quantity} possédée{quantity > 1 ? "s" : ""}
          </b>
        </span>
        <button
          className="add-card"
          aria-label={"Ajouter " + card.name}
          onClick={onAdd}
        >
          <Plus size={18} />
        </button>
      </div>
    </article>
  );
}
