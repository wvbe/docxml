import { AnyXmlComponent, XmlComponent } from '../classes/XmlComponent.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Paragraph } from './Paragraph.ts';
import { Row } from './Row.ts';
import { Table } from './Table.ts';

export type CellChild = Paragraph;

export type CellProps = { [key: string]: never };

export class Cell extends XmlComponent<CellProps, CellChild> {
	public static children = [Paragraph];
	public static mixed = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
		const rowAncestor = ancestry.find((ancestor): ancestor is Row => ancestor instanceof Row);
		const tableAncestor = ancestry.find((ancestor): ancestor is Table => ancestor instanceof Table);

		const nthColumn = rowAncestor?.children.indexOf(this) || 0;
		const width = tableAncestor?.props.columnWidths?.[nthColumn] || 0;

		console.error('ancestry:' + !!rowAncestor + ' ' + !!tableAncestor);
		console.error('NTH CELL:' + nthColumn);
		console.error('CELL WIDTH:' + width);
		return create(
			`
				element ${QNS.w}tc {
					element ${QNS.w}tcPr {
						element ${QNS.w}tcW {
							attribute ${QNS.w}w { $width },
							attribute ${QNS.w}type { "dxa" }
						}
					},
					for $child in $children
						return $child
				}
			`,
			{
				children: super.toNode(ancestry),
				width,
			},
		);
	}

	static matchesNode(node: Node) {
		return node.nodeName === 'w:tc';
	}

	static fromNode(node: Node): Cell {
		const { children } = evaluateXPathToMap(
			`
				map {
					"children": array{ ./(${QNS.w}p) }
				}
			`,
			node,
		) as { children: Node[] };
		return new Cell(
			{},
			...children
				.map(
					(node) => this.children.find((Child) => Child.matchesNode(node))?.fromNode(node) || null,
				)
				.filter((child): child is Exclude<typeof child, null> => !!child),
		);
	}
}
