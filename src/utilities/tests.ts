/**
 * @file
 * All the helper functions for test purposes only.
 */
import * as path from 'https://deno.land/std@0.146.0/path/mod.ts';
import { expect } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { XmlFile } from '../classes/XmlFile.ts';
import { ZipArchive } from '../classes/ZipArchive.ts';
import { Docx } from '../Docx.ts';
import { castRelationshipToClass } from '../files/index.ts';
import { RelationshipType } from '../files/Relationships.ts';
import { evaluateXPathToBoolean } from './xquery.ts';

const ZIPS = new Map<string, ZipArchive>();

export function file(absolutePathFromProjectDir: string) {
	return path.resolve(
		new URL('.', import.meta.url).pathname,
		'..',
		'..',
		absolutePathFromProjectDir,
	);
}

/**
 * Get a ZipArchive instance for a given file. The file name is absolute from the project directory.
 */
export async function archive(archiveLocation: string): Promise<ZipArchive> {
	if (!ZIPS.has(archiveLocation)) {
		ZIPS.set(archiveLocation, await ZipArchive.fromFile(file(archiveLocation)));
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
export function expectDocxToContain(
	bundle: Docx,
	relationshipType: RelationshipType,
	test: string,
) {
	const document = bundle.relationships.find((meta) => meta.type === relationshipType);
	if (!document) {
		throw new Error('$$$ Unknown relationship ' + relationshipType);
	}
	const dom = (document as XmlFile).$$$toNode();

	return expect(evaluateXPathToBoolean(test, dom.documentElement)).toBeTruthy();
}
export function expectDocumentToContain(
	bundle: Docx,
	relationshipType: RelationshipType,
	test: string,
) {
	const document = bundle.document.relationships.find((meta) => meta.type === relationshipType);
	if (!document) {
		throw new Error('$$$ Unknown relationship ' + relationshipType);
	}
	const dom = (document as XmlFile).$$$toNode();

	return expect(evaluateXPathToBoolean(test, dom.documentElement)).toBeTruthy();
}
