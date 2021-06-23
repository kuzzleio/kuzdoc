import execa from 'execa'
import { fwDirName } from '../constants'

export const buildRepo = (
  baseRoot: string,
  docVersion: number,
  deployPath: string,
  repoName?: string
) => {
  return execa(
    `$(npm --prefix ${fwDirName} bin)/vuepress`,
    ['build', '--no-cache', `${docVersion}`],
    {
      shell: true,
      cwd: baseRoot,
      env: {
        REPO_NAME: repoName,
        SITE_BASE: deployPath.endsWith('/') ? deployPath : `${deployPath}/`, // TODO rename to DEPLOY_PATH
        DOC_DIR: `${docVersion}` // TODO rename to LOCAL_PATH
      }
    }
  )
}
