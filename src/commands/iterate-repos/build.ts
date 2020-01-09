import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { buildRepo } from '../repo/build'
import { getRepositories } from '../../common'
import Listr from 'listr'
import { join } from 'path'
import { docPathInRepo } from '../../constants'

export default class ReposBuild extends Command {
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
    const { flags } = this.parse(ReposBuild)
    cli.action.start('Fetching repository list')

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )
    cli.action.stop(`Found ${selectedRepos.length} repos`)

    const tasks = new Listr([
      {
        title: `Building repositories into ${flags.repos_path}`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: repo.name,
              task: () =>
                buildRepo(
                  join(
                    flags.repos_path,
                    repo.name,
                    repo.doc_root || docPathInRepo
                  ),
                  repo.doc_version,
                  repo.deploy_path,
                  repo.name
                )
            }))
          )
      }
    ])

    await tasks.run()
  }
}