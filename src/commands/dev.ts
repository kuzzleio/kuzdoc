import { Command, flags } from '@oclif/command'
import { assertIsFrameworkRoot } from '../lib/assertions'
import { devRepo } from '../lib/build'
import { ENV_REPO } from '../lib/constants'
import { resolveRepoList } from '../lib/repo'

export default class Dev extends Command {
  static description = `Launches the dev server for the documentation of a repo.
  NOTE: This command must be executed from the root of the framework meta-repo.

The repository must be previously installed in the framework via the "install" command.
The repository to be built can be specified via the --repo flag, the KUZDOC_REPO environment
variable, or via the interactive prompt (only the installed repositories are listed).`

  static flags = {
    help: flags.help({ char: 'h' }),
    repo: flags.string({
      description: `The name of repository to scan. If not specified, kuzdoc will ask a prompt.

Environment variable: $${ENV_REPO}`,
      default: process.env[ENV_REPO]
    }),
  }

  async run() {
    try {
      assertIsFrameworkRoot(process.cwd())
    } catch (error) {
      this.log('⛔️ Aborting.')
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${error.message}`)
      return
    }
    const { flags } = this.parse(Dev)
    const repoList = await resolveRepoList(flags.repo, true, false)
    if (repoList.length === 0) {
      this.log(`\n  🤷‍♂️ No repo resolved from ${flags.repo}.\n`)
      return
    }
    const repo = repoList[0]
    if (flags.repo) {
      this.log(`\n  👉 Resolved repo ${repo.name}\n`)
    }

    await devRepo(repo)
  }
}
