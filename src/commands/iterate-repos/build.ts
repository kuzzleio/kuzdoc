import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import { buildRepo } from '../repo/build'
import { getRepositories, Repo } from '../../common'
import Listr from 'listr'
import { join } from 'path'
import { docPathInRepo } from '../../constants'

export const buildRepos = (repos: Repo[], path = './repos') => {
  return [
    {
      title: `Building repositories into ${path}`,
      task: () =>
        new Listr(
          repos.map(repo => ({
            title: repo.name,
            task: () =>
              buildRepo(
                join(
                  path,
                  repo.name,
                  repo.docRoot || docPathInRepo
                ),
                repo.version,
                repo.deployPath,
                repo.name
              )
          }))
        )
    }
  ]
}

export default class ReposBuild extends BaseCommand {
  static description = 'Build a list of repositories'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to build - env: $REPOSITORIES',
      default: process.env.REPOSITORIES
    }),
    repos_path: flags.string({
      char: 'd',
      description:
        'The path where the repositories are installed - env: $REPOS_PATH',
      default: process.env.REPOS_PATH || '.repos'
    })
  }

  async run() {
    this.printVersion()
    const { flags } = this.parse(ReposBuild)

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr(buildRepos(selectedRepos, flags.repos_path))
    return tasks.run()
  }
}
