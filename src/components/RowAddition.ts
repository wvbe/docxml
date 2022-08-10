/**
 * @file
 * Note this file is 99% the same as RowDeletion. Please maintain both accordingly.
 */

import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import type { ChangeInformation } from '../utilities/changes.ts';
import { getChangeInformation } from '../utilities/changes.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToBoolean, evaluateXPathToFirstNode } from '../utilities/xquery.ts';
import type { RowChild } from './Row.ts';
import { createNodeFromRow, parsePropsAndChildNodes, Row } from './Row.ts';

/**
 * A type describing the components accepted as children of {@link RowAddition}.
 */
export type RowAdditionChild = RowChild;

/**
 * A type describing the props accepted by {@link RowAddition}.
 */
export type RowAdditionProps = ChangeInformation;

/**
 * A component that represents a change-tracked table row that was inserted. Works the same way as
 * a normal row, but requires some props describing the change.
 */
export class RowAddition extends Component<RowAdditionProps, RowAdditionChild> {
	public static readonly children: string[] = Row.children;
	public static readonly mixed: boolean = Row.mixed;

	public toNode(ancestry: ComponentAncestor[]): Node {
		const node = createNodeFromRow(this, ancestry);

		let trPr = evaluateXPathToFirstNode(`./${QNS.w}trPr`, node);
		if (!trPr) {
			trPr = create(`element ${QNS.w}trPr {}`);
			node.insertBefore(trPr, node.firstChild);
		}

		trPr.insertBefore(
			create(
				`
					element ${QNS.w}ins {
						attribute ${QNS.w}id { $id },
						attribute ${QNS.w}author { $author },
						attribute ${QNS.w}date { $date }
					}
				`,
				{
					...this.props,
					date: this.props.date.toISOString(),
				},
			),
			null,
		);

		return node;
	}

	static matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean(
			`
				self::${QNS.w}tr and
				./${QNS.w}trPr/${QNS.w}ins and
				not(./${QNS.w}trPr/${QNS.w}del)
			`,
			node,
		);
	}

	static fromNode(node: Node): RowAddition {
		const { children, ...rowProps } = parsePropsAndChildNodes(node);
		const changeProps = getChangeInformation(evaluateXPathToFirstNode(`./${QNS.w}trPr`, node));

		return new RowAddition(
			{
				...rowProps,
				...changeProps,
			},
			...createChildComponentsFromNodes<RowAdditionChild>(this.children, children),
		);
	}
}

registerComponent(RowAddition as unknown as ComponentDefinition);
