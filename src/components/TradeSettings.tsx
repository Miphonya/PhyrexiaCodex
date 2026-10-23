import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { updatePrefs } from "../db";
import { usePreferences } from "./CollectionShared";
export function TradeSettings() {
  const p = usePreferences(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  return <section className="panel deck-collection-setting">
    <div><ArrowLeftRight size={22} /><h2>Doublons et échanges</h2></div>
    <button type="button" role="switch" aria-checked={p.autoTradeDuplicates} className={"tracked-toggle " + (p.autoTradeDuplicates ? "is-on" : "")} disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try { await updatePrefs({ autoTradeDuplicates: !p.autoTradeDuplicates }); } catch { setError("Réglage non enregistré. Réessayez."); } finally { setBusy(false); }
    }}><span className="switch-track"><span /></span><span>Mettre automatiquement les doublons à l’échange</span></button>
    <p>Conserve un exemplaire de chaque carte, toutes impressions, langues et finitions confondues. Les suivants apparaissent dans Échanges. L’exemplaire conservé provient du lot le plus ancien.</p>
    <p className="muted">Les cartes affectées aux decks sont protégées et ne sont pas proposées à l’échange. Désactiver ce réglage rétablit vos quantités d’échange manuelles, modifiables lors de l’ajout ou de l’édition.</p>
    {error && <p className="error" role="alert">{error}</p>}
  </section>;
}
