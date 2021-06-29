/* eslint-disable no-process-exit */
/* eslint-disable unicorn/no-process-exit */
import { Command, flags } from '@oclif/command'
import { ENV_REPO, reposPathInFw } from '../lib/constants'
import { assertIsFrameworkRoot, Stage } from '../lib/assertions'
import { fetchRepoList, resolveRepoList, resolveStage } from '../lib/repo'
import { cloneAndLinkRepos } from '../lib/install'
import Listr from 'listr'
import { symlinkSync, unlinkSync, existsSync } from 'fs'
import { ensureDir } from 'fs-extra'
import path from 'path'

function stripLastSlash(path: string): string {
  if (path.endsWith('/')) {
    return path.slice(0, -1)
  }
  return path
}

export default class DeadLinks extends Command {
  static description = `Scans a given repo for dead-links and reports them.
  NOTE: This command must be executed from the root of the framework meta-repo.

The repository must be previously installed in the framework via the "install" command.`

  static flags = {
    help: flags.help({ char: 'h' }),
    repo: flags.string({
      description: `The name of repository to scan. If not specified, kuzdoc will ask a prompt.

Environment variable: $${ENV_REPO}`,
      default: process.env[ENV_REPO]
    }),
    dumpReport: flags.string({
      description: `The name of the JSON file to write the report to.
      If not set, report will be only written to stdout.`
    }),
    linkType: flags.string({
      description: `The link type to check.
      If empty, both external and internal links are checked.`,
      options: ['external', 'internal']
    })
  }

  async run() {
    try {
      assertIsFrameworkRoot(process.cwd())
    } catch (error) {
      this.log('⛔️ Aborting.')
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${error.message}`)
      return
    }
    const { flags } = this.parse(DeadLinks)
    const stage: Stage = await resolveStage(process.cwd())
    const repoList = await resolveRepoList(flags.repo, true, false)
    if (repoList.length === 0) {
      this.log(`\n  🤷‍♂️ No repo resolved from ${flags.repo}.\n`)
      return
    }
    const repo = repoList[0]
    if (flags.repo) {
      this.log(`\n  👉 Resolved repo ${repo.name}\n`)
    }

    let exitCode = 0
    const allRepos = fetchRepoList()
    const symlinks: string[] = []

    const tasks = new Listr([{
      title: 'Install missing repositories',
      task: () => cloneAndLinkRepos(allRepos, stage)
    }, {
      title: 'Create symlinks in framework',
      task: () => new Listr(allRepos.map(repo => {
        const repoDeployPath = path.join(process.cwd(), 'src', stripLastSlash(repo.deployPath))
        symlinks.push(repoDeployPath)
        return {
          title: `Creating symlink for ${repo.name}`,
          skip: () => existsSync(repoDeployPath),
          task: async () => {
            await ensureDir(path.resolve(repoDeployPath, '..'))
            symlinkSync(
              repo.resolveDocPath(path.join(process.cwd(), reposPathInFw)),
              repoDeployPath,
              'dir'
            )
          }
        }
      }))
    }, {
      title: `Run dead-link check on ${repo.name}`,
      task: () => {
        // TODO
        exitCode = 0
      }
    }, {
      title: 'Clean symlinks from framework',
      task: () => new Listr(symlinks.map(l => ({
        title: `Deleting ${l}`,
        skip: () => !existsSync(l),
        task: () => unlinkSync(l)
      })))
    }])

    await tasks.run()
    process.exit(exitCode)
  }
}
