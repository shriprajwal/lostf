const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');
  if (!content.includes('wasm-node')) {
    content = content.replace(
      /if\s*\(\s*error\s+instanceof\s+Error\s*&&\s*error\.code\s*===\s*['"]ERR_DLOPEN_FAILED['"]\s*\)\s*\{\s*throw\s+error;\s*\}/,
      `if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {
        try {
          return require('@rollup/wasm-node/dist/native.js');
        } catch (_) {
          throw error;
        }
      }`
    );
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('✅ Applied Windows AppLocker WASM fallback patch for Rollup.');
  }
}
