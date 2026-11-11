import "dotenv/config";
import { createApp } from "./app";
import { runPredictions } from "./modules/predictions/service";
import { resolve } from "node:path";
import express from "express";
const app = createApp();
const production = process.argv.includes("--production");
const apiOnly = process.argv.includes("--api-only");
if (production && !apiOnly) {
  app.use(express.static(resolve("dist")));
  app.get("*", (req, res) => res.sendFile(resolve("dist/index.html")));
} else if (!apiOnly) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
const server = app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log(
    "JME disponible en http://localhost:" + (process.env.PORT || 3000),
  ),
);
const interval = Number(process.env.PREDICTION_INTERVAL_MINUTES || 60);
if (interval > 0) {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await runPredictions();
    } catch (e) {
      console.error("No se pudo ejecutar el lote de alertas", e);
    } finally {
      running = false;
    }
  }, interval * 60000);
  timer.unref();
}
process.on("SIGTERM", () => server.close(() => process.exit(0)));
