# Weather Brief AI

Weather Brief AI turns a city's current observation into a short, practical brief. The user enters a city and unit system in the React client; the Express API validates the request, retrieves current weather, asks the optional OpenAI integration for structured advice, and stores the result in MongoDB when configured. Without an OpenAI key or MongoDB, deterministic fallback output keeps local development usable.

## System model

```text
React/Vite -> Express REST API -> wttr.in
                         |-> OpenAI Responses API (optional)
                         |-> MongoDB (optional operational storage)
PostgreSQL schema -> normalized reporting model (optional)
```

The browser never receives server secrets. `getWeather` wraps Node's callback-based HTTPS stream in a Promise, and the route/service layers use `async`/`await` so errors move through one middleware path instead of nested callbacks. The relational model in `database/postgres-schema.sql` demonstrates the city-to-observation primary-key/foreign-key relationship for analytics; MongoDB is the current operational store because generated briefs are document-shaped.

## Run locally

1. Copy `.env.example` to `.env` and add `OPENAI_API_KEY` and/or `MONGODB_URI` when needed.
2. Install server dependencies with `npm install`.
3. Install client dependencies with `npm --prefix client install`.
4. Start the API with `npm start` and the client with `npm run client`.

Useful checks:

```text
npm test
npm run build:client
```

## Git workflow

Use a short-lived branch such as `feat/weather-brief-history`, make small conventional commits (`feat:`, `fix:`, `test:`, `docs:`), and open a pull request into `main`. The workflow in `.github/workflows/ci.yml` runs the API tests and client production build on every push and pull request. Never commit `.env`, credentials, `node_modules`, or build output.