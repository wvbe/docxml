This is a [Deno](https://deno.land) module for making `.docx` files.

It can be used to create a `.docx` using components, for example:

```ts
/** @jsx JSX */
import { Docx, JSX, Paragraph } from 'https://deno.land/x/docxml@1.0.0/mod.ts';

Docx.fromJsx(<Paragraph>This is the simplest document you could make.</Paragraph>)
	.toArchive()
	.toFile('test.docx');
```

Or it can be used to convert any XML to DOCX:

```ts
// TODO example code
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
const style = api.styles.add({
	type: 'paragraph',
	paragraphProperties: {
		alignment: 'center',
	},
});
<Paragraph style={style} />;
```

Every style property, and every property of every style property, is optional;

```ts
{
	alignment?: 'left' | 'right' | 'center' | 'both';
	style?: string;
	spacing?: {
		before?: TwentiethPoint;
		after?: TwentiethPoint;
		line?: TwentiethPoint;
		lineRule?: 'atLeast' | 'exactly' | 'auto';
		afterAutoSpacing?: boolean;
		beforeAutoSpacing?: boolean;
	};
	indentation?: {
		left?: TwentiethPoint;
		leftChars?: number;
		right?: TwentiethPoint;
		rightChars?: number;
		hanging?: TwentiethPoint;
		hangingChars?: number;
		firstLine?: TwentiethPoint;
		firstLineChars?: number;
	};
}
```

## Text formatting

```tsx
// As a prop:
<Text isBold />
```

Every style property is optional again:

```tsx
{
	verticalAlign?: 'baseline' | 'subscript' | 'superscript';
	isBold?: boolean;
	isItalic?: boolean;
	isSmallCaps?: boolean;
	language?: string;
	fontSize?: HalfPoint;
}
```

Paragraph formatting options may be merged with text formatting options. When used directly on a component (ie. not via a style) the formatting only applies to the paragraph pilcrow ("¶") sign. In MS Word, the text styling options merged into a paragraph style definition _do_ apply to the paragraph text -- but may still be overriden with dedicated text formatting options.

```tsx
<Paragraph isBold>Text not shown as bold, but the paragraph's pilcrow is.</Paragraph>
```

```tsx
// As a style:
const style = api.styles.add({
	type: 'paragraph',
	textProperties: {
		isItalic: true,
	},
	paragraphProperties: {
		isBold: true,
	},
});
<Paragraph style={style}>Text is shown as bold and italic</Paragraph>;
```

# Differences with actual MS Word DOCX

Obviously `docxml` is a TypeScript project, which is already very different from how you would normally interact
with a DOCX document. More meaningfully however, `docxml` is meant to make writing DOCX _easier_. For example;

- All sizes are of type `Length`, which means it doesn't matter wether you input them as points, centimeters,
  inches, 1/2, 1/8th or 1/20th points, English Metric Units, and so on.
- The JSX pragma will try to correct components that would lead to invalid XML structures, by splitting the parents of
  invalidly placed components recursively until the new position is valid.
- Some of the words have changed, generally speaking `docxml` is more verbose than the DOCX verbiage.
- Generally speaking `docxml` prefers formal (JS) references over references-by-identifier. The identifiers are
  generated for you when the `.docx` file is written.
- Especially in tables and images, a lot of formatting details are automatically applied. In a lot of cases there
 is no API _yet_ to change them.


# For contributors

```sh
# Run all unit tests
deno task test
```