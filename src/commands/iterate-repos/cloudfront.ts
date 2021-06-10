import { Command, flags } from '@oclif/command'
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
        'The Cloudfront distribution ID where the invalidation will be created - env: $CLOUDFRONT_DISTRIBUTION_ID',
      required: true,
      default: process.env.CLOUDFRONT_DISTRIBUTION_ID
    })
  }

  async run() {
    const { flags } = this.parse(ReposBuild)
    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr([
      {
        title: `Invalidating Cloudfront cache for repositories into ${flags.repos_path}`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: repo.name,
              task: () =>
                invalidateCloudfront(
                  repo.deployPath,
                  flags.cloudfront_distribution_id
                )
            }))
          )
      }
    ])

    await tasks.run()
  }
}
