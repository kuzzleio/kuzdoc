import { join } from 'path'

/**
 * Asserts a given path is the root of the framework meta-repo.
 * If the assertion is valid, nothing happens, if not, an Error
 * is thrown.
 *
 * @param fwPath The path to check.
 * @returns Void.
 */
export function assertIsFrameworkRoot(fwPath: string) {
  const packagejson = require(join(fwPath, 'package.json'))
  if (packagejson.name !== 'kuzzleio-documentation') {
    throw new Error(`Package is not Kuzzle Documentation (${packagejson.name})`)
  }
}

export type Stage = 'stable' | 'dev'
