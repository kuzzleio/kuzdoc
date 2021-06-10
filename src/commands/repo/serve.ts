import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import express from 'express'
import path from 'path'

export default class RepoServe extends BaseCommand {
  static description =
    'Serve the docs build of the current repository via a local static http server'

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
      parse: input => (input.endsWith('/') ? input : `${input}/`),
      required: true
    }),
    base_root: flags.string({
      char: 'b',
      description: 'The local root of the docs',
      default: 'doc/'
    }),
    port: flags.integer({
      char: 'p',
      description: 'The port to open to the static file server',
      default: 3000
    })
  }

  async run() {
    this.printVersion()
    const { flags } = this.parse(RepoServe)
    const app = express()
    const files = path.resolve(
      flags.base_root,
      flags.doc_version,
      '.vuepress',
      'dist'
    )
    app.use(flags.deploy_path, express.static(files))

    this.log(
      `Serving files in ${files} on http://localhost:${flags.port}${flags.deploy_path}`
    )
    app.listen(flags.port)
  }
}
