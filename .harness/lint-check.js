const fs = require('node:fs');
const path = require('node:path');

const sourceRoots = ['backend/src', 'backend/tests', 'frontend/src', 'frontend/tests'];
const issues = [];

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filePath);
    return /\.(?:js|jsx|mjs|cjs)$/.test(entry.name) ? [filePath] : [];
  });
}

for (const root of sourceRoots) {
  for (const file of sourceFiles(root)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) {
        issues.push(`${file}:${index + 1} [trailing-whitespace] Remove trailing spaces.`);
      }
      if (/^\s*var\s+/.test(line)) {
        issues.push(`${file}:${index + 1} [var-declaration] Use const or let for block-scoped declarations.`);
      }
    });
    if (!content.endsWith('\n')) {
      issues.push(`${file} [final-newline] Add a final newline.`);
    }
  }
}

if (issues.length) {
  for (const issue of issues) console.error(issue);
  process.exitCode = 1;
} else {
  console.log(`PASS: lint rules checked ${sourceRoots.join(', ')} (trailing whitespace, var declarations, final newline).`);
}
