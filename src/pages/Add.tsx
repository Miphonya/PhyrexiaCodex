import { Camera, FilePlus2, Search } from "lucide-react";
import { PageHead, usePreferences } from "../components/CollectionShared";
import { NameSearch } from "../components/NameSearch";
import { Scanner } from "../components/Scanner";
import { ListImporter } from "../components/ListImporter";
import { updatePrefs } from "../db";
const methods = [
  { id: "name", name: "Par nom", icon: Search },
  { id: "photo", name: "Par photo", icon: Camera },
  { id: "batch", name: "Par lot", icon: FilePlus2 },
] as const;
export default function Add() {
  const p = usePreferences();
  return (
    <>
      <PageHead
        eyebrow="AGRANDISSEZ L’ARCHIVE"
        title="Ajouter des cartes"
        description="Un nom, une photo ou une liste. À vous de choisir."
      />
      <div className="add-methods" role="tablist" aria-label="Méthode d’ajout">
        {methods.map(({ id, name, icon: Icon }, i) => (
          <button
            key={id}
            id={"method-" + id}
            type="button"
            role="tab"
            aria-selected={p.addMethod === id}
            aria-controls={"panel-" + id}
            tabIndex={p.addMethod === id ? 0 : -1}
            onClick={() => void updatePrefs({ addMethod: id })}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const index =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 2
                      : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                void updatePrefs({ addMethod: methods[index].id });
                document.getElementById("method-" + methods[index].id)?.focus();
              }
            }}
          >
            <Icon size={18} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <section
        className="add-method-panel"
        role="tabpanel"
        id={"panel-" + p.addMethod}
        aria-labelledby={"method-" + p.addMethod}
      >
        {p.addMethod === "name" ? (
          <NameSearch />
        ) : p.addMethod === "photo" ? (
          <Scanner />
        ) : (
          <ListImporter />
        )}
      </section>
    </>
  );
}
