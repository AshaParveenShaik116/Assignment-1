import { randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregateResults, evaluateCase } from './evaluator.js';
import { createModelClient, ModelError } from './modelClient.js';
import { SYSTEM_PROMPT } from './agent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetPath = path.join(root, 'evals', 'dataset.json');
const resultsPath = path.join(root, 'evidence', 'eval-results.json');

export async function runEvaluation({
  env = process.env,
  datasetPathOverride = datasetPath,
  resultsPathOverride = resultsPath,
  fetchImpl = globalThis.fetch,
} = {}) {
  const startedAt = new Date().toISOString();
  const report = {
    runId: randomUUID(),
    startedAt,
    completedAt: null,
    status: 'not_run',
    configuration: {
      baseUrl: redactBaseUrl(env.AI_BASE_URL || 'https://api.openai.com/v1'),
      model: env.AI_MODEL || null,
      requestTimeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS || 30000),
      apiKeyConfigured: Boolean(env.AI_API_KEY),
    },
    results: [],
    metrics: null,
    error: null,
  };

  try {
    const dataset = JSON.parse(await readFile(datasetPathOverride, 'utf8'));
    if (!Array.isArray(dataset.cases) || dataset.cases.length < 15) {
      throw new Error('Evaluation dataset must contain at least 15 cases.');
    }
    const modelClient = createModelClient({
      baseUrl: env.AI_BASE_URL || 'https://api.openai.com/v1',
      model: env.AI_MODEL || '',
      apiKey: env.AI_API_KEY || '',
      timeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS || 30000),
      fetchImpl,
    });
    report.status = 'running';

    for (const testCase of dataset.cases) {
      let rawOutput;
      try {
        rawOutput = await modelClient.generate({
          systemPrompt: SYSTEM_PROMPT,
          input: testCase.input,
        });
      } catch (error) {
        if (!(error instanceof ModelError)) throw error;
        report.error = { category: error.category, message: error.message, status: error.status };
        if (error.category === 'provider_error' || error.category === 'configuration_error') {
          report.status = 'provider_error';
          break;
        }
        rawOutput = '';
      }

      const result = evaluateCase(testCase, rawOutput);
      result.generatedOutput = rawOutput;
      report.results.push(result);
    }

    if (report.status === 'running') {
      report.metrics = aggregateResults(report.results);
      report.status = report.metrics.decision === 'PASS' ? 'PASS' : 'FAIL';
    }
  } catch (error) {
    report.status = error instanceof ModelError ? 'configuration_error' : 'runner_error';
    report.error = { category: error.category || 'runner_error', message: error.message };
  }

  report.completedAt = new Date().toISOString();
  await persistReport(report, resultsPathOverride);
  return report;
}

async function persistReport(report, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  let history = { runs: [] };
  try {
    history = JSON.parse(await readFile(outputPath, 'utf8'));
    if (!history || !Array.isArray(history.runs)) {
      throw new Error('Existing evaluation results must contain a runs array.');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  history.runs.push(report);
  await writeFile(outputPath, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
}

function redactBaseUrl(value) {
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '[invalid URL]';
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runEvaluation();
  console.log(`Part 1B evaluation: ${report.status}`);
  if (report.metrics) console.log(JSON.stringify(report.metrics, null, 2));
  if (report.error) console.error(`${report.error.category}: ${report.error.message}`);
  console.log(`Results written to ${path.relative(root, resultsPath)}`);
  if (report.status !== 'PASS') process.exitCode = 1;
}
