const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy pnpm-lock.yaml
fs.copyFileSync(
  path.join(process.cwd(), 'pnpm-lock.yaml'),
  path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
);

const rootPkgPath = path.join(process.cwd(), 'package.json');
const serverPkgPath = path.join(MEDUSA_SERVER_PATH, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const serverPkg = JSON.parse(fs.readFileSync(serverPkgPath, 'utf8'));
for (const dep of ['pdf-lib', 'pg']) {
  if (rootPkg.dependencies?.[dep]) {
    serverPkg.dependencies = serverPkg.dependencies || {};
    serverPkg.dependencies[dep] = rootPkg.dependencies[dep];
  }
}
fs.writeFileSync(serverPkgPath, `${JSON.stringify(serverPkg, null, 2)}\n`);

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
execSync('pnpm i --prod --frozen-lockfile', { 
  cwd: MEDUSA_SERVER_PATH,
  stdio: 'inherit'
});
