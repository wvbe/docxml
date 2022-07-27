import { XmlComponent } from '../classes/XmlComponent.ts';
import { Tblpr, TblprI } from '../shared/tblpr.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Row } from './Row.ts';

export type TableChild = Row;

export type TableProps = TblprI;

export class Table extends XmlComponent<TableProps, TableChild> {
	public static children = [Row];
	public static mixed = false;

	public toNode(): Node {
		return create(
			`
				element ${QNS.w}tbl {
					$tblPr,
					for $child in $children
						return $child
				}
			`,
			{
				tblPr: Tblpr.toNode(this.props),
				children: super.toNode(),
			},
		);
	}

	static matchesNode(node: Node) {
		return node.nodeName === 'w:tbl';
	}
	static fromNode(node: Node): Table {
		const { children, tblpr } = evaluateXPathToMap(
			`
				map {
					"tblpr": ./${QNS.w}tblPr,
					"children": array{ ./(${QNS.w}tr) }
				}
			`,
			node,
		) as { tblpr: Node; children: Node[] };
		return new Table(
			{
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
