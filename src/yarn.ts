import { spawnProcess } from './util/spawn';

export default class Yarn {
  constructor(private workDir: string) {}

  install() {
    const { workDir } = this;
    return spawnProcess('yarn', ['install'], { cwd: workDir });
  }

  add(packages: string[], options: string[]) {
    const { workDir } = this;
    return spawnProcess('yarn', ['add', ...options, ...packages], {
      cwd: workDir,
    });
  }
}
