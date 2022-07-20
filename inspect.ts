/**
 * @file
 * Dump the structure of a Docx instance to console.
 *
 * Use as;
 *   deno run --allow-read inspect.ts test/docx/simple.docx
 */

import { Docx } from './src/Docx.ts';
console.dir(await Docx.fromArchive(Deno.args[0]), { depth: 50 });
