import { OfficeDocumentChild } from '../bundle/OfficeDocument.ts';
import { XmlComponent } from '../classes/XmlComponent.ts';
import { Paragraph } from './Paragraph.ts';
import { Table } from './Table.ts';

export type DocumentChild = OfficeDocumentChild;

export type DocumentProps = { [key: string]: never };

/**
 * http://officeopenxml.com/WPDocument.php
 */
export class Document extends XmlComponent<DocumentProps, DocumentChild> {
	public static readonly children: string[] = [Paragraph.name, Table.name];
	public static readonly mixed: boolean = false;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static matchesNode(_node: Node) {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static fromNode(_node: Node): Document {
		throw new Error(`Cannot fromNode a <Document> component.`);
	}
}
