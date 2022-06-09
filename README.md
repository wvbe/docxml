This is a [Deno](https://deno.land/) library.

# Setup

You will probably want to do two things besides your normal imports etc.;

- Have a Deno configuration file (`deno.json`) that avoids importing `lib.dom.d.ts`;
  ```json
  {
    "$schema": "https://deno.land/x/deno@v1.22.1/cli/schemas/config-file.v1.json",
    "compilerOptions": {
      "lib": ["deno.ns"]
    }
  }
  ```

- Either use a JSX pragma at the start of each `.tsx` file (`/** @jsx JSX */`), or add another line
  to `compilerOptions` in `deno.js`:
  ```js
  "jsxFactory": "JSX"
  ```


From this point onward, your basic configuration looks like;

```tsx
/** @jsx JSX */
import API, { JSX } from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

const api = new API();

// … Use `api.add()` to register XML-to-DOCX rules

await api.writeXmlToDocx(
  await Deno.readTextFile(Deno.args[0]),
  Deno.args[1]
);
```

# Tools
```sh
# Inspect roche-style-template.dotx/word/styles.xml
# Work in progress
deno run -A executables/get-styles-from-dotx.ts demos/from-template.dotx
```

# Demos

```sh
# A simple DOCX
deno run -A ./demos/hello-world.tsx && open hello-world.docx

# A simple DOCX, but it contains an image or a table
deno run -A ./demos/images.tsx && open images.docx
deno run -A ./demos/tables.tsx && open tables.docx

# An XML of Shakespeare's Macbeth, converted to a DOCX file
deno run -A ./demos/macbeth.tsx && open macbeth.docx

# An XML of a food recipe, converted to a DOCX file and including some change tracking info (WIP)
deno run -A ./demos/mushroom-lunch.tsx && open mushroom-lunch.docx
```