const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const databasePath = process.env.PLAITECAM_DB_PATH || path.join(ROOT, 'data', 'plaintecam.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, login_code_salt TEXT, login_code_hash TEXT, profile_json TEXT NOT NULL DEFAULT '{}');`);
const columns = new Set(db.prepare('PRAGMA table_info(users)').all().map(column => column.name));
if (!columns.has('login_code_salt')) db.exec('ALTER TABLE users ADD COLUMN login_code_salt TEXT');
if (!columns.has('login_code_hash')) db.exec('ALTER TABLE users ADD COLUMN login_code_hash TEXT');
if (!columns.has('profile_json')) db.exec("ALTER TABLE users ADD COLUMN profile_json TEXT NOT NULL DEFAULT '{}'");

function question(label) {
  return new Promise(resolve => {
    process.stdout.write(label);
    process.stdin.resume();
    process.stdin.setRawMode(true);
    let answer = '';
    const onData = chunk => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (char === '\r' || char === '\n') {
          process.stdin.removeListener('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(answer);
          return;
        }
        if (char === '\u007f' || char === '\b') answer = answer.slice(0, -1);
        else if (char >= ' ') answer += char;
      }
    };
    process.stdin.on('data', onData);
  });
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Lancez cette commande depuis un terminal interactif.');
  const matricule = (await question('Matricule (chiffres uniquement) : ')).replace(/\D/g, '');
  if (!/^\d{4,10}$/.test(matricule)) throw new Error('Matricule invalide.');
  const role = (await question('Rôle (commissaire/enqueteur/accueil) : ')).trim().toLowerCase();
  if (!['commissaire', 'enqueteur', 'accueil'].includes(role)) throw new Error('Rôle invalide.');
  const name = (await question('Nom affiché : ')).trim();
  if (!name || name.length > 160) throw new Error('Nom invalide.');
  const password = await question('Mot de passe (saisie masquée) : ');
  if (password.length < 12) throw new Error('Le mot de passe doit comporter au moins 12 caractères.');
  const email = `SN-${matricule}@police.cm`;
  const salt = crypto.randomUUID();
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  db.prepare(`INSERT INTO users (id,email,role,name,salt,password_hash,created_at,login_code_salt,login_code_hash,profile_json)
    VALUES (?,?,?,?,?,?,?,NULL,NULL,?)
    ON CONFLICT(email) DO UPDATE SET role=excluded.role,name=excluded.name,salt=excluded.salt,
      password_hash=excluded.password_hash,login_code_salt=NULL,login_code_hash=NULL,profile_json=excluded.profile_json`)
    .run(crypto.randomUUID(), email, role, name, salt, hash, new Date().toISOString(), JSON.stringify({ matricule: `SN-${matricule}` }));
  process.stdout.write(`Compte ${role} provisionné ou réinitialisé : ${email}\n`);
}

main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }).finally(() => db.close());
