import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

import _ from 'lodash';

import { InfoClass, InfoMethod } from './ClassExtractor';

function upFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function kebabCase(string: string): string {
  return string
    // get all lowercase letters that are near to uppercase ones
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // replace all spaces and low dash
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function contextualizeKeys(context: string, values: Record<string, any>) {
  const obj: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    obj[`${context}${upFirst(key)}`] = value;
  }

  return obj;
}

/**
 * "You who enter here, abandon all hope"
 *
 * If you really want to be completely disgusted about Typescript then I can advise you to start a project with Oclif.
 * The typescript compiler is so strict, it's keeping bothering you with complete useless nonsense.
 *
 * Additionally, it's simply bugged and will throw error when there is none, like here.
 * If I try to declare those as class attribute Oclif is complaining :)
 */
let outputDir: any;
let templateDir: any;
let baseDir: any;

export class MarkdownFormatter {
  constructor(outputDirArg: string, templateDirArg: string) {
    outputDir = outputDirArg;
    templateDir = templateDirArg;
  }

  onClass(classInfo: InfoClass) {
    if (classInfo.internal) {
      return;
    }

    baseDir = path.join(outputDir, kebabCase(classInfo.name));

    const rootIndex = this.renderTemplate(
      ['class', 'index.tpl.md'],
      contextualizeKeys('class', classInfo));

    this.writeFile(['index.md'], rootIndex);

    const introduction = this.renderTemplate(
      ['class', 'introduction', 'index.tpl.md'],
      contextualizeKeys('class', classInfo));

    this.writeFile(['introduction', 'index.md'], introduction);

    for (const method of classInfo.methods) {
      this.onMethod(classInfo, method);
    }
  }

  onMethod(classInfo: InfoClass, infoMethod: InfoMethod) {
    if (infoMethod.internal) {
      return;
    }

    const method = this.renderTemplate(
      ['class', 'method', 'index.tpl.md'],
      {
        ...contextualizeKeys('method', infoMethod),
        ...contextualizeKeys('class', classInfo),
      });

    this.writeFile([infoMethod.name, 'index.md'], method);
  }

  private writeFile(paths: string[], content: string) {
    const fullPath = path.join(baseDir as string, ...paths.map(p => kebabCase(p)));

    mkdirSync(path.dirname(fullPath), { recursive: true });

    writeFileSync(fullPath, content);
  }

  private renderTemplate(paths: string[], values: Record<string, any> = {}): string {
    const fullPath = path.join(templateDir, ...paths);

    const compiled = _.template(readFileSync(fullPath, { encoding: 'utf-8' }));

    return compiled(values);
  }
}
