import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { deploy } from '../repo/deploy'
import { getRepositories } from '../../common'
import Listr from 'listr'
import { join, basename } from 'path'
import { docPathInRepo } from '../../constants'

export default class ReposBuild extends Command {
  static description =
    'Deploy a list of sub-repositories (or all) to an S3 bucket'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to deploy'
    }),
    repos_path: flags.string({
      char: 'd',
      description: 'The path where the repositories are installed',
      default: '.repos'
    }),
    s3_bucket: flags.string({
      description: 'The ID of the S3 bucket to deploy the docs to',
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
                deploy(
                  join(flags.repos_path, repo.name, docPathInRepo),
                  basename(repo.local_path), // WARNING UGLI ACK
                  repo.base_url,
                  flags.s3_bucket
                )
            }))
          )
      }
    ])

    await tasks.run()
  }
}
