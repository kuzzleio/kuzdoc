import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import execa = require('execa')

export default class RepoDeploy extends Command {
  static description = 'Deploy the docs to the AWS S3 bucket'

  static flags = {
    help: flags.help({ char: 'h' }),
    doc_version: flags.string({
      char: 'v',
      description:
        'The local version of the docs to be linked, relative to the base doc root (e.g. 6/) - env: $DOC_VERSION',
      default: process.env.DOC_VERSION,
      required: true
    }),
    deploy_path: flags.string({
      char: 'd',
      description:
        'The path where the local version of the docs will be deployed (e.g. /sdk/js/6/) - env: $DEPLOY_PATH',
      default: process.env.DEPLOY_PATH,
      required: true
    }),
    s3_bucket: flags.string({
      description: 'The ID of the S3 bucket to deploy the docs to',
      required: true
    }),
    base_root: flags.string({
      char: 'b',
      description: 'The local root of the docs',
      default: 'doc/'
    })
  }

  async run() {
    const { flags } = this.parse(RepoDeploy)

    cli.action.start(`Deploying version ${flags.doc_version}`)

    const vuepress = execa(
      'aws',
      [
        's3',
        'sync',
        `${flags.doc_version}/.vuepress/dist`,
        `s3://${flags.s3_bucket}${flags.deploy_path}`,
        '--delete'
      ],
      {
        shell: true,
        cwd: flags.base_root
      }
    )
    vuepress.stderr.pipe(process.stderr)
    vuepress.stdout.pipe(process.stdout)
    await vuepress

    cli.action.stop()
  }
}
