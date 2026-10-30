/* Authentification avec comptes et sessions conservés localement. */
var AuthService = {
  async signInWithOtp(email) { return { error: { message: 'Les codes e-mail nécessitent un service d’envoi. Utilisez un compte local avec mot de passe.' }, email: email }; },
  async verifyOtp() { return { error: { message: 'La vérification par code e-mail n’est pas configurée en mode local.' } }; },
  async signInWithPassword(matricule, password) {
    try { var login = String(matricule).replace(/^SN[-–\s]*/i, ''); var credential = /^\d{6}$/.test(String(password)) ? { code: String(password) } : { password: password }; var result = await LocalAPI.request('/auth/login', { method: 'POST', body: JSON.stringify(Object.assign({ email: String(matricule).includes('@') ? matricule : 'SN-' + login + '@police.cm' }, credential)) }); LocalAPI.setSession(result.token); return { data: result, error: null }; }
    catch (error) { return { data: null, error: { message: error.message } }; }
  },
  async signInWithCode(email, code) {
    try { var result = await LocalAPI.request('/auth/login', { method: 'POST', body: JSON.stringify({ email: email, code: code }) }); LocalAPI.setSession(result.token); return { data: result, error: null }; }
    catch (error) { return { data: null, error: { message: error.message } }; }
  },
  async register(name, email, password, role) {
    try { return { data: await LocalAPI.request('/auth/register', { method: 'POST', body: JSON.stringify({ name: name, email: email, password: password, role: role }) }), error: null }; }
    catch (error) { return { data: null, error: { message: error.message } }; }
  },
  async signOut() { try { await LocalAPI.request('/auth/logout', { method: 'POST' }); } finally { LocalAPI.setSession(''); } },
  async getSession() { if (!LocalAPI.getSession()) return null; try { return { access_token: LocalAPI.getSession(), user: (await LocalAPI.request('/auth/me')).user }; } catch (_) { LocalAPI.setSession(''); return null; } },
  async getUser() { var session = await this.getSession(); return session && session.user || null; }
};
