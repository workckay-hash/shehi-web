const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'dist');
const audioBaseUrl = process.env.SHEHI_AUDIO_BASE_URL?.trim().replace(/\/+$/, '');

if (audioBaseUrl && new URL(audioBaseUrl).protocol !== 'https:') {
  throw new Error('SHEHI_AUDIO_BASE_URL must use HTTPS.');
}

let audioConfig = fs.readFileSync(path.join(root, 'audio-config.js'), 'utf8');
if (audioBaseUrl) {
  const baseUrlSetting = /^window\.SHEHI_AUDIO_BASE_URL\s*=.*;$/m;
  if (!baseUrlSetting.test(audioConfig)) {
    throw new Error('audio-config.js is missing the SHEHI_AUDIO_BASE_URL setting.');
  }
  audioConfig = audioConfig.replace(
    baseUrlSetting,
    `window.SHEHI_AUDIO_BASE_URL = ${JSON.stringify(audioBaseUrl)};`
  );
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && /\.(?:html|css)$/i.test(entry.name)) {
    fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
  }

  if (entry.isDirectory() && ['assets', 'items'].includes(entry.name)) {
    fs.cpSync(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
  }
}

fs.writeFileSync(path.join(output, 'audio-config.js'), audioConfig);
fs.copyFileSync(path.join(root, 'script.js'), path.join(output, 'script.js'));

console.log('Built static site in dist/ (audio files are hosted separately).');
