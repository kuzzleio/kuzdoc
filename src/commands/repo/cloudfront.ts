import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import execa = require('execa')

export const invalidateCloudfront = (
  deployPath: string,
  cloudfrontDistributionId: string
) =>
  execa(
    'aws',
    [
      'cloudfront',
      'create-invalidation',
      '--distribution-id',
      cloudfrontDistributionId,
      '--paths',
      deployPath
    ],
    {
      shell: true
    }
  )

export default class RepoCloudfront extends Command {
  static description =
    'Invalidate the Cloudfront docs cache for the current repository'

  static flags = {
    help: flags.help({ char: 'h' }),
    deploy_path: flags.string({
      char: 'd',
      description:
        'The path where the local version of the docs will be deployed (e.g. /sdk/js/6/) - env: $DEPLOY_PATH',
      default: process.env.DEPLOY_PATH,
      required: true
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
    const { flags } = this.parse(RepoCloudfront)

    cli.action.start(
      `Invalidating Cloudfront cache for path ${flags.deploy_path}`
    )

    const cloudfrontTask = invalidateCloudfront(
      flags.deploy_path,
      flags.cloudfront_distribution_id
    )

    cloudfrontTask.stderr?.pipe(process.stderr)
    cloudfrontTask.stdout?.pipe(process.stdout)
    await cloudfrontTask

    cli.action.stop()
  }
}
