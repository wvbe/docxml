/**
 * @file
 * All the helper functions for test purposes only.
 */
import * as path from 'https://deno.land/std@0.170.0/path/mod.ts';
import { expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Docx } from '../Docx.ts';
import { castRelationshipToClass } from '../files/index.ts';
import { RelationshipType } from '../files/Relationships.ts';
import { create } from './dom.ts';
import { evaluateXPathToBoolean } from './xquery.ts';

const ZIPS = new Map<string, Archive>();

export function file(absolutePathFromProjectDir: string) {
	return path.resolve(absolutePathFromProjectDir);
}

/**
 * Get a Archive instance for a given file. The file name is absolute from the project directory.
 */
export async function archive(archiveLocation: string): Promise<Archive> {
	if (!ZIPS.has(archiveLocation)) {
		ZIPS.set(archiveLocation, await Archive.fromFile(file(archiveLocation)));
	}
	const zip = ZIPS.get(archiveLocation);
	if (!zip) {
		throw new Error(`Archive "${archiveLocation}" does not exist`);
	}
	return zip;
}

/**
 * Get the text contents of a file in a ZIP archive. The archive location is absolute from the
 * project directory. The file location is absolute from the ZIP root.
 */
export async function archivedText(archiveLocation: string, fileLocation: string) {
	const zip = await archive(archiveLocation);
	return zip.readText(fileLocation);
}

/**
 * Get the DOM of an XML file in a ZIP archive. The archive location is absolute from the
 * project directory. The file location is absolute from the ZIP root.
 */
export async function archivedXml(archiveLocation: string, fileLocation: string) {
	const zip = await archive(archiveLocation);
	return zip.readXml(fileLocation);
}

/**
 * Get the instance of XmlFile that correlates with an XML file in a DOCX archive. The archive
 * location is absolute from the project directory. The file location is absolute from the ZIP root.
 */
export async function archivedFile(
	archiveLocation: string,
	type: RelationshipType,
	fileLocation: string,
) {
	const zip = await archive(archiveLocation);
	return castRelationshipToClass(zip, { type, target: fileLocation });
}

/**
 * Convenient but unoptimized function to run an XPath test against the DOM of a file in the DOCX
 * archive that has a specific relationship (such as being the "main document" or the "settings").
 *
 * May optimize for speed later
 */
export async function expectDocxToContain(
	bundle: Docx,
	relationshipType: RelationshipType,
	test: string,
) {
	const document = bundle.relationships.find((meta) => meta.type === relationshipType);
	if (!document) {
		throw new Error('$$$ Unknown relationship ' + relationshipType);
	}
	const dom = await (document as XmlFile).$$$toNode();

	return expect(evaluateXPathToBoolean(test, dom.documentElement)).toBeTruthy();
}
export async function expectDocumentToContain(
	bundle: Docx,
	relationshipType: RelationshipType,
	test: string,
) {
	const document = bundle.document.relationships.find((meta) => meta.type === relationshipType);
	if (!document) {
		throw new Error('$$$ Unknown relationship ' + relationshipType);
	}
	const dom = await (document as XmlFile).$$$toNode();

	return expect(evaluateXPathToBoolean(test, dom.documentElement)).toBeTruthy();
}

/**
 * Creates a small test suite to assert that an object can succesfully be parsed from XML, serialized
 * to XML again and then parses a 2nd time to the same object as before.
 *
 * Succeeding this test means the two functions convert back-and-forth without loss of information.
 */
export function createXmlRoundRobinTest<ObjectShape extends { [key: string]: unknown }>(
	fromNode: (n: Node | null) => ObjectShape,
	toNode: (n: ObjectShape) => Node | null,
) {
	return function test(
		/**
		 * The XML that the system should be able to ingest.
		 */
		xmlSource: string,
		/**
		 * The object parsed from XML.
		 */
		parsedExpectation: ObjectShape,
	) {
		const serializedOnce = create(xmlSource);
		const parsedOnce = fromNode(serializedOnce);
		const serializedAgain = toNode(parsedOnce);
		const parsedTwice = fromNode(serializedAgain);

		// Usually fails strict string equals because of namespace declarations and shit:
		// it('XML', () => {
		// 	expect(serialize(serializedOnce)).toBe(serialize(serializedAgain));
		// });

		for (const prop in parsedExpectation) {
			it(`.${String(prop)}`, () => {
				// Assert that the parsed prop equals the expected
				expect(parsedOnce[prop]).toEqual(parsedExpectation[prop]);

				// Assert that serializing and parsing again will result in the same outcome
				// nb: If this test fails there is probably a problem in paragraphPropertiesToNode()
				expect(parsedOnce[prop]).toEqual(parsedTwice[prop]);
			});
		}
	};
}
