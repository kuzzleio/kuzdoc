import execa from 'execa'

export const deploy = (
  baseRoot: string,
  docVersion: string,
  deployPath: string,
  s3BucketId: string
) =>
  execa(
    'aws',
    [
      's3',
      'sync',
      `${docVersion}/.vuepress/dist`,
      `s3://${s3BucketId}${deployPath}`,
      '--delete'
    ],
    {
      shell: true,
      cwd: baseRoot
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
      shell: true
    }
  )
