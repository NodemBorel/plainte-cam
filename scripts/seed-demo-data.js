const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const databasePath = process.env.PLAITECAM_DB_PATH || path.join(ROOT, 'data', 'plaintecam.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, type TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, login_code_salt TEXT, login_code_hash TEXT, profile_json TEXT NOT NULL DEFAULT '{}');`);

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/modules/data.js'), 'utf8') +
  ';globalThis.__fixtures={CITOYENS,AGENTS,DOSSIERS,HISTORIQUE,CONVOCATIONS,PV_CORRECTIONS};', context);
const fixtures = JSON.parse(JSON.stringify(context.__fixtures));
const stamp = new Date().toISOString();
const masterCode = '343982';
const citizenByFixtureId = new Map();
const demoEmails = new Set(fixtures.CITOYENS.map(c => c.email.toLowerCase()));
const userByEmail = db.prepare('SELECT * FROM users WHERE email=?');
const insertCitizen = db.prepare(`INSERT INTO users
  (id,email,role,name,salt,password_hash,created_at,login_code_salt,login_code_hash,profile_json)
  VALUES (?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(email) DO UPDATE SET role='citoyen',name=excluded.name,login_code_salt=excluded.login_code_salt,
  login_code_hash=excluded.login_code_hash,profile_json=excluded.profile_json`);

for (const citizen of fixtures.CITOYENS) {
  const email = citizen.email.toLowerCase();
  const old = userByEmail.get(email);
  const id = old && old.role === 'citoyen' ? old.id : crypto.randomUUID();
  const salt = crypto.randomUUID();
  const codeSalt = crypto.randomUUID();
  const profile = {
    prenom: citizen.prenom, nom: citizen.nom, telephone: citizen.telephone || '',
    pays: citizen.pays || 'Cameroun', region: citizen.region || '', ville: citizen.ville || '',
    profession: citizen.profession || '', adresse: citizen.adresse || ''
  };
  insertCitizen.run(id, email, 'citoyen', `${citizen.prenom} ${citizen.nom}`, salt,
    crypto.scryptSync(crypto.randomUUID(), salt, 64).toString('hex'), stamp, codeSalt,
    crypto.scryptSync(masterCode, codeSalt, 64).toString('hex'), JSON.stringify(profile));
  citizenByFixtureId.set(citizen.id, { ...citizen, id, email });
}

const mapDossier = source => {
  const citizen = citizenByFixtureId.get(source.citoyen);
  return { ...source, citoyen: citizen ? citizen.id : source.citoyen,
    plaignant: citizen ? `${citizen.prenom} ${citizen.nom}` : source.plaignant,
    pieces: [], demo: true };
};
const demoDossiers = fixtures.DOSSIERS.map(mapDossier);

