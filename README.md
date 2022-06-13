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

