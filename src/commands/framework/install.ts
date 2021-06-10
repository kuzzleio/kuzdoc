import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import execa from 'execa'
import fs from 'fs'
import path from 'path'
import Listr from 'listr'

import { fwDirName, docPathInRepo, fwRepo } from '../../constants'

export default class FrameworkInstall extends BaseCommand {
  static description = 'Install the documentation framework inside a repo'

  static flags = {
    help: flags.help({ char: 'h' }),
    branch: flags.string({
      char: 'b',
      description: 'The framework branch that should be checked out',
      default: process.env.FRAMEWORK_BRANCH
    }),
    destination: flags.string({
      char: 'd',
      description: 'The path where the framework should be installed',
      default: docPathInRepo
    })
  }

  async run() {
    this.printVersion()
    const { flags } = this.parse(FrameworkInstall)
    const branch = flags.branch || (await this.resolveFrameworkBranch())

    if (!fs.existsSync(path.resolve(flags.destination))) {
      throw new Error(`Destination path ${flags.destination} does not exist`)
    }

    const tasks = new Listr([
      {
        title: 'Install doc framework',
        task: () => {
          return new Listr([
            {
              title: `Cloning framework branch ${branch} in ${flags.destination}`,
              task: () =>
                execa.command(
                  `git clone --branch ${branch} --depth 10 --single-branch ${fwRepo} ${fwDirName}`,
                  {
                    cwd: flags.destination,
                    env: {
                      PATH: process.env.PATH
                    }
                  }
                )
            },
            {
              title: 'Installing framework dependencies',
              task: () =>
                execa('npm', ['ci'], {
                  cwd: path.join(flags.destination, fwDirName)
                })
            }
          ])
        }
      }
    ])
    tasks.run()
  }

  async resolveFrameworkBranch() {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
      if (stdout.match(/^\d+-dev$/)) {
        return 'develop'
      }
      return 'master'
    } catch (error) {
      return 'master'
    }
  }
}
