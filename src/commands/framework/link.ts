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
    const fwPath = path
      .join(flags.base_root, fwDirName, 'src')
      .replace(/\/$/, '')
    const deployPath = path.join(fwPath, flags.deploy_path).replace(/\/$/, '')
    const docPathRelativeToFw = path
      .relative(
        path.join(deployPath, '..'),
        path.join(flags.base_root, flags.doc_version)
      )
      .replace(/\/$/, '')

    this.debug(`fwPath=${fwPath}`)
    this.debug(`deployPath=${deployPath}`)
    this.debug(`docPathRelativeToFw=${docPathRelativeToFw}`)

    if (!fs.existsSync(fwPath)) {
      throw new Error(`Framework not found in ${fwPath}`)
    }

    cli.action.start('Linking local docs into framework')
    await execa('rm', ['-rf', `${deployPath}`], {})
    await execa('ln', ['-s', docPathRelativeToFw, deployPath], {})
    cli.action.stop('Done!')
  }
}
