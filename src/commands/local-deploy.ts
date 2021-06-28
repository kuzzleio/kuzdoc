import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import path from 'path'
import { buildFramework, buildRepo, deployFrameworkLocally, deployRepoLocally } from '../lib/build'
import { assertIsFrameworkRoot } from '../lib/assertions'
import { listInstalledRepos } from '../lib/repo'

export default class LocalDeploy extends Command {
  static description = `Creates a local deploy of the docs containing the currently installed repos
  NOTE: This command must be executed from the root of the framework meta-repo.

The repositories must be previously installed in the framework via the "install" command.
All the currently installed repositories will be built and deployed to the destination path.`

  static flags = {
    help: flags.help({ char: 'h' }),
    destination: flags.string({
      description: 'The path to the locally deployed docs',
      default: path.join('/', 'tmp', 'kuzzle-docs')
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
    const { flags } = this.parse(LocalDeploy)

    const installedRepos = listInstalledRepos()

    this.log(`\n  👉 Deploying framework with repos ${installedRepos.map(r => r.name).join(', ')}\n`)

    const tasks = new Listr([
      {
        title: 'Process Framework',
        task: () => new Listr([{
          title: 'Build',
          task: () => buildFramework()
        }, {
          title: `Deploy to ${flags.destination}`,
          task: () => deployFrameworkLocally(flags.destination)
        }])
      },
      ...installedRepos.map(repo => ({
        title: `Process ${repo.name}`,
        task: () => new Listr([{
          title: 'Build',
          task: () => buildRepo(repo)
        }, {
          title: `Deploy to ${path.join(flags.destination, repo.deployPath)}`,
          task: () => deployRepoLocally(repo, flags.destination)
        }])
      }))
    ])
    await tasks.run()

    this.log('\n  ✅ All done!')
    this.log('  You can now browse the locally deployed docs by launching the following command:\n')
    this.log(`   http-server ${flags.destination}\n`)
  }
}
