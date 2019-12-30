kdoc
====

The CLI that helps build the Kuzzle Docs

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kdoc.svg)](https://npmjs.org/package/kdoc)
[![Downloads/week](https://img.shields.io/npm/dw/kdoc.svg)](https://npmjs.org/package/kdoc)
[![License](https://img.shields.io/npm/l/kdoc.svg)](https://github.com/kuzzleio/kdoc/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g kdoc
$ kdoc COMMAND
running command...
$ kdoc (-v|--version|version)
kdoc/0.0.0 linux-x64 node-v10.12.0
$ kdoc --help [COMMAND]
USAGE
  $ kdoc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kdoc framework:install`](#kdoc-frameworkinstall)
* [`kdoc framework:link`](#kdoc-frameworklink)
* [`kdoc help [COMMAND]`](#kdoc-help-command)
* [`kdoc repo:build [FILE]`](#kdoc-repobuild-file)

## `kdoc framework:install`

Install the documentation framework inside a repo

```
USAGE
  $ kdoc framework:install

OPTIONS
  -b, --branch=branch            The framework branch that should be checked out
  -d, --destination=destination  [default: doc/] The path where the framework should be installed
  -h, --help                     show CLI help
```

_See code: [src/commands/framework/install.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/framework/install.ts)_

## `kdoc framework:link`

Links a local version of the docs to the installed framework

```
USAGE
  $ kdoc framework:link

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/framework/link.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/framework/link.ts)_

## `kdoc help [COMMAND]`

display help for kdoc

```
USAGE
  $ kdoc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `kdoc repo:build [FILE]`

describe the command here

```
USAGE
  $ kdoc repo:build [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/repo/build.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/build.ts)_
<!-- commandsstop -->
