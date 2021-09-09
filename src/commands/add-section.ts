import { Command, flags } from '@oclif/command'
import inquirer from 'inquirer'
import path from 'path'
import { assertIsFrameworkRoot } from '../lib/assertions'
import { writeFileSync } from 'fs'

export default class AddSection extends Command {
  static description = `Wizard to add a new section in src/.vuepress/sections.json.
  NOTE: This command must be executed from the root of the framework meta-repo.`

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    this.log('\n  📖 Add new section to the documentation\n')

    try {
      assertIsFrameworkRoot(process.cwd())
    } catch (error) {
      this.log('⛔️ Aborting.')
      this.log(`It doesn't seem that you are executing this command from the root of the framework repo ${process.cwd()}: ${(error as Error).message}`)
      return
    }

    const answers = await inquirer.prompt([{
      message: 'What is the name of the section? (it will be probably shown in a menu or a list, e.g. "Dart Null Safety")',
      type: 'input',
      name: 'name'
    }, {
      message: 'Select the Kuzzle major version this section is part of',
      type: 'list',
      choices: ['v1.x', 'v2.x'],
      name: 'kuzzleMajor',
      default: 'v2.x'
    }, {
      message: 'What is the version of the product in this section? (e.g. "3" for the Dart SDK v3)',
      type: 'number',
      name: 'version'
    }, {
      message: 'What will be the path to the section? (e.g. /sdk/dart/3)',
      type: 'input',
      name: 'path'
    }, {
      message: 'What is the identifier of this section? (e.g. dart, or home)',
      type: 'input',
      name: 'id'
    }, {
      message: 'Is this section a child of a parent section? (e.g. the parent of "dart" would be "sdk"',
      type: 'confirm',
      name: 'hasParent'
    }, {
      message: 'Then what is the name of the parent section? (e.g. "sdk")',
      type: 'input',
      when: answers => answers.hasParent === true,
      name: 'parentSection'
    }, {
      message: 'Does this section have an icon? (to be shown in index pages or dropdown menus)',
      type: 'confirm',
      name: 'hasIcon'
    }, {
      message: 'Then, what is the path to the icon? (e.g. /logos/dart.svg)',
      type: 'input',
      name: 'icon',
      when: answers => answers.hasIcon === true
    }, {
      message: 'Do you want to release this section? (if not, the section will be created but will not be added to the docs indexes)',
      type: 'confirm',
      name: 'released',
      default: true
    }])

    const sectionsFilePath = path.join(process.cwd(), 'src', '.vuepress', 'sections.json')
    const sections = require(sectionsFilePath)

    const newSection = {
      name: answers.name,
      version: answers.version,
      kuzzleMajor: answers.kuzzleMajor,
      released: answers.released,
      icon: undefined,
      section: undefined,
      subsection: undefined
    }

    if (answers.hasIcon) {
      newSection.icon = answers.icon
    }

    if (answers.hasParent) {
      newSection.section = answers.parentSection
      newSection.subsection = answers.id
    } else {
      newSection.section = answers.id
    }

    sections[answers.path] = newSection

    writeFileSync(path.join(process.cwd(), 'src', '.vuepress', 'sections.json'), JSON.stringify(sections, null, 2))

    this.log('\n  ✅ All done!')
    this.log('  The new section item has been added to the list in src/.vuepress/sections.json\n')
  }
}
