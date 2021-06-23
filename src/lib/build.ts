import execa from 'execa'
import path from 'path'
import { docPathInRepo, reposPathInFw } from './constants'

export const buildRepo = (
  name: string,
  version: number,
  deployPath: string,
  docRoot: string = docPathInRepo,
) => {
  return execa(
    '$(npm bin)/vuepress',
    ['build', path.join(reposPathInFw, name, docRoot, `${version}`)],
    {
      shell: true,
      env: {
        REPO_NAME: name,
        SITE_BASE: deployPath.endsWith('/') ? deployPath : `${deployPath}/`, // TODO rename to DEPLOY_PATH
      },
      stdout: 'inherit'
    }
  )
}

