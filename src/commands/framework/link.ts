import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import execa from 'execa'
import fs from 'fs'
import path from 'path'

import { fwDirName, docPathInRepo } from '../../constants'

export default class FrameworkLink extends Command {
  static description =
    'Links a local version of the docs to the installed framework'

  static flags = {
    help: flags.help({ char: 'h' }),
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
      default: docPathInRepo
    })
  }

  async run() {
    const { flags } = this.parse(FrameworkLink)

    if (
      !fs.existsSync(path.resolve(path.join(flags.base_root, fwDirName, 'src')))
    ) {
      throw new Error(`Framework not found in ${fwDirName}/src`)
    }

    cli.action.start('Linking local docs into framework')
    await execa('rm', ['-rf', `${fwDirName}/src${flags.deploy_path}`], {
      cwd: flags.base_root
    })
    await execa(
      'ln',
      [
        '-s',
        path.relative(
          path.join(flags.base_root, fwDirName, 'src', flags.deploy_path, '..'),
          path.join(flags.base_root, flags.doc_version)
        ),
        `${fwDirName}/src${flags.deploy_path}`
      ],
      {
        cwd: flags.base_root
      }
    )
    cli.action.stop('Done!')
  }
}
