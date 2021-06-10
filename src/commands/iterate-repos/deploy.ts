import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import { deploy } from '../repo/deploy'
import { getRepositories } from '../../common'
import Listr from 'listr'
import { join } from 'path'
import { docPathInRepo } from '../../constants'

export default class ReposBuild extends BaseCommand {
  static description =
    'Deploy a list of sub-repositories (or all) to an S3 bucket'

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
    s3_bucket: flags.string({
      description: 'The ID of the S3 bucket to deploy the docs to',
      required: true,
      default: process.env.S3_BUCKET
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

    const tasks = new Listr([
      {
        title: `Deploying repositories into ${flags.repos_path} to S3`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: repo.name,
              task: () =>
                deploy(
                  join(
                    flags.repos_path,
                    repo.name,
                    repo.docRoot || docPathInRepo
                  ),
                  `${repo.version}`,
                  repo.deployPath,
                  flags.s3_bucket
                )
            }))
          )
      }
    ])

    await tasks.run()
  }
}
