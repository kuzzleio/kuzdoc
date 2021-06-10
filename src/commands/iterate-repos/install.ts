import { Command, flags } from '@oclif/command'
import execa from 'execa'
import path from 'path'
import Listr from 'listr'

import { fwDirName, docPathInRepo } from '../../constants'
import { getRepositories, Repo, resolveRepoBranch } from '../../common'

async function cloneRepository(repo: Repo, branch: string, destination: string) {
  // this.debug(`${repo.url}#${branch === 'dev' ? repo.dev : repo.stable}`)

  return execa('git', [
    'clone',
    '--branch',
    branch === 'dev' ? repo.devBranch : repo.stableBranch,
    '--depth',
    '10',
    '--single-branch',
    repo.url,
    path.join(destination, repo.name)
  ])
}

async function linkFrameworkToRepo(
  repo: Repo,
  destination: string,
  frameworkPath: string
) {
  return execa('ln', [
    '-s',
    path.relative(
      path.join(destination, repo.name, repo.docRoot || docPathInRepo),
      frameworkPath
    ),
    path.join(
      destination,
      repo.name,
      repo.docRoot || docPathInRepo,
      fwDirName
    )
  ])
}

// eslint-disable-next-line max-params
export const installRepos = (selectedRepos: Repo[], branch: string, reposPath = '.repos', linkFramework = false, frameworkPath = '.') => {
  const tasks = [
    {
      title: `Cloning repositories (${branch}) into ${reposPath}`,
      task: () =>
        new Listr(
          selectedRepos.map(repo => ({
            title: `${repo.name} (${branch === 'dev' ? repo.devBranch : repo.stableBranch
              })`,
            task: () =>
              cloneRepository(repo, branch, reposPath)
          }))
        )
    }
  ]

  if (linkFramework) {
    const linkTask = {
      title: `Linking framework (${frameworkPath}) to repositories`,
      task: () =>
        new Listr(
          selectedRepos.map(repo => ({
            title: repo.name,
            task: () =>
              linkFrameworkToRepo(
                repo,
                reposPath,
                frameworkPath
              )
          }))
        )
    }
    tasks.push(linkTask)
  }

  return tasks
}

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
    const resolvedBranch = flags.branch || (await resolveRepoBranch(flags.framework_path))

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr(
      installRepos(selectedRepos, resolvedBranch, flags.repos_path, flags.link_framework, flags.framework_path)
    )

    return tasks.run()
  }
}
