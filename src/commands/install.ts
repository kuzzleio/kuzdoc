import { flags } from '@oclif/command'
import { BaseCommand } from '../lib/base-command'
import { fetchRepoList, promptRepo, filterRepoList, resolveRepoBranch } from '../lib/repo'
import { assertIsFrameworkRoot, Stage } from '../lib/framework'
import { cloneAndLinkRepos } from '../lib/install'

const ENV_REPO = 'KUZDOC_REPO'
const ENV_REPO_BRANCH = 'KUZDOC_REPO_BRANCH'
const ENV_STAGE = 'KUZDOC_STAGE'
const ENV_LOCAL_PATH = 'KUZDOC_LOCAL_PATH'
const VALUE_ALL_REPOS = '__ALL__'

export default class Install extends BaseCommand {
  static description = `Installs one or multiple repos in the framework meta-repo.
  NOTE: This command must be executed from the root of the framework meta-repo.

This command will install one or multiple repos, listed in the repositories.yml file, within the .repos directory of the documentation framework.
Repositories will be either cloned from Github or symlink-ed from the local filesystem (--local-path flag).
The repositories.yml file will be fetched from the local instance of the documentation framework.
Repositories are either specified via the --repo flag, or the ${ENV_REPO}: if no value is specified, kuzdoc will ask it via a prompt.
Kuzdoc will not overwrite existing repositories. If a folder with the same name of a selected repository is already present, the selected repository will be skipped and the folder will be left untouched.`

  static flags = {
    help: flags.help({ char: 'h' }),
    repo: flags.string({
      description: `The list of repositories to install, or the value ${VALUE_ALL_REPOS} to install all repos.
If not specified, kuzdoc will ask a prompt.

Environment variable: $${ENV_REPO}`,
      default: process.env[ENV_REPO]
    }),
    repoBranch: flags.string({
      description: `The branch to checkout from the repo to install.
This option is valid if only 1 repo is specified.

Environment variable: $${ENV_REPO_BRANCH}`,
      default: process.env[ENV_REPO_BRANCH]
    }),
    stage: flags.string({
      description: `The branch type to checkout.
If this option is not specified, kuzdoc will try to infer it based on the current branch of the framework meta-repo.

Environment variable: $${ENV_STAGE}`,
      options: ['stable', 'dev'],
      default: process.env[ENV_STAGE]
    }),
    localPath: flags.string({
      description: `Installs the repo from a local path instead of cloning it from Github. Handy for testing locally developed features.
This option is valid if only 1 repo is specified.

Environment variable: $${ENV_LOCAL_PATH}`,
      default: process.env[ENV_LOCAL_PATH]
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

    const { flags } = this.parse(Install)
    const stage: Stage = flags.stage as Stage || await resolveRepoBranch(process.cwd())
    const interactive = !flags.repo
    const repositoriesYML = fetchRepoList()
    let selectedRepo = []

    if (interactive) {
      selectedRepo = await promptRepo(repositoriesYML)
    } else {
      selectedRepo = flags.repo ? flags.repo.split(',') : []
    }

    const repoList = flags.repo === VALUE_ALL_REPOS ? repositoriesYML : filterRepoList(repositoriesYML, selectedRepo)

    if (repoList.length > 1) {
      if (flags.repoBranch) {
        throw new Error('ABORT: cannot use --repoBranch flag with multiple repos')
      }
      if (flags.localPath) {
        throw new Error('ABORT: cannot use --localPath flag with multiple repos')
      }
      // TODO install multiple repos
      // this.log(`Install multiple repos: ${repoList.join(', ')}`)
      await cloneAndLinkRepos(repoList, stage)
    } else {
      // TODO install single repo with flags
      this.log(`Install single repo: ${repoList}`)
    }
  }
}
