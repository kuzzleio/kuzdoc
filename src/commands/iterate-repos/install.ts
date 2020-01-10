import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import execa from 'execa'
import Listr from 'listr'
import path from 'path'

import { fwDirName, docPathInRepo } from '../../constants'
import { getRepositories, Repo } from '../../common'

export default class ReposInstall extends Command {
  static description =
    'Install a list of sub-repositories (or all) to a given destination'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to install - env: $REPOSITORIES',
      default: process.env.REPOSITORIES
    }),
    repos_path: flags.string({
      char: 'd',
      description:
        'The path where the repositories will be installed - env: $REPOS_PATH',
      default: process.env.REPOS_PATH || '.repos'
    }),
    branch: flags.string({
      char: 'b',
      description: 'The branch type to checkout - env: $BRANCH',
      options: ['stable', 'dev'],
      default: process.env.BRANCH
    }),
    link_framework: flags.boolean({
      description:
        'Whether to link the doc framework to the repositories or not',
      default: false
    }),
    framework_path: flags.string({
      description: 'The path to the framework',
      default: '.'
    })
  }

  async run() {
    const { flags } = this.parse(ReposInstall)
    const resolvedBranch = flags.branch || (await this.resolveBranch())

    cli.action.start('Fetching repository list')

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )
    cli.action.stop(`Found ${selectedRepos.length} repos`)

    const tasks = new Listr([
      {
        title: `Cloning repositories into ${flags.repos_path}`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: `${repo.name} (${
                resolvedBranch === 'dev' ? repo.dev : repo.stable
              })`,
              task: () =>
                this.cloneRepository(repo, resolvedBranch, flags.repos_path)
            }))
          )
      }
    ])

    if (flags.link_framework) {
      const linkTask = {
        title: `Linking framework (${flags.framework_path}) to repositories`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: repo.name,
              task: () =>
                this.linkFrameworkToRepo(
                  repo,
                  flags.repos_path,
                  flags.framework_path
                )
            }))
          )
      }
      tasks.add(linkTask)
    }

    await tasks.run()
  }

  async cloneRepository(repo: Repo, branch: string, destination: string) {
    this.debug(`${repo.url}#${branch === 'dev' ? repo.dev : repo.stable}`)

    return execa('git', [
      'clone',
      '--branch',
      branch === 'dev' ? repo.dev : repo.stable,
      '--depth',
      '10',
      '--single-branch',
      repo.url,
      path.join(destination, repo.name)
    ])
  }

  async linkFrameworkToRepo(
    repo: Repo,
    destination: string,
    frameworkPath: string
  ) {
    return execa('ln', [
      '-s',
      path.relative(
        path.join(destination, repo.name, repo.doc_root || docPathInRepo),
        frameworkPath
      ),
      path.join(
        destination,
        repo.name,
        repo.doc_root || docPathInRepo,
        fwDirName
      )
    ])
  }

  async resolveBranch() {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
    if (stdout.match(/^master|\d+-stable$/)) {
      return 'stable'
    }
    return 'dev'
  }
}
