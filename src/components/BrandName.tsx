import { useEffect, useState } from "react";
// š is represented by the font's supplied sh.liga glyph (U+F005).
export const PHYREXIAN_NAME = "\uF005otm";
let fontReady: Promise<boolean> | undefined;
function loadNameFont() {
  return (fontReady ??=
    typeof document !== "undefined" && document.fonts
      ? document.fonts.ready
          .then(() => document.fonts.load("48px SotmPhyrexian", PHYREXIAN_NAME))
          .then((faces) => faces.length > 0)
          .catch(() => false)
      : Promise.resolve(false));
}
export function BrandName() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    void loadNameFont().then((ok) => {
      if (mounted) setReady(ok);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <span className="brand-name" role="img" aria-label="šotm">
      <span
        aria-hidden="true"
        className={ready ? "phyrexian-name" : "human-name"}
      >
        {ready ? PHYREXIAN_NAME : "šotm"}
      </span>
    </span>
  );
}
