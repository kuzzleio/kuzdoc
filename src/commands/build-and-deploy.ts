import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { buildRepo, deployRepo, invalidateCloudfront } from '../lib/build'
import { ENV_CLOUDFRONT_ID, ENV_REPO, ENV_S3_BUCKET, VALUE_ALL_REPOS } from '../lib/constants'
import { assertIsFrameworkRoot } from '../lib/assertions'
import { resolveRepoList } from '../lib/repo'

export default class BuildAndDeploy extends Command {
  static description = `Builds and deploys one or more repositories.
  NOTE: This command must be executed from the root of the framework meta-repo.

The repositories must be previously installed in the framework via the "install" command.
The repositories to be built can be specified via the --repo flag, the KUZDOC_REPO environment
variable, or via the interactive prompt (only the installed repositories are listed).
The built repositories are deployed to the S3 bucket specified via the --s3Bucket flag,
then the Cloudfront cache (specified via --cloufrtontId) is invalidated.
This command needs the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables to
be properly set.
`

  static flags = {
    help: flags.help({ char: 'h' }),
    repo: flags.string({
      description: `The list of repositories to build, or the value ${VALUE_ALL_REPOS} to build all repos.
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
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${(error as Error).message}`)
      return
    }
    const { flags } = this.parse(BuildAndDeploy)
    if (!flags.dryRun && !process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID environment variable not found.')
    }
    if (!flags.dryRun && !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY environment variable not found.')
    }
    const repoList = await resolveRepoList(flags.repo, true)

    if (repoList.length === 0) {
      if (flags.repo) {
        this.log(`\n  🤷‍♂️ No repo resolved from list ${flags.repo}.\n`)
      } else {
        this.log('\n  🤷‍♂️ No repo selected.\n')
      }
      return
    }

    if (flags.repo) {
      this.log(`\n  👉 Resolved repos ${repoList.map(r => r.name).join(', ')}\n`)
    }

    const tasks = new Listr(repoList.map(repo => ({
      title: `Build & deploy ${repo.name}`,
      task: () => new Listr([{
        title: 'Build repo',
        task: () => buildRepo(repo)
      }, {
        title: 'Deploy repo',
        task: () => deployRepo(repo, flags.s3Bucket, flags.dryRun)
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
