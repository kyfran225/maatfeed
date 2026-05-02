#!/usr/bin/env tsx
/**
 * Cleanup and Test Script
 * 
 * Usage: npm run test:zero-community
 * 
 * This script:
 * 1. Cleans all community data (debates, comments, replies, etc.)
 * 2. Runs Playwright tests to validate zero-data state
 * 3. Generates a report
 */

import { execSync, spawn, type ChildProcess } from 'child_process';
import path from 'path';
import process from 'process';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const API_HEALTH_URL = 'http://127.0.0.1:4000/api/health';
const WEB_HEALTH_URL = 'http://127.0.0.1:5173';
const STARTUP_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_000;
const LOG_TAIL_LIMIT = 40;

interface Step {
  name: string;
  command: string;
  critical: boolean;
}

interface ManagedProcess {
  child: ChildProcess;
  command: string;
  logTail: string[];
  name: string;
}

const steps: Step[] = [
  {
    name: 'Cleanup Community Data',
    command: 'npx tsx infra/scripts/cleanup-community-data.ts',
    critical: true
  },
  {
    name: 'Run Zero-Data Tests',
    // Use workers=1 for maximum stability with dev server
    command: 'npx playwright test tests/community-zero-data.spec.ts --reporter=line --workers=1',
    critical: false
  }
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServiceAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(3_000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

function createLogCollector(logTail: string[]) {
  let pending = '';

  return (chunk: Buffer | string) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      logTail.push(line);
      if (logTail.length > LOG_TAIL_LIMIT) {
        logTail.shift();
      }
    }
  };
}

function formatLogTail(logTail: string[]): string {
  if (logTail.length === 0) {
    return 'No process output captured.';
  }

  return logTail.map((line) => `    ${line}`).join('\n');
}

function startManagedProcess(name: string, args: string[]): ManagedProcess {
  const logTail: string[] = [];
  const command = `${npmCommand} ${args.join(' ')}`;
  const child = spawn(npmCommand, args, {
    cwd: PROJECT_ROOT,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  child.stdout?.on('data', createLogCollector(logTail));
  child.stderr?.on('data', createLogCollector(logTail));

  return { child, command, logTail, name };
}

async function waitForService(url: string, label: string, managed?: ManagedProcess) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (await isServiceAvailable(url)) {
      console.log(`✅ ${label} is ready at ${url}`);
      return;
    }

    if (managed?.child.exitCode !== null) {
      throw new Error(
        `${label} exited before becoming ready.\n` +
        `Command: ${managed.command}\n` +
        `${label} logs:\n${formatLogTail(managed.logTail)}`
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `${label} did not become ready within ${STARTUP_TIMEOUT_MS / 1000} seconds.\n` +
    `${managed ? `Command: ${managed.command}\n${label} logs:\n${formatLogTail(managed.logTail)}` : 'Service was not reachable.'}`
  );
}

async function stopManagedProcess(processInfo: ManagedProcess) {
  if (processInfo.child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${processInfo.child.pid} /T /F`, {
        stdio: 'ignore',
        windowsHide: true
      });
    } catch {
      processInfo.child.kill();
    }
    return;
  }

  processInfo.child.kill('SIGTERM');
  await sleep(1_000);
  if (processInfo.child.exitCode === null) {
    processInfo.child.kill('SIGKILL');
  }
}

async function ensureServicesReady(): Promise<ManagedProcess[]> {
  const managedProcesses: ManagedProcess[] = [];

  const apiAvailable = await isServiceAvailable(API_HEALTH_URL);
  if (apiAvailable) {
    console.log(`ℹ️  Reusing existing API server at ${API_HEALTH_URL}`);
  } else {
    console.log('Starting API server for zero-data tests...');
    const apiProcess = startManagedProcess('API server', ['--workspace', '@maat/api', 'run', 'dev']);
    managedProcesses.push(apiProcess);
    await waitForService(API_HEALTH_URL, 'API server', apiProcess);
  }

  const webAvailable = await isServiceAvailable(WEB_HEALTH_URL);
  if (webAvailable) {
    console.log(`ℹ️  Reusing existing web server at ${WEB_HEALTH_URL}`);
  } else {
    console.log('Starting web server for zero-data tests...');
    const webProcess = startManagedProcess('Web server', ['--workspace', '@maat/web', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173']);
    managedProcesses.push(webProcess);
    await waitForService(WEB_HEALTH_URL, 'Web server', webProcess);
  }

  return managedProcesses;
}

function runStep(step: Step, index: number): boolean {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Step ${index + 1}/${steps.length}: ${step.name}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    execSync(step.command, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    console.log(`\n✅ ${step.name} completed successfully`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${step.name} failed`);
    if (step.critical) {
      console.error('This step is critical. Stopping execution.');
      process.exit(1);
    }
    return false;
  }
}

async function main() {
  console.log('\n🧹 MAAT FEED - Community Cleanup & Test');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;
  let managedProcesses: ManagedProcess[] = [];

  try {
    const cleanupSuccess = runStep(steps[0], 0);
    if (cleanupSuccess) {
      passed++;
    } else {
      failed++;
    }

    managedProcesses = await ensureServicesReady();

    const testStep = steps[1];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Step 2/${steps.length}: ${testStep.name}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      execSync(testStep.command, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          PLAYWRIGHT_DISABLE_WEBSERVER: '1'
        }
      });
      console.log(`\n✅ ${testStep.name} completed successfully`);
      passed++;
    } catch (error) {
      console.error(`\n❌ ${testStep.name} failed`);
      failed++;
    }
  } finally {
    for (const processInfo of managedProcesses.reverse()) {
      await stopManagedProcess(processInfo);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Passed: ${passed}/${steps.length}`);
  console.log(`❌ Failed: ${failed}/${steps.length}`);

  if (failed === 0) {
    console.log('\n🎉 All steps completed successfully!');
    console.log('Database is ready for testing with ZERO community data.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some steps failed. Check the output above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Zero-community test runner failed');
  console.error(error);
  process.exit(1);
});
