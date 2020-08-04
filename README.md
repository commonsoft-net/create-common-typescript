# create-common-typescript

Forked from https://github.com/jsynowiec/node-typescript-boilerplate

Provides a command to start a typescript app.

Based on commands listed in https://docs.npmjs.com/cli/init



### Usage

```
npx create-common-typescript $project-name -t $project-type
```
Or
```
npm init common-typescript $project-name -t $project-type
```
Or
```
yarn create common-typescript $project-name -t $project-type
```

_$project-name_ supports namespaced names like `@org/project`

### Options
-t, --type: Project type: "node" or "react"

-b, --attach-bin: Adds bin script linked to index file

-s, --skip-install: Skips dependencies installation