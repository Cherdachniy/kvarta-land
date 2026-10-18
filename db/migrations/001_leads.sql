-- Заявки с лендинга. Схема — prompt.xml, раздел <database>, в типах SQLite:
-- uuid → TEXT, varchar(n) → TEXT с CHECK на длину, timestamptz → TEXT в ISO 8601 UTC
-- (читается глазами в консоли Turso и сравнивается как строка).
-- Миграция идемпотентна: её может одновременно запустить несколько холодных стартов.

CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  phone        TEXT NOT NULL CHECK (length(phone) = 13),
  interest     TEXT NOT NULL CHECK (interest IN ('subscription', 'one_time', 'question')),
  product      TEXT CHECK (length(product) <= 30),
  comment      TEXT,
  utm_source   TEXT CHECK (length(utm_source) <= 255),
  utm_medium   TEXT CHECK (length(utm_medium) <= 255),
  utm_campaign TEXT CHECK (length(utm_campaign) <= 255),
  utm_content  TEXT CHECK (length(utm_content) <= 255),
  utm_term     TEXT CHECK (length(utm_term) <= 255),
  landing_page TEXT,
  referrer     TEXT,
  created_at   TEXT NOT NULL
);

-- Поиск дублей: тот же телефон за последние 10 минут
CREATE INDEX IF NOT EXISTS leads_phone_created_at ON leads (phone, created_at);

-- Выборки по периоду для менеджера
CREATE INDEX IF NOT EXISTS leads_created_at ON leads (created_at);

-- Ограничение частоты запросов. IP хранится только как хэш с солью.
CREATE TABLE IF NOT EXISTS rate_hits (
  key TEXT NOT NULL,
  at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_hits_key_at ON rate_hits (key, at);
CREATE INDEX IF NOT EXISTS rate_hits_at ON rate_hits (at);
