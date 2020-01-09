# kuzdoc

The CLI that helps build the Kuzzle Docs.

This is an internal tool used by the Kuzzle team to build the documentation of all the Kuzzle.io projects.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kdoc.svg)](https://npmjs.org/package/kdoc)
[![Downloads/week](https://img.shields.io/npm/dw/kdoc.svg)](https://npmjs.org/package/kdoc)
[![License](https://img.shields.io/npm/l/kdoc.svg)](https://github.com/kuzzleio/kdoc/blob/master/package.json)

<!-- toc -->
* [kuzdoc](#kuzdoc)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g kuzdoc
$ kuzdoc COMMAND
running command...
$ kuzdoc (-v|--version|version)
kuzdoc/1.1.6 linux-x64 node-v10.12.0
$ kuzdoc --help [COMMAND]
USAGE
  $ kuzdoc COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`kuzdoc framework:install`](#kuzdoc-frameworkinstall)
* [`kuzdoc framework:link`](#kuzdoc-frameworklink)
* [`kuzdoc help [COMMAND]`](#kuzdoc-help-command)
* [`kuzdoc iterate-repos:build`](#kuzdoc-iterate-reposbuild)
* [`kuzdoc iterate-repos:cloudfront`](#kuzdoc-iterate-reposcloudfront)
* [`kuzdoc iterate-repos:deploy`](#kuzdoc-iterate-reposdeploy)
* [`kuzdoc iterate-repos:install`](#kuzdoc-iterate-reposinstall)
* [`kuzdoc repo:build`](#kuzdoc-repobuild)
* [`kuzdoc repo:cloudfront`](#kuzdoc-repocloudfront)
* [`kuzdoc repo:deploy`](#kuzdoc-repodeploy)
* [`kuzdoc repo:dev [FILE]`](#kuzdoc-repodev-file)
* [`kuzdoc repo:serve`](#kuzdoc-reposerve)

## `kuzdoc framework:install`

Install the documentation framework inside a repo

```
USAGE
  $ kuzdoc framework:install

OPTIONS
  -b, --branch=branch            [default: master] The framework branch that should be checked out
  -d, --destination=destination  [default: doc/] The path where the framework should be installed
  -h, --help                     show CLI help
```

_See code: [src/commands/framework/install.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/framework/install.ts)_

## `kuzdoc framework:link`

Links a local version of the docs to the installed framework

```
USAGE
  $ kuzdoc framework:link

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/framework/link.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/framework/link.ts)_

## `kuzdoc help [COMMAND]`

display help for kuzdoc

```
USAGE
  $ kuzdoc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `kuzdoc iterate-repos:build`

Build a list of repositories

```
USAGE
  $ kuzdoc iterate-repos:build

OPTIONS
  -d, --repos_path=repos_path      [default: .repos] The path where the repositories are installed - env: $REPOS_PATH
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to build - env: $REPOSITORIES
```

_See code: [src/commands/iterate-repos/build.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/iterate-repos/build.ts)_

## `kuzdoc iterate-repos:cloudfront`

Invalidates the Cloudfront cache of a list of repositories

```
USAGE
  $ kuzdoc iterate-repos:cloudfront

OPTIONS
  -c, --cloudfront_distribution_id=cloudfront_distribution_id  (required) The Cloudfront distribution ID where the
                                                               invalidation will be created - env:
                                                               $CLOUDFRONT_DISTRIBUTION_ID

  -d, --repos_path=repos_path                                  [default: .repos] The path where the repositories are
                                                               installed - env: $REPOS_PATH

  -h, --help                                                   show CLI help

  -r, --repositories=repositories                              The list of repositories to deploy - env: $REPOSITORIES
```

_See code: [src/commands/iterate-repos/cloudfront.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/iterate-repos/cloudfront.ts)_

## `kuzdoc iterate-repos:deploy`

Deploy a list of sub-repositories (or all) to an S3 bucket

```
USAGE
  $ kuzdoc iterate-repos:deploy

OPTIONS
  -d, --repos_path=repos_path      [default: .repos] The path where the repositories are installed - env: $REPOS_PATH
  -h, --help                       show CLI help
  -r, --repositories=repositories  The list of repositories to deploy - env: $REPOSITORIES
  --s3_bucket=s3_bucket            (required) The ID of the S3 bucket to deploy the docs to
```

_See code: [src/commands/iterate-repos/deploy.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/iterate-repos/deploy.ts)_

## `kuzdoc iterate-repos:install`

Install a list of sub-repositories (or all) to a given destination

```
USAGE
  $ kuzdoc iterate-repos:install

OPTIONS
  -b, --branch=stable|dev          [default: stable] The branch type to checkout - env: $BRANCH

  -d, --repos_path=repos_path      [default: .repos] The path where the repositories will be installed - env:
                                   $REPOS_PATH

  -h, --help                       show CLI help

  -r, --repositories=repositories  The list of repositories to install - env: $REPOSITORIES

  --framework_path=framework_path  [default: .] The path to the framework

  --link_framework                 Whether to link the doc framework to the repositories or not
```

_See code: [src/commands/iterate-repos/install.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/iterate-repos/install.ts)_

## `kuzdoc repo:build`

Build the documentation for the current repository

```
USAGE
  $ kuzdoc repo:build

OPTIONS
  -b, --doc_root=doc_root        [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -n, --repo_name=repo_name      The name of the repo (used by Algolia)

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/repo/build.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/repo/build.ts)_

## `kuzdoc repo:cloudfront`

Invalidate the Cloudfront docs cache for the current repository

```
USAGE
  $ kuzdoc repo:cloudfront

OPTIONS
  -c, --cloudfront_distribution_id=cloudfront_distribution_id  (required) The Cloudfront distribution ID where the
                                                               invalidation will be created - env:
                                                               $CLOUDFRONT_DISTRIBUTION_ID

  -d, --deploy_path=deploy_path                                (required) The path where the local version of the docs
                                                               will be deployed (e.g. /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                                                   show CLI help
```

_See code: [src/commands/repo/cloudfront.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/repo/cloudfront.ts)_

## `kuzdoc repo:deploy`

Deploy the docs of the current repository to the AWS S3 bucket

```
USAGE
  $ kuzdoc repo:deploy

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION

  --s3_bucket=s3_bucket          (required) The ID of the S3 bucket to deploy the docs to  - env: $S3_BUCKET
```

_See code: [src/commands/repo/deploy.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/repo/deploy.ts)_

## `kuzdoc repo:dev [FILE]`

describe the command here

```
USAGE
  $ kuzdoc repo:dev [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/repo/dev.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/repo/dev.ts)_

## `kuzdoc repo:serve`

Serve the docs build of the current repository via a local static http server

```
USAGE
  $ kuzdoc repo:serve

OPTIONS
  -b, --base_root=base_root      [default: doc/] The local root of the docs

  -d, --deploy_path=deploy_path  (required) The path where the local version of the docs will be deployed (e.g.
                                 /sdk/js/6/) - env: $DEPLOY_PATH

  -h, --help                     show CLI help

  -p, --port=port                [default: 3000] The port to open to the static file server

  -v, --doc_version=doc_version  (required) The local version of the docs to be linked, relative to the base doc root
                                 (e.g. 6/) - env: $DOC_VERSION
```

_See code: [src/commands/repo/serve.ts](https://github.com/kuzzleio/kuzzle-documentation-cli/blob/v1.1.6/src/commands/repo/serve.ts)_
<!-- commandsstop -->
