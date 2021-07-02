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
kuzdoc/2.4.0 darwin-x64 node-v12.18.3
$ kuzdoc --help [COMMAND]
USAGE
  $ kuzdoc COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`kuzdoc add-repo`](#kuzdoc-add-repo)
* [`kuzdoc add-section`](#kuzdoc-add-section)
* [`kuzdoc build-and-deploy`](#kuzdoc-build-and-deploy)
* [`kuzdoc dead-links`](#kuzdoc-dead-links)
* [`kuzdoc dev`](#kuzdoc-dev)
* [`kuzdoc help [COMMAND]`](#kuzdoc-help-command)
* [`kuzdoc install`](#kuzdoc-install)
* [`kuzdoc local-deploy`](#kuzdoc-local-deploy)

## `kuzdoc add-repo`

Wizard to add a new repo to repositories.yml.

```
USAGE
  $ kuzdoc add-repo

OPTIONS
  -h, --help  show CLI help

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.
```

_See code: [src/commands/add-repo.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/add-repo.ts)_

## `kuzdoc add-section`

Wizard to add a new section in src/.vuepress/sections.json.

```
USAGE
  $ kuzdoc add-section

OPTIONS
  -h, --help  show CLI help

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.
```

_See code: [src/commands/add-section.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/add-section.ts)_

## `kuzdoc build-and-deploy`

Builds and deploys one or more repositories.

```
USAGE
  $ kuzdoc build-and-deploy

OPTIONS
  -h, --help                   show CLI help

  --cloudfrontId=cloudfrontId  (required) The name of the Cloudfront distribution to invalidate after deploying each
                               repo.

                               Environment variable: $KUZDOC_CLOUDFRONT_ID

  --dryRun                     Only builds the repo without deploying it

  --repo=repo                  The list of repositories to build, or the value __ALL__ to build all repos.
                               If not specified, kuzdoc will ask a prompt.

                               Environment variable: $KUZDOC_REPO

  --s3Bucket=s3Bucket          (required) The name of the S3 bucket to upload the repos to.

                               Environment variable: $KUZDOC_S3_BUCKET

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.

  The repositories must be previously installed in the framework via the "install" command.
  The repositories to be built can be specified via the --repo flag, the KUZDOC_REPO environment
  variable, or via the interactive prompt (only the installed repositories are listed).
  The built repositories are deployed to the S3 bucket specified via the --s3Bucket flag,
  then the Cloudfront cache (specified via --cloufrtontId) is invalidated.
  This command needs the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables to
  be properly set.
```

_See code: [src/commands/build-and-deploy.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/build-and-deploy.ts)_

## `kuzdoc dead-links`

Scans a given repo for dead-links and reports them.

```
USAGE
  $ kuzdoc dead-links

OPTIONS
  -h, --help                    show CLI help

  --dumpReport=dumpReport       The name of the JSON file to write the report to.
                                If not set, report will be only written to stdout.

  --linkType=external|internal  The link type to check.
                                If empty, both external and internal links are checked.

  --repo=repo                   The name of repository to scan. If not specified, kuzdoc will ask a prompt.

                                Environment variable: $KUZDOC_REPO

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.

  The repository must be previously installed in the framework via the "install" command.
```

_See code: [src/commands/dead-links.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/dead-links.ts)_

## `kuzdoc dev`

Launches the dev server for the documentation of a repo.

```
USAGE
  $ kuzdoc dev

OPTIONS
  -h, --help   show CLI help

  --repo=repo  The name of repository to scan. If not specified, kuzdoc will ask a prompt.

               Environment variable: $KUZDOC_REPO

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.

  The repository must be previously installed in the framework via the "install" command.
  The repository can be specified via the --repo flag, the KUZDOC_REPO environment
  variable, or via the interactive prompt (only the installed repositories are listed).
```

_See code: [src/commands/dev.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/dev.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `kuzdoc install`

Installs one or multiple repos in the framework meta-repo.

```
USAGE
  $ kuzdoc install

OPTIONS
  -h, --help               show CLI help

  --localPath=localPath    Installs the repo from a local path instead of cloning it from Github. Handy for testing
                           locally developed features.
                           This option is valid if only 1 repo is specified. Overrides --repoBranch.

                           Environment variable: $KUZDOC_LOCAL_PATH

  --repo=repo              The list of repositories to install, or the value __ALL__ to install all repos.
                           If not specified, kuzdoc will ask a prompt.

                           Environment variable: $KUZDOC_REPO

  --repoBranch=repoBranch  The branch to checkout from the repo to install.
                           This option is valid if only 1 repo is specified.

                           Environment variable: $KUZDOC_REPO_BRANCH

  --stage=stable|dev       The branch type to checkout.
                           If this option is not specified, kuzdoc will try to infer it based on the current branch of
                           the framework meta-repo.

                           Environment variable: $KUZDOC_STAGE

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.

  This command will install one or multiple repos, listed in the repositories.yml file,
  within the .repos directory of the documentation framework.
  Repositories will be either cloned from Github or symlink-ed from the local filesystem (--local-path flag).
  The repositories.yml file will be fetched from the local instance of the documentation framework.
  Repositories are either specified via the --repo flag, or the KUZDOC_REPO: if no value is specified,
  kuzdoc will ask it via a prompt.
  Kuzdoc will not overwrite existing repositories. If a folder with the same name of a selected
  repository is already present, the selected repository will be skipped and the folder will be left untouched.
```

_See code: [src/commands/install.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/install.ts)_

## `kuzdoc local-deploy`

Creates a local deploy of the docs containing the currently installed repos

```
USAGE
  $ kuzdoc local-deploy

OPTIONS
  -h, --help                 show CLI help
  --destination=destination  [default: /tmp/kuzzle-docs] The path to the locally deployed docs

DESCRIPTION
  NOTE: This command must be executed from the root of the framework meta-repo.

  The repositories must be previously installed in the framework via the "install" command.
  All the currently installed repositories will be built and deployed to the destination path.
```

_See code: [src/commands/local-deploy.ts](https://github.com/kuzzleio/kuzdoc/blob/v2.4.0/src/commands/local-deploy.ts)_
<!-- commandsstop -->
