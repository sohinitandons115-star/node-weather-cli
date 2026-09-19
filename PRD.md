# Product Requirements Document — Weather Brief AI

## Problem
Raw weather data is fast to retrieve but harder to act on. Users need a short, grounded explanation of the current conditions and what to wear.

## Users and goal
People checking a city's current weather can enter a city and receive a concise AI-generated brief. They can view and delete saved briefs when MongoDB is configured.

## Functional requirements
- Create a brief with `POST /api/weather-briefs` using a city and metric/imperial units.
- Retrieve current conditions from wttr.in, then generate an LLM brief that is restricted to those observations.
- Enforce a JSON schema for `summary`, `clothingAdvice`, and `alerts`.
- Save, list, and delete briefs through MongoDB when configured.
- Provide Create and History routes in the React client.

## Acceptance criteria
- Invalid requests return 400, a new brief returns 201, unknown resources return 404, and successful deletion returns 204.
- The API key never reaches the browser or repository.
- With no API key, the app returns a clearly labelled deterministic fallback, enabling local development.

## Non-goals
Forecasting, severe-weather authority, authentication, and user-specific recommendations are out of scope.
