import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';

async function packageOpk() {
  console.log('[1/4] Running production build with Vite...');
  execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });

  console.log('[2/4] Validating manifest.json schema...');
  const manifestRaw = fs.readFileSync('manifest.json', 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  if (!manifest.meta || !manifest.meta.name || !manifest.meta.version) {
    throw new Error('Invalid manifest: missing meta.name or meta.version');
  }
  if (!manifest.data || !manifest.data.windows) {
    throw new Error('Invalid manifest: missing data.windows');
  }

  console.log('[3/4] Staging manifest and assets into dist/...');
  fs.writeFileSync('dist/manifest.json', manifestRaw);

  // Copy assets folder into dist
  fs.cpSync('assets', 'dist/assets', { recursive: true });

  console.log('[4/4] Archiving into dist/tactician-coach.opk...');
  const outputFilePath = path.resolve('dist/tactician-coach.opk');
  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`\n🎉 Successfully packaged: dist/tactician-coach.opk (${sizeMb} MB)`);
      console.log('   Ready for direct drag-and-drop into Overwolf or Developer Console upload!');
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    // Add all contents of dist/ (excluding .opk if it already existed)
    archive.directory('dist/', false, (entry) => {
      if (entry.name.endsWith('.opk')) return false;
      return entry;
    });
    archive.finalize();
  });
}

packageOpk().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
