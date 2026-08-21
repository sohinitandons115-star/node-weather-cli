require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectMongo, WeatherBrief } = require("./server/models/weatherBrief");
const { createWeatherBrief } = require("./server/services/briefService");

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => console.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`));
  next();
});
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.post("/api/weather-briefs", async (req, res, next) => {
  try {
    const { city, units = "metric" } = req.body;
    if (typeof city !== "string" || !city.trim() || city.length > 80) return res.status(400).json({ error: "city must be a non-empty string of up to 80 characters" });
    if (!["metric", "imperial"].includes(units)) return res.status(400).json({ error: "units must be metric or imperial" });
    const brief = await createWeatherBrief({ city: city.trim(), units });
    const saved = process.env.MONGODB_URI ? await WeatherBrief.create(brief) : brief;
    return res.status(201).json(saved);
  } catch (error) { return next(error); }
});
app.get("/api/weather-briefs", async (_req, res, next) => {
  try { return res.status(200).json(process.env.MONGODB_URI ? await WeatherBrief.find().sort({ createdAt: -1 }).limit(25).lean() : []); } catch (error) { return next(error); }
});
app.delete("/api/weather-briefs/:id", async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(501).json({ error: "Persistence requires MONGODB_URI" });
    const deleted = await WeatherBrief.findByIdAndDelete(req.params.id);
    return deleted ? res.status(204).end() : res.status(404).json({ error: "Weather brief not found" });
  } catch (error) { return next(error); }
});
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} was not found` }));
app.use((error, _req, res, _next) => { console.error(error); const status = error.statusCode || (error.name === "ValidationError" ? 400 : 500); res.status(status).json({ error: status === 500 ? "Internal server error" : error.message }); });
connectMongo().then(() => app.listen(port, () => console.log(`Weather Brief API listening on :${port}`))).catch((error) => { console.error("Unable to start server", error); process.exit(1); });
