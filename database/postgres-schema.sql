CREATE TABLE cities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  country_code CHAR(2) NOT NULL,
  UNIQUE (name, country_code)
);
CREATE TABLE weather_observations (
  id BIGSERIAL PRIMARY KEY,
  city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  temperature_c NUMERIC(5,2) NOT NULL,
  condition VARCHAR(120) NOT NULL
);
-- Latest observations with their city (PK/FK relationship and JOIN):
SELECT c.name, c.country_code, o.observed_at, o.temperature_c, o.condition
FROM cities c JOIN weather_observations o ON o.city_id = c.id
ORDER BY o.observed_at DESC;
