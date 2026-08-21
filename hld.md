# High-Level Design — Weather Brief AI

```text
React/Vite browser
  └─ REST/JSON → Express API → wttr.in current-weather API
                              └→ OpenAI Responses API (structured output)
                              └→ MongoDB (saved documents, optional)
PostgreSQL schema → reporting/relational analytics (optional)
```

The browser only calls the Express service. The service owns secrets and coordinates external calls. It validates input before any network request, validates LLM shape using strict JSON Schema output, and centralizes error conversion in middleware. MongoDB is the operational document store for generated briefs. PostgreSQL is intentionally modeled separately for normalized city/observation analytics.

Environment configuration is injected via `.env`; `.env.example` documents required keys and `.gitignore` prevents committed secrets. Use separate least-privilege credentials per environment. The React app only uses the non-secret `VITE_API_URL` value.
