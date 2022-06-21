This is a [Deno](https://deno.land/) library, for the following purposes;

- Transform XML into a DOCX
- Compile a standalone executable that does the above.

```tsx
/** @jsx Application.JSX */

import Application, {
	Document,
	Paragraph,
	Section,
	Text,
} from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

const ast = await (
	<Document>
		<Section>
			<Paragraph>This is probably the simplest document you could make</Paragraph>
		</Section>
	</Document>
);

await Application.writeAstToDocx('hello-world.docx', ast);

// Hey presto, `hello-world.docx` is saved to disk
```

It relies heavily on the excellent [slimdom](https://github.com/bwrrp/slimdom.js),
[fontoxpath](https://github.com/FontoXML/fontoxpath) and provides syntactic sugar for the
magnificent [docx](https://github.com/dolanmiu/docx).

## To use

1.  Create a `deno.json` in your project directory, and give it the following contents to avoid
    conflicts with `lib.dom.d.ts`;

    ```json
    {
    	"compilerOptions": {
    		"lib": ["deno.ns"]
    	}
    }
    ```

2.  Create a `.tsx` file, include the `/** @jsx app.JSX */` and use the rest of the API as shown in
    the other code examples of this README.

## Creating an executable

An instance of the default export class comes with some helper methods that makes it dead easy to
build an executable using Deno's own `deno compile`.

The following examples takes a couple of CLI arguments, and applies its rendering rules on the
input XML;

```tsx
/** @jsx app.JSX */
import Application, {
	Document,
	Section,
	Text,
	Paragraph,
} from 'https://raw.githubusercontent.com/wvbe/experimental-deno-xml-to-docx/develop/mod.ts';

const app = new Application();

// Some catch-all rules for any XML node, any XML element, any text:
app.add('self::node()', () => null);
app.add('self::element()', ({ traverse }) => traverse('./*'));
app.add('self::text()', ({ node }) => node.nodeValue);
app.add('self::document-node()', ({ traverse }) => <Document>{traverse('./*')}</Document>);

// Some rules for specific HTML elements. Elements that have no specific configuration
// fall back to the catch-all ones.
app.add('self::html', ({ traverse }) => <Section>{traverse('./*')}</Section>);
app.add('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);
app.add('self::b', ({ traverse }) => <Text bold>{traverse()}</Text>);

await app.execute();
```

This could then be compiled into a self-contained executable:

```sh
deno compile -A -o my-executable my-script.tsx
```

When calling `Application#execute()`, like in the earlier code example, the script will look for the
following command-line input;

- **-s <filename>**, **--source <filename>**, specify the XML file that needs to be transformed.

- **-d <filename>**, **--destination <filename>**, specify the location to which you would like the
  `.docx` file to be written.

- **--debug**, log more information about the document that is being output.

Alternatively, you can pipe in- and out of the executable;

```sh
cat my-source.xml | my-executable > my-destination.docx
```

## Error codes

- `DXE001: The XML input cannot be empty.`: For some reason, the options with which you executed an
  application did not result in a string that could be processed as XML.

- `DXE002: The transformation resulted in an empty document.`: The processing of your input XML went
  fine, but it resulted in an empty document. Verify that at least one element maps to the
  `<Document />` component, and that the rendering rules traverse into meaningful content from there.

- `DXE003: The transformation resulted in a string, which is not a valid document.`: The processing
  of your input XML did use any of the required components -- at least `<Document />` and
  `<Section />`.

- `DXE004: Could not read the DOTX template file due to error "…"`

- `DXE010:Cannot use styles without calling 'init' first.`: A content rendering rule is attempting
  to use a style (via `Template#style()`), but the template could not verify it exists. Run (and
  `await`) `Template#init()` at an earlier time -- for example when passing it to `<Document />`'s
  `template` prop.

- `DXE011:Style "…" is not available in this template. The only available style names are: …`: You
  are referencing a style name that does not exist in the supplied `.dotx` Word template. Please
  check the template and spelling.

- `DXE020: Unrecognized CLI option "…"`: The user gave a command line argument or option that is
  not recognized. Please check your input.

- `DXE021: The --source option should be followed by the location of an XML file`: The user
  attempted to use the `--source` CLI option without giving it a value. Please use as `--source
  <value>` instead. That value should be an XML file that exists on your disk.

- `DXE022: The --destination option should be followed by the location to which a DOCX file will be
  written`: The user attempted to use the `--destination` CLI option without giving it a value.
  Please use as `--destination <value>` instead. The value does not have to exist on disk already,
  and using the `.docx` file extension is recommended.

- `DXE029: getPipedStdin unexpectedly finished without returning.` This error should never occur. It
  has to do with the way you piped XML into the application.
  [Please submit an issue](https://github.com/wvbe/experimental-deno-xml-to-docx/issues/new), and
  share anything you can about your command-line input and XML file.

- `DXE030: Some AST nodes could not be given a valid position.`: The rendering rules resulted in
  invalid nesting of components, and after correction by the system some components could not be
  given a valid new place.

## About the `docx` facade

In all cases, the options on components are actually
[documented with the rest of docx](https://docx.js.org/). However, there are a few minor
differences:

- Unlike `docx`, paragraphs can contain text (strings) directly. The system will wrap them in
  `docx.TextRun` automatically. It makes the thing a lot more convenient when transforming XML.

- When the system finds component nesting that is not supported by `docx` (eg. a `Paragraph` inside
  a `TextRun`), it will try to split the ancestors of the invalid child until a valid position is
  reached. If the top-level is reached, there is no valid resolution, and the system throws an
  error.
