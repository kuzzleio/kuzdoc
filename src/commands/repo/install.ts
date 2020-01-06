import { Command, flags } from '@oclif/command'
import axios from 'axios'
import cli from 'cli-ux'
import execa from 'execa'
import YAML from 'yaml'
import Listr from 'listr'
import path from 'path'

interface Repo {
  name: string
  url: string
  stable: string
  dev: string
  destination: string
  base_url: string
}

export default class RepoInstall extends Command {
  static description = 'Installs a sub-repo to a given destination'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to install'
    }),
    destination: flags.string({
      char: 'd',
      description: 'The path where the repositories will be installed',
      default: '.repos'
    }),
    branch: flags.string({
      char: 'b',
      description: 'The branch type to checkout',
      options: ['stable', 'dev'],
      default: 'stable'
    })
  }

  async run() {
    const { flags } = this.parse(RepoInstall)

    cli.action.start('Fetching repository list')

    const selectedRepos = await this.getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )
    cli.action.stop(`Found ${selectedRepos.length} repos`)

    const tasks = new Listr([
      {
        title: `Cloning repositories into ${flags.destination}`,
        task: () =>
          new Listr(
            selectedRepos.map(repo => ({
              title: repo.name,
              task: () =>
                this.cloneRepository(repo, flags.branch, flags.destination)
            }))
          )
      }
    ])
    await tasks.run()
  }

  async getRepositories(
    repositoryNames: Array<string> = []
  ): Promise<Array<Repo>> {
    const reposResponse = await axios.get(
      'https://raw.githubusercontent.com/kuzzleio/documentation/master/.repos/repositories.yml'
    )
    this.debug(repositoryNames)
    this.debug(reposResponse.data)

    const YMLRepos: Array<Repo> = YAML.parse(reposResponse.data)
    const selectedRepos = YMLRepos.filter(
      repo =>
        repositoryNames.length === 0 || repositoryNames.includes(repo.name)
    )

    return selectedRepos
  }

  async cloneRepository(repo: Repo, branch: string, destination: string) {
    this.debug(`${repo.url}#${branch === 'dev' ? repo.dev : repo.stable}`)

    return execa('git', [
      'clone',
      '--branch',
      branch === 'dev' ? repo.dev : repo.stable,
      '--depth',
      '10',
      '--single-branch',
      repo.url,
      path.join(destination, repo.name)
    ])
  }
}
