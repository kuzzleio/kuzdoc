import { join } from 'path'

export function assertIsFrameworkRoot(fwPath: string) {
  const packagejson = require(join(fwPath, 'package.json'))
  if (packagejson.name !== 'kuzzleio-documentation') {
    throw new Error(`Package is not Kuzzle Documentation (${packagejson.name})`)
  }
}

export type Stage = 'stable' | 'dev'
