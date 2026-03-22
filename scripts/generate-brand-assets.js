#!/usr/bin/env node

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const scriptPath = path.join(__dirname, 'generate-brand-assets.py');
const result = spawnSync('python3', [scriptPath], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
