import { Command, flags } from '@oclif/command'
import { assertIsFrameworkRoot } from '../lib/assertions'
import { addNewRepo } from '../lib/repo'

export default class AddRepo extends Command {
  static description = `Wizard to add a new repo to repositories.yml.
  NOTE: This command must be executed from the root of the framework meta-repo.`

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    this.log('\n  📦 Add new repo to repositories.yml\n')

    try {
      assertIsFrameworkRoot(process.cwd())
    } catch (error) {
      this.log('⛔️ Aborting.')
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${(error as Error).message}`)
      return
    }

    await addNewRepo(process.cwd())

    this.log('\n  ✅ All done!')
    this.log('  The new repo item has been added to the list in repositories.yml\n')
  }
}
