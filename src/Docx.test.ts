import { beforeAll, describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Docx } from './Docx.ts';
import { BundleFile } from './types.ts';
import { file } from './util/tests.ts';

describe('Docx', () => {
	let bundle: Docx;
	beforeAll(async () => {
		bundle = await Docx.fromArchive(file('test/simple.docx'));
	});

	it('correct files', async () => {
		const archive = await bundle.toArchive();
		expect(
			Object.keys(archive.zip.files())
				.filter((name) => !name.endsWith('/'))
				.sort(),
		).toEqual(
			[
				BundleFile.contentTypes,
				BundleFile.relationships,

				// Stuff referenced from any of the .rels files
				'docProps/app.xml',
				'docProps/core.xml',
				'word/document.xml',
				'word/_rels/document.xml.rels',
				'word/footer1.xml',
				'word/theme/theme1.xml',
				'word/webSettings.xml',
				'word/header2.xml',
				'word/fontTable.xml',
				'word/settings.xml',
				'word/_rels/settings.xml.rels',
				'word/styles.xml',
				'word/header1.xml',
				'word/footer3.xml',
				'word/endnotes.xml',
				'word/header3.xml',
				'word/footnotes.xml',
				'word/footer2.xml',
			].sort(),
		);
	});
});

run();
