// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Text.ts';

import {
	Component,
	ComponentAncestor,
	ComponentContext,
	ComponentDefinition,
} from '../classes/Component.ts';
import { type ChangeInformation, getChangeInformation } from '../utilities/changes.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';
import { type Text } from './Text.ts';
import { type TextDeletion } from './TextDeletion.ts';

/**
 * A type describing the components accepted as children of {@link TextAddition}.
 */
export type TextAdditionChild = Text | TextAddition | TextDeletion;

/**
 * A type describing the props accepted by {@link TextAddition}.
 */
export type TextAdditionProps = ChangeInformation;

/**
 * A component that represents a change-tracked text that was inserted.
 */
export class TextAddition extends Component<TextAdditionProps, TextAdditionChild> {
	public static readonly children: string[] = ['Text', this.name, 'TextDeletion'];
	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}ins {
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
		return node.nodeName === 'w:ins';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node, context: ComponentContext): TextAddition {
		const props = getChangeInformation(node);
		return new TextAddition(
			props,
			...createChildComponentsFromNodes<TextAdditionChild>(
				this.children,
				evaluateXPathToNodes(`./${QNS.w}r`, node),
				context,
			),
		);
	}
}

registerComponent(TextAddition as unknown as ComponentDefinition);
