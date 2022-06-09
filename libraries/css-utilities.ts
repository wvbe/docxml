import { Declaration, parse, Rule } from 'https://esm.sh/css@3.0.0';
import { evaluateXPathToString } from 'https://esm.sh/fontoxpath@3.26.0';
import { sync } from 'https://esm.sh/slimdom-sax-parser@1.5.3';

function getMsoStylesFromCssString(css: string): {
	[styleName: string]: { [cssRule: string]: string };
} {
	return (
		parse(css)
			.stylesheet?.rules.filter((rule): rule is Rule => !!(rule as Rule).selectors)
			.map((rule) => ({
				selectors: rule.selectors,
				declarations:
					rule.declarations
						?.filter((decl): decl is Declaration => !!(decl as Declaration).value)
						.reduce<Record<string, string>>(
							(map, decl) => ({
								...map,
								[decl.property || '<no property name>']:
									decl.value?.startsWith('"') && decl.value.endsWith('"')
										? decl.value.substring(1, decl.value.length - 1)
										: String(decl.value),
							}),
							{},
						) || {},
			})) || []
	)
		.map((style) => ({
			...style,
			name: style.declarations['mso-style-name'],
		}))
		.filter((style) => !!style.name)
		.reduce(
			(map, style) => ({
				...map,
				[style.name]: style.declarations,
			}),
			{},
		);
}

export async function getMsoStylesFromDotxHtml(location: string) {
	// Of _course_ the HTML export of a Word file contains unquoted attributes etc. To make it work
	// with our XML parser, regex for <style> tags first, remove some HTML comment tags, and parse
	// each <style> individually
	const styleTags = (await Deno.readTextFile(location)).matchAll(/<style>(.|\n)*?<\/style>/gm);
	if (!styleTags) {
		throw new Error(`Did not find any eligible <style> tags in ${location}`);
	}
	return getMsoStylesFromCssString(
		Array.from(styleTags)
			.map(([styleTag]) =>
				evaluateXPathToString('.', sync(styleTag.replace(/<!--/g, '').replace(/-->/g, ''))),
			)
			.join('\n'),
	);
}
