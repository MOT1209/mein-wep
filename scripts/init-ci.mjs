/**
 * init-ci.mjs — CI-friendly Capacitor initializer
 * Used by GitHub Actions workflow when a project doesn't have Capacitor yet.
 *
 * Usage: node scripts/init-ci.mjs <project-dir> --name "App" --id com.rashid.app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function main() {
  const projectArg = process.argv[2];
  const nameFlag = process.argv.indexOf('--name');
  const idFlag = process.argv.indexOf('--id');

  if (!projectArg) {
    console.error('Usage: node scripts/init-ci.mjs <project-dir> [--name "App Name"] [--id com.rashid.app]');
    process.exit(1);
  }

  const projectDir = path.resolve(ROOT, projectArg);
  const folderName = path.basename(projectDir);
  const appName = nameFlag >= 0 ? process.argv[nameFlag + 1] : folderName;
  const appId = idFlag >= 0 ? process.argv[idFlag + 1] : `com.rashid.${folderName.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Read manifest.json for better name
  const manifestPath = path.join(projectDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (manifest.name && nameFlag < 0) {
        console.log(`📖 Using name from manifest: ${manifest.name}`);
      }
    } catch {}
  }

  // Create package.json
  const pkg = {
    name: folderName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      'build:web': 'node ../../scripts/copy-to-www.mjs .',
      'cap:sync': 'npx cap sync android',
      'cap:build': 'npx cap build android',
      'cap:open': 'npx cap open android'
    },
    dependencies: {
      '@capacitor/core': '^8.0.0',
      '@capacitor/android': '^8.0.0'
    },
    devDependencies: {
      '@capacitor/cli': '^8.0.0'
    }
  };

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✅ Created package.json`);

  // Create capacitor.config.ts
  const capConfig = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${appName}',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
      signingType: 'apksigner'
    }
  }
};

export default config;
`;
  fs.writeFileSync(path.join(projectDir, 'capacitor.config.ts'), capConfig);
  console.log(`✅ Created capacitor.config.ts`);

  // Copy update-checker.js
  const jsDir = path.join(projectDir, 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  const checkerSrc = path.join(__dirname, 'update-checker.js');
  const checkerDest = path.join(jsDir, 'update-checker.js');
  if (fs.existsSync(checkerSrc)) {
    fs.copyFileSync(checkerSrc, checkerDest);
    console.log(`✅ Copied update-checker.js`);
  }

  // Create version.json
  const versionFile = {
    version: '1.0.0',
    buildNumber: 1,
    apkUrl: `https://rashid-wep.vercel.app/apks/${folderName}-v1.0.0.apk`,
    changelog: 'Initial release',
    releaseDate: new Date().toISOString().split('T')[0]
  };
  const verPath = path.join(projectDir, 'version.json');
  if (!fs.existsSync(verPath)) {
    fs.writeFileSync(verPath, JSON.stringify(versionFile, null, 2) + '\n');
    console.log(`✅ Created version.json`);
  }

  // Inject script tag into index.html
  const indexPath = path.join(projectDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    if (!html.includes('update-checker.js')) {
      html = html.replace('</body>', '  <script src="js/update-checker.js"></script>\n</body>');
      fs.writeFileSync(indexPath, html);
      console.log(`✅ Injected update-checker script into index.html`);
    } else {
      console.log(`⏭️ update-checker already in index.html`);
    }
  }

  console.log(`\n🎉 Capacitor initialized for ${folderName} (${appId})`);
}

main();
