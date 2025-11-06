const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'apps', 'api-gateway', 'src', 'mail-templates');
const targetDir = path.join(__dirname, '..', 'dist', 'apps', 'api-gateway', 'src', 'mail-templates');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  copyDirectory(sourceDir, targetDir);
  console.log('✅ Mail templates copied successfully to dist/apps/api-gateway/src/mail-templates');
} else {
  console.log('❌ Source mail-templates directory not found');
}