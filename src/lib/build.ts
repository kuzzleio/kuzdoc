import execa from 'execa'
import fse from 'fs-extra'
import path from 'path'
import { reposPathInFw } from './constants'
import { Repo } from './repo'

/**
 * Builds the docs of a Repo.
 *
 * @param repo The Repo to build
 * @returns An execa promise.
 */
export const buildRepo = (
  repo: Repo
) => execa(
  '$(npm bin)/vuepress',
  ['build', path.join(reposPathInFw, repo.name, repo.docRoot, `${repo.version}`)], // TODO Detect docs both in /doc/2 and /doc/
  {
    shell: true,
    env: {
      REPO_NAME: repo.name,
      SITE_BASE: repo.deployPath.endsWith('/') ? repo.deployPath : `${repo.deployPath}/`,
    },
    stdout: 'inherit'
  }
)

/**
 * Builds the framework meta-repo.
 *
 * @param cwd The framework root (where the command is launched)
 * @returns an execa promise
 */
export const buildFramework = (
  cwd = process.cwd()
) => execa(
  '$(npm bin)/vuepress',
  ['build', 'src'],
  {
    shell: true,
    cwd,
    stdout: 'inherit'
  }
)

/**
 * Deploys the built docs of the Repo to a given S3 bucket.
 *
 * @param repo The Repo to deploy.
 * @param s3BucketId The S3 bucket to deploy the Repo to.
 * @param dryRun Whether to really deploy of just dry-run.
 * @returns an execa Promise.
 */
export const deployRepo = (
  repo: Repo,
  s3BucketId: string,
  dryRun = false
) => execa(
  'aws',
  [
    's3',
    'sync',
    path.join(reposPathInFw, repo.name, repo.docRoot, `${repo.version}`, '.vuepress', 'dist'), // `${version}/.vuepress/dist`,
    `s3://${s3BucketId}${repo.deployPath}`,
    '--delete',
    dryRun ? '--dryrun' : ''
  ],
  {
    shell: true,
    stdout: 'inherit'
  }
)

export const deployFrameworkLocally = (destination: string) =>
  fse.copy(path.join('src', '.vuepress', 'dist'), destination)

export const deployRepoLocally = (repo: Repo, destination: string, source = reposPathInFw) =>
  fse.copy(
    path.join(source, repo.name, repo.docRoot, `${repo.version}`, '.vuepress', 'dist'),
    path.join(destination, repo.deployPath)
  )

/**
 * Invalidates a path in a given Cloudfront distribution.
 *
 * @param deployPath The remote path to invalidate.
 * @param cloudfrontDistributionId The ID of the Cloufront distribution.
 * @returns an execa promise.
 */
export const invalidateCloudfront = (
  deployPath: string,
  cloudfrontDistributionId: string
) => execa(
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
