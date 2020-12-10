import { Command, flags } from '@oclif/command'
import { getRepositories, Repo } from '../../common'
import Listr from 'listr'
import execa = require('execa')
import path from 'path'

export const execCommandInRepo = (repos: Repo[], command: string, reposPath = './repos') => {
  return [{
    title: `Executing command in repositories into ${reposPath}`,
    task: () => new Listr(
      repos.map(repo => ({
        title: repo.name,
        task: () => execa(command, {
          shell: true,
          cwd: path.join(reposPath, repo.name),
          env: {
            REPO_NAME: repo.name,
            DEPLOY_PATH: repo.deploy_path,
            REPO_DOC_ROOT: repo.doc_root,
            REPO_DOC_VERSION: repo.doc_version,
            REPO_BRANCH_TYPE: repo.dev ? 'dev' : 'stable'
          }
        })
      }))
    )
  }]
}

export default class IterateRepoExecute extends Command {
  static description = `execute a command or shell script upon a set of repos (missing repos will not be installed)

EXAMPLES

$ kuzdoc iterate-repos:execute "echo I haz never been here > iwazhere"

Executes two inline commands upon the list of repos.

$ kuzdoc iterate-repos:execute /tmp/my-test-script

Executes a shell script upon the list of repos`

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to build - env: $REPOSITORIES',
      default: process.env.REPOSITORIES
    }),
    repos_path: flags.string({
      char: 'd',
      description:
        'The path where the repositories are installed - env: $REPOS_PATH',
      default: process.env.REPOS_PATH || '.repos'
    })
  }

  static args = [{
    name: 'command',
    required: true,
    description: 'the command or script to execute'
  }]

  async run() {
    const { args, flags } = this.parse(IterateRepoExecute)

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr(execCommandInRepo(selectedRepos, args.command, flags.repos_path))
    return tasks.run()
  }
}
