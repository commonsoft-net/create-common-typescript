import fsExtra from 'fs-extra';
import path from 'path';

import Yarn from './yarn';
import Storybook from './storybook';
import * as packageJson from './packageJson';

function copyFiles(projectName: string, boilerplate: 'node' | 'react') {
  fsExtra.copySync(
    path.join(__dirname, '..', 'boilerplates', boilerplate),
    projectName
  );
}

function makeExecutable(filename: string) {
  const fileContents = fsExtra.readFileSync(filename, { encoding: 'utf-8' });
  const fileContentsPlus = `#!/usr/bin/env node\n\n${fileContents}`;
  fsExtra.writeFileSync(filename, fileContentsPlus);
}

const checkProjectFolder = (projectName: string) => {
  if (
    fsExtra.pathExistsSync(projectName) &&
    fsExtra.readdirSync(projectName).length > 0
  ) {
    throw new Error(
      `error: the folder ${projectName} exists and it's not empty`
    );
  }
};

async function runReactApp(projectName: string) {
  const yarn = new Yarn();
  await yarn.create('react-app', [projectName, '--template', 'typescript']);
}

export type RunOptions = {
  attachBin: boolean;
  skipInstall: boolean;
  type: 'node' | 'react' | 'react-app';
};

export async function run(
  projectName: string,
  { attachBin, skipInstall, type }: RunOptions
) {
  if (type === 'react-app') {
    return runReactApp(projectName);
  }

  checkProjectFolder(projectName);

  copyFiles(projectName, type);
  packageJson.addPackageName(projectName);

  if (attachBin) {
    makeExecutable(path.join(projectName, 'src/index.ts'));
    packageJson.addBinCommand(projectName);
  }

  if (!skipInstall) {
    const yarn = new Yarn(projectName);
    await yarn.install();
  }

  if (type === 'react') {
    console.log('Installing Storybook');
    const storybook = new Storybook(projectName);
    await storybook.install();
  }

  // Adds prebublish after all the yarn installs
  packageJson.addPrepublishScript(projectName);
}
