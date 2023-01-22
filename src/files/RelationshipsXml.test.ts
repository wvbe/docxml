import { beforeAll, describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { serialize } from '../utilities/dom.ts';
import { archive } from '../utilities/tests.ts';
import { RelationshipsXml } from './RelationshipsXml.ts';

describe('Relationships', () => {
	let relationships: RelationshipsXml;
	beforeAll(async () => {
		relationships = await RelationshipsXml.fromArchive(
			await archive('test/simple.docx'),
			'_rels/.rels',
		);
	});

	it('serializes correctly', async () => {
		// @TODO include an "external" relationship
		expect(serialize(await relationships.$$$toNode())).toBe(
			`
				<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
					<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
					<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
					<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
				</Relationships>
			`.replace(/\n|\t/g, ''),
		);
	});
});

run();
