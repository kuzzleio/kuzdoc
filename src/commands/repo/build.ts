import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { fwDirName, docPathInRepo } from '../../constants'
import execa = require('execa')

export const buildRepo = (
  baseRoot: string,
  docVersion: string,
  deployPath: string,
  repoName?: string
) => {
  return execa(
    `$(npm --prefix ${fwDirName} bin)/vuepress`,
    ['build', '--no-cache', docVersion],
    {
      shell: true,
      cwd: baseRoot,
      env: {
        REPO_NAME: repoName,
        SITE_BASE: deployPath.endsWith('/') ? deployPath : `${deployPath}/`, // TODO rename to DEPLOY_PATH
        DOC_DIR: docVersion // TODO rename to LOCAL_PATH
      }
    }
  )
}

export default class RepoBuild extends Command {
  static description = 'Build the documentation for the current repository'

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
    doc_root: flags.string({
      char: 'b',
      description: 'The local root of the docs',
      default: docPathInRepo
    })
  }

  async run() {
    const { flags } = this.parse(RepoBuild)

    cli.action.start(`Building version ${flags.doc_version}`)

    const buildTask = buildRepo(
      flags.doc_root,
      flags.doc_version,
      flags.deploy_path,
      flags.repo_name
    )

    buildTask.stderr.pipe(process.stderr)
    buildTask.stdout.pipe(process.stdout)
    await buildTask
    cli.action.stop()
  }
}
