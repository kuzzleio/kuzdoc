import path from 'path'
import { Command, flags } from '@oclif/command'
import 'ts-node/register'

import { ClassExtractor } from '../../lib/generator/javascript/ClassExtractor'
import { MarkdownFormatter } from '../../lib/generator/javascript/MarkdownFormatter'

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'lib', 'generator', 'javascript', 'templates')
export default class GenerateJs extends Command {
  static description = 'Generate the documentation of a class written in Typescript.'

  static flags = {
    path: flags.string({
      description: 'Directory to write the doc',
      default: 'generated'
    }),
    help: flags.help({ char: 'h' }),
  }

  static args = [
    { name: 'filePath', description: 'File containing the class to generate the doc', required: true },
  ]

  async run() {
    const { args, flags: _flags } = this.parse(GenerateJs)

    this.log(`Generating documentation for the class defined in "${args.filePath}"`)

    const formatter = new MarkdownFormatter(_flags.path, TEMPLATES_DIR)

    const extractor = new ClassExtractor(args.filePath)

    let className
    extractor.on('class', classInfo => {
      className = classInfo.name
      formatter.onClass(classInfo)
    })

    extractor.on('method', methodInfo => {
      this.log(`Creates doc for method "${methodInfo.name}"`)
    })

    extractor.extract()

    this.log(`Documentation for class "${className}" created`)
  }
}
