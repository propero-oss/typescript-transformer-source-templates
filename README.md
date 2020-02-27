# @propero/typescript-transformer-source-templates

[![Maintainability](https://api.codeclimate.com/v1/badges/0e6222501c8f6d1b7af9/maintainability)](https://codeclimate.com/github/propero-oss/typescript-transformer-source-templates/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0e6222501c8f6d1b7af9/test_coverage)](https://codeclimate.com/github/propero-oss/typescript-transformer-source-templates/test_coverage)
[![Build Status](https://travis-ci.com/propero-oss/typescript-transformer-source-templates.svg?branch=master)](https://travis-ci.com/propero-oss/typescript-transformer-source-templates)

Generate fresh ASTs from source strings

```shell script
npm i @propero/typescript-transformer-source-templates
```

## Example Usage
```typescript
import { template } from "@propero/typescript-transformer-source-templates";

const aggregationTemplate = template(`
let VARIABLE = control.getAggregation("AGGREGATION");
if (!Array.isArray(VARIABLE)) VARIABLE = VARIABLE == null ? [] : [VARIABLE];
VARIABLE.forEach(it => rm.renderControl(it));
`);
const headerNodes = aggregationTemplate.statements({ AGGREGATION: 'header', VARIABLE: "_header" });
const contentNodes = aggregationTemplate.statements({ AGGREGATION: 'content', VARIABLE: () => "_content" });
const footerNodes = aggregationTemplate.statements({ AGGREGATION: 'footer' });
```

#### Casting and member templates
```typescript
import { template } from "@propero/typescript-transformer-source-templates";
import { MethodDeclaration } from "typescript";

const methodTemplate = template("render() {RENDER_CODE}");
const render = methodTemplate.objectMember<MethodDeclaration>({ RENDER_CODE: "return 'hello world';" });
```
