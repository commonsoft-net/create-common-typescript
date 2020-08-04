#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
import { run } from '.';
import * as packageJson from './packageJson';

const initProgram = (version: string) =>
  program
    .version(version)
    .requiredOption('-t, --type <type>', 'Project type: "node" or "react"')
    .option('-b, --attach-bin', 'Adds bin script linked to index file')
    .option('-s, --skip-install', 'Skips dependencies install')
    .arguments('<project-name>')
    .action(() => {
      if (program.args.length > 1) {
        throw new Error('error: too many arguments');
      }
    });

async function main() {
  initProgram(packageJson.read(path.join(__dirname, '..')).version);
  try {
    program.parse(process.argv);
    const [projectName] = program.args;
    const { attachBin, skipInstall, type } = program;

    await run(projectName, { attachBin, skipInstall, type });
  } catch (e) {
    console.error(e.message || e);
    return 1;
  }
  return 0;
}

main().then((code) => process.exit(code));
