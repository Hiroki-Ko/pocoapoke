PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'002_add_indexes.sql','2026-04-14 13:12:54');
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
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(1,'specialty',1,'もやす','burn','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(2,'specialty',2,'さいばい','cultivation','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(3,'specialty',3,'うるおす','moisturize','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(4,'specialty',4,'きをきる','cut','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(5,'specialty',5,'けんちく','architecture','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(6,'specialty',6,'じならし','bulldoze','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(7,'specialty',7,'さがしもの','search','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(8,'specialty',8,'そらをとぶ','fly','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(9,'specialty',9,'テレポート','teleport','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(10,'specialty',10,'リサイクル','recycle','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(11,'specialty',11,'しわける','classify','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(12,'specialty',12,'はつでん','electricity','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(13,'specialty',13,'つぶす','crush','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(14,'specialty',14,'ちらかす','scatter','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(15,'specialty',15,'とりひき','transaction','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(16,'specialty',16,'もりあげる','enliven','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(17,'specialty',17,'あくび','yawn','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(18,'specialty',18,'ゆめしま','dreamisland','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(19,'specialty',19,'ミツあつめ','honeygather','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(20,'specialty',20,'かんてい','appraisal','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(21,'specialty',21,'はっこう','illuminate','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(22,'specialty',22,'ペイント','paint','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(23,'specialty',23,'くいしんぼ','gluttony','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(24,'specialty',24,'しゅうのう','storage','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(25,'specialty',25,'コレクター','collector','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(26,'specialty',26,'パーティー','party','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(27,'specialty',27,'DJ','dj','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(28,'specialty',28,'しょくにん','craftsman','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(29,'specialty',29,'ばくはつ','bomb','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(30,'specialty',30,'レアもの','rare','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(31,'environment',1,'あたたかい','warm','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(32,'environment',2,'すずしい','cool','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(33,'environment',3,'うるおっている','moisturized','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(34,'environment',4,'乾そうしている','dry','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(35,'environment',5,'あかるい','bright','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(36,'environment',6,'くらい','dark','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(37,'favorite',1,'あまい','sweet','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(38,'favorite',2,'からい','spicy','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(39,'favorite',3,'しぶい','bitterness','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(40,'favorite',4,'すっぱい','sour','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(41,'favorite',5,'にがい','bitter','2026-04-16 17:39:04',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(42,'place',1,'パサパサこうや','wilderness','2026-04-17 14:11:55',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(43,'place',2,'ドンヨリうみべ','seaside','2026-04-17 14:11:55',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(44,'place',3,'ゴツゴツやま','mountain','2026-04-17 14:11:55',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(45,'place',4,'キラキラうきしま','island','2026-04-17 14:11:55',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(46,'place',5,'まっさらな街','city','2026-04-17 14:11:55',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(47,'evaluation',1,'最高','best','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(48,'evaluation',2,'めちゃイイ','good','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(49,'evaluation',3,'ちょっといい','nice','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(50,'evaluation',4,'ふつう','normal','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(51,'evaluation',5,'びみょう','subtle','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(52,'evaluation',6,'すみかなし','less','2026-04-17 14:12:12',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(53,'category',1,'かざりつけ','decoration','2026-04-17 14:12:21',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(54,'category',2,'おもちゃ','toys','2026-04-17 14:12:21',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(55,'category',3,'きゅうけい','break','2026-04-17 14:12:21',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(56,'category',4,'たべもの','food','2026-04-17 14:53:20',NULL,NULL);
INSERT INTO "master_code" ("id","class","code","label","value","created_at","updated_at","deleted_at") VALUES(57,'wish',0,'None','none','2026-04-17 14:57:36',NULL,NULL);
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
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(1,1,'フシギダネ',2,NULL,35,NULL,NULL,NULL,NULL,NULL,37,'2026-04-16 17:39:24',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(2,2,'フシギソウ',2,NULL,35,40,NULL,NULL,NULL,NULL,NULL,'2026-04-16 17:40:05',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(3,3,'フシギバナ',2,14,35,40,NULL,NULL,NULL,NULL,NULL,'2026-04-16 17:47:13',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(4,4,'ヒトカゲ',1,NULL,31,38,NULL,NULL,NULL,NULL,NULL,'2026-04-16 18:12:36',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(6,5,'リザード',1,NULL,31,38,NULL,NULL,NULL,NULL,NULL,'2026-04-16 23:15:07',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(7,6,'リザードン',1,8,31,38,NULL,NULL,NULL,NULL,NULL,'2026-04-16 23:16:17',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(8,7,'ゼニガメ',3,NULL,33,37,NULL,NULL,NULL,NULL,NULL,'2026-04-16 23:59:24',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(9,8,'カメール',3,NULL,33,38,NULL,NULL,NULL,NULL,NULL,'2026-04-17 00:00:10',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(10,9,'カメックス',3,15,33,40,NULL,NULL,NULL,NULL,NULL,'2026-04-17 00:00:47',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(11,10,'ポッポ',8,7,35,40,NULL,NULL,NULL,NULL,NULL,'2026-04-17 01:17:23',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(12,11,'ピジョン',8,7,35,38,NULL,NULL,NULL,NULL,NULL,'2026-04-17 03:23:38',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(13,12,'ピジョット',8,4,35,40,NULL,NULL,NULL,NULL,NULL,'2026-04-17 03:24:54',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(14,13,'ナゾノクサ',2,NULL,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:22:38',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(15,14,'クサイハナ',2,NULL,33,39,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:23:10',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(16,15,'ラフレシア',2,14,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:24:08',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(17,16,'キレイハナ',2,16,35,40,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:24:27',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(18,17,'パラス',7,NULL,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:25:08',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(19,18,'パラセクト',7,NULL,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:25:31',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(20,19,'コンパン',7,NULL,35,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:25:49',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(21,20,'モルフォン',7,NULL,35,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 04:28:26',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(22,21,'マダツボミ',2,14,33,39,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:47:14',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(23,22,'ウツドン',2,14,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:47:46',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(24,23,'ウツボット',2,4,33,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:48:10',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(25,24,'ヤドン',3,17,33,39,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:49:16',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(26,25,'ヤドラン',3,15,33,39,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:49:48',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(27,26,'ヤドキング',3,9,33,40,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:50:23',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(28,27,'コイル',12,NULL,35,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:50:55',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(29,28,'レアコイル',12,NULL,35,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:51:22',NULL,NULL);
INSERT INTO "pokemon_ms" ("id","number","name","specialty1","specialty2","environment","favorite1","favorite2","favorite3","favorite4","favorite5","favorite6","created_at","updated_at","deleted_at") VALUES(30,29,'ジバコイル',12,10,35,41,NULL,NULL,NULL,NULL,NULL,'2026-04-17 10:52:07',NULL,NULL);
CREATE TABLE pokemon_status (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  poke_id     INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  place_code  INTEGER NOT NULL,
  today_wish  BOOLEAN NOT NULL,
  created_at  TEXT,
  updated_at  TEXT,
  deleted_at  TEXT,

  FOREIGN KEY (poke_id) REFERENCES pokemon_ms(id),
  FOREIGN KEY (status_code) REFERENCES master_code(id),
  FOREIGN KEY (place_code) REFERENCES master_code(id)
);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(1,1,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(2,2,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(3,3,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(4,4,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(5,6,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(6,7,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(7,8,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(8,9,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(9,10,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(10,11,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(11,12,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(12,13,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(13,14,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(14,15,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(15,16,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(16,17,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(17,18,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(18,19,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(19,20,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(20,21,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(21,22,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(22,23,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(23,24,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(24,25,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(25,26,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(26,27,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(27,28,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(28,29,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
INSERT INTO "pokemon_status" ("id","poke_id","status_code","place_code","today_wish","created_at","updated_at","deleted_at") VALUES(29,30,47,42,57,'2026-04-17 15:06:08','2026-04-17 16:38:32',NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('master_code',57);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('pokemon_ms',30);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('pokemon_status',29);
