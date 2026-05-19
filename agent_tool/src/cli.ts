import { readFile } from 'node:fs/promises';
import { calculateFromInput } from './engine.js';
import type { AgentCalcInput } from './types.js';

const parseArgs = (argv: string[]) => {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
};

const print = (payload: unknown) => {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = typeof args.input === 'string' ? args.input : undefined;

  if (!inputPath) {
    print({
      ok: false,
      error: {
        code: 'MISSING_INPUT',
        message: 'Usage: npm run calc -- --input examples/zhu_shuang_mo_t21_boss1.json'
      }
    });
    process.exitCode = 2;
    return;
  }

  try {
    const text = await readFile(inputPath, 'utf8');
    const input = JSON.parse(text.replace(/^\uFEFF/, '')) as AgentCalcInput;
    const result = await calculateFromInput(input);
    print(result);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    print({
      ok: false,
      error: {
        code: 'RUNTIME_ERROR',
        message: error instanceof Error ? error.message : String(error)
      }
    });
    process.exitCode = 1;
  }
};

await main();
