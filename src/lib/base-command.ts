import { Command } from '@oclif/command'

export abstract class BaseCommand extends Command {
  public printVersion() {
    this.log(`kuzdoc v${this.config.version}`)
  }
}
