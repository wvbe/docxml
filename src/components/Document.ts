import { OfficeDocumentChild } from '../bundle/OfficeDocument.ts';
import { XmlComponent } from '../classes/XmlComponent.ts';
import { Paragraph } from './Paragraph.ts';

export type DocumentChild = OfficeDocumentChild;

export type DocumentProps = { [key: string]: never };

/**
 * http://officeopenxml.com/WPDocument.php
 */
export class Document extends XmlComponent<DocumentProps, DocumentChild> {
	public static children = [Paragraph];
	public static mixed = false;

	/**
	 * @deprecated Remove?
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static fromNode(_node: Node): Promise<Document> {
		throw new Error(`Cannot fromNode a <Document> component.`);
	}
}
