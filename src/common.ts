import axios from 'axios'
import YAML from 'yaml'

export interface Repo {
  url: string
  doc_version: string
  stable: string
  dev: string
  name: string
  deploy_path: string
  doc_root?: string
}

export const getRepositories = async (
  repositoryNames: Array<string> = []
): Promise<Array<Repo>> => {
  const reposResponse = await axios.get(
    'https://raw.githubusercontent.com/kuzzleio/documentation/develop/.repos/repositories.yml'
  )

  const YMLRepos: Array<Repo> = YAML.parse(reposResponse.data)
  const selectedRepos = YMLRepos.filter(
    repo => repositoryNames.length === 0 || repositoryNames.includes(repo.name)
  )

  return selectedRepos
}
