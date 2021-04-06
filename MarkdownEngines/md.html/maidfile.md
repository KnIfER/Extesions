# maidfile

NOTE: `yarn XXX` command invokes the below task, and additional `yarn format` is shortcut to `yarn lint --fix`.

## dev

Start development server.

```bash
set -ex
webpack-dev-server --config webpack.config.js "$@"
```

## build

Build project.

```bash
set -ex
webpack --config webpack.config.js --env.production


```

## analyze

Ananlyze bundled JavaScript.

```bash
set -ex
mkdir -p docs
webpack --config webpack.config.js --env.production --profile --json > dist/stats.json
webpack-bundle-analyzer dist/stats.json
```

## test

Run test.

```bash
set -ex
jest "$@"
```

## lint

Run linter for source codes.

When `--fix` option is given, linters try to fix errors automatically.

```bash
if [[ $1 == --fix ]]; then
  prettier_opt=--write
else
  prettier_opt=--list-different
fi
set -ex
prettier-package-json 'package.json' $prettier_opt
prettier --ignore-path .gitignore '**/*.{css,js,json,md,yml}' $prettier_opt
```
