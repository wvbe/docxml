import { AnyXmlComponent, XmlComponent } from '../classes/XmlComponent.ts';
import { Tblpr, TblprI } from '../shared/tblpr.ts';
import { TwentiethPoint } from '../types.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Row } from './Row.ts';
export type TableChild = Row;

export type TableProps = TblprI & {
	columnWidths?: null | TwentiethPoint[];
};

export class Table extends XmlComponent<TableProps, TableChild> {
	public static children = [Row];
	public static mixed = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
		return create(
			`
				element ${QNS.w}tbl {
					$tblPr,
					if (exists($columnWidths)) then element ${QNS.w}tblGrid {
						for $columnWidth in array:flatten($columnWidths) return element ${QNS.w}gridCol {
							attribute ${QNS.w}w { $columnWidth }
						}
					} else (),
					for $child in $children
						return $child
				}
			`,
			{
				tblPr: Tblpr.toNode(this.props),
				columnWidths: this.props.columnWidths?.length ? this.props.columnWidths : null,
				children: super.toNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node) {
		return node.nodeName === 'w:tbl';
	}
	static fromNode(node: Node): Table {
		const { children, tblpr, ...props } = evaluateXPathToMap(
			`
				map {
					"tblpr": ./${QNS.w}tblPr,
					"columnWidths": array {
						./${QNS.w}tblGrid/${QNS.w}gridCol/@${QNS.w}w/number()
					},
					"children": array{ ./(${QNS.w}tr) }
				}
			`,
			node,
		) as { tblpr: Node; children: Node[] };
		return new Table(
			{
				...props,
				...Tblpr.fromNode(tblpr),
			},
			...children
				.map(
					(node) => this.children.find((Child) => Child.matchesNode(node))?.fromNode(node) || null,
				)
				.filter((child): child is Exclude<typeof child, null> => !!child),
		);
	}
}
