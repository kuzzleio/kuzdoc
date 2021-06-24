import execa from 'execa'
import path from 'path'
import { reposPathInFw } from './constants'

export const buildRepo = (
  name: string,
  docRoot: string,
  version: number,
  deployPath: string,
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

export const deployRepo = (
  name: string,
  docRoot: string,
  version: string,
  deployPath: string,
  s3BucketId: string,
  dryRun = false
) =>
  execa(
    'aws',
    [
      's3',
      'sync',
      path.join(reposPathInFw, name, docRoot, version, '.vuepress', 'dist'), // `${version}/.vuepress/dist`,
      `s3://${s3BucketId}${deployPath}`,
      '--delete',
      dryRun ? '--dryrun' : ''
    ],
    {
      shell: true,
      stdout: 'inherit'
    }
  )

export const invalidateCloudfront = (
  deployPath: string,
  cloudfrontDistributionId: string
) =>
  execa(
    'aws',
    [
      'cloudfront',
      'create-invalidation',
      '--distribution-id',
      cloudfrontDistributionId,
      '--paths',
      deployPath
    ],
    {
      shell: true,
      stdout: 'inherit'
    }
  )
