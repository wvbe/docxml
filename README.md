This is a [Deno](https://deno.land/) library, for the following purposes;

- Transform XML into a DOCX
- Compile a standalone executable that does the above.

It relies heavily on the excellent [slimdom](https://github.com/bwrrp/slimdom.js),
[fontoxpath](https://github.com/FontoXML/fontoxpath) and [docx](https://github.com/dolanmiu/docx)
libraries.

## How to configure

We'll use a simple HTML schema as an example;

**Step 1:** Create a file called `transform-html-to-docx.tsx`:

```diff
+import Application from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

+const app = new Application();
```

**Step 2:** Add the JSX pragma and a few of the basic rendering rules:

```diff
+/** @jsx app.JSX */

 import Application, {
+  Document,
+  Text,
 } from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

+app.add('self::node()', () => null);

+app.add('self::element()', ({ traverse }) => traverse('./*'));

+app.add('self::document-node()', async ({ traverse, template }) => (
+  <Document>{traverse('./*')}</Document>
+));

+app.add('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);
```

**Step 3:** Add rendering rules for some of HTML's elements:

```diff
 import Application, {
   Document,
+  Section,
   Text,
+  Paragraph,
 } from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

 // …

+app.add('self::body', () => <Section>{traverse('./*')}</Section>);

+app.add('self::p', () => <Paragraph>{traverse('./*')}</Paragraph>);
```

**Step 4:** Configure the in- and output of your application:

```diff
// …

+await app.execute();
```

**Step 5:** Create a self-contained executable:

```sh
deno compile --allow-env --allow-read --allow-write transform-html-to-docx.tsx
```

You can now forever use your executable to transform HTML to DOCX:

```sh
# Pipe XML into script, and save result as .docx file
cat my-document.html | transform-html-to-docx > my-document.docx

# Use option flags to determine in and output locations
transform-html-to-docx --source my-document.html --destination my-document.docx

# Run script and unzip to the current working directory immediately
cat my-document.html | transform-html-to-docx | bsdtar -xvf-
```


## Error codes

`DXE001: The XML input cannot be empty.`: For some reason, the options with which you executed an
application did not result in a string that could be processed as XML.

`DXE002: The transformation resulted in an empty document.`: The processing of your input XML went
fine, but it resulted in an empty document. Verify that at least one element maps to the
`<Document />` component, and that the rendering rules traverse into meaningful content from there.

`DXE010:Cannot use styles without calling 'init' first.`: A content rendering rule is attempting
to use a style (via `Template#style()`), but the template could not verify it exists. Run (and
`await`) `Template#init()` at an earlier time -- for example when passing it to `<Document />`'s
`template` prop.

`DXE011:Style "…" is not available in this template. The only available style names are: …`: You are
referencing a style name that does not exist in the supplied `.dotx` Word template. Please check
the template and spelling.

`DXE020: Unrecognized CLI option "…"`: The user gave a command line argument or option that is
not recognized. Please check your input.

`DXE021: The --source option should be followed by the location of an XML file`: The user attempted
to use the `--source` CLI option without giving it a value. Please use as `--source <value>`
instead. That value should be an XML file that exists on your disk.

`DXE022: The --destination option should be followed by the location to which a DOCX file will be written`:
The user attempted to use the `--destination` CLI option without giving it a value. Please use as
`--destination <value>` instead. The value does not have to exist on disk already, and using the
`.docx` file extension is recommended.

`DXE029: getPipedStdin unexpectedly finished without returning.` This error should never occur. It
has to do with the way you piped XML into the application. [Please submit an issue](https://github.com/wvbe/experimental-deno-xml-to-docx/issues/new), and share anything you can about your command-line
input and XML file.

`DXE030: Some AST nodes could not be given a valid position.`: The rendering rules resulted in
invalid nesting of components, and after correction by the system some components could not be
given a valid new place.