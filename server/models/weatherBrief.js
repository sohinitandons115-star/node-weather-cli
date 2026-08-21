const mongoose = require("mongoose");
const weatherBriefSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true, maxlength: 80, index: true },
  units: { type: String, enum: ["metric", "imperial"], required: true },
  observedAt: { type: Date, required: true }, temperature: { type: Number, required: true }, condition: { type: String, required: true },
  summary: { type: String, required: true, maxlength: 280 }, clothingAdvice: { type: String, required: true, maxlength: 180 },
  alerts: [{ type: String, maxlength: 120 }], source: { type: String, enum: ["openai", "fallback"], required: true }
}, { timestamps: true, versionKey: false });
async function connectMongo() { if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI); }
module.exports = { WeatherBrief: mongoose.model("WeatherBrief", weatherBriefSchema), connectMongo };
