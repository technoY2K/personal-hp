import { initSparkles } from "./sparkles.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#sparkles");

if (canvas) {
  initSparkles(canvas);
}
