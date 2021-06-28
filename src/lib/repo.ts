import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import execa from 'execa'
import YAML from 'yaml'
import inquirer from 'inquirer'
import { docPathInRepo, reposPathInFw, VALUE_ALL_REPOS } from './constants'

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

  get name(): string {
    if (this.repoName) {
      return `${this.repoName}-${this.version}`
    }
    if (this.legacyName) {
      return this.legacyName
    }
    throw new Error('Malformed Repo. No repoName nor legacyName specified.')
  }

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

export const fetchRepoList = (): Repo[] => {
  const fileContent = readFileSync(join(process.cwd(), reposPathInFw, 'repositories.yml'))
  const YMLRepos = YAML.parse(fileContent.toString())
  return parseYMLRepos(YMLRepos)
}

export const listInstalledRepos = (): Repo[] => {
  const dircontents = readdirSync(join(process.cwd(), reposPathInFw))
  const repoList = fetchRepoList()
  return repoList.filter(r => dircontents.includes(r.name))
}

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

export const filterRepoList = (
  repoList: Repo[],
  repositoryNames: string[] = []
): Repo[] => {
  if (repositoryNames.length === 0) {
    return repoList
  }

  return repoList.filter(
    repo => repositoryNames.includes(repo.name)
  )
}

export async function resolveRepoList(repoFlag: string | undefined, installed = false) {
  const repositoriesYML = installed ? listInstalledRepos() : fetchRepoList()
  let selectedRepo = []

  if (repoFlag) {
    selectedRepo = repoFlag.split(',')
  } else {
    selectedRepo = await promptRepo(repositoriesYML)
  }
  return repoFlag === VALUE_ALL_REPOS ? repositoriesYML : filterRepoList(repositoriesYML, selectedRepo)
}
