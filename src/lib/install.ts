import execa from 'execa'
import Listr from 'listr'
import path from 'path'
import { Repo } from './repo'
import { docPathInRepo, reposPathInFw } from '../constants'
import { Stage } from './framework'
import { existsSync, symlinkSync, unlinkSync } from 'fs'

export async function cloneRepository(repo: Repo, branch: string, destination: string) {
  // this.debug(`${repo.url}#${branch === 'dev' ? repo.dev : repo.stable}`)
  return execa('git', [
    'clone',
    '--branch',
    branch,
    '--depth',
    '10',
    '--single-branch',
    repo.url,
    path.join(destination, repo.name)
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

export function repoExists(repo: Repo, destination: string) {
  return existsSync(path.join(destination, repo.name))
}

export async function cloneAndLinkRepos(repoList: Repo[], stage: Stage) {
  const tasks = new Listr(
    repoList.map(repo => ({
      skip: () => {
        if (repoExists(repo, reposPathInFw)) {
          return 'Repo is already installed'
        }
      },
      title: `Install ${repo.name} (${repo.getBranchByStage(stage)})`,
      task: () => new Listr([{
        title: 'Clone repo',
        task: () => cloneRepository(repo, repo.getBranchByStage(stage), reposPathInFw)
      }, {
        title: 'Link repo',
        task: () => linkFrameworkToRepo(repo)
      }])
    }))
  )
  await tasks.run()
}
