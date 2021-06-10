import { flags } from '@oclif/command'
import { BaseCommand } from '../../common'
import execa from 'execa'
import Listr from 'listr'
import path from 'path'

import { getRepositories, Repo, resolveRepoBranch } from '../../common'
import { fwDirName, docPathInRepo } from '../../constants'

import { installRepos } from '../iterate-repos/install'
import { buildRepos } from '../iterate-repos/build'

async function copyFrameworkToRepo(
  repo: Repo,
  destination: string,
  frameworkPath: string
) {
  // Create $TARGET/framework
  await execa('mkdir', [path.join(
    destination,
    repo.name,
    repo.docRoot || docPathInRepo,
    fwDirName
  )])
  // Copy package.json in $TARGET/framework
  await execa('cp', [
    '-r',
    path.join('package.json'),
    path.join(
      destination,
      repo.name,
      repo.docRoot || docPathInRepo,
      fwDirName
    )
  ])
  // Create $TARGET/framework/src
  await execa('mkdir', [path.join(
    destination,
    repo.name,
    repo.docRoot || docPathInRepo,
    fwDirName,
    'src'
  )])
  // Copy the .vuepress dir in $TARGET/framework/src
  await execa('cp', [
    '-r',
    path.join(frameworkPath, 'src', '.vuepress'),
    path.join(
      destination,
      repo.name,
      repo.docRoot || docPathInRepo,
      fwDirName,
      'src'
    )
  ])
  // DISCLAIMER - this is a dirty hack.
  // I've put 'inside' at the end to have the right computation
  // of the relative path.
  const repoDocPath = path.join(destination, repo.name, repo.docRoot || docPathInRepo, fwDirName, 'inside')
  const fwNodeModPath = path.join(frameworkPath, 'node_modules', '.')
  const relPath = path.relative(
    repoDocPath,
    fwNodeModPath
  )
  // Symlink framework/node_modules to $TARGET/framework
  // (to avoid copying it too many times)
  await execa('ln', [
    '-s',
    relPath,
    '.'
  ], {
    cwd: path.join(destination, repo.name, repo.docRoot || docPathInRepo, fwDirName)
  })
}

export default class FrameworkLocalDeploy extends BaseCommand {
  static description = 'Creates a local deployment of the docs'

  static flags = {
    help: flags.help({ char: 'h' }),
    repositories: flags.string({
      char: 'r',
      description: 'The list of repositories to deploy - env: $REPOSITORIES',
      default: process.env.REPOSITORIES
    }),
    destination: flags.string({
      char: 'd',
      description:
        'The destination path to deploy to - env: $DESTINATION',
      default: process.env.DESTINATION || '/tmp'
    }),
    branch: flags.string({
      char: 'b',
      description: 'The branch type to checkout - env: $BRANCH',
      options: ['stable', 'dev'],
      default: process.env.BRANCH
    }),
    frameworkPath: flags.string({
      char: 'f',
      description:
        'The path to the framework',
      default: process.env.DESTINATION || '.'
    }),
  }

  async run() {
    this.printVersion()
    const { flags } = this.parse(FrameworkLocalDeploy)
    const reposPath = path.join(flags.destination, 'kuzzle-repos')
    const deployDir = path.join(flags.destination, 'kuzzle-documentation')
    const fwPackageJsonPath = path.isAbsolute(flags.frameworkPath) ? path.join(flags.frameworkPath, 'package.json') :
      path.join(process.cwd(), flags.frameworkPath, 'package.json')
    try {
      const fwPackageJson = require(fwPackageJsonPath)
      if (fwPackageJson.name !== 'kuzzleio-documentation') {
        return this.log(`It seems the path for the framework (${fwPackageJsonPath}) is wrong (the name of the repo is ${fwPackageJson.name})`)
      }
    } catch (error) {
      return this.log(`It seems the path for the framework (${fwPackageJsonPath}) is wrong (no package.json found)`)
    }

    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    const resolvedBranch = flags.branch || (await resolveRepoBranch(flags.frameworkPath))

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr([{
      title: 'Cleaning-up temporary files',
      task: async () => {
        await execa('rm', ['-rf', reposPath])
        await execa('rm', ['-rf', deployDir])
      }
    }])

    tasks.add(installRepos(selectedRepos, resolvedBranch, reposPath))

    tasks.add({
      title: 'Copying framework into repositories',
      task: () =>
        new Listr(
          selectedRepos.map(repo => ({
            title: repo.name,
            task: () =>
              copyFrameworkToRepo(
                repo,
                reposPath,
                flags.frameworkPath
              )
          }))
        )
    })

    tasks.add(buildRepos(selectedRepos, reposPath))

    tasks.add({
      title: 'Building framework',
      task: () => execa('npm', ['run', 'build'], {
        cwd: flags.frameworkPath
      })
    })

    tasks.add({
      title: `Creating directory for deployment on ${deployDir}`,
      task: () => execa('mkdir', [`${deployDir}`]),
    })

    tasks.add({
      title: `Copying framework build into ${deployDir}`,
      task: () => execa('cp', [
        '-r',
        path.join(flags.frameworkPath, 'src', '.vuepress', 'dist', '*'),
        deployDir
      ], {
        shell: true
      })
    })

    tasks.add({
      title: `Copying repos build build into ${deployDir}`,
      task: () => new Listr(
        selectedRepos.map(repo => ({
          title: repo.name,
          task: async () => {
            await execa('mkdir', ['-p', path.join(deployDir, repo.deployPath)])
            await execa('cp', [
              '-r',
              path.join(reposPath, repo.name, repo.docRoot || docPathInRepo,
                fwDirName, 'src', '.vuepress', 'dist', '*'),
              path.join(deployDir, repo.deployPath)
            ], {
              shell: true
            })
          }
        })))
    })

    await tasks.run()

    this.log('\n* Documentation successfully deployed!\n')
    this.log('  You can view it by running the following command')
    this.log(`  http-server ${deployDir}`)
  }
}
