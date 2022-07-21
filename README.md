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
