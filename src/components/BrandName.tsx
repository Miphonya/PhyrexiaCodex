import { useState } from "react";
const wordmark = new URL("../../public/wordmark.svg", import.meta.url).href;
export function BrandName() {
  const [failed, setFailed] = useState(false);
  return (
    <span className="brand-name">
      {failed ? (
        "šotm"
      ) : (
        <img src={wordmark} alt="šotm" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
