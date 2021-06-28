import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import execa from 'execa'
import YAML from 'yaml'
import inquirer from 'inquirer'
import { docPathInRepo, reposPathInFw, VALUE_ALL_REPOS } from './constants'

/**
 * Specifies what to expect from an element of the array
 * contained in the repositories.yml file.
 */
export interface RawRepo {
  url: string
  doc_version: string
  stable: string
  dev: string
  name: string
  deploy_path: string
  doc_root?: string,
  repo_name?: string
  private?: boolean
}

/**
 * Represents a Repository, parsed from the repositories.yml file.
 */
export class Repo {
  /**
     * The name of the repository (used to build the URL)
     */
  repoName?: string

  /**
   * The version of the product
   */
  version: number

  /**
   * The name of the stable branch
   */
  stableBranch: string

  /**
   * The name of the dev branch
   */
  devBranch: string

  /**
   * A branch explicitly set, overriding dev and stable branch.
   *
   * @see this.resolveBranch
   */
  customBranch?: string

  /**
   * The path the docs of the current repo will be deployed to, within the
   * documentation website
   */
  deployPath: string

  /**
   * The path of the documentation sources, within the current repo
   */
  docRoot: string = docPathInRepo

  /**
   * Whether the repository is public or privave (used to build the URL)
   */
  isPrivate = false

  /**
   * The legacy explicit name (will be a computed getter in the next iterations).
   *
   * @deprecated
   */
  legacyName?: string

  /**
   * The complete URL of the repositlry
   *
   * @deprecated
   */
  legacyUrl?: string

  /**
   * Builds the instance of a Repo given a definition object
   *
   * @param r The definition object
   */
  constructor(
    r: RawRepo
  ) {
    if (!r.url && !r.repo_name) {
      throw new Error('Repository definition must specify at least "url" or "repos_name"')
    }
    if (!r.name && !r.repo_name) {
      throw new Error('Repository definition must specify at least "name" or "repos_name"')
    }

    this.version = parseInt(r.doc_version, 10)
    this.stableBranch = r.stable
    this.devBranch = r.dev
    this.deployPath = r.deploy_path
    this.repoName = r.repo_name

    if (r.doc_root) {
      this.docRoot = r.doc_root
    }

    if (r.private) {
      this.isPrivate = r.private
    }
    if (r.url) {
      this.legacyUrl = r.url
    }
    if (r.name) {
      this.legacyName = r.name
    }
  }

  /**
   * Computes the URL used to clone the Repository. Public ones are
   * cloned via https, private ones via git@github.
   */
  get url(): string {
    if (this.repoName) {
      if (this.isPrivate) {
        return `git@github.com:kuzzleio/${this.repoName}.git`
      }
      return `https://github.com/kuzzleio/${this.repoName}.git`
    }

    if (this.legacyUrl) {
      return this.legacyUrl
    }

    throw new Error('Malformed Repo. No _url nor repoName specified.')
  }

  /**
   * The name of the Repository, depending on whether the legacy
   * name is explicitly set.
   */
  get name(): string {
    if (this.repoName) {
      return `${this.repoName}-${this.version}`
    }
    if (this.legacyName) {
      return this.legacyName
    }
    throw new Error('Malformed Repo. No repoName nor legacyName specified.')
  }

  /**
   * Resolves the branch name, based on the given stage.
   *
   * @param stage The stage (dev | stable)
   * @returns The name of the resolved branch
   */
  resolveBranch(stage: string): string {
    if (this.customBranch) {
      return this.customBranch
    }
    return stage === 'dev' ? this.devBranch : this.stableBranch
  }

  toString() {
    return `
    * ${this.name} ${this.isPrivate ? '(private)' : ''}
      ${this.url}
      repo_name:     ${this.repoName}
      Stable branch: ${this.stableBranch}
      Dev branch:    ${this.devBranch}
      Deploy path:   ${this.deployPath}`
  }
}

const parseYMLRepos = (YMLRepos: Array<any>): Repo[] => {
  return YMLRepos.map(r => new Repo(r))
}

/**
 *
 * @param cwd The path to the root of the framework meta-repo
 * @returns [dev | stable]
 */
export const resolveStage = async (cwd: string) => {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd
    })
    if (stdout.match(/^develop$/)) {
      return 'dev'
    }
    return 'stable'
  } catch (error) {
    return 'stable'
  }
}

/**
 * Fetch the list of Repos from the `repositories.yml` file
 * located in the framework meta-repo.
 *
 * @param fwPath The path of the framework meta-repo
 * @returns The list of Repos
 */
export const fetchRepoList = (fwPath = process.cwd()): Repo[] => {
  const fileContent = readFileSync(join(fwPath, reposPathInFw, 'repositories.yml'))
  const YMLRepos = YAML.parse(fileContent.toString())
  return parseYMLRepos(YMLRepos)
}

/**
 * Fetches a list of Repos containing only the ones that are
 * currently installed in the framework meta-repo.
 *
 * @param fwPath The path of the framework meta-repo
 * @returns The list of installed Repos
 */
export const listInstalledRepos = (fwPath = process.cwd()): Repo[] => {
  const dircontents = readdirSync(join(fwPath, reposPathInFw))
  const repoList = fetchRepoList()
  return repoList.filter(r => dircontents.includes(r.name))
}

/**
 * Prompts for a set of repos to choose among a given list.
 *
 * @param repoList The list of Repos to choose from
 * @returns An array containing the names of the choosen Repos
 */
export const promptRepo = async (repoList: Repo[]): Promise<string[]> => {
  const choices = repoList.map(r => ({ name: r.name }))
  const answers = await inquirer.prompt([{
    type: 'checkbox',
    message: 'Select the repositories you want',
    name: 'repos',
    pageSize: 15,
    loop: false,
    choices: choices
  }])
  return answers.repos
}

/**
 * Resolves a Repo set by filtering the origin list (all the Repos or the ones that
 * are currently installed in the framework meta-repo) against a set of selected repos.
 * Selected repos can be passed as arguments or interactively prompted.
 *
 * @param repoNames A string containing a comma-separated list of selected Repos,
 *                 or the value __ALL__, meaning all the Repos are selected.
 * @param installed Whether to lookup the Repos within the whole list or the installed ones.
 * @returns The list of resolved Repos.
 */
export async function resolveRepoList(repoNames: string | undefined, installed = false) {
  const repositoriesYML = installed ? listInstalledRepos() : fetchRepoList()
  let wishList: string[] = []

  if (repoNames) {
    wishList = repoNames.split(',')
  } else {
    wishList = await promptRepo(repositoriesYML)
  }
  return repoNames === VALUE_ALL_REPOS ?
    repositoriesYML :
    repositoriesYML.filter(repo => wishList.includes(repo.name))
}
