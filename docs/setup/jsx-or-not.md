`docxml` can be used as vanilla class instances, or using JSX.

This is a paragraph with some text `docxml` using vanilla class instances:

<!-- prettier-ignore -->
```ts
const para = new Paragraph(
	{ alignment: 'center' },
	new Text(
		{ isBold: true },
		'Hello world.',
	),
);
```

This is the same paragraph using JSX:

```tsx
const para = (
	<Paragraph alignment={'center'}>
		<Text isBold>Hello world.</Text>
	</Paragraph>
);
```

### Using as class instances

You don't need to do anything special to use `docxml`'s components as vanilla class instances. Simply `import` and `new` them. The first argument is always an object of _props_, the rest of the arguments are the component children;

```ts
new Component(props, ...children);
```

Your IDE should inform you which components are accepted as children of another component. If you're not getting any code intelligence upon using `docxml` through Deno or Node, consider switching to a code editor like [Visual Studio Code](https://code.visualstudio.com/).

⚠️ Unlike the JSX syntax, using vanilla class instances does not have self-repairing properties.

### Using JSX

The JSX syntax is often easier to read for a DOM. The JSX syntax uses all the same _props_ as you would when using vanilla class instances.

Moreover, the JSX pragma will attempt to make your input valid if it is not already;

- Components that have invalid child components will be split into two, with the invalid child in the middle. This process repeats until the DOM becomes valid, or there is nothing left to split.
- Text in components that do not accept string children is automatically wrapped in `<Text>`.

You need to point your compiler to the JSX pragma. The pragma is exported as the `jsx` named export of `docxml`, the `.jsx` static member of `docxml`'s default export, and the `.jsx` instance member of `docxml`'s default export;

```ts
/** @jsx jsx */
import { jsx } from 'docxml';

/** @jsx Docx.jsx */
import Docx from 'docxml';

/** @jsx d.jsx */
const d = new Docxml();
```

As an alternative to the `/** @jsx */` directive, you can set the [`compilerOptions.jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory) property of your `tsconfig.json`

ℹ️ JSX is supported in [Deno](https://deno.land) out of the box -- all you need to do is give your file the `.tsx` extension. If you're instead using NodeJS, read on.

### Using Babel for JSX in Node

NodeJS does not have support for JSX, but [Babel](https://babeljs.io/) and some plugins could be used to compile your JSX code to canonical JavaScript.

First, install a bunch of development dependencies, and of course `docxml` itself:

```sh
npm install --save-dev \
	@babel/cli \
	@babel/core \
	@babel/plugin-syntax-jsx \
	@babel/plugin-transform-react-jsx
npm install --save docxml
```

Then create a `.babelrc` configuration file:

<!-- prettier-ignore -->
```json
{
	"plugins": [
		"@babel/plugin-syntax-jsx",
		[
			"@babel/plugin-transform-react-jsx",
			{ "pragma": "jsx" }
		]
	]
}
```

Then, either create an npm script in `package.json` for building the JS that you _can_ run:

```json
	"scripts": {
		"build": "babel script.jsx --out-dir built"
	}
```

Or run it directly via Babel (or rather without saving the transpiled result first):

```sh
npx @babel/node script.jx
```
