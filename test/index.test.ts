import { template, TemplateFactory } from "src/main";
import {
  isSourceFile,
  VariableStatement,
  isVariableStatement,
  isVariableDeclaration,
  ObjectLiteralExpression,
  isObjectLiteralExpression,
  MethodDeclaration,
  isMethodDeclaration
} from "typescript";

const source = "const HELLO = 'WORLD';";
const tmpl = template(source);
const sourceMulti = "const HELLO = 'WORLD';\nconst WORLD = 'HELLO';\nconsole.log('HELLO');";
const tmplMulti = template(sourceMulti);

describe("template", () => {
  it("should construct an instance of TemplateFactory", () => {
    expect(tmpl).toBeInstanceOf(TemplateFactory);
  });
});

describe("TemplateFactory", () => {
  describe("#replace()", () => {
    it("should return the plain source if no replacements are given", () => {
      expect(tmpl.replace()).toEqual(source);
    });
    it("should only replace matching strings", () => {
      expect(tmpl.replace({ HELLO: "GOODBYE" })).toEqual("const GOODBYE = 'WORLD';");
    });
    it("should support custom source", () => {
      expect(tmpl.replace({ HELLO: "GOODBYE" }, "const WORLD = 'HELLO';")).toEqual("const WORLD = 'GOODBYE';");
    });
    it("should execute replacer functions", () => {
      expect(tmpl.replace({ HELLO: () => "GOODBYE" })).toEqual("const GOODBYE = 'WORLD';");
    });
  });
  describe("#file()", () => {
    it("should create a source file", () => {
      const file = tmpl.file("test.ts");
      expect(isSourceFile(file)).toBeTruthy();
      expect(file.fileName).toEqual("test.ts");
    });
  });
  describe("#statements()", () => {
    const stmts = tmplMulti.statements<VariableStatement>();
    it("should extract all statements", () => {
      expect(stmts).toHaveLength(3);
      expect(stmts.map(isVariableStatement)).toEqual([true, true, false]);
    });
    it("should clone all statements", () => {
      expect(stmts.map(it => it.parent)).toEqual([undefined, undefined, undefined]);
    });
  });
  describe("#statement()", () => {
    const stmt = tmplMulti.statement<VariableStatement>();
    it("should extract the first statement", () => {
      expect(stmt).toBeDefined();
      expect(isVariableStatement(stmt)).toBeTruthy();
    });
    it("should clone the first statement", () => {
      expect(stmt.parent).toBeUndefined();
    });
  });
  describe("#declaration()", () => {
    const dec = tmplMulti.declaration();
    it("should extract the first variable declaration", () => {
      expect(dec).toBeDefined();
      expect(isVariableDeclaration(dec)).toBeTruthy();
    });
    it("should clone the first variable declaration", () => {
      expect(dec.parent).toBeUndefined();
    });
  });
  describe("#expression()", () => {
    const expr = template("{ HELLO: 'WORLD' }").expression<ObjectLiteralExpression>();
    it("should extract an expression", () => {
      expect(expr).toBeDefined();
      expect(isObjectLiteralExpression(expr)).toBeTruthy();
    });
    it("should clone the expression", () => {
      expect(expr.parent).toBeUndefined();
    });
  });
  describe("#objectMember()", () => {
    const method = template("HELLO() { return 'WORLD' }").objectMember<MethodDeclaration>();
    it("should extract an object member", () => {
      expect(method).toBeDefined();
      expect(isMethodDeclaration(method)).toBeTruthy();
    });
    it("should clone the method declaration", () => {
      expect(method.parent).toBeUndefined();
    });
  });
});
