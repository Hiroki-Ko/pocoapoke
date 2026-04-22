/**
 * seed_pokemon_ms.cjs
 * pokemon_ms.json を読み込み、一時SQLファイルを分割して wrangler d1 execute --file で投入する
 *
 * 使い方:
 *   node seeds/seed_pokemon_ms.cjs          # ローカルD1
 *   node seeds/seed_pokemon_ms.cjs --remote # リモートD1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isRemote = process.argv.includes('--remote');
const remoteFlag = isRemote ? '--remote' : '--local';

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pokemon_ms.json'), 'utf8')
);
const sqlText = fs.readFileSync(
  path.join(__dirname, 'master_code.sql'), 'utf8'
);

// master_code から label→code マップを構築
const specialtyMap = {};
const environmentMap = {};
const favoriteMap = {};

const re = /\(\s*'(specialty|environment|favorite)'\s*,\s*(\d+)\s*,\s*'([^']*)'/g;
let m;
while ((m = re.exec(sqlText)) !== null) {
  const cls = m[1], code = parseInt(m[2]), label = m[3];
  if (cls === 'specialty')   specialtyMap[label]   = code;
  if (cls === 'environment') environmentMap[label] = code;
  if (cls === 'favorite')    favoriteMap[label]    = code;
}

function getCode(map, label, mapName) {
  if (!label || label === 'なし') return null;
  const c = map[label];
  if (c === undefined) throw new Error(`Not found in ${mapName}: "${label}"`);
  return c;
}

function subsel(cls, code) {
  if (code === null || code === undefined) return 'null';
  return `(SELECT id FROM master_code WHERE class='${cls}' AND code=${code})`;
}

function escape(str) {
  return str.replace(/'/g, "''");
}

function runSqlFile(filePath) {
  execSync(
    `wrangler d1 execute pocoapoke ${remoteFlag} --file="${filePath}"`,
    { stdio: 'pipe' }
  );
}

const tmpDir = os.tmpdir();

// DELETE
console.log('Deleting existing pokemon_ms records...');
const delFile = path.join(tmpDir, '_poke_delete.sql');
fs.writeFileSync(delFile, 'DELETE FROM pokemon_ms;\n', 'utf8');
execSync(
  `wrangler d1 execute pocoapoke ${remoteFlag} --file="${delFile}"`,
  { stdio: 'inherit' }
);

// INSERT: BATCH_SIZE件ずつまとめてファイル実行
const BATCH_SIZE = 1;
let count = 0;

for (let i = 0; i < data.length; i += BATCH_SIZE) {
  const batch = data.slice(i, i + BATCH_SIZE);
  const lines = [];

  for (const p of batch) {
    const cat = p.category || 'main';
    const numStr = (p.number !== null && p.number !== undefined) ? p.number : 'null';
    const localNumStr = (p.local_number !== null && p.local_number !== undefined) ? p.local_number : 'null';

    const specs = Array.isArray(p.specialty) ? p.specialty : [];
    const sp1label = specs[0] || 'なし';
    const sp2label = specs[1] || null;

    // specialty: 'なし' は code=0 (NOT NULL なので null にしない)
    const sp1code = (sp1label === 'なし') ? 0 : getCode(specialtyMap, sp1label, 'specialty');
    const sp2code = sp2label ? getCode(specialtyMap, sp2label, 'specialty') : null;

    const envLabel = p.environment || 'なし';
    const envCode = (envLabel === 'なし' || envLabel === 'none') ? 0
      : getCode(environmentMap, envLabel, 'environment');

    const favs = Array.isArray(p.favorites) ? p.favorites : [];
    const favCodes = [];
    for (let j = 0; j < 6; j++) {
      const fl = favs[j];
      // favorite: 'なし' は code=0
      if (!fl || fl === 'なし') {
        favCodes.push(0);
      } else {
        favCodes.push(getCode(favoriteMap, fl, 'favorite'));
      }
    }

    lines.push(
      `INSERT INTO pokemon_ms (category, number, local_number, name, specialty1, specialty2, environment, favorite1, favorite2, favorite3, favorite4, favorite5, favorite6, created_at) VALUES ('${cat}', ${numStr}, ${localNumStr}, '${escape(p.name)}', ${subsel('specialty', sp1code)}, ${subsel('specialty', sp2code)}, ${subsel('environment', envCode)}, ${subsel('favorite', favCodes[0])}, ${subsel('favorite', favCodes[1])}, ${subsel('favorite', favCodes[2])}, ${subsel('favorite', favCodes[3])}, ${subsel('favorite', favCodes[4])}, ${subsel('favorite', favCodes[5])}, datetime('now'));`
    );
  }

  const tmpFile = path.join(tmpDir, `_poke_batch_${i}.sql`);
  fs.writeFileSync(tmpFile, lines.join('\n') + '\n', 'utf8');

  try {
    runSqlFile(tmpFile);
    count += batch.length;
    process.stdout.write(`\r  ${count}/${data.length} inserted...`);
  } catch (e) {
    console.error(`\nError at batch starting index ${i}:`);
    console.error(lines[0]);
    throw e;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

fs.unlinkSync(delFile);
console.log(`\nDone! ${count} records inserted.`);