const testRegions = [
  { ville: 'Yaoundé', region: 'Centre', departement: 'Mfoundi', arrondissement: 'Yaoundé 1er', commissariat: 'Commissariat central n° 1, Yaoundé', quartiers: ['Mokolo', 'Elig-Essono', 'Nlongkak', 'Emana', 'Messa', 'Tsinga'] },
  { ville: 'Douala', region: 'Littoral', departement: 'Wouri', arrondissement: 'Douala 1er', commissariat: 'Commissariat central, Bonanjo, Douala', quartiers: ['Bonanjo', 'Akwa', 'Bonapriso', 'Deido', 'Bali', 'Youpwè'] },
  { ville: 'Douala', region: 'Littoral', departement: 'Wouri', arrondissement: 'Douala 5e', commissariat: 'Commissariat de sécurité publique, Bonamoussadi', quartiers: ['Bonamoussadi', 'Makepe', 'Kotto', 'Logpom', 'Denver', 'Bangue'] },
  { ville: 'Bafoussam', region: 'Ouest', departement: 'Mifi', arrondissement: 'Bafoussam 1er', commissariat: 'Commissariat central de Bafoussam', quartiers: ['Centre commercial', 'Djeleng', 'Tamja', 'Famla', 'Banengo', 'Tchitchap'] },
  { ville: 'Garoua', region: 'Nord', departement: 'Bénoué', arrondissement: 'Garoua 1er', commissariat: 'Commissariat central de Garoua', quartiers: ['Roumdé-Adjia', 'Poumpoumré', 'Yelwa', 'Plateau', 'Laindé', 'Pitoa route'] },
  { ville: 'Maroua', region: 'Extrême-Nord', departement: 'Diamaré', arrondissement: 'Maroua 1er', commissariat: 'Commissariat central de Maroua', quartiers: ['Domayo', 'Palar', 'Zokok', 'Doualaré', 'Kongola', 'Marché central'] },
  { ville: 'Bamenda', region: 'Nord-Ouest', departement: 'Mezam', arrondissement: 'Bamenda 2e', commissariat: 'Commissariat de sécurité publique, Bamenda', quartiers: ['Commercial Avenue', 'Nkwen', 'Mankon', 'Mile 4', 'Old Town', 'Azire'] },
  { ville: 'Buea', region: 'Sud-Ouest', departement: 'Fako', arrondissement: 'Buea', commissariat: 'Commissariat central de Buea', quartiers: ['Molyko', 'Great Soppo', 'Bokwaongo', 'Bonduma', 'Buea Town', 'Mile 17'] },
  { ville: 'Bertoua', region: 'Est', departement: 'Lom-et-Djérem', arrondissement: 'Bertoua 1er', commissariat: 'Commissariat central de Bertoua', quartiers: ['Centre-ville', 'Yadémé', 'Enia', 'Mokolo', 'Nkolbikon', 'Mandjou route'] },
  { ville: 'Kribi', region: 'Sud', departement: 'Océan', arrondissement: 'Kribi 1er', commissariat: 'Commissariat central de Kribi', quartiers: ['Mboa Manga', 'Londji', 'Afan Mabé', 'Mpangou', 'Talla', 'Bongandoué'] }
];
const categories = ['Vol simple', 'Vol avec violence', 'Escroquerie / Fraude', 'Agression physique', 'Dégradation de biens', 'Harcèlement', 'Accident de la route'];
const investigators = ['Insp. KANA', 'Insp. BIYA', 'Insp. NKOA'];
const statuses = ['RECU', 'EN_INSTRUCTION', 'AUDITION', 'DECISION', 'CLOTURE'];
const generated = [];
for (let i = 0; i < 60; i++) {
  const area = testRegions[i % testRegions.length];
  const quartier = area.quartiers[Math.floor(i / testRegions.length) % area.quartiers.length];
  const citizen = [...citizenByFixtureId.values()][(i * 7 + 3) % citizenByFixtureId.size];
  const id = `TEST-2026-${String(i + 1).padStart(4, '0')}`;
  const type = categories[i % categories.length];
  const date = new Date(Date.UTC(2026, i % 10, (i % 27) + 1, 10, 15));
  const dateText = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/2026`;
  const statut = statuses[i % statuses.length];
  const enqueteur = i % 5 === 0 ? null : investigators[i % investigators.length];
  const lieu = `Secteur ${quartier}, ${quartier}, ${area.arrondissement}, ${area.departement}, ${area.region}`;
  const preju = i % 3 === 0 ? { nature: 'Financier', montant: `${(i + 2) * 15000}`, detail: 'Perte financière déclarée — dossier fictif de test' }
    : { nature: 'Matériel', montant: `${(i + 1) * 10000}`, detail: 'Bien endommagé ou dérobé — dossier fictif de test' };
  generated.push({
    id, numero_dossier: id, citoyen: citizen.id, plaignant: `${citizen.prenom} ${citizen.nom}`,
    type, statut, date: dateText, heure: `${String(8 + i % 10).padStart(2, '0')}h${String((i * 7) % 60).padStart(2, '0')}`,
    score: 55 + (i * 13) % 46, enqueteur, priorite: ['NORMALE', 'HAUTE', 'URGENTE'][i % 3],
    commissariat: area.commissariat, ville: area.ville, quartier, arrondissement: area.arrondissement,
    departement: area.departement, region: area.region, lieu, prejudice: preju,
    declaration: `Dossier fictif de démonstration ${id} : signalement d'un(e) ${type.toLowerCase()} dans le quartier ${quartier}, à ${area.ville}. Les circonstances, le lieu et le préjudice sont des données de test.`,
    contact: { email: citizen.email, telephone: citizen.telephone || '' }, pieces: [], misEnCause: null, demo: true
  });
}

