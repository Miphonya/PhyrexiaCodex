import { useState } from "react";
import { ScanText, ShieldCheck, KeyRound } from "lucide-react";
import { useVisionSession } from "../stores/vision";
import { Button } from "./ui/button";
export function RecognitionSettings() {
  const [input, setInput] = useState(""),
    [error, setError] = useState("");
  const active = useVisionSession((s) => !!s.apiKey),
    setKey = useVisionSession((s) => s.setKey),
    clear = useVisionSession((s) => s.clear);
  return (
    <section className="panel setting recognition-settings">
      <ScanText />
      <h2>Reconnaissance des cartes</h2>
      <div className="recognition-tier">
        <ShieldCheck size={18} />
        <div>
          <h3>Base · locale, sans clé</h3>
          <p>
            OCR français/anglais dans le navigateur. Vos photos restent sur
            l’appareil. Les champs corrigés servent ensuite à rechercher la
            carte sur Scryfall.
          </p>
        </div>
      </div>
      <div className="recognition-tier">
        <KeyRound size={18} />
        <div>
          <h3>+ · vision optionnelle</h3>
          <p>
            Une analyse visuelle peut mieux lire une photo difficile. Elle
            utilise OpenAI avec votre clé API personnelle. Chaque envoi
            nécessite votre confirmation ; la photo et les instructions sont
            transmises à OpenAI, dont les conditions s’appliquent. Usage
            potentiellement payant auprès du fournisseur.
          </p>
        </div>
      </div>
      <p className="muted">
        La clé reste uniquement dans la mémoire de cet onglet, sans sauvegarde
        ni stockage local. Un rechargement la supprime. Une app statique ne peut
        pas la cacher au navigateur : n’utilisez cette option que sur une
        instance à laquelle vous faites confiance. Aucune clé du projet n’est
        fournie.
      </p>
      {active ? (
        <div className="key-active">
          <p>
            Mode + disponible pour cette session. La connexion sera vérifiée
            lors de votre première analyse explicite.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              clear();
              setInput("");
            }}
          >
            Oublier ma clé
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (input.trim().length < 20) {
              setError("Vérifiez que vous avez saisi une clé API complète.");
              return;
            }
            setKey(input);
            setInput("");
          }}
        >
          <label>
            Clé API personnelle OpenAI
            <input
              type="password"
              aria-label="Clé API personnelle OpenAI"
              autoComplete="off"
              spellCheck={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Clé utilisée uniquement dans cet onglet"
            />
          </label>
          <Button type="submit" variant="outline" disabled={!input.trim()}>
            Activer + pour cette session
          </Button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
