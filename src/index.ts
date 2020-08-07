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
  await new Yarn().create('react-app', [
    projectName,
    '--template',
    'typescript',
  ]);
  const yarn = new Yarn(projectName);
  await yarn.add(
    [
      '@types/react',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint-config-prettier',
      'eslint-config-react',
      'eslint-plugin-prettier',
      'prettier',
    ],
    ['-D']
  );
  console.log('Installing Storybook');
  await new Storybook(projectName).install('react-app');
}

export type RunPackageOptions = {
  attachBin: boolean;
  skipInstall: boolean;
  type: 'node' | 'react';
};

export async function runPackage(
  projectName: string,
  { attachBin, skipInstall, type }: RunPackageOptions
) {
  copyFiles(projectName, type);
  packageJson.addPackageName(projectName);

  if (attachBin) {
    makeExecutable(path.join(projectName, 'src/index.ts'));
    packageJson.addBinCommand(projectName);
  }

  if (type === 'react') {
    console.log('Installing Storybook');
    await new Storybook(projectName).install(type);
  }

  if (!skipInstall) {
    const yarn = new Yarn(projectName);
    await yarn.install();
  }
  // Adds prebublish after all the yarn installs
  packageJson.addPrepublishScript(projectName);
}

export type RunOptions = Omit<RunPackageOptions, 'type'> & {
  type: 'node' | 'react' | 'react-app';
};

export async function run(projectName: string, options: RunOptions) {
  checkProjectFolder(projectName);

  if (options.type === 'react-app') {
    return runReactApp(projectName);
  } else {
    return runPackage(projectName, options);
  }
}
