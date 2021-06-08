/**
 * This file is not meant to be a real test suite (unfortunately),
 * but just a place where I test functions without having to launch
 * real commands.
 */
import { getRepositories, Product } from '../src/common'

const test = async () => {
  const repos: Product[] = await getRepositories(['kuzzle-plugin-hermes-messenger-1', 'kuzzle-plugin-workflows-1']) //

  repos.forEach(r => console.log(r.toString()))
}

test().then(() => {
  console.log('Test complete.')
})
