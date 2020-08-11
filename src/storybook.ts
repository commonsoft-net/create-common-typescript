import { spawnProcess } from './util/spawn';

export default class Storybook {
  constructor(private workDir: string) {}

  async install(type: 'react' | 'react-app') {
    console.log('Installing Storybook');
    const { workDir } = this;
    const options = ['-p', '@storybook/cli', 'sb', 'init'];
    if (type === 'react') {
      options.push('--type');
      options.push('react');
    }
    return spawnProcess('npx', options, { cwd: workDir });
  }
}
