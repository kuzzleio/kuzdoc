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
* [`kdoc iterate-repos:build`](#kdoc-iterate-reposbuild)
* [`kdoc iterate-repos:cloudfront`](#kdoc-iterate-reposcloudfront)
* [`kdoc iterate-repos:deploy`](#kdoc-iterate-reposdeploy)
* [`kdoc iterate-repos:install`](#kdoc-iterate-reposinstall)
* [`kdoc repo:build`](#kdoc-repobuild)
* [`kdoc repo:cloudfront`](#kdoc-repocloudfront)
* [`kdoc repo:deploy`](#kdoc-repodeploy)
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

## `kdoc iterate-repos:build`

Build a list of repositories

```
USAGE
  $ kdoc iterate-repos:build

OPTIONS
  -d, --repos_path=repos_path      [default: .repos] The path where the repositories are installed
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to build
```

_See code: [src/commands/iterate-repos/build.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/iterate-repos/build.ts)_

## `kdoc iterate-repos:cloudfront`

Invalidates the Cloudfront cache of a list of repositories

```
USAGE
  $ kdoc iterate-repos:cloudfront

OPTIONS
  -c, --cloudfront_distribution_id=cloudfront_distribution_id  (required) The Cloudfront distribution ID where the
                                                               invalidation will be created

  -d, --repos_path=repos_path                                  [default: .repos] The path where the repositories are
                                                               installed

  -h, --help                                                   show CLI help

  -r, --repositories=repositories                              The list of repositories to deploy
```

_See code: [src/commands/iterate-repos/cloudfront.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/iterate-repos/cloudfront.ts)_

## `kdoc iterate-repos:deploy`

Deploy a list of sub-repositories (or all) to an S3 bucket

```
USAGE
  $ kdoc iterate-repos:deploy

OPTIONS
  -d, --repos_path=repos_path      [default: .repos] The path where the repositories are installed
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to deploy
  --s3_bucket=s3_bucket            (required) The ID of the S3 bucket to deploy the docs to
```

_See code: [src/commands/iterate-repos/deploy.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/iterate-repos/deploy.ts)_

## `kdoc iterate-repos:install`

Install a list of sub-repositories (or all) to a given destination

```
USAGE
  $ kdoc iterate-repos:install

OPTIONS
  -b, --branch=stable|dev          [default: stable] The branch type to checkout
  -d, --repos_path=repos_path      [default: .repos] The path where the repositories will be installed
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to install
  --framework_path=framework_path  [default: .] The path to the framework
  --link_framework                 Whether to link the doc framework to the repositories or not
```

_See code: [src/commands/iterate-repos/install.ts](https://github.com/kuzzleio/kdoc/blob/v0.0.0/src/commands/iterate-repos/install.ts)_

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
