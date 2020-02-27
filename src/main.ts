import { cloneNode, CloneNodeOptions } from "@wessberg/ts-clone-node";
import {
  ScriptTarget,
  ScriptKind,
  createSourceFile,
  Statement,
  Expression,
  VariableStatement,
  VariableDeclaration,
  SourceFile,
  NodeArray
} from "typescript";

interface Replacements {
  [key: string]: any;
}

export class TemplateFactory {
  public constructor(
    protected source: string,
    protected target: ScriptTarget,
    protected kind: ScriptKind,
    protected cloneOpts?: CloneNodeOptions
  ) {}

  /**
   * Replaces all occurrences of all keys of the given replacement map with its corresponding values.
   * @param replacements - The map of strings to replace within the source
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return the processed source string
   * @public
   */
  public replace(replacements?: Replacements, source: string = this.source): string {
    if (!replacements) return source;
    return Object.keys(replacements).reduce((source, key) => source.replace(key, replacements[key]), source);
  }

  /**
   * Creates a virtual source file from the internal source
   * @param fileName - The name of the file to create
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript SourceFile instance
   * @public
   */
  public file(fileName = "", replacements?: Replacements, source: string = this.source): SourceFile {
    return createSourceFile(fileName, this.replace(replacements, source), this.target, true, this.kind);
  }

  /**
   * Builds a list of statements from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return An array of typescript statements, cloned and ready for insertion / replacement
   * @public
   */
  public statements<T extends Statement = Statement>(replacements?: Replacements, source: string = this.source): T[] {
    return this.unclonedStatements<T>(replacements, source).map(this.cloner);
  }

  /**
   * Builds a statement from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript statement, cloned and ready for insertion / replacement
   * @public
   */
  public statement<T extends Statement = Statement>(replacements?: Replacements, source: string = this.source): T {
    return this.clone(this.unclonedStatement<T>(replacements, source));
  }

  /**
   * Builds a declaration from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript variable declaration, cloned and ready for insertion / replacement
   * @public
   */
  public declaration<T extends VariableDeclaration = VariableDeclaration>(replacements?: Replacements, source: string = this.source): T {
    return this.clone(this.unclonedDeclaration<T>(replacements, source));
  }

  /**
   * Builds an expression from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript expression, cloned and ready for insertion / replacement
   * @public
   */
  public expression<T extends Expression = Expression>(replacements?: Replacements, source: string = this.source): T {
    return this.clone(this.unclonedExpression<T>(replacements, source));
  }

  /**
   * Builds a list of statements from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return An array of typescript statements, not fit for insertion yet
   * @internal
   */
  protected unclonedStatements<T extends Statement = Statement>(replacements?: Replacements, source: string = this.source): NodeArray<T> {
    return this.file("", replacements, source).statements as NodeArray<T>;
  }

  /**
   * Builds a statement from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript statement, not fit for insertion yet
   * @internal
   */
  protected unclonedStatement<T extends Statement = Statement>(replacements?: Replacements, source: string = this.source): T {
    return this.unclonedStatements<T>(replacements, source)[0];
  }

  /**
   * Builds a declaration from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript variable declaration, not fit for insertion yet
   * @internal
   */
  protected unclonedDeclaration<T extends VariableDeclaration = VariableDeclaration>(
    replacements?: Replacements,
    source: string = this.source
  ): T {
    return this.unclonedStatement<VariableStatement>(replacements, source).declarationList.declarations[0] as T;
  }

  /**
   * Builds an expression from the internal source.
   * @param replacements - The replacement map to apply to the source {@link replace}
   * @param source - Optionally you can provide your own source instead of the internal source
   * @return A typescript expression, not fit for insertion yet
   * @internal
   */
  protected unclonedExpression<T extends Expression = Expression>(replacements?: Replacements, source: string = this.source): T {
    const wrapped = `const __TEMPLATE_REPLACE__${Date.now()}_${0 | (Math.random() * 10000)} = ${source};`;
    return this.unclonedDeclaration(replacements, wrapped).initializer as T;
  }

  /**
   * A function for use in {@link Array#map}.
   * Clones all passed elements.
   * {@link clone}, {@link cloneOpts}
   * @internal
   */
  protected get cloner() {
    return (node: any) => this.clone(node);
  }

  /**
   * A function that clones all passed nodes using {@link cloneOpts}.
   * @param node - The node to clone
   * @returns The cloned node
   * {@link clone}, {@link cloneOpts}
   * @internal
   */
  protected clone<T extends any>(node: T): T {
    return cloneNode(node, this.cloneOpts) as T;
  }
}

export interface TemplateOptions {
  target?: ScriptTarget;
  kind?: ScriptKind;
  clone?: CloneNodeOptions;
}

export function template(source: string, { target = ScriptTarget.Latest, kind = ScriptKind.TS, clone }: TemplateOptions = {}) {
  return new TemplateFactory(source, target, kind, clone);
}
