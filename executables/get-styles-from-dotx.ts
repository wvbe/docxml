import * as path from 'https://deno.land/std@0.141.0/path/mod.ts';

import { DotxTemplate } from '../libraries/classes/template.dotx.ts';

const arg = path.resolve(Deno.cwd(), Deno.args[0]);

const template = new DotxTemplate(arg);
await template.init();
console.log(JSON.stringify(template.availableStyleNames, null, '\t'));

// import { getMsoStylesFromDotxHtml } from '../libraries/css-utilities.ts';
// console.dir(JSON.stringify(await getMsoStylesFromDotxHtml(arg), null, '  '), {
// 	depth: 10,
// });
