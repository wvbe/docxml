import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';

import { assert, exit } from '../libraries/check-utilities.ts';
import { DotxTemplate } from '../libraries/classes/template.dotx.ts';
import { getMsoStylesFromDotxHtml } from '../libraries/css-utilities.ts';

const DOTX = resolve(Deno.cwd(), Deno.args[0]);
const HTML = resolve(Deno.cwd(), Deno.args[1]);

let dotx: DotxTemplate;
console.group('');

await assert('The .dotx template is succesfully parsed', async () => {
	dotx = new DotxTemplate(DOTX);
	await dotx.init();
	return true;
});

await assert('The styles in .dotx and .html match perfectly', async () => {
	const htmlStyleNames = Object.keys(await getMsoStylesFromDotxHtml(HTML)).sort();
	const notInDotx =
		htmlStyleNames.filter((style) => !dotx.availableStyleNames?.includes(style)) || [];
	const notInHtml =
		dotx.availableStyleNames?.filter((style) => !htmlStyleNames.includes(style)) || [];
	if (notInDotx.length || notInHtml.length) {
		throw new Error(
			`There are ${notInHtml.length} DOTX styles not in HTML, and ${notInDotx.length} HTML styles not in DOTX`,
		);
	}
	return true;
});

await assert('At least some styles match', async () => {
	const htmlStyleNames = Object.keys(await getMsoStylesFromDotxHtml(HTML)).sort();

	const inBoth = htmlStyleNames.filter((style) => dotx.availableStyleNames?.includes(style)) || [];
	return inBoth.length >= 1;
});

exit();
