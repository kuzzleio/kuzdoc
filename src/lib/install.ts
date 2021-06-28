import path from 'path'
import { existsSync, symlinkSync, unlinkSync } from 'fs'
import execa from 'execa'
import Listr from 'listr'
import { Repo } from './repo'
import { reposPathInFw } from './constants'
import { Stage } from './assertions'

/**
 * Checks whether a Repo is already installed in a given destination.
 *
 * @param repoName The name of the Repo to check
 * @param destination The path to the Repos installation directory.
 * @returns True if the repo is installed, false if not.
 */
export function repoExists(repoName: string, destination = reposPathInFw) {
  return existsSync(path.join(destination, repoName))
}

/**
 * Installs a Repo from a local directory.
 *
 * @param localRepoPath The path to the Repo to install.
 * @param repo The Repo object, representing the Repo to install.
 * @param destination The path to the Repos installation directory.
 * @param frameworkPath The path to the framework meta-repo.
 * @returns A ready to run Listr instance.
 */
export function installLocalRepository(localRepoPath: string, repo: Repo, destination = '.repos', frameworkPath = process.cwd()) {
  return new Listr([{
    title: `Verify repo ${repo.name} is not already installed`,
    task: () => {
      if (repoExists(repo.name, destination)) {
        throw new Error(`Repo ${repo.name} is already installed.`)
      }
    }
  }, {
    title: `Symlinking ${localRepoPath} in ${destination}...`,
    task: () => symlinkSync(destination, path.join(
      localRepoPath
    ))
  }, {
    title: `Symlinking framework in ${localRepoPath}...`,
    task: () => symlinkSync(
      path.join(
        frameworkPath,
        'src',
        '.vuepress'
      ),
      path.join(
        localRepoPath,
        repo.docRoot,
        `${repo.version}`,
        '.vuepress'
      )
    )
  }])
}

/**
 * Clones one single branch of a Repo.
 *
 * @param url The URL to clone the Repo from.
 * @param branch The branch of the Repo to clone.
 * @param destination The path to the installatio directory.
 * @returns An execa promise.
 */
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

/**
 * Creates the symlink to the Vuepress framework inside an installed Repo.
 *
 * @param repo The Repo instance.
 * @param localPath The local path to the Repo (leave undefined if repo was cloned from remote)
 * @param reposPath The path to the Repos installation directory
 * @param frameworkPath The path to the framework meta-repo.
 * @returns Void.
 */
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
    repo.docRoot,
    `${repo.version}`, // TODO Detect docs both in /doc/2 and /doc/
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

/**
 * Given a list of Repos, it clones them and links the framework inside
 * each one of them.
 *
 * @param repoList The list of the Repos to clone and link
 * @param stage The stage to resolve branches from
 * @returns A ready to run Listr instance.
 */
export async function cloneAndLinkRepos(repoList: Repo[], stage: Stage) {
  return new Listr(
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
    }), { concurrent: 5 })
  )
}
