import { AnyXmlComponent, XmlComponent } from '../classes/XmlComponent.ts';
import { createChildComponentsFromNodes, registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Paragraph } from './Paragraph.ts';
import { Table } from './Table.ts';

export type CellChild = Paragraph;

export type CellProps = {
	colSpan?: number | null;
	rowSpan?: number | null;
};

export class Cell extends XmlComponent<CellProps, CellChild> {
	public static readonly children: string[] = [Paragraph.name, 'Table'];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
		const { width } = ancestry
			.find((ancestor): ancestor is Table => ancestor instanceof Table)
			?.getCellProperties(this) || { width: 0 };

		const children = super.toNode(ancestry) as Node[];
		if (!(this.children[this.children.length - 1] instanceof Paragraph)) {
			// Cells must always end with a paragraph, or MS Word will complain about
			// file corruption.
			children.push(new Paragraph({}).toNode([this, ...ancestry]));
		}

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
				children,
				width,
			},
		);
	}

	static matchesNode(node: Node): boolean {
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
		return new Cell({}, ...createChildComponentsFromNodes<CellChild>(this.children, children));
	}
}
registerComponent(Cell);
