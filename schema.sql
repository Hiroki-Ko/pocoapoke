CREATE TABLE master_code (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  class      TEXT    NOT NULL,
  code       INTEGER NOT NULL,
  label      TEXT,
  value      TEXT,
  created_at TEXT,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE TABLE pokemon_ms (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      INTEGER NOT NULL,
  name        TEXT    NOT NULL,
  specialty1  INTEGER NOT NULL,
  specialty2  INTEGER,
  environment INTEGER NOT NULL,
  favorite1   INTEGER,
  favorite2   INTEGER,
  favorite3   INTEGER,
  favorite4   INTEGER,
  favorite5   INTEGER,
  favorite6   INTEGER,
  created_at  TEXT,
  updated_at  TEXT,
  deleted_at  TEXT,

  FOREIGN KEY (specialty1) REFERENCES master_code(id),
  FOREIGN KEY (specialty2) REFERENCES master_code(id),
  FOREIGN KEY (environment) REFERENCES master_code(id),
  FOREIGN KEY (favorite1) REFERENCES master_code(id),
  FOREIGN KEY (favorite2) REFERENCES master_code(id),
  FOREIGN KEY (favorite3) REFERENCES master_code(id),
  FOREIGN KEY (favorite4) REFERENCES master_code(id),
  FOREIGN KEY (favorite5) REFERENCES master_code(id),
  FOREIGN KEY (favorite6) REFERENCES master_code(id)
);

CREATE TABLE pokemon_status (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  poke_id     INTEGER NOT NULL UNIQUE,
  status_code INTEGER NOT NULL,
  place_code  INTEGER NOT NULL,
  today_wish  INTEGER NOT NULL,
  created_at  TEXT,
  updated_at  TEXT,
  deleted_at  TEXT,

  FOREIGN KEY (poke_id) REFERENCES pokemon_ms(id),
  FOREIGN KEY (status_code) REFERENCES master_code(id),
  FOREIGN KEY (place_code) REFERENCES master_code(id),
  FOREIGN KEY (today_wish) REFERENCES master_code(id)
);