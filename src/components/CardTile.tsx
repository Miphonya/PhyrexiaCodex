import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { imageUrl, type Card, type Lot } from "../schemas/models";
import { usePricing } from "../hooks/usePricing";
export function CardTile({
  card,
  quantity = 0,
  onAdd,
  onImageClick = onAdd,
  imageAction,
  missing = false,
  finish = "nonfoil",
}: {
  card: Card;
  quantity?: number;
  missing?: boolean;
  finish?: Lot["finish"];
  onAdd: () => void;
  onImageClick?: () => void;
  imageAction?: string;
}) {
  const pricing = usePricing();
  const price = pricing.quote(card, finish);
  const [face, setFace] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = imageUrl(card, face);
  return (
    <article className={"card-tile" + (missing ? " is-missing" : "")}>
      <div className="card-art">
        <button type="button" className="card-image-button" aria-label={imageAction ?? "Ajouter " + card.name} onClick={onImageClick}>
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
        </button>
        {missing && <span className="missing-label">Manquante</span>}
        <span className="price" title={price.source}>
          {pricing.format(price.amount)}
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