const toIsoDate = value => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value || '')) { const [d, m, y] = value.split('/'); return `${y}-${m}-${d}`; }
  return '2026-05-01';
};
const asPlainte = d => ({
  id: d.id, numero_dossier: d.numero_dossier || d.id, citoyen_id: d.citoyen,
  type_infraction: d.type, statut: d.statut, priorite: d.priorite,
  date_faits: toIsoDate(d.date), region: d.region || '', departement: d.departement || '',
  arrondissement: d.arrondissement || '', quartier: d.quartier || '', adresse_faits: d.lieu || '',
  lieu: d.lieu || '', commissariat: d.commissariat || '', declaration: d.declaration || '',
  prejudice_nature: d.prejudice?.nature || '', prejudice_montant: d.prejudice?.montant || '',
  prejudice_detail: d.prejudice?.detail || '', mis_en_cause: d.misEnCause || '',
  mis_en_cause_description: '', questionnaire: {}, score_completude: d.score || 0,
  pieces_jointes: [], enqueteur: d.enqueteur || null, demo: true,
  created_at: `${toIsoDate(d.date)}T${(d.heure || '12h00').replace('h', ':')}:00.000Z`
});
const insertRecord = db.prepare(`INSERT INTO records (id,type,data,created_at,updated_at) VALUES (?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET type=excluded.type,data=excluded.data,updated_at=excluded.updated_at`);
for (const d of [...demoDossiers, ...generated]) {
  const row = asPlainte(d);
  const created = row.created_at;
  insertRecord.run(d.id, 'plaintes', JSON.stringify(row), created, stamp);
}

const oldStateRecord = db.prepare("SELECT data FROM records WHERE id='shared' AND type='app_state'").get();
const oldState = oldStateRecord ? JSON.parse(oldStateRecord.data).value || {} : {};
const demoCitizenIds = new Set([...citizenByFixtureId.values()].map(c => c.id));
const demoCaseIds = new Set([...demoDossiers, ...generated].map(d => d.id));
const extraCitizens = (oldState.CITOYENS || []).filter(c => !demoCitizenIds.has(c.id) && !demoEmails.has((c.email || '').toLowerCase()));
const appCitizens = [...citizenByFixtureId.values(), ...extraCitizens];
const fixtureMatricules = new Set(fixtures.AGENTS.map(a => a.matricule));
const extraAgents = (oldState.AGENTS || []).filter(a => !fixtureMatricules.has(a.matricule));
const agents = [...fixtures.AGENTS, ...extraAgents];
const oldDossiers = (oldState.DOSSIERS || []).filter(d => !demoCaseIds.has(d.id));
const dossiers = [...demoDossiers, ...generated, ...oldDossiers];
const historique = { ...(oldState.HISTORIQUE || {}), ...fixtures.HISTORIQUE };
for (let i = 0; i < generated.length; i++) {
  const d = generated[i];
  historique[d.id] = [{ etape: 'RECU', type: 'depot', date: d.date, heure: d.heure,
    libelle: 'Dossier fictif déposé pour démonstration', detail: `${d.quartier}, ${d.ville} — ${d.commissariat}` }];
}
for (const d of oldDossiers) if (oldState.HISTORIQUE?.[d.id]) historique[d.id] = oldState.HISTORIQUE[d.id];
const appState = {
  ...oldState, CITOYENS: appCitizens, AGENTS: agents, DOSSIERS: dossiers,
  HISTORIQUE: historique,
  CONVOCATIONS: { ...(oldState.CONVOCATIONS || {}), ...fixtures.CONVOCATIONS },
  PV_CORRECTIONS: { ...(oldState.PV_CORRECTIONS || {}), ...fixtures.PV_CORRECTIONS }
};
const appData = JSON.stringify({ id: 'shared', value: appState, updated_at: stamp });
insertRecord.run('shared', 'app_state', appData, stamp, stamp);

console.log(`Base: ${databasePath}`);
console.log(`Comptes plaignants de démonstration: ${citizenByFixtureId.size} (code: ${masterCode})`);
console.log(`Commissaire: SN-2018001 (code: ${masterCode})`);
console.log(`Enquêteurs: SN-2021044, SN-2020031, SN-2022017 (code: ${masterCode})`);
console.log(`Dossiers de test: ${demoDossiers.length + generated.length}; quartiers/villes et commissariats: ${testRegions.length} zones`);
db.close();
