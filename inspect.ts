/**
 * @file
 * Dump the structure of a Docx instance to console.
 *
 * Use as;
 *   deno run --allow-read inspect.ts test/docx/simple.docx
 */

import { Docx } from './src/Docx.ts';

const docx = await Docx.fromArchive(Deno.args[0]);
if (Deno.args.includes('--json')) {
	console.log(JSON.stringify(docx.document.children, null, '\t'));
} else {
	console.dir(docx, { depth: 50 });
}
