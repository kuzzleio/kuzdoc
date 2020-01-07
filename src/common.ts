import axios from 'axios'
import YAML from 'yaml'

export interface Repo {
  local_path: string
  name: string
  url: string
  stable: string
  dev: string
  destination: string
  base_url: string
}

export const getRepositories = async (
  repositoryNames: Array<string> = []
): Promise<Array<Repo>> => {
  const reposResponse = await axios.get(
    'https://raw.githubusercontent.com/kuzzleio/documentation/master/.repos/repositories.yml'
  )

  const YMLRepos: Array<Repo> = YAML.parse(reposResponse.data)
  const selectedRepos = YMLRepos.filter(
    repo => repositoryNames.length === 0 || repositoryNames.includes(repo.name)
  )

  return selectedRepos
}
