import fs from 'fs';
import path from 'path';
import { spawnProcess } from './util/spawn';
import Yarn from './yarn';

const stories = {
  before: '../stories/**/*.stories.js',
  after: '../src/**/*.stories.tsx',
};

const addons = {
  before: `addons: ['@storybook/addon-actions', '@storybook/addon-links']`,
  after: `addons: ['@storybook/addon-actions', '@storybook/addon-links', '@storybook/preset-typescript']`,
};

export default class Storybook {
  constructor(private workDir: string) {}

  async install() {
    await this.baseInstall();
    this.updateDefaultExamples();
    await this.installTypescriptParsers();
    this.updateSettings();
  }

  private baseInstall() {
    const { workDir } = this;
    return spawnProcess(
      'npx',
      ['-p', '@storybook/cli', 'sb', 'init', '--type', 'react'],
      {
        cwd: workDir,
      }
    );
  }

  private updateSettings() {
    const { workDir } = this;
    const filename = path.join(workDir, '.storybook/main.js');
    const text = fs.readFileSync(filename, { encoding: 'utf-8' });

    const newText = text
      .replace(stories.before, stories.after)
      .replace(addons.before, addons.after);

    fs.writeFileSync(filename, newText, 'utf-8');
  }

  private updateDefaultExamples() {
    const { workDir } = this;
    const foldername = path.join(workDir, 'stories');
    const newFoldername = path.join(workDir, 'src/stories');
    fs.renameSync(foldername, newFoldername);

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

  private installTypescriptParsers() {
    const yarn = new Yarn(this.workDir);
    return yarn.add(
      [
        '@storybook/preset-typescript',
        'ts-loader',
        'fork-ts-checker-webpack-plugin',
      ],
      ['-D']
    );
  }
}
