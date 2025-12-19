import { FaceDetection } from "./App";

const API_BASE = "http://127.0.0.1:8080";

export type EffectType = "grayscale" | "blur";

const effectEndpoints: Record<EffectType, string> = {
  grayscale: `${API_BASE}/grayscale-faces`,
  blur: `${API_BASE}/blur-faces`,
};

export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 450;
  canvas.getContext("2d")?.drawImage(video, 0, 0, 800, 450);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export async function detectFaces(frameData: string): Promise<FaceDetection[]> {
  const res = await fetch(`${API_BASE}/detect-faces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: frameData }),
  });
  const data = await res.json();
  return data.detections || [];
}

export async function applyEffect(
  frameData: string,
  detections: FaceDetection[],
  effect: EffectType
): Promise<string> {
  const res = await fetch(effectEndpoints[effect], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: frameData, detections }),
  });
  const data = await res.json();
  return data.image;
}

export function drawToCanvas(canvas: HTMLCanvasElement, imageSrc: string): void {
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 800;
      canvas.height = 450;
      ctx.drawImage(img, 0, 0, 800, 450);
    }
  };
  img.src = imageSrc;
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}