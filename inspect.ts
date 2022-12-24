/**
 * @file
 * Dump the structure of a Docx instance to console.
 *
 * Use as;
 *   deno run --allow-read inspect.ts test/docx/simple.docx
 */
import { blue, dim, green, red } from 'https://deno.land/std@0.170.0/fmt/colors.ts';

import { AnyComponent } from './src/classes/Component.ts';
import { Docx } from './src/Docx.ts';
import { Length } from './src/utilities/length.ts';

const docx = await Docx.fromArchive(Deno.args[0]);

const color = {
	nodeName: red,
	propName: red,
	propValue: blue,
	syntax: green,
	text: blue,
};

function stringifyLength(len: Length) {
	const fucksGiven = ['cm', 'pt', 'hpt', 'twip', 'inch', 'emu'].map((unit) => ({
		unit,
		amount: len[unit as keyof Length],
	}));
	const fuck = fucksGiven.find(({ amount }) => amount === Math.round(amount)) || fucksGiven[0];
	return `${fuck.amount} ${fuck.unit}`;
}

function jsxify(comp: AnyComponent): string[] {
	const props = comp.props
		? Object.keys(comp.props)
				.filter((key) => comp.props[key] !== null && comp.props[key] !== undefined)
				.map((key) => {
					const val = comp.props[key];
					return `${color.propName(key)}={${color.propValue(
						(val as Length).twip ? stringifyLength(val as Length) : JSON.stringify(val),
					)}}`;
				})
				.join(' ')
		: '';
	if (!comp.children || !comp.children.length) {
		return [`<${color.nodeName(comp.constructor.name)}${props ? ' ' + props : ''} />`];
	}
	return [
		`<${color.nodeName(comp.constructor.name)}${props ? ' ' + props : ''}>`,
		...(comp.children || [])
			.reduce<string[]>(
				(flat, child) => [
					...flat,
					...(typeof child === 'string' ? [`"${color.text(child)}"`] : jsxify(child)),
				],
				[],
			)
			.map((line) => `${' ' || dim('·')}   ${line}`),
		`</${color.nodeName(comp.constructor.name)}>`,
	];
}

if (Deno.args.includes('--json')) {
	console.log(JSON.stringify(await docx.document.children, null, '  '));
} else {
	console.dir(jsxify((await docx.document.children)[0]).join('\n'), { depth: 50 });
}
