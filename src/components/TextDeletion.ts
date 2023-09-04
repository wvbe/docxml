// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Text.ts';

import {
	type ComponentAncestor,
	type ComponentDefinition,
	Component,
	ComponentContext,
} from '../classes/Component.ts';
import { type ChangeInformation, getChangeInformation } from '../utilities/changes.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';
import { type Text } from './Text.ts';
import { type TextAddition } from './TextAddition.ts';

/**
 * A type describing the components accepted as children of {@link TextDeletion}.
 */
export type TextDeletionChild = Text | TextDeletion | TextAddition;

/**
 * A type describing the props accepted by {@link TextDeletion}.
 */
export type TextDeletionProps = ChangeInformation;

/**
 * A component that represents a change-tracked text that was deleted.
 */
export class TextDeletion extends Component<TextDeletionProps, TextDeletionChild> {
	public static readonly children: string[] = [
		'Text',
		'TextAddition',
		// Sometimes deletions nested into themselves work well? At other times, they don't.
		// For safety, keep it disabled now (or put it behind a flag possibly)
		// 'TextDeletion',
	];
	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}del {
					attribute ${QNS.w}id { $id },
					attribute ${QNS.w}author { $author },
					attribute ${QNS.w}date { $date },
					$children
				}
			`,
			{
				...this.props,
				date: this.props.date.toISOString(),
				children: await this.childrenToNode(ancestry),
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:del';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node, context: ComponentContext): TextDeletion {
		const props = getChangeInformation(node);
		return new TextDeletion(
			props,
			...createChildComponentsFromNodes<TextDeletionChild>(
				this.children,
				evaluateXPathToNodes(`./${QNS.w}r`, node),
				context,
			),
		);
	}
}

registerComponent(TextDeletion as unknown as ComponentDefinition);
