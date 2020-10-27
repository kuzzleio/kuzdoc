import { Command, flags } from '@oclif/command'
import execa from 'execa'
import Listr from 'listr'
import path from 'path'

import { getRepositories, Repo, resolveBranch } from '../../common'
import { fwDirName, docPathInRepo } from '../../constants'

import { installRepos } from '../iterate-repos/install'
import { buildRepos } from '../iterate-repos/build'

async function copyFrameworkToRepo(
  repo: Repo,
  destination: string,
  frameworkPath: string
) {
  await execa('mkdir', [path.join(
    destination,
    repo.name,
    repo.doc_root || docPathInRepo,
    fwDirName
  )])
  await execa('cp', [
    '-r',
    path.join('package.json'),
    path.join(
      destination,
      repo.name,
      repo.doc_root || docPathInRepo,
      fwDirName
    )
  ])
  await execa('mkdir', [path.join(
    destination,
    repo.name,
    repo.doc_root || docPathInRepo,
    fwDirName,
    'src'
  )])
  await execa('cp', [
    '-r',
    path.join('src', '.vuepress'),
    path.join(
      destination,
      repo.name,
      repo.doc_root || docPathInRepo,
      fwDirName,
      'src'
    )
  ])
  // DISCLAIMER - this is a dirty hack.
  // I've put 'inside' at the end to have the right computation
  // of the relative path.
  const repoDocPath = path.join(destination, repo.name, repo.doc_root || docPathInRepo, fwDirName, 'inside')
  const fwNodeModPath = path.join(frameworkPath, 'node_modules', '.')
  const relPath = path.relative(
    repoDocPath,
    fwNodeModPath
  )
  await execa('ln', [
    '-s',
    relPath,
    '.'
  ], {
    cwd: path.join(destination, repo.name, repo.doc_root || docPathInRepo, fwDirName)
  })
}

export default class FrameworkLocalDeploy extends Command {
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
    const { flags } = this.parse(FrameworkLocalDeploy)
    const reposPath = path.join(flags.destination, 'kuzzle-repos')
    const deployDir = path.join(flags.destination, 'kuzzle-documentation')
    const resolvedBranch = flags.branch || (await resolveBranch())
    const selectedRepos = await getRepositories(
      flags.repositories ? flags.repositories.split(',') : []
    )

    if (selectedRepos.length === 0) {
      return this.log('No repository selected.')
    }

    const tasks = new Listr([{
      title: 'Installing framework dependencies',
      task: () => execa('npm', ['ci']),
      skip: () => true
    }])

    tasks.add({
      title: 'Cleaning-up temporary files',
      task: async () => {
        await execa('rm', ['-rf', reposPath])
        await execa('rm', ['-rf', deployDir])
      }
    })

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
      task: () => execa('npm', ['run', 'build'])
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
            await execa('mkdir', ['-p', path.join(deployDir, repo.deploy_path)])
            await execa('cp', [
              '-r',
              path.join(reposPath, repo.name, repo.doc_root || docPathInRepo,
                fwDirName, 'src', '.vuepress', 'dist', '*'),
              path.join(deployDir, repo.deploy_path)
            ], {
              shell: true
            })
          }
        })))
    })

    return tasks.run()
  }
}
