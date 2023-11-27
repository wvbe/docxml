/**
 * @file
 * All the helper functions for test purposes only.
 */
import * as path from 'https://deno.land/std@0.187.0/path/mod.ts';
import { describe, expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Docx } from '../Docx.ts';
import { FileLocation, RelationshipType } from '../enums.ts';
import { ContentTypesXml } from '../files/ContentTypesXml.ts';
import { castRelationshipToClass } from '../files/index.ts';
import { create } from './dom.ts';
import { evaluateXPathToBoolean } from './xquery.ts';

const ZIPS = new Map<string, Archive>();

export function file(absolutePathFromProjectDir: string) {
	return path.resolve(
		new URL(import.meta.url).pathname,
		'..',
		'..',
		'..',
		absolutePathFromProjectDir,
	);
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
	const contentTypes = await ContentTypesXml.fromArchive(zip, FileLocation.contentTypes);
	return castRelationshipToClass(zip, contentTypes, { type, target: fileLocation });
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
	const document = bundle.relationships.findInstance((meta) => meta.type === relationshipType);
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
	const document = bundle.document.relationships.findInstance(
		(meta) => meta.type === relationshipType,
	);
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
	function assert(
		prop: string | number,
		p1: Record<string, unknown> | Array<unknown>,
		e1: Record<string, unknown> | Array<unknown>,
		p2: Record<string, unknown> | Array<unknown>,
	): void {
		const value = p1[prop as keyof typeof p1];
		const expectation = e1[prop as keyof typeof e1];
		const reparsed = p2[prop as keyof typeof p2];

		if (expectation && typeof expectation === 'object') {
			describe(`.${String(prop)}`, () => {
				if(Array.isArray(expectation)) {
					it('Has the expected length', () => {
						expect(value).toHaveLength(expectation.length);
					});
				}
				for (const p in expectation) {
					assert(
						p,
						value as Record<string, unknown> | Array<unknown>,
						expectation as Record<string, unknown> | Array<unknown>,
						reparsed as Record<string, unknown> | Array<unknown>,
					);
				}
			});
		} else {
			it(`.${String(prop)}`, () => {
				expect(value).toBe(expectation);
				expect(reparsed).toBe(expectation);
			});
		}
	}

	return function test(xml: Node | string, parsedExpectation: ObjectShape) {
		const dom = typeof xml === 'string' ? create(xml) : xml;
		const p1 = fromNode(dom);
		const serializedAgain = toNode(p1);
		if (typeof xml !== 'string') {
			xml.parentElement?.insertBefore(serializedAgain as Node, xml);
			xml.parentElement?.removeChild(xml);
		}
		const p2 = fromNode(serializedAgain);
		for (const prop in parsedExpectation) {
			assert(prop, p1, parsedExpectation, p2);
		}
	};
}
