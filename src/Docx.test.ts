import { beforeAll, describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Docx } from './Docx.ts';
import { FileLocation } from './enums.ts';
import { file } from './utilities/tests.ts';

describe('Docx', () => {
	let bundle: Docx;
	beforeAll(async () => {
		bundle = await Docx.fromArchive(file('test/simple.docx'));
	});

	it('correct files', async () => {
		const archive = await bundle.toArchive();
		expect(
			Object.keys(archive.$$$fileNames)
				.filter((name) => !name.endsWith('/'))
				.sort(),
		).toEqual(
			[
				FileLocation.contentTypes,
				FileLocation.relationships,

				// Stuff referenced from any of the .rels files
				'docProps/app.xml',
				'docProps/core.xml',
				'word/document.xml',
				'word/_rels/document.xml.rels',
				'word/_rels/footer1.xml.rels',
				'word/_rels/footer2.xml.rels',
				'word/_rels/footer3.xml.rels',
				'word/_rels/header1.xml.rels',
				'word/_rels/header2.xml.rels',
				'word/_rels/header3.xml.rels',
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

	it('.cloneAsEmptyTemplate()', () => {
		const original = Docx.fromNothing();
		original.withSettings({
			attachedTemplate: 'derp',
			isTrackChangesEnabled: true,
		});
		original.document.styles.add({
			id: 'foo',
			type: 'paragraph',
			paragraph: {
				style: 'bar',
			},
		});

		const clone = original.cloneAsEmptyTemplate();
		expect(clone.document.styles.get('foo')).toBeTruthy();
		expect(clone.document.settings.get('attachedTemplate')).toBe('derp');
	});
});

run();
