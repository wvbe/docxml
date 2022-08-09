// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Text.ts';

import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import type { ChangeInformation } from '../utilities/changes.ts';
import { getChangeInformation } from '../utilities/changes.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';
import type { Text } from './Text.ts';
import type { TextDeletion } from './TextDeletion.ts';

export type TextAdditionProps = ChangeInformation;

export type TextAdditionChild = Text | TextAddition | TextDeletion;

export class TextAddition extends Component<TextAdditionProps, TextAdditionChild> {
	public static readonly children: string[] = ['Text', this.name, 'TextDeletion'];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]): Node {
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
				children: this.childrenToNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:ins';
	}

	static fromNode(node: Node): TextAddition {
		const props = getChangeInformation(node);
		return new TextAddition(
			props,
			...createChildComponentsFromNodes<TextAdditionChild>(
				this.children,
				evaluateXPathToNodes(`./${QNS.w}r`, node),
			),
		);
	}
}

registerComponent(TextAddition as unknown as ComponentDefinition);
