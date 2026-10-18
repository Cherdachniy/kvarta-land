-- Идентификаторы клика рекламы: по брифу клиенты приходят из Яндекса (yclid)
-- и Instagram (fbclid). По ним менеджер находит конкретный клик в кабинете рекламы.
-- ALTER TABLE ADD COLUMN не бывает IF NOT EXISTS — гонку параллельных холодных
-- стартов разбирает migrate() в lib/db.ts.

ALTER TABLE leads ADD COLUMN yclid TEXT CHECK (length(yclid) <= 255);
ALTER TABLE leads ADD COLUMN fbclid TEXT CHECK (length(fbclid) <= 255);
