const { randomUUID } = require('node:crypto');

function silentWav(seconds = 1) {
  const sampleRate = 16_000;
  const samples = sampleRate * seconds;
  const dataLength = samples * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

(async () => {
  const base = process.env.APP_URL || 'http://127.0.0.1:4173';
  const email = `groq-transcription-${randomUUID()}@example.invalid`;
  const register = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Transcription Smoke Test', email })
  }).then(response => response.json());
  if (!register.login_code) throw new Error(register.error || 'Test-account registration failed.');
  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: register.login_code })
  }).then(response => response.json());
  if (!login.token) throw new Error(login.error || 'Test-account login failed.');

  const form = new FormData();
  form.append('name', 'silence.wav');
  form.append('mime_type', 'audio/wav');
  form.append('audio', silentWav().toString('base64'));
  const response = await fetch(`${base}/api/ai/transcribe`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'silence.wav', mime_type: 'audio/wav', audio: silentWav().toString('base64') })
  });
  const result = await response.json();
  console.log(JSON.stringify({ status: response.status, hasText: Boolean(result.text), error: result.error || null }));
})().catch(error => {
  console.error(JSON.stringify({ testError: error.message }));
  process.exitCode = 1;
});
