import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { buildRepo, deployRepo, invalidateCloudfront } from '../lib/build'
import { ENV_CLOUDFRONT_ID, ENV_REPO, ENV_S3_BUCKET, VALUE_ALL_REPOS } from '../lib/constants'
import { assertIsFrameworkRoot } from '../lib/framework'
import { resolveRepoList } from '../lib/repo'

export default class BuildAndDeploy extends Command {
  static description = 'Builds and deploys one or more repositories.'

  static flags = {
    help: flags.help({ char: 'h' }),
    repo: flags.string({
      description: `The list of repositories to install, or the value ${VALUE_ALL_REPOS} to install all repos.
If not specified, kuzdoc will ask a prompt.

Environment variable: $${ENV_REPO}`,
      default: process.env[ENV_REPO]
    }),
    s3Bucket: flags.string({
      description: `The name of the S3 bucket to upload the repos to.

Environment variable: $${ENV_S3_BUCKET}`,
      default: process.env[ENV_S3_BUCKET],
      required: true
    }),
    cloudfrontId: flags.string({
      description: `The name of the Cloudfront distribution to invalidate after deploying each repo.

Environment variable: $${ENV_CLOUDFRONT_ID}`,
      default: process.env[ENV_CLOUDFRONT_ID],
      required: true
    }),
    dryRun: flags.boolean({
      description: 'Only builds the repo without deploying it',
      default: false
    })
  }

  async run() {
    try {
      assertIsFrameworkRoot(process.cwd())
    } catch (error) {
      this.log('⛔️ Aborting.')
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${error.message}`)
      return
    }
    const { flags } = this.parse(BuildAndDeploy)
    if (!flags.dryRun && !process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID environment variable not found.')
    }
    if (!flags.dryRun && !process.env.AWS_ACCESS_KEY) {
      throw new Error('AWS_ACCESS_KEY environment variable not found.')
    }
    const repoList = await resolveRepoList(flags.repo)

    const tasks = new Listr(repoList.map(repo => ({
      title: `Processing ${repo.name}`,
      task: () => new Listr([{
        title: 'Build repo',
        task: () => buildRepo(repo.name, repo.docRoot, repo.version, repo.deployPath)
      }, {
        title: 'Deploy repo',
        task: () => deployRepo(repo.name, repo.docRoot, `${repo.version}`, repo.deployPath, flags.s3Bucket, flags.dryRun)
      }, {
        title: 'Invalidate Cloudfront distribution',
        skip: () => {
          if (flags.dryRun) {
            return 'Not invalidating in dry-run'
          }
        },
        task: () => invalidateCloudfront(repo.deployPath, flags.cloudfrontId)
      }])
    })))

    await tasks.run()
  }
}
