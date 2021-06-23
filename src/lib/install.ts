import path from 'path'
import { existsSync, symlinkSync, unlinkSync } from 'fs'
import cli from 'cli-ux'
import execa from 'execa'
import Listr from 'listr'
import { Repo } from './repo'
import { docPathInRepo, reposPathInFw } from '../constants'
import { Stage } from './framework'

export function repoExists(repoName: string, destination: string) {
  return existsSync(path.join(destination, repoName))
}

export function installLocalRepository(localRepoPath: string, repo: Repo, destination = '.repos', frameworkPath = process.cwd()) {
  cli.action.start(`Verifying repo ${repo.name} is not already installed...`)
  if (repoExists(repo.name, destination)) {
    cli.action.stop(`Repo ${repo.name} is already installed.`)
    return
  }
  cli.action.stop(`Repo ${repo.name} is not installed.`)

  cli.action.start(`Symlinking ${localRepoPath} in ${destination}...`)
  symlinkSync(destination, path.join(
    localRepoPath
  )
  )
  cli.action.stop('Done.')

  cli.action.start(`Symlinking framework in ${localRepoPath}...`)
  symlinkSync(
    path.join(
      frameworkPath,
      'src',
      '.vuepress'
    ),
    path.join(
      localRepoPath,
      repo.docRoot || docPathInRepo,
      `${repo.version}`,
      '.vuepress'
    )
  )
  cli.action.stop('Done.')
}

export async function cloneRepository(url: string, branch: string, destination: string) {
  // this.debug(`${repo.url}#${branch === 'dev' ? repo.dev : repo.stable}`)
  return execa('git', [
    'clone',
    '--branch',
    branch,
    '--depth',
    '10',
    '--single-branch',
    url,
    destination
  ])
}

export async function linkFrameworkToRepo(
  repo: Repo,
  localPath?: string,
  reposPath: string = reposPathInFw,
  frameworkPath: string = process.cwd()
) {
  const lnPath = localPath ? localPath : path.join(
    frameworkPath,
    reposPath,
    repo.name,
    repo.docRoot || docPathInRepo,
    `${repo.version}`,
    '.vuepress'
  )

  try {
    unlinkSync(path.join(lnPath))
  } catch (error) {
    console.log(error.message)
  }
  symlinkSync(
    path.join(frameworkPath, 'src', '.vuepress'),
    lnPath,
    'dir'
  )
}

export async function cloneAndLinkRepos(repoList: Repo[], stage: Stage) {
  const tasks = new Listr(
    repoList.map(repo => ({
      skip: () => {
        if (repoExists(repo.name, reposPathInFw)) {
          return 'Repo is already installed'
        }
      },
      title: `Install ${repo.name} (${repo.resolveBranch(stage)})`,
      task: () => new Listr([{
        title: 'Clone repo',
        task: () => cloneRepository(repo.url, repo.resolveBranch(stage), path.join(reposPathInFw, repo.name))
      }, {
        title: 'Link repo',
        task: () => linkFrameworkToRepo(repo)
      }])
    }))
  )
  await tasks.run()
}
