import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { fwDirName } from '../../constants'
import execa = require('execa')

export default class RepoBuild extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    repo_name: flags.string({
      char: 'n',
      description: 'The name of the repo (used by Algolia)'
    }),
    deploy_path: flags.string({
      char: 'd',
      description:
        'The path where the local version of the docs will be deployed (e.g. /sdk/js/6/) - env: $DEPLOY_PATH',
      default: process.env.DEPLOY_PATH,
      required: true
    }),
    doc_version: flags.string({
      char: 'v',
      description:
        'The local version of the docs to be linked, relative to the base doc root (e.g. 6/) - env: $DOC_VERSION',
      default: process.env.DOC_VERSION,
      required: true
    }),
    base_root: flags.string({
      char: 'b',
      description: 'The local root of the docs',
      default: 'doc/'
    })
  }

  async run() {
    const { flags } = this.parse(RepoBuild)

    cli.action.start(`Building version ${flags.doc_version}`)

    const vuepress = execa(
      `$(npm --prefix ${fwDirName} bin)/vuepress`,
      ['build', '--no-cache', flags.doc_version],
      {
        shell: true,
        cwd: flags.base_root,
        env: {
          REPO_NAME: flags.repo_name,
          SITE_BASE: flags.deploy_path, // TODO rename to DEPLOY_PATH
          DOC_DIR: flags.doc_version // TODO rename to LOCAL_PATH
        }
      }
    )
    vuepress.stderr.pipe(process.stderr)
    vuepress.stdout.pipe(process.stdout)
    await vuepress
    cli.action.stop()
  }
}
