import fs from 'fs-extra';
import path from 'path';
import { spawnProcess } from './util/spawn';
import Yarn from './yarn';

export default class Storybook {
  constructor(private workDir: string) {}

  async install(type: 'react' | 'react-app') {
    console.log('Installing Storybook');
    await this.baseInstall(type);
    this.updateDefaultExamples();
    await this.installTypescriptParsers();
    this.updateSettings(type);
  }

  private baseInstall(type: 'react' | 'react-app') {
    const { workDir } = this;
    const options = ['-p', '@storybook/cli', 'sb', 'init'];
    if (type === 'react') {
      options.push('--type');
      options.push('react');
    }
    return spawnProcess('npx', options, { cwd: workDir });
  }

  private updateSettings(type: 'react' | 'react-app') {
    const dest = path.join(this.workDir, '.storybook/main.js');
    fs.renameSync(dest, dest.replace(/\.js$/, '.js.bak'));
    fs.copySync(
      path.join(__dirname, '..', 'boilerplates', type, 'storybook/main.js'),
      dest
    );
  }

  private updateDefaultExamples() {
    const { workDir } = this;
    const foldername = path.join(workDir, 'stories');
    const newFoldername = path.join(workDir, 'src/stories');
    if (fs.existsSync(foldername)) {
      fs.renameSync(foldername, newFoldername);
    }
    if (fs.existsSync(newFoldername)) {
      const files = fs.readdirSync(newFoldername);
      files.forEach((fileName) => {
        const oldFilePath = path.join(newFoldername, fileName);
        const newFilePath = path.join(
          newFoldername,
          fileName.replace(/.js$/, '.tsx')
        );
        fs.renameSync(oldFilePath, newFilePath);
      });
    }
  }

  private installTypescriptParsers() {
    return new Yarn(this.workDir).add(
      [
        '@storybook/preset-typescript',
        'ts-loader',
        'fork-ts-checker-webpack-plugin',
      ],
      ['-D']
    );
  }
}
