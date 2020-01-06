import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import execa = require('execa')

export default class RepoCloudfront extends Command {
  static description = 'Invalidate the Cloudfront cache for the current docs'

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
        'The Cloudfront distribution ID where the invalidation will be created',
      required: true
    })
  }

  async run() {
    const { flags } = this.parse(RepoCloudfront)

    cli.action.start(
      `Invalidating Cloudfront cache for path ${flags.deploy_path}`
    )

    const vuepress = execa(
      'aws',
      [
        'cloudfront',
        'create-invalidation',
        '--distribution-id',
        flags.cloudfront_distribution_id,
        '--paths',
        flags.deploy_path
      ],
      {
        shell: true
      }
    )
    vuepress.stderr.pipe(process.stderr)
    vuepress.stdout.pipe(process.stdout)
    await vuepress

    cli.action.stop()
  }
}
