# kdoc

The CLI that helps build the Kuzzle Docs

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kdoc.svg)](https://npmjs.org/package/kdoc)
[![Downloads/week](https://img.shields.io/npm/dw/kdoc.svg)](https://npmjs.org/package/kdoc)
[![License](https://img.shields.io/npm/l/kdoc.svg)](https://github.com/kuzzleio/kdoc/blob/master/package.json)

<!-- toc -->
* [kdoc](#kdoc)
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
* [`kdoc repo:build`](#kdoc-repobuild)
* [`kdoc repo:cloudfront`](#kdoc-repocloudfront)
* [`kdoc repo:deploy`](#kdoc-repodeploy)
* [`kdoc repo:install`](#kdoc-repoinstall)
* [`kdoc repo:serve`](#kdoc-reposerve)

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

## `kdoc repo:build`

describe the command here

```
USAGE
  $ kdoc repo:build

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -n, --repo_name=repo_name      The name of the repo (used by Algolia)

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/repo/build.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/build.ts)_

## `kdoc repo:cloudfront`

Invalidate the Cloudfront cache for the current docs

```
USAGE
  $ kdoc repo:cloudfront

OPTIONS
  -c, --cloudfront_distribution_id=cloudfront_distribution_id  (required) The Cloudfront distribution ID where the
                                                               invalidation will be created

  -d, --deploy_path=deploy_path                                (required) The path where the local version of the docs
                                                               will be deployed (e.g. /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                                                   show CLI help
```

_See code: [src/commands/repo/cloudfront.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/cloudfront.ts)_

## `kdoc repo:deploy`

Deploy the docs to the AWS S3 bucket

```
USAGE
  $ kdoc repo:deploy

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION

  --s3_bucket=s3_bucket          (required) The ID of the S3 bucket to deploy the docs to
```

_See code: [src/commands/repo/deploy.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/deploy.ts)_

## `kdoc repo:install`

Installs a sub-repo to a given destination

```
USAGE
  $ kdoc repo:install

OPTIONS
  -b, --branch=stable|dev          [default: stable] The branch type to checkout
  -d, --destination=destination    [default: .repos] The path where the repositories will be installed
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to install
```

_See code: [src/commands/repo/install.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/install.ts)_

## `kdoc repo:serve`

Serve the doc build via a local static http server

```
USAGE
  $ kdoc repo:serve

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -p, --port=port                [default: 3000] The port to open to the static file server

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/repo/serve.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/repo/serve.ts)_
<!-- commandsstop -->
