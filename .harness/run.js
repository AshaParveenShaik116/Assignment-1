const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const evidenceDirectory = path.join(root, 'evidence', 'part-1a');

function collectJavaScript(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') return [];
      return collectJavaScript(filePath);
    }
    return entry.name.endsWith('.js') ? [filePath] : [];
  });
}

function runCheck(id, command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    env: process.env,
  });
  return {
    id,
    command: [command, ...args].join(' '),
    cwd: path.relative(root, cwd) || '.',
    exitCode: result.status,
    error: result.error ? result.error.message : null,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    passed: result.status === 0 && !result.error,
  };
}

const startedAt = new Date().toISOString();
const checks = [];
for (const file of [
  ...collectJavaScript(path.join(root, '.harness')),
  ...collectJavaScript(path.join(root, 'backend')),
  ...collectJavaScript(path.join(root, 'Part-1B', 'src')),
  ...collectJavaScript(path.join(root, 'Part-1B', 'tests')),
]) {
  if (file.includes(`${path.sep}node_modules${path.sep}`)) continue;
  checks.push(runCheck(`syntax:${path.relative(root, file)}`, process.execPath, ['--check', file]));
}
checks.push(
  runCheck('syntax-lint', process.execPath, [path.join(root, '.harness', 'lint-check.js')]),
  runCheck('security-static', process.execPath, [path.join(root, '.harness', 'security-check.js')]),
  runCheck('backend-tests', process.execPath, [path.join(root, 'backend', 'node_modules', 'vitest', 'vitest.mjs'), 'run'], path.join(root, 'backend')),
  runCheck('frontend-tests', process.execPath, [path.join(root, 'frontend', 'node_modules', 'vitest', 'vitest.mjs'), 'run'], path.join(root, 'frontend')),
  runCheck('frontend-production-build', process.execPath, [path.join(root, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], path.join(root, 'frontend')),
);

const run = {
  startedAt,
  completedAt: new Date().toISOString(),
  result: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
  checks,
};

fs.mkdirSync(evidenceDirectory, { recursive: true });
const resultsPath = path.join(evidenceDirectory, 'harness-results.json');
const history = fs.existsSync(resultsPath)
  ? JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
  : { runs: [] };
history.runs.push(run);
fs.writeFileSync(resultsPath, `${JSON.stringify(history, null, 2)}\n`);

for (const check of checks) console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.id}`);
console.log(`Overall: ${run.result}. Results: ${path.relative(root, resultsPath)}`);
if (run.result !== 'PASS') process.exitCode = 1;
