# Low-Level Design — Weather Brief AI

## API contract

| Method | Path | Purpose | Responses |
| --- | --- | --- | --- |
| GET | `/api/health` | Liveness check | 200 |
| POST | `/api/weather-briefs` | Build and optionally save a brief | 201, 400, 502, 504, 500 |
| GET | `/api/weather-briefs` | List last 25 saved briefs | 200, 500 |
| DELETE | `/api/weather-briefs/:id` | Delete a saved brief | 204, 404, 501, 500 |

`POST` body: `{ "city": "Delhi", "units": "metric" }`. The response contains city, unit, observed time, temperature, condition, summary, clothing advice, alerts, and source.

## Request lifecycle
1. CORS, JSON parser, and request-timing middleware execute.
2. The route validates city and units.
3. `getWeather` obtains and parses current weather using a Promise wrapper around Node HTTPS.
4. `generateAdvice` supplies a bounded, anti-hallucination prompt and strict JSON Schema to the Responses API. It uses a deterministic fallback without `OPENAI_API_KEY`.
5. A Mongoose schema validates the document before storage. The global error middleware maps known failures to appropriate response codes.

## Data models

MongoDB `WeatherBrief`: `{ city, units, observedAt, temperature, condition, summary, clothingAdvice, alerts, source, createdAt }`; city is indexed for query efficiency.

PostgreSQL uses `cities(id PK)` and `weather_observations(id PK, city_id FK)`. The executable schema and a JOIN are in `database/postgres-schema.sql`.

## Frontend and JavaScript notes

`App` composes navigation and route components. `Create` owns form/loading/error state with `useState`; `History` loads after render with `useEffect`. Both use `async/await` over `fetch` promises. Event handlers form closures over state setters; React's event loop scheduling explains why loading state is rendered before the asynchronous fetch completes. `const`/`let` avoid the hoisting pitfalls of `var`; promises replace nested callbacks for readable error propagation.

## Git workflow

Use short-lived branches (`feat/weather-brief-api`), conventional commits, PR review, and CI running `npm test` plus frontend build. Never commit `.env`, generated dependencies, or database credentials.
