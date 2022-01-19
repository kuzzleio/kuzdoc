import { EventEmitter } from 'stream';

import { ClassDeclaration, JSDoc, MethodDeclaration, Project, SyntaxKind } from 'ts-morph';

export type InfoMethod = {
  name: string;
  signature: string;
  description: string;
  args: InfoMethodArgs[];
  internal: boolean;
  returnType: string;
  returnTypeRaw: string;
  scope: 'public' | 'private' | 'protected';
}

export type InfoMethodArgs = {
  name: string;
  description: string;
  type: string;
  typeRaw: string;
  optional: boolean;
}

export type InfoClass = {
  name: string;
  description: string;
  internal: boolean;
  methods: InfoMethod[];
}

export class ClassExtractor extends EventEmitter {
  private filePath: string;

  public info: InfoClass | null = null;

  public methods: InfoMethod[] = [];

  constructor(filePath: string) {
    super();

    this.filePath = filePath;
  }

  extract() {
    const project = new Project();

    for (const classDeclaration of project.addSourceFileAtPath(this.filePath).getClasses()) {
      this.extractClass(classDeclaration);
    }
  }

  private extractClass(classDeclaration: ClassDeclaration) {
    try {
      const name = classDeclaration.getName() as string;

      const { description, internal } = this.extractClassProperties(classDeclaration);

      const methods = this.extractMethods(classDeclaration);

      this.info = { name, description, internal, methods };

      this.emit('class', this.info);
    }
    catch (error) {
      throw new Error(`Cannot extract class "${classDeclaration.getName()}": ${error.message}${error.stack}`);
    }
  }

  private extractClassProperties(classDeclaration: ClassDeclaration) {
    const jsDoc = classDeclaration.getChildrenOfKind(SyntaxKind.JSDocComment)[0];

    if (!jsDoc) {
      console.log(`[warn] Class "${classDeclaration.getName()}" does not have js doc comment`);
      return { internal: false, description: '' }
    }

    const internal = Boolean(jsDoc.getTags().find(tag => tag.getTagName() === 'internal'));

    const description = this.formatText(jsDoc.getComment());

    return { internal, description }
  }

  private extractMethods(classDeclaration: ClassDeclaration): InfoMethod[] {
    const methods: InfoMethod[] = [];

    for (const method of classDeclaration.getMethods()) {
      try {
        const scope = method.getScope();

        if (scope === 'private') {
          continue;
        }

        const { description, args, internal } = this.extractMethodProperties(classDeclaration, method)

        const name = method.getName();

        const returnTypeRaw = method.getReturnType().getText();
        const returnType = returnTypeRaw ? returnTypeRaw.replace(/import\(.*\)\./, '') : '<missing return type>';
        const signature = `${scope === 'public' ? '' : `${scope} `}${name} (${args.map(arg => `${arg.name}${arg.optional ? '?' : ''}: ${arg.type}`).join(', ')}): ${returnType}`;

        const methodInfo = { name, signature, description, args, internal, scope, returnType, returnTypeRaw };

        methods.push(methodInfo);

        this.emit('method', methodInfo);
      }
      catch (error) {
        console.log(`[error] Cannot extract method "${classDeclaration.getName()}.${method.getName()}": ${error}${error.stack}`)
      }
    }

    return methods;
  }

  private extractMethodProperties(classDeclaration: ClassDeclaration, method: MethodDeclaration) {
    const jsDoc = method.getChildrenOfKind(SyntaxKind.JSDocComment)[0];

    if (!jsDoc) {
      console.log(`[warn] Method "${classDeclaration.getName()}.${method.getName()}" does not have js doc comment`);
      return { description: '', args: [], internal: false }
    }

    const description = this.formatText(jsDoc.getComment());

    const args = this.getMethodArgs(jsDoc);

    const internal = Boolean(jsDoc.getTags().find(tag => tag.getTagName() === 'internal'));

    return { description, args, internal }
  }

  private getMethodArgs(jsDoc: JSDoc): InfoMethodArgs[] {
    const args: InfoMethodArgs[] = jsDoc.getTags()
      .filter(tag => tag.getTagName() === 'param')
      .map((tag: any) => {
        const tagSymbol = tag.getSymbol()
        const typeRaw = tagSymbol ? tag.getSymbol().getValueDeclaration().getType().getText() : '<missing type>';
        const type = typeRaw.replace(/import\(.*\)\./, '');

        let optional = false
        try {
          // If someone find better than this ugly hack I'm in!
          optional =  Boolean(
            tag.getSymbol().getValueDeclaration()['_compilerNode']['questionToken']
            || tag.getSymbol().getValueDeclaration()['_compilerNode']['initalizer'])
        }
        catch (e) {}

        return {
          name: tagSymbol ? tagSymbol.getEscapedName() : '<missing name>',
          description: this.formatText(tag.getComment()),
          type,
          typeRaw,
          optional,
        };
      });

    return args;
  }

  private formatText(text: any) {
    return text ? text.replace('\n\n', '\n') : '' as string;
  }
}