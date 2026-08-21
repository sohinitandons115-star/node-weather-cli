const https = require("https");
const OpenAI = require("openai");
const briefSchema = { type: "object", additionalProperties: false, properties: { summary: { type: "string", maxLength: 280 }, clothingAdvice: { type: "string", maxLength: 180 }, alerts: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 3 } }, required: ["summary", "clothingAdvice", "alerts"] };
function getWeather(city) {
  return new Promise((resolve, reject) => {
    const request = https.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { headers: { "User-Agent": "weather-brief-ai/2.0" } }, (response) => {
      let body = ""; if (response.statusCode !== 200) return reject(Object.assign(new Error("Weather service unavailable"), { statusCode: 502 }));
      response.on("data", (chunk) => { body += chunk; }); response.on("end", () => { try { const current = JSON.parse(body).current_condition?.[0]; if (!current) throw new Error(); resolve({ tempC: Number(current.temp_C), tempF: Number(current.temp_F), condition: current.weatherDesc?.[0]?.value || "Unknown" }); } catch { reject(Object.assign(new Error("Invalid weather response"), { statusCode: 502 })); } });
    });
    request.setTimeout(8000, () => request.destroy(Object.assign(new Error("Weather request timed out"), { statusCode: 504 })));
    request.on("error", reject);
  });
}
async function generateAdvice(city, weather) {
  const temperature = `${weather.tempC} C / ${weather.tempF} F`;
  if (!process.env.OPENAI_API_KEY) return { summary: `${city} is currently ${weather.condition.toLowerCase()} at ${temperature}.`, clothingAdvice: weather.tempC < 15 ? "Bring a warm outer layer." : "Light layers should be comfortable.", alerts: [], source: "fallback" };
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model: process.env.OPENAI_MODEL || "gpt-5", instructions: "You are a concise, safety-conscious weather assistant. Use only the supplied observation. Do not invent forecasts, locations, measurements, or warnings. Return practical advice for an adult, with a calm neutral tone.", input: `City: ${city}\nObserved condition: ${weather.condition}\nTemperature: ${temperature}`, text: { format: { type: "json_schema", name: "weather_brief", strict: true, schema: briefSchema } } });
  return { ...JSON.parse(response.output_text), source: "openai" };
}
async function createWeatherBrief({ city, units }) { const weather = await getWeather(city); const advice = await generateAdvice(city, weather); return { city, units, observedAt: new Date(), temperature: units === "metric" ? weather.tempC : weather.tempF, condition: weather.condition, ...advice }; }
module.exports = { createWeatherBrief, getWeather };
