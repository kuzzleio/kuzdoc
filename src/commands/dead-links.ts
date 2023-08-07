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
import execa from 'execa'

function stripLastSlash(p: string): string {
  if (p.endsWith('/')) {
    return p.slice(0, -1)
  }
  return p
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
    const { flags: _flags } = this.parse(DeadLinks)
    const stage: Stage = await resolveStage(process.cwd())
    const repoList = await resolveRepoList(_flags.repo, true, false)
    if (repoList.length === 0) {
      this.log(`\n  🤷‍♂️ No repo resolved from ${_flags.repo}.\n`)
      return
    }
    const repo = repoList[0]
    if (_flags.repo) {
      this.log(`\n  👉 Resolved repo ${repo.name}\n`)
    }

    let mainExitCode = 0
    const allRepos = fetchRepoList()
    const symlinks: string[] = []

    const tasks = new Listr([{
      title: 'Install missing repositories',
      task: () => cloneAndLinkRepos(allRepos, stage)
    }, {
      title: 'Create symlinks in framework',
      task: () => new Listr(allRepos.map(repository => {
        const repoDeployPath = path.join(process.cwd(), 'src', stripLastSlash(repository.deployPath))
        symlinks.push(repoDeployPath)
        return {
          title: `Creating symlink for ${repository.name}`,
          skip: () => existsSync(repoDeployPath),
          task: async () => {
            await ensureDir(path.resolve(repoDeployPath, '..'))
            symlinkSync(
              repository.resolveDocPath(path.join(process.cwd(), reposPathInFw, repo.name)),
              repoDeployPath,
              'dir'
            )
          }
        }
      }))
    }])

    await tasks.run()

    this.log(`\n  💀 Run dead-links check on ${repo.name} - ${repo.deployPath}\n`)

    try {
      await execa(
        'ruby',
        [path.join('.ci', 'dead-links.rb'), '-p', path.join('src', repo.deployPath)],
        {
          shell: true,
          stdout: 'inherit',
          env: {
            HYDRA_MAX_CONCURRENCY: '20'
          },

        }
      )
    } catch (error) {
      this.log(error.message)
      mainExitCode = 1
    }

    this.log('') // Leave a pretty newline before the next listr
    const moarTasks = new Listr([{
      title: 'Clean symlinks from framework',
      skip: () => false,
      task: () => new Listr(symlinks.map(l => ({
        title: `Deleting ${l}`,
        skip: () => !existsSync(l),
        task: () => unlinkSync(l)
      })))
    }])
    await moarTasks.run()
    process.exit(mainExitCode)
  }
}
