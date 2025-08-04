// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import '../../document/src/Text.ts';

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
	type ComponentDefinition,
} from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToNodes } from '../../../utilities/src/xquery.ts';
import type { Text } from '../../document/src/Text.ts';
import type { TextDeletion } from './TextDeletion.ts';

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
export class TextAddition extends Component<
	TextAdditionProps,
	TextAdditionChild
> {
	public static override readonly children: string[] = [
		'Text',
		this.name,
		'TextDeletion',
	];
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
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
				date: this.props.date?.toISOString(),
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:ins';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(
		node: Node,
		context: ComponentContext
	): TextAddition {
		const props = getChangeInformation(node);
		return new TextAddition(
			props,
			...createChildComponentsFromNodes<TextAdditionChild>(
				this.children,
				evaluateXPathToNodes(`./${QNS.w}r`, node),
				context
			)
		);
	}
}

registerComponent(TextAddition as unknown as ComponentDefinition);
