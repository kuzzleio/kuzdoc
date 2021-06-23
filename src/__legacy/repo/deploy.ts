import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import cli from 'cli-ux'
import execa = require('execa')

export const deploy = (
  baseRoot: string,
  docVersion: string,
  deployPath: string,
  s3BucketId: string
) =>
  execa(
    'aws',
    [
      's3',
      'sync',
      `${docVersion}/.vuepress/dist`,
      `s3://${s3BucketId}${deployPath}`,
      '--delete'
    ],
    {
      shell: true,
      cwd: baseRoot
    }
  )

export default class RepoDeploy extends BaseCommand {
  static description =
    'Deploy the docs of the current repository to the AWS S3 bucket'

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
      description:
        'The ID of the S3 bucket to deploy the docs to  - env: $S3_BUCKET',
      required: true,
      default: process.env.S3_BUCKET
    }),
    base_root: flags.string({
      char: 'b',
      description: 'The local root of the docs',
      default: 'doc/'
    })
  }

  async run() {
    this.printVersion()
    const { flags } = this.parse(RepoDeploy)

    cli.action.start(`Deploying version ${flags.doc_version}`)

    const deployTask = deploy(
      flags.base_root,
      flags.doc_version,
      flags.deploy_path,
      flags.s3_bucket
    )
    deployTask.stderr?.pipe(process.stderr)
    deployTask.stdout?.pipe(process.stdout)
    await deployTask

    cli.action.stop()
  }
}
