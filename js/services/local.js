/* API locale : SQLite, fichiers sur disque et assistance Grok côté serveur. */
var LocalAPI = (function () {
  var token = localStorage.getItem('plaintecam.session.v1') || '';
  async function request(path, options) {
    options = options || {};
    options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (token) options.headers.Authorization = 'Bearer ' + token;
    var response = await fetch('/api' + path, options);
    var data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(data && data.error || 'Erreur du serveur local');
    return data;
  }
  function query(type) {
    var operation = 'list', id = null, payload = null, filters = [], ordering = null, columns = '*';
    var q = {
      select: function (cols) { columns = cols || '*'; if (operation === 'insert' || operation === 'update') return q; return q; },
      insert: function (value) { operation = 'insert'; payload = value; return q; },
      update: function (value) { operation = 'update'; payload = value; return q; },
      delete: function () { operation = 'delete'; return q; },
      eq: function (field, value) { filters.push([field, value]); return q; },
      order: function (field, opts) { ordering = [field, opts || {}]; return q; },
      single: function () { return q.run(true); },
      then: function (resolve, reject) { return q.run(false).then(resolve, reject); },
      run: async function (single) {
        try {
          var result;
          if (operation === 'insert') result = await request('/records/' + type, { method: 'POST', body: JSON.stringify(payload) });
          else if (operation === 'list') result = await request('/records/' + type);
          else {
            var rows = await request('/records/' + type);
            var found = rows.filter(function (row) { return filters.every(function (f) { return String(row[f[0]]) === String(f[1]); }); });
            if (operation === 'update') result = await Promise.all(found.map(function (row) { return request('/records/' + type + '/' + encodeURIComponent(row.id), { method: 'PUT', body: JSON.stringify(payload) }); }));
            else if (operation === 'delete') result = await Promise.all(found.map(function (row) { return request('/records/' + type + '/' + encodeURIComponent(row.id), { method: 'DELETE' }); }));
            else result = found;
          }
          if (operation === 'list' && filters.length) result = result.filter(function (row) { return filters.every(function (f) { return String(row[f[0]]) === String(f[1]); }); });
          if (ordering && Array.isArray(result)) result.sort(function (a, b) { var c = String(a[ordering[0]] || '').localeCompare(String(b[ordering[0]] || '')); return ordering[1].ascending ? c : -c; });
          if (single && Array.isArray(result)) result = result[0] || null;
          if (columns !== '*' && typeof columns === 'string' && Array.isArray(result)) { var keys = columns.split(',').map(function (x) { return x.trim(); }); result = result.map(function (row) { var out = {}; keys.forEach(function (k) { if (k.includes('(')) return; out[k] = row[k]; }); return out; }); }
          return { data: result, error: null };
        } catch (error) { return { data: null, error: { message: error.message } }; }
      }
    };
    return q;
  }
  return {
    request: request,
    query: query,
    setSession: function (value) { token = value || ''; if (token) localStorage.setItem('plaintecam.session.v1', token); else localStorage.removeItem('plaintecam.session.v1'); },
    getSession: function () { return token; },
    async upload(file, complaintId) { var data = await new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onerror = reject; reader.onload = function () { resolve(String(reader.result).split(',')[1]); }; reader.readAsDataURL(file); }); return request('/files', { method: 'POST', body: JSON.stringify({ name: file.name, mime_type: file.type, data: data, complaint_id: complaintId }) }); },
    async transcribeAudio(file) { var buffer = await file.arrayBuffer(), bytes = new Uint8Array(buffer), binary = ''; for (var offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + 0x8000)); return request('/ai/transcribe', { method: 'POST', body: JSON.stringify({ name: file.name || 'declaration.webm', mime_type: file.type || 'audio/webm', audio: btoa(binary) }) }); },
    async createStaff(agent) { return request('/staff', { method: 'POST', body: JSON.stringify(agent) }); },
    async submitSupport(message) { return request('/support', { method: 'POST', body: JSON.stringify(message) }); },
    async askGrok(prompt, model) { return request('/ai/grok', { method: 'POST', body: JSON.stringify({ prompt: prompt, model: model }) }); }
  };
})();
