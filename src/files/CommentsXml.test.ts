import { expect } from 'std/expect';
import { beforeEach, describe, it } from 'std/testing/bdd';

import { Paragraph } from '../components/Paragraph.ts';
import { Text } from '../components/Text.ts';
import { parse, serialize } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { archive } from '../utilities/tests.ts';
import { CommentsXml } from './CommentsXml.ts';
import { ContentTypesXml } from './ContentTypesXml.ts';

describe('Comments', () => {
	let contentTypes: ContentTypesXml;
	let comments: CommentsXml;
	beforeEach(async () => {
		const arch = await archive('test/simple.docx');
		contentTypes = await ContentTypesXml.fromArchive(
			arch,
			'[Content_Types].xml'
		);
		// The comments file is not included in the archive by default. Add an empty one.
		arch.addXmlFile(
			'word/comments.xml',
			parse(`<w:comments ${ALL_NAMESPACE_DECLARATIONS} />`)
		);
		comments = await CommentsXml.fromArchive(
			arch,
			contentTypes,
			'word/comments.xml'
		);
	});

	it('serializes correctly if there are no comments', async () => {
		expect(serialize(await comments.$$$toNode())).toBe(
			`<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`.replace(
				/\n|\t/g,
				''
			)
		);
	});

	it('can add a comment with minimum information', async () => {
		const date = new Date();

		const commentId = comments.add({ author: 'foo', date }, []);
		const expectedComment = `<w:comment w:id="${commentId}" w:author="foo" w:date="${date.toISOString()}"/>`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment with and without initials', async () => {
		const date = new Date();

		const commentId = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB' },
			[]
		);
		const expectedComment = `<w:comment w:id="${commentId}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}"/>`;

		const commentId2 = comments.add(
			{ author: 'Foo Bar', date, initials: null },
			[]
		);
		const expectedComment2 = `<w:comment w:id="${commentId2}" w:author="Foo Bar" w:date="${date.toISOString()}"/>`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
					${expectedComment2}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment with contents', async () => {
		const date = new Date();

		const para = new Paragraph({}, new Text({}, 'Hello world.'));
		const commentId = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB' },
			[para]
		);
		const expectedComment = `
			<w:comment w:id="${commentId}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}">
				<w:p>
					<w:r>
						<w:t xml:space="preserve">Hello world.</w:t>
					</w:r>
				</w:p>
			</w:comment>
		`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});
});
