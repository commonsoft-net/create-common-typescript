import fsExtra from 'fs-extra';
import path from 'path';

import Yarn from './yarn';
import Storybook from './storybook';
import * as packageJson from './packageJson';

function copyFiles(
  projectName: string,
  boilerplate: 'node' | 'react' | 'react-app'
) {
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
  const projectType = 'react-app';
  await new Yarn().create(projectType, [
    projectName,
    '--template',
    'typescript',
  ]);
  await new Yarn(projectName).add(
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
  copyFiles(projectName, projectType);
  packageJson.addLintScript(projectName);
  await new Storybook(projectName).install(projectType);
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
  checkProjectFolder(projectName);

  if (type === 'react-app') {
    return runReactApp(projectName);
  }
  copyFiles(projectName, type);
  packageJson.addPackageName(projectName);

  if (attachBin) {
    makeExecutable(path.join(projectName, 'src/index.ts'));
    packageJson.addBinCommand(projectName);
  }
  if (!skipInstall) {
    if (type === 'react') {
      await new Storybook(projectName).install(type);
    } else {
      await new Yarn(projectName).install();
    }
  }
  // Adds prebublish after all the yarn installs
  packageJson.addPrepublishScript(projectName);
}
