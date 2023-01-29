/** @jsx Docx.jsx */

import { expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Docx } from '../Docx.ts';
import { Hyperlink } from './Hyperlink.ts';

it('Hyperlinks register their relationship on serialization time', async () => {
	const doc1 = Docx.fromNothing();
	await doc1.toArchive();
	expect(doc1.document.relationships.meta).toHaveLength(1);

	const doc2 = Docx.fromJsx(<Hyperlink url={'http://nerf'} />);
	await doc2.toArchive();
	expect(doc2.document.relationships.meta).toHaveLength(2);
});

run();
