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
      description: 'The list of repositories to install'
    }),
    repos_path: flags.string({
      char: 'd',
      description: 'The path where the repositories will be installed',
      default: '.repos'
    }),
    branch: flags.string({
      char: 'b',
      description: 'The branch type to checkout',
      options: ['stable', 'dev'],
      default: 'stable'
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
              title: repo.name,
              task: () =>
                this.cloneRepository(repo, flags.branch, flags.repos_path)
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
        path.join(destination, repo.name, docPathInRepo),
        frameworkPath
      ),
      path.join(destination, repo.name, docPathInRepo, fwDirName)
    ])
  }
}
