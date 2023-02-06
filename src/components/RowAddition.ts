/**
 * @file
 * Note this file is 99% the same as RowDeletion. Please maintain both accordingly.
 */

import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import { type TableRowProperties } from '../properties/table-row-properties.ts';
import { type ChangeInformation, getChangeInformation } from '../utilities/changes.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToBoolean, evaluateXPathToFirstNode } from '../utilities/xquery.ts';
import { type RowChild, createNodeFromRow, parsePropsAndChildNodes, Row } from './Row.ts';

/**
 * A type describing the components accepted as children of {@link RowAddition}.
 */
export type RowAdditionChild = RowChild;

/**
 * A type describing the props accepted by {@link RowAddition}.
 */
export type RowAdditionProps = ChangeInformation & TableRowProperties;

/**
 * A component that represents a change-tracked table row that was inserted. Works the same way as
 * a normal row, but requires some props describing the change.
 */
export class RowAddition extends Component<RowAdditionProps, RowAdditionChild> {
	public static readonly children: string[] = Row.children;
	public static readonly mixed: boolean = Row.mixed;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const node = await createNodeFromRow(this, ancestry);

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

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
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

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
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
