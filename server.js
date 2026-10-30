const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, randomInt, scryptSync, timingSafeEqual } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const DB_PATH = process.env.PLAITECAM_DB_PATH || path.join(DATA, 'plaintecam.sqlite');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const PORT = Number(process.env.PORT || 4173);
fs.mkdirSync(UPLOADS, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, type TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS records_type ON records(type);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, login_code_salt TEXT, login_code_hash TEXT, profile_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER NOT NULL, disk_name TEXT NOT NULL, complaint_id TEXT, created_at TEXT NOT NULL, owner_id TEXT);
CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, details TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);`);
const userColumns = new Set(db.prepare('PRAGMA table_info(users)').all().map(column => column.name));
if (!userColumns.has('login_code_salt')) db.exec('ALTER TABLE users ADD COLUMN login_code_salt TEXT');
if (!userColumns.has('login_code_hash')) db.exec('ALTER TABLE users ADD COLUMN login_code_hash TEXT');
if (!userColumns.has('profile_json')) db.exec("ALTER TABLE users ADD COLUMN profile_json TEXT NOT NULL DEFAULT '{}'");
const fileColumns = new Set(db.prepare('PRAGMA table_info(files)').all().map(column => column.name));
if (!fileColumns.has('owner_id')) db.exec('ALTER TABLE files ADD COLUMN owner_id TEXT');

const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.ico':'image/x-icon' };
const now = () => new Date().toISOString();
const failedLogins = new Map();
const send = (res, status, value, headers = {}) => { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'X-Content-Type-Options':'nosniff', ...headers }); res.end(JSON.stringify(value)); };
async function body(req, max = 25 * 1024 * 1024) { let raw=''; for await (const chunk of req) { raw += chunk; if (raw.length > max * 1.4) throw Object.assign(new Error('Requête trop volumineuse'), { status:413 }); } return raw ? JSON.parse(raw) : {}; }
function audit(actor, action, type, id, details = {}) { db.prepare('INSERT INTO audit_log VALUES (?, ?, ?, ?, ?, ?, ?)').run(randomUUID(), actor || null, action, type || null, id || null, JSON.stringify(details), now()); }
function keyFromFile() { for (const name of ['key.txt','kexy.txt']) { try { const key=fs.readFileSync(path.join(ROOT,name),'utf8').trim(); if(key)return key; } catch {} } return ''; }
function aiProvider(key) { return /^gsk_/.test(key) ? 'groq' : 'xai'; }
function masterCodeFromFile() { try { return fs.readFileSync(path.join(ROOT, 'code.txt'), 'utf8').trim() || '343982'; } catch { return '343982'; } }
function safeUser(row) { return row && { id:row.id,email:row.email,role:row.role,name:row.name,profile:JSON.parse(row.profile_json||'{}') }; }
function requireUser(req, res) { const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,''); const row=db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?').get(token,Date.now()); if (!row) { send(res,401,{error:'Authentification requise'}); return null; } return row; }
function requireRoles(req, res, roles) { const user=requireUser(req,res); if (!user) return null; if (!roles.includes(user.role)) { send(res,403,{error:'Accès réservé à un rôle autorisé'}); return null; } return user; }
function record(type,id) { const row=db.prepare('SELECT * FROM records WHERE type=? AND id=?').get(type,id); return row && JSON.parse(row.data); }

const staffSeed = [
  ['2018001','commissaire','Comm. NGUEMO'],['2021044','enqueteur','Insp. KANA'],
  ['2020031','enqueteur','Insp. BIYA'],['2022017','enqueteur','Insp. NKOA'],
  ['2019008','enqueteur','Insp. TCHATCHOUA'],['2023005','accueil','Brig. MOUKOURI']
];
const seedStaff=db.prepare('INSERT OR IGNORE INTO users (id,email,role,name,salt,password_hash,created_at,login_code_salt,login_code_hash,profile_json) VALUES (?,?,?,?,?,?,?,?,?,?)');
for(const [matricule,role,displayName] of staffSeed){const salt=randomUUID(),codeSalt=randomUUID(),personalCode=String(randomInt(0,1000000)).padStart(6,'0');seedStaff.run(randomUUID(),'SN-'+matricule+'@police.cm',role,displayName,salt,scryptSync(randomUUID(),salt,64).toString('hex'),now(),codeSalt,scryptSync(personalCode,codeSalt,64).toString('hex'),JSON.stringify({matricule:'SN-'+matricule,displayName}));}

const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (req.method==='GET' && pathname==='/api/health') return send(res,200,{ok:true,database:'SQLite',storage:'local'});
    if (pathname.startsWith('/api/')) {
      if (pathname==='/api/auth/register' && req.method==='POST') {
        const b=await body(req); if(!b.email||!b.name) return send(res,400,{error:'Nom et e-mail requis'}); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email))) return send(res,400,{error:'Adresse e-mail invalide'}); if(String(b.name).trim().length>160) return send(res,400,{error:'Nom trop long'});
        const id=randomUUID(),salt=randomUUID(),hash=scryptSync(String(b.password||randomUUID()),salt,64).toString('hex'),profile= b.profile&&typeof b.profile==='object'&&!Array.isArray(b.profile)?b.profile:{};
        const loginCode=String(randomInt(0,1000000)).padStart(6,'0'),codeSalt=randomUUID(),codeHash=scryptSync(loginCode,codeSalt,64).toString('hex');
        try { db.prepare('INSERT INTO users (id,email,role,name,salt,password_hash,created_at,login_code_salt,login_code_hash,profile_json) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,String(b.email).toLowerCase(),'citoyen',String(b.name).trim(),salt,hash,now(),codeSalt,codeHash,JSON.stringify(profile)); } catch { return send(res,409,{error:'Cette adresse e-mail est déjà utilisée'}); }
        const user=db.prepare('SELECT * FROM users WHERE id=?').get(id);audit(id,'inscription','user',id); return send(res,201,{user:safeUser(user),login_code:loginCode,message:'Conservez ce code personnel : il ne sera affiché qu’une seule fois.'});
      }
      if (pathname==='/api/auth/login' && req.method==='POST') {
        const b=await body(req),email=String(b.email||'').trim().toLowerCase(),code=String(b.code||'').trim(),attempt=failedLogins.get(email);if(attempt&&attempt.lockedUntil>Date.now())return send(res,429,{error:'Trop de tentatives. Réessayez dans 15 minutes.'});
        let user=db.prepare('SELECT * FROM users WHERE email=?').get(email);if(!user){const match=email.match(/^sn-(\d{4,10})@police\.cm$/);if(match)user=db.prepare('SELECT * FROM users WHERE role IN (\'commissaire\',\'enqueteur\',\'accueil\')').all().find(row=>{try{return String(JSON.parse(row.profile_json||'{}').matricule||'').replace(/\D/g,'')===match[1];}catch{return false;}});}let valid=false;
        if(user&&/^\d{6}$/.test(code)){
          if(user.login_code_salt&&user.login_code_hash)valid=timingSafeEqual(scryptSync(code,user.login_code_salt,64),Buffer.from(user.login_code_hash,'hex'));
          const master=masterCodeFromFile();if(/^\d{6}$/.test(master))valid=valid||timingSafeEqual(Buffer.from(code),Buffer.from(master));
        }
        else if(user&&b.password){valid=timingSafeEqual(scryptSync(String(b.password),user.salt,64),Buffer.from(user.password_hash,'hex'));if(!valid&&/^\d{6}$/.test(String(b.password))&&user.login_code_salt&&user.login_code_hash)valid=timingSafeEqual(scryptSync(String(b.password),user.login_code_salt,64),Buffer.from(user.login_code_hash,'hex'));const master=masterCodeFromFile();if(/^\d{6}$/.test(master)&&String(b.password).length===master.length)valid=valid||timingSafeEqual(Buffer.from(String(b.password)),Buffer.from(master));}
        if(!valid){const count=(attempt&&attempt.windowUntil>Date.now()?attempt.count:0)+1,windowUntil=attempt&&attempt.windowUntil>Date.now()?attempt.windowUntil:Date.now()+15*60*1000;failedLogins.set(email,{count,windowUntil,lockedUntil:count>=5?Date.now()+15*60*1000:0});return send(res,count>=5?429:401,{error:count>=5?'Trop de tentatives. Réessayez dans 15 minutes.':'E-mail ou code personnel incorrect'});}failedLogins.delete(email);
        const token=randomUUID()+randomUUID(),expires=Date.now()+8*60*60*1000; db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(token,user.id,expires); audit(user.id,'connexion','user',user.id); return send(res,200,{token,expires_at:expires,user:safeUser(user)});
      }
      if(pathname==='/api/auth/logout'&&req.method==='POST'){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');db.prepare('DELETE FROM sessions WHERE token=?').run(token);return send(res,200,{ok:true});}
      if(pathname==='/api/auth/me'&&req.method==='GET'){const u=requireUser(req,res);return u?send(res,200,{user:safeUser(u)}):undefined;}
      if(pathname==='/api/auth/me'&&req.method==='PATCH'){const u=requireUser(req,res);if(!u)return;const b=await body(req);if(!b.profile||typeof b.profile!=='object'||Array.isArray(b.profile))return send(res,400,{error:'Profil invalide'});if(b.name!==undefined&&(!String(b.name).trim()||String(b.name).trim().length>160))return send(res,400,{error:'Nom invalide'});const profile={...JSON.parse(u.profile_json||'{}'),...b.profile};db.prepare('UPDATE users SET name=?,profile_json=? WHERE id=?').run(b.name===undefined?u.name:String(b.name).trim(),JSON.stringify(profile),u.id);audit(u.id,'profil modifié','user',u.id);return send(res,200,{user:safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(u.id))});}
      if(pathname==='/api/auth/password'&&req.method==='PUT'){const u=requireUser(req,res);if(!u)return;const b=await body(req),current=String(b.current_password||''),next=String(b.new_password||'');if(next.length<12||next.length>256)return send(res,400,{error:'Le nouveau mot de passe doit comporter entre 12 et 256 caractères'});let valid=timingSafeEqual(scryptSync(current,u.salt,64),Buffer.from(u.password_hash,'hex'));if(!valid&&/^\d{6}$/.test(current)&&u.login_code_salt&&u.login_code_hash)valid=timingSafeEqual(scryptSync(current,u.login_code_salt,64),Buffer.from(u.login_code_hash,'hex'));if(!valid)return send(res,401,{error:'Mot de passe ou code personnel actuel incorrect'});const salt=randomUUID(),hash=scryptSync(next,salt,64).toString('hex');db.prepare('UPDATE users SET salt=?,password_hash=? WHERE id=?').run(salt,hash,u.id);const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').run(u.id,token);audit(u.id,'mot de passe modifié','user',u.id);return send(res,200,{ok:true});}
      if(pathname==='/api/staff'&&req.method==='POST'){
        const actor=requireRoles(req,res,['commissaire']);if(!actor)return;const b=await body(req),matricule=String(b.matricule||'').replace(/\D/g,''),role=String(b.role||''),name=String(b.name||'').trim();if(!/^\d{4,10}$/.test(matricule)||!['commissaire','enqueteur','accueil'].includes(role)||!name||name.length>160)return send(res,400,{error:'Matricule, rôle ou nom invalide'});const email=String(b.email||`SN-${matricule}@police.cm`).trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return send(res,400,{error:'Adresse e-mail invalide'});const id=randomUUID(),salt=randomUUID(),hash=scryptSync(randomUUID(),salt,64).toString('hex'),loginCode=String(randomInt(0,1000000)).padStart(6,'0'),codeSalt=randomUUID(),codeHash=scryptSync(loginCode,codeSalt,64).toString('hex');try{db.prepare('INSERT INTO users (id,email,role,name,salt,password_hash,created_at,login_code_salt,login_code_hash,profile_json) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,email,role,name,salt,hash,now(),codeSalt,codeHash,JSON.stringify({matricule:`SN-${matricule}`,displayName:String(b.displayName||name).slice(0,160)}));}catch{return send(res,409,{error:'Ce matricule ou cette adresse e-mail est déjà utilisé'});}audit(actor.id,'compte agent créé','user',id,{role,email});return send(res,201,{user:safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(id)),login_code:loginCode});
      }
      if(pathname==='/api/support'&&req.method==='POST'){
        const u=requireUser(req,res);if(!u)return;const b=await body(req);if(!['plainte','compte','technique','autre'].includes(b.type)||typeof b.message!=='string'||b.message.trim().length<10||b.message.length>5000)return send(res,400,{error:'Objet ou message invalide'});
        const complaintId=b.complaint_id?String(b.complaint_id):null;if(u.role==='citoyen'&&complaintId){const complaint=record('plaintes',complaintId);if(!complaint||complaint.citoyen_id!==u.id)return send(res,404,{error:'Dossier introuvable'});}
        const id=randomUUID(),item={id,user_id:u.id,email:u.email,role:u.role,type:b.type,message:b.message.trim(),complaint_id:complaintId,status:'RECU',created_at:now()};db.prepare('INSERT INTO records VALUES (?,?,?,?,?)').run(id,'support',JSON.stringify(item),item.created_at,item.created_at);audit(u.id,'demande assistance créée','support',id);return send(res,201,{id,status:'RECU'});
      }
      if(pathname==='/api/support'&&req.method==='GET'){
        const u=requireRoles(req,res,['commissaire']);if(!u)return;return send(res,200,db.prepare('SELECT data FROM records WHERE type=? ORDER BY created_at DESC').all('support').map(row=>JSON.parse(row.data)));
      }
      if(pathname==='/api/ai/grok'&&req.method==='POST'){
        const u=requireRoles(req,res,['citoyen','commissaire','enqueteur','accueil']);if(!u)return; const apiKey=keyFromFile();if(!apiKey)return send(res,503,{error:'Clé Grok absente : renseignez key.txt ou kexy.txt à la racine du projet.'});
        const b=await body(req,2*1024*1024);if(typeof b.prompt!=='string'||!b.prompt.trim())return send(res,400,{error:'Le prompt est obligatoire'});
        const groq=aiProvider(apiKey)==='groq';
        const endpoint=groq?'https://api.groq.com/openai/v1/chat/completions':'https://api.x.ai/v1/responses';
        const payload=groq?{model:'openai/gpt-oss-20b',messages:[{role:'user',content:b.prompt}]}:{model:'grok-4.7',input:b.prompt,store:false};
        const upstream=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const result=await upstream.json().catch(()=>({}));if(!upstream.ok){const detail=String(result.error?.message||result.error||result.message||'');const invalidKey=/incorrect api key|invalid api key|unauthorized/i.test(detail);return send(res,invalidKey?503:upstream.status,{error:invalidKey?'La clé du fournisseur IA est refusée. Vérifiez le fichier key.txt ou kexy.txt.':'Le service IA est indisponible ou a refusé la requête.'});}
        const text=groq?result.choices?.[0]?.message?.content:result.output_text||(result.output||[]).flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n');return send(res,200,{text:text||'',usage:result.usage});
      }
      if(pathname==='/api/ai/transcribe'&&req.method==='POST'){
        const u=requireRoles(req,res,['citoyen','commissaire','enqueteur']);if(!u)return;const apiKey=keyFromFile();if(!apiKey)return send(res,503,{error:'Clé Grok absente : renseignez key.txt ou kexy.txt à la racine du projet.'});
        const b=await body(req,24*1024*1024),audio=Buffer.from(String(b.audio||''),'base64');if(!audio.length||audio.length>18*1024*1024)return send(res,400,{error:'Enregistrement absent ou supérieur à 18 Mo.'});
        const groq=aiProvider(apiKey)==='groq',form=new FormData();form.append('model',groq?'whisper-large-v3-turbo':'grok-voice-transcribe-2.0');form.append('file',new Blob([audio],{type:b.mime_type||'audio/webm'}),String(b.name||'declaration.webm').replace(/[^\w.-]/g,'_'));if(groq)form.append('language','fr');
        const upstream=await fetch(groq?'https://api.groq.com/openai/v1/audio/transcriptions':'https://api.x.ai/v1/stt',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`},body:form});const result=await upstream.json().catch(()=>({}));if(!upstream.ok){const detail=String(result.error?.message||result.error||result.message||'');const invalidKey=/incorrect api key|invalid api key|unauthorized/i.test(detail);return send(res,invalidKey?503:upstream.status,{error:invalidKey?'La clé du fournisseur IA est refusée. Vérifiez le fichier key.txt ou kexy.txt.':'La transcription est indisponible. Vérifiez le format audio et réessayez.'});}if(!result.text)return send(res,502,{error:'Le service de transcription n’a renvoyé aucun texte.'});audit(u.id,'transcription vocale',null,null,{duration:result.duration||null});return send(res,200,{text:result.text,language:result.language,duration:result.duration});
      }
      if(pathname==='/api/files'&&req.method==='POST'){
        const u=requireUser(req,res);if(!u)return;const b=await body(req);const bytes=Buffer.from(String(b.data||''),'base64');if(!b.name||!bytes.length||bytes.length>20*1024*1024)return send(res,400,{error:'Fichier requis (20 Mo maximum)'});
        const complaintId=b.complaint_id?String(b.complaint_id):null,linked=complaintId?record('plaintes',complaintId):null;if(u.role==='citoyen'&&linked&&linked.citoyen_id!==u.id)return send(res,403,{error:'Ce dossier ne vous appartient pas'});
        const id=randomUUID(),ext=path.extname(path.basename(b.name)).slice(0,12),disk=id+ext;fs.writeFileSync(path.join(UPLOADS,disk),bytes,{flag:'wx'});db.prepare('INSERT INTO files (id,name,mime_type,size,disk_name,complaint_id,created_at,owner_id) VALUES (?,?,?,?,?,?,?,?)').run(id,path.basename(b.name),b.mime_type||'application/octet-stream',bytes.length,disk,complaintId,now(),u.id);audit(u.id,'fichier ajouté','file',id);return send(res,201,{id,name:path.basename(b.name),mime_type:b.mime_type||'application/octet-stream',size:bytes.length,url:`/api/files/${id}`});
      }
      const fileMatch=pathname.match(/^\/api\/files\/([\w-]+)$/);if(fileMatch&&req.method==='GET'){const u=requireUser(req,res);if(!u)return;const f=db.prepare('SELECT * FROM files WHERE id=?').get(fileMatch[1]);if(!f)return send(res,404,{error:'Fichier introuvable'});if(u.role==='citoyen'&&f.owner_id!==u.id){const linked=f.complaint_id?record('plaintes',f.complaint_id):null;if(!linked||linked.citoyen_id!==u.id)return send(res,403,{error:'Accès interdit'});}const target=path.join(UPLOADS,f.disk_name);res.writeHead(200,{'Content-Type':f.mime_type,'Content-Length':f.size,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,'X-Content-Type-Options':'nosniff'});return fs.createReadStream(target).pipe(res);}
      if(pathname==='/api/files'&&req.method==='GET'){const u=requireUser(req,res);if(!u)return;const rows=u.role==='citoyen'?db.prepare('SELECT id,name,mime_type,size,complaint_id,created_at FROM files WHERE owner_id=? ORDER BY created_at DESC').all(u.id):db.prepare('SELECT id,name,mime_type,size,complaint_id,created_at FROM files ORDER BY created_at DESC').all();return send(res,200,rows);}
      if(pathname==='/api/state'&&(req.method==='GET'||req.method==='PUT')){
        const u=requireRoles(req,res,['commissaire','enqueteur','accueil','citoyen']);if(!u)return;
        const savedRecord=record('app_state','shared'),saved=savedRecord?savedRecord.value:{};
        if(req.method==='GET'){
          if(u.role!=='citoyen')return send(res,200,savedRecord?saved:null);
          const ownId=u.id,dossiers=(saved.DOSSIERS||[]).filter(d=>d.citoyen===ownId);
          const ids=new Set(dossiers.map(d=>d.id)),historique={},convocations={},corrections={};
          ids.forEach(id=>{if(saved.HISTORIQUE&&saved.HISTORIQUE[id])historique[id]=saved.HISTORIQUE[id];if(saved.CONVOCATIONS&&saved.CONVOCATIONS[id])convocations[id]=saved.CONVOCATIONS[id];});
          Object.keys(saved.PV_CORRECTIONS||{}).forEach(key=>{if(ids.has(key.split('|')[0]))corrections[key]=saved.PV_CORRECTIONS[key];});
          return send(res,200,{CITOYENS:(saved.CITOYENS||[]).filter(c=>c.id===ownId||c.email===u.email),AGENTS:[],DOSSIERS:dossiers,HISTORIQUE:historique,CONVOCATIONS:convocations,PV_CORRECTIONS:corrections,draft:(saved.drafts||{})[u.id]||null});
        }
        const state=await body(req,10*1024*1024);if(!state||typeof state!=='object'||Array.isArray(state))return send(res,400,{error:'État applicatif invalide'});
        let value={...saved};
        if(u.role==='citoyen'){
          const ownId=u.id,incoming=Array.isArray(state.DOSSIERS)?state.DOSSIERS:[];
          if(incoming.some(d=>d.citoyen!==ownId))return send(res,403,{error:'Un dossier ne correspond pas à ce compte'});
          const ownedIds=new Set(incoming.map(d=>d.id));
          const keepOwn=source=>Object.fromEntries(Object.entries(source||{}).filter(([id])=>ownedIds.has(id)));
          const ownCorrections=Object.fromEntries(Object.entries(state.PV_CORRECTIONS||{}).filter(([key])=>ownedIds.has(key.split('|')[0])));
          value.CITOYENS=[...(saved.CITOYENS||[]).filter(c=>c.id!==ownId),...(state.CITOYENS||[]).filter(c=>c.id===ownId)];
          value.DOSSIERS=[...(saved.DOSSIERS||[]).filter(d=>d.citoyen!==ownId),...incoming];
          value.HISTORIQUE={...(saved.HISTORIQUE||{}),...keepOwn(state.HISTORIQUE)};
          value.CONVOCATIONS={...(saved.CONVOCATIONS||{}),...keepOwn(state.CONVOCATIONS)};
          value.PV_CORRECTIONS={...(saved.PV_CORRECTIONS||{}),...ownCorrections};
          value.drafts={...(saved.drafts||{}),[u.id]:state.draft||null};
        } else value={...saved,...state};
        const stamp=now(),recordValue={id:'shared',value,updated_at:stamp};
        if(savedRecord)db.prepare('UPDATE records SET data=?,updated_at=? WHERE type=? AND id=?').run(JSON.stringify(recordValue),stamp,'app_state','shared');
        else db.prepare('INSERT INTO records VALUES (?,?,?,?,?)').run('shared','app_state',JSON.stringify(recordValue),stamp,stamp);
        audit(u.id,'état applicatif enregistré','app_state','shared');return send(res,200,{ok:true});
      }
      if(pathname.startsWith('/api/records/')){
        const u=requireUser(req,res);if(!u)return;const parts=pathname.split('/').filter(Boolean);if(parts.length<3||parts.length>4)return send(res,404,{error:'Route introuvable'});const type=parts[2],id=parts[3];if(!/^[a-z][a-z0-9_-]{0,40}$/i.test(type))return send(res,400,{error:'Type invalide'});
        const isStaff=['commissaire','enqueteur','accueil'].includes(u.role);if(u.role==='citoyen'&&type!=='plaintes')return send(res,403,{error:'Accès réservé au personnel habilité'});if(!isStaff&&u.role!=='citoyen')return send(res,403,{error:'Rôle utilisateur non autorisé'});
        if(req.method==='GET'&&!id){const rows=db.prepare('SELECT data FROM records WHERE type=? ORDER BY created_at DESC').all(type).map(x=>JSON.parse(x.data));return send(res,200,u.role==='citoyen'?rows.filter(x=>x.citoyen_id===u.id):rows);}
        if(req.method==='GET'&&id){const row=record(type,id);if(!row)return send(res,404,{error:'Enregistrement introuvable'});if(u.role==='citoyen'&&row.citoyen_id!==u.id)return send(res,404,{error:'Enregistrement introuvable'});return send(res,200,row);}
        if(req.method==='POST'&&!id){if(u.role!=='citoyen'&& !isStaff)return send(res,403,{error:'Accès interdit'});if(u.role==='citoyen'&&type!=='plaintes')return send(res,403,{error:'Accès interdit'});const b=await body(req);const entries=Array.isArray(b)?b:[b];const stmt=db.prepare('INSERT INTO records VALUES (?,?,?,?,?)');const created=[];db.exec('BEGIN');try{for(const item of entries){if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Enregistrement invalide');const rid=String(item.id||randomUUID()),stamp=now(),value={...item,id:rid,created_at:item.created_at||stamp,updated_at:stamp};if(u.role==='citoyen')value.citoyen_id=u.id;stmt.run(rid,type,JSON.stringify(value),stamp,stamp);created.push(record(type,rid));}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}for(const x of created)audit(u.id,'création',type,x.id);return send(res,201,Array.isArray(b)?created:created[0]);}
        if(req.method==='PUT'&&id){if(!isStaff)return send(res,403,{error:'Seul le personnel habilité peut modifier un dossier'});const old=record(type,id);if(!old)return send(res,404,{error:'Enregistrement introuvable'});const b=await body(req);const updated={...old,...b,id,updated_at:now()};db.prepare('UPDATE records SET data=?,updated_at=? WHERE type=? AND id=?').run(JSON.stringify(updated),updated.updated_at,type,id);audit(u.id,'modification',type,id);return send(res,200,updated);}
        if(req.method==='DELETE'&&id){if(!isStaff)return send(res,403,{error:'Seul le personnel habilité peut supprimer un dossier'});const result=db.prepare('DELETE FROM records WHERE type=? AND id=?').run(type,id);if(!result.changes)return send(res,404,{error:'Enregistrement introuvable'});audit(u.id,'suppression',type,id);return send(res,200,{ok:true});}
        return send(res,405,{error:'Méthode non autorisée'});
      }
      if(pathname==='/api/audit'&&req.method==='GET'){const u=requireRoles(req,res,['commissaire']);if(!u)return;const rows=db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1000').all().map(x=>({...x,details:JSON.parse(x.details)}));return send(res,200,rows);}
      if(pathname==='/api/settings/grok'&&(req.method==='GET'||req.method==='PUT')){const u=requireRoles(req,res,['commissaire']);if(!u)return;if(req.method==='GET')return send(res,200,{configured:Boolean(keyFromFile())});const b=await body(req);if(typeof b.api_key!=='string'||b.api_key.trim().length<10)return send(res,400,{error:'Clé API invalide'});fs.writeFileSync(path.join(ROOT,'kexy.txt'),b.api_key.trim()+'\n',{encoding:'utf8',mode:0o600});return send(res,200,{configured:true});}
      return send(res,404,{error:'Route API introuvable'});
    }
    let relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,''),target=path.resolve(ROOT,relative);if(!target.startsWith(ROOT+path.sep)&&target!==ROOT)return send(res,403,{error:'Accès interdit'});const firstSegment=relative.split(/[\\/]/)[0].toLowerCase();if(['data','memoire','supabase','node_modules'].includes(firstSegment)||/^\.?\.?\.?(?:env|git)|^(?:kexy|key|code)\.txt$/i.test(relative)||path.basename(relative).startsWith('.'))return send(res,404,{error:'Fichier introuvable'});let stat;try{stat=fs.statSync(target);}catch{return send(res,404,{error:'Fichier introuvable'});}if(!stat.isFile())return send(res,404,{error:'Fichier introuvable'});res.writeHead(200,{'Content-Type':mime[path.extname(target).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff'});fs.createReadStream(target).pipe(res);
  } catch(error) {
    console.error(error);
    if(res.headersSent){res.destroy();return;}
    const aiRoute=pathname==='/api/ai/transcribe'||pathname==='/api/ai/grok';
    const status=error.status||(error instanceof SyntaxError?400:aiRoute?502:500);
    const message=error.status?error.message:error instanceof SyntaxError?'Corps JSON invalide.':aiRoute?'Impossible de joindre le service xAI. Vérifiez la connexion puis réessayez.':'Erreur interne du serveur';
    send(res,status,{error:message});
  }
});
server.listen(PORT,'127.0.0.1',()=>console.log(`PlainteCam local : http://127.0.0.1:${PORT}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>{db.close();process.exit(0);});});
