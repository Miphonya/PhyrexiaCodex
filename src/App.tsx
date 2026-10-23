import { CurrencySelect, ExchangeSync } from "./components/CurrencySettings";
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  Layers3,
  ScanLine,
  Settings2,
  ShieldCheck,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { Empty, PageHead, usePreferences } from "./components/CollectionShared";
import LotsPanel from "./components/LotsPanel";
import Add from "./pages/Add";
import Collection from "./pages/Collection";
import Owned from "./pages/Owned";
import SetPage from "./pages/SetPage";
import Settings from "./pages/Settings";
import { useUI } from "./stores/ui";
const logo = new URL("../public/logo.svg", import.meta.url).href;

export default function App() {
  const p = usePreferences();
  const [online, setOnline] = useState(navigator.onLine);
  const message = useUI((s) => s.message);
  useEffect(() => {
    document.documentElement.dataset.theme = p.theme;
  }, [p.theme]);
  useEffect(() => {
    const yes = () => setOnline(true),
      no = () => setOnline(false);
    window.addEventListener("online", yes);
    window.addEventListener("offline", no);
    return () => {
      window.removeEventListener("online", yes);
      window.removeEventListener("offline", no);
    };
  }, []);
  const links = [
    { to: "/", label: "Collection", icon: Layers3 },
    { to: "/add", label: "Ajouter / Scanner", icon: ScanLine },
    { to: "/trade", label: "Trade", icon: ArrowLeftRight },
    { to: "/settings", label: "Paramètres", icon: Settings2 },
  ];
  return (
    <div className="app">
      <ExchangeSync />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <img src={logo} alt="Logo original Phyrexian Vault" />
          <span>
            PHYREXIAN<small>VAULT</small>
          </span>
        </NavLink>
        <div className="sidebar-label">VOTRE ARCHIVE</div>
        <nav aria-label="Navigation principale">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={19} />
              <span>{label}</span>
              {to === "/" && <ChevronRight className="nav-chevron" size={14} />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-badge">
            <span className="status-dot" /> LOCAL FIRST
          </div>
          <p>
            Votre collection.
            <br />
            Sous votre seul contrôle.
          </p>
          <small>PHYREXIAN VAULT · V0.1</small>
        </div>
      </aside>
      <div className="workspace">
        <div className="topbar">
          <span>
            LE VAULT <ChevronRight size={12} /> <b>Archive personnelle</b>
          </span>
          <span className="privacy">
            <CurrencySelect />
            <ShieldCheck size={14} /> Stockage local <i />{" "}
            {online ? "Connecté" : "Hors ligne"}
          </span>
        </div>
        {!online && (
          <div className="offline">
            <WifiOff size={16} /> Hors ligne · consultation des données déjà
            chargées
          </div>
        )}
        <main id="main">
          <Routes>
            <Route path="/" element={<Collection />} />
            <Route path="/sets/:code" element={<SetPage />} />
            <Route path="/cards" element={<Owned />} />
            <Route path="/add" element={<Add />} />
            <Route
              path="/trade"
              element={
                <>
                  <PageHead
                    eyebrow="LE CERCLE DES ÉCHANGES"
                    title="Trade"
                    description="Vos exemplaires disponibles. Toujours liés à votre collection."
                  />
                  <LotsPanel tradeOnly />
                  <p className="muted">
                    Valeurs indicatives Scryfall, hors estimation des
                    signatures, altérations et états.
                  </p>
                </>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Empty title="Page introuvable">
                  <NavLink to="/">Retour à la collection</NavLink>
                </Empty>
              }
            />
          </Routes>
          <footer>
            <span>
              <img src={logo} alt="" /> FAÇONNÉ POUR LES COLLECTIONNEURS
            </span>
            <span>
              Données et images :{" "}
              <a href="https://scryfall.com" target="_blank" rel="noreferrer">
                Scryfall
              </a>{" "}
              · Magic: The Gathering © Wizards of the Coast. Projet indépendant.
            </span>
          </footer>
        </main>
      </div>
      {message && (
        <div className="toast" role="status">
          <Check size={18} />
          {message}
          <button
            aria-label="Fermer la notification"
            onClick={() => useUI.setState({ message: "" })}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
