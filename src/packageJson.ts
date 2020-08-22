import fsExtra from 'fs-extra';
import path from 'path';

export const read = (folderName: string) =>
  JSON.parse(
    fsExtra.readFileSync(path.join(folderName, 'package.json'), {
      encoding: 'utf-8',
    })
  );

const writePackageJson = (
  projectName: string,
  contents: Record<string, unknown>
) => {
  fsExtra.writeFileSync(
    path.join(projectName, 'package.json'),
    JSON.stringify(contents, null, 2)
  );
};

const sortJSON = (json: Record<string, unknown>) => {
  const {
    name,
    version,
    private: isPrivate,
    description,
    main,
    bin,
    contributors,
    license,
    scripts,
    dependencies,
    devDependencies,
    ...others // ensure we don't miss anything
  } = json;
  const newPackageJson: Record<string, unknown> = {};
  newPackageJson.name = name;
  newPackageJson.version = version;
  newPackageJson.private = isPrivate;
  newPackageJson.description = description;
  newPackageJson.main = main;
  newPackageJson.bin = bin;
  newPackageJson.contributors = contributors;
  newPackageJson.license = license;
  newPackageJson.scripts = scripts;
  newPackageJson.dependencies = dependencies;
  newPackageJson.devDependencies = devDependencies;
  return { ...newPackageJson, ...others };
};

export function addPackageName(projectName: string) {
  const packageJson = read(projectName);
  packageJson.name = projectName;
  writePackageJson(projectName, sortJSON(packageJson));
}

export function addBinCommand(projectName: string) {
  const packageJson = read(projectName);
  packageJson.bin = './lib/index.js';
  writePackageJson(projectName, sortJSON(packageJson));
}

function addScript(projectName: string, name: string, command: string) {
  const packageJson = read(projectName);
  packageJson.scripts[name] = command;
  writePackageJson(projectName, sortJSON(packageJson));
}

export function addPrepublishScript(projectName: string) {
  addScript(projectName, 'prepublish', 'yarn build');
}

export function addLintScript(projectName: string) {
  addScript(projectName, 'lint:fix', 'eslint . --ext .ts,.tsx --fix');
}
