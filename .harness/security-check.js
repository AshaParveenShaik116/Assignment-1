const fs = require('node:fs');
const path = require('node:path');

const sourceRoots = ['backend/src', 'frontend/src'];
const rules = [
  ['dynamic-eval', /\beval\s*\(/, 'Dynamic eval can execute untrusted input.'],
  ['dynamic-function', /\bnew\s+Function\s*\(/, 'Dynamic Function construction can execute untrusted input.'],
  ['shell-exec', /\bchild_process\.(?:exec|execSync)\s*\(/, 'Shell execution with interpolated input is unsafe.'],
  ['shell-option', /\bshell\s*:\s*true\b/, 'Shell-enabled process execution requires security review.'],
  [
    'hardcoded-credential',
    /\b(?:api[_-]?key|password|secret|access[_-]?token)\s*[:=]\s*(['"`])[^'"`]+['"`]/i,
    'Credential-like values must come from environment configuration.',
  ],
];

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filePath);
    return /\.(?:js|jsx|mjs|cjs)$/.test(entry.name) ? [filePath] : [];
  });
}

const findings = [];
for (const root of sourceRoots) {
  for (const file of sourceFiles(root)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const [rule, pattern, message] of rules) {
        if (pattern.test(line)) findings.push({ rule, file, line: index + 1, message });
      }
    });
  }
}

if (findings.length) {
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`PASS: ${rules.length} source security rules checked across ${sourceRoots.join(', ')}.`);
}
