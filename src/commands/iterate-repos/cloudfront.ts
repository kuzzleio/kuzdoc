import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { invalidateCloudfront } from '../repo/cloudfront'
import { getRepositories } from '../../common'
import Listr from 'listr'

export default class ReposBuild extends Command {
  static description =
    'Invalidates the Cloudfront cache of a list of repositories'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to deploy - env: $REPOSITORIES',
      default: process.env.REPOSITORIES
    }),
    repos_path: flags.string({
      char: 'd',
      description:
        'The path where the repositories are installed - env: $REPOS_PATH',
      default: process.env.REPOS_PATH || '.repos'
    }),
    cloudfront_distribution_id: flags.string({
      char: 'c',
      description:
        'The Cloudfront distribution ID where the invalidation will be created',
      required: true
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
                invalidateCloudfront(
                  repo.base_url,
                  flags.cloudfront_distribution_id
                )
            }))
          )
      }
    ])

    await tasks.run()
  }
}
