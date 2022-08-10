import { Component } from '../classes/Component.ts';
import { OfficeDocumentChild } from '../files/OfficeDocument.ts';
import { Paragraph } from './Paragraph.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Document}.
 */
export type DocumentChild = OfficeDocumentChild;

/**
 * A type describing the props accepted by {@link Document}.
 */
export type DocumentProps = { [key: string]: never };

/**
 * A component that represents the document itself.
 *
 * @deprecated This component may be removed in the future, and you can simply remove all references
 * to it from your code.
 */
export class Document extends Component<DocumentProps, DocumentChild> {
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
