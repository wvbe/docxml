`docxml` is originally written in [Deno](http://deno.land), but published to [npmjs.org](https://npmjs.org) for [NodeJS](https://nodejs.org) users as well.

### Deno

`docxml` is published to [Deno's contributor modules](https://deno.land/x/docxml) and can be imported via there. Always ensure to specify the version number, and point to the `mod.ts` entry file.

```ts
// Not using version number, bad
import Docxml, { Paragraph } from 'https://deno.land/x/docxml/mod.ts';

// Using version number, good
import Docxml, { Paragraph } from 'https://deno.land/x/docxml@6.0.0/mod.ts';
```

Deno comes with the advantage that it supports TypeScript and JSX without needing configuration. [Read more about `docxml` and JSX here](./jsx-or-not.md)

Deno supports import maps too, [a fun way of making those imports easier to write](https://deno.land/manual/basics/import_maps).

### NodeJS

The original Deno source is automatically transpiled and given some shims to make it work in NodeJS as you would expect. [`docxml` is then published to npmjs.org](https://npmjs.com/package/docxml) and uses the same version tagging and so on.

```sh
npm install docxml
```

You can import `docxml` using `require()` or an `import` statement depending on your `package.json` `type` setting.

When `"type": "module"`:

```ts
import Docxml, { Paragraph } from 'docxml';
```

When `"type": "commonjs"`, or not set at all:

```ts
const { default: Docxml, Paragraph } = require('docxml');
```

NodeJS can support JSX for `docxml` too, [but it takes some new dependencies and configuration.](./jsx-or-not.md).
