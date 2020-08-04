import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export const spawnProcess = (
  command: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio
) =>
  new Promise((resolve) => {
    const sp = spawn(command, args, options);
    sp.stdout.on('data', (data) => console.log(`${data}`));
    sp.stderr.on('data', (data) => console.error(`${data}`));
    sp.on('close', () => {
      resolve();
    });
    return sp;
  });
