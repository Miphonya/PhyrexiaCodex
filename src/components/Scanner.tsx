import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
export function Scanner() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => () => stream.current?.getTracks().forEach((t) => t.stop()),
    [],
  );
  async function start() {
    setError("");
    try {
      if (!navigator.mediaDevices)
        throw Error("La caméra nécessite HTTPS et un navigateur compatible.");
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setActive(true);
      setPhoto("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Caméra indisponible");
    }
  }
  useEffect(() => {
    if (active && video.current) {
      video.current.srcObject = stream.current;
      void video.current
        .play()
        .catch(() => setError("Impossible de lire le flux caméra"));
    }
  }, [active]);
  function capture() {
    const v = video.current;
    if (!v?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg"));
    stream.current?.getTracks().forEach((t) => t.stop());
    setActive(false);
  }
  return (
    <section className="scanner panel">
      <Camera size={26} />
      <div>
        <h3>Capture assistée</h3>
        <p>
          Aucun OCR intégré. Capturez une carte, recherchez son nom ci-dessous,
          puis vérifiez l’impression avant l’ajout. L’image reste dans cette
          page.
        </p>
      </div>
      {active && <video ref={video} playsInline muted />}
      {photo && <img src={photo} alt="Capture locale de votre carte" />}
      {active ? (
        <Button onClick={capture}>Capturer</Button>
      ) : (
        <Button variant="outline" onClick={() => void start()}>
          {photo ? "Reprendre" : "Activer la caméra"}
        </Button>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
