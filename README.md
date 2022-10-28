This is a [Deno](https://deno.land) module for making `.docx` files.

It can be used to create a `.docx` using components, for example:

```tsx
/** @jsx Docx.jsx */
import Docx, { Paragraph } from 'https://deno.land/x/docxml/mod.ts';

await Docx.fromJsx(<Paragraph>This is the simplest document you could make.</Paragraph>)
    .toFile('example-1.docx');
```

Or it can be used to convert any XML to DOCX:

```tsx
/** @jsx Docx.jsx */
import Docx, { Paragraph, Text } from 'https://deno.land/x/docxml/mod.ts';

await Docx.fromNothing()
    .withXmlRule('self::node()', ({ traverse }) => traverse('./*'))
    .withXmlRule('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>)
    .withXmlRule('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>)
    .withXmlRule('self::strong', ({ traverse }) => <Text isBold>{traverse()}</Text>)
    .withXml(
        `<html>
            <body>
                <p>This is a very simply <strong>XML transformation</strong>.</p>
            </body>
        </html>`,
        {},
    )
    .toFile('example-2.docx');
```

For the latest and greatest API documentation please go to https://doc.deno.land/https://deno.land/x/docxml/mod.ts

# Formatting options

## Paragraph formatting

Paragraph styles may be applied via different ways;

```tsx
// As a prop:
<Paragraph alignment="center" />
```

```tsx
// As a style:
const style = docx.styles.add({
    type: 'paragraph',
    paragraph: {
        alignment: 'center',
    },
});
<Paragraph style={style} />;
```

- [See all the paragraph formatting options](https://doc.deno.land/https://deno.land/x/docxml/src/properties/paragraph-properties.ts/~/ParagraphProperties).
- Every style property, and every property of every style property, is optional;


## Text formatting

```tsx
// As a prop:
<Text isBold />
```

- [See all the text formatting options](https://doc.deno.land/https://deno.land/x/docxml/src/properties/text-properties.ts/~/TextProperties)
- Paragraph formatting options may be merged with text formatting options. When used directly on a component (ie. not via a style) the formatting only applies to the paragraph pilcrow ("¶") sign. In MS Word, the text styling options merged into a paragraph style definition _do_ apply to the paragraph text -- but may still be overriden with dedicated text formatting options.

```tsx
<Paragraph isBold>Text not shown as bold, but the paragraph's pilcrow is.</Paragraph>
```

```tsx
// As a style:
const style = docx.styles.add({
    type: 'paragraph',
    text: {
        isItalic: true,
    },
    paragraph: {
        isBold: true,
    },
});
<Paragraph style={style}>Text is shown as bold and italic</Paragraph>;
```

# Features

To great or small extend, the following features work in the current version of `docxml`. Some items are not ticked off yet -- they are not available, but hopefully soon:

**API features:**
- [x] Asynchronous components
- [x] Component composition

**Custom styles:**
- [x] Font size and color
- [x] Bold, italic, underline styles
- [x] Subscript, superscript, small caps
- [x] Paragraph spacing and indentation
- [x] Left/right/center/justified alignment
- [ ] Aligning text on tabs
- [ ] Font family

**References:**
- [ ] Cross references
- [ ] Table of contents

**Tables:**
- [x] Colspans and rowspans
- [x] [Table borders](http://officeopenxml.com/WPtableBorders.php)
- [x] [Conditional formatting](http://officeopenxml.com/WPtblLook.php)

**Images:**
- [x] From any `UInt8Array` source
- [x] Alternative and title text
- [x] Width and height

**Sections:**
- [x] Width and height
- [x] Orientation

**Comments:**
- [x] Point comment
- [x] Range comment
- [ ] Comment reply

**Change tracking:**
- [x] Text additions and deletions
- [x] Style changes
- [x] Table row additions and deletions

# Differences with actual MS Word DOCX

Obviously `docxml` is a TypeScript project, which is already very different from how you would normally interact
with a DOCX document. More meaningfully however, `docxml` is meant to make writing DOCX _easier_ than going straight
to OOXML. For example;

- All sizes are of type `Length`, which means it doesn't matter wether you input them as points, centimeters,
  inches, 1/2, 1/8th or 1/20th points, English Metric Units, and so on.
- The JSX pragma will try to correct components that would lead to invalid XML structures, by splitting the parents of
  invalidly placed components recursively until the new position is valid. Moreover, string content in unexpected places
  is automatically wrapped in `<Text>` when using JSX. This makes the configuration of a new DOCX a little more
  forgiving.
- Using the `<Image>` or `<Comment>` components will automatically create all required relationships etc.
- Some of the words have changed, generally speaking `docxml` is more verbose than the DOCX verbiage.
- Generally speaking `docxml` prefers formal (JS) references over references-by-identifier. In those cases the
  identifiers are randomly generated for you when the `.docx` file is written.
- Especially in tables and images, a lot of formatting details are automatically applied. In a lot of cases there
 is no API _yet_ to change them.


# For contributors

```sh
# Run all unit tests
deno task test


# Run all linting
deno task lint
```