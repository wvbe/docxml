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
import type { TextAddition } from './TextAddition.ts';

export type TextDeletionChild = Text | TextDeletion | TextAddition;

export type TextDeletionProps = ChangeInformation;

export class TextDeletion extends Component<TextDeletionProps, TextDeletionChild> {
	public static readonly children: string[] = [
		'Text',
		'TextAddition',
		// Sometimes deletions nested into themselves work well? At other times, they don't.
		// For safety, keep it disabled now (or put it behind a flag possibly)
		// 'TextDeletion',
	];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]): Node {
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
				children: this.childrenToNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:del';
	}

	static fromNode(node: Node): TextDeletion {
		const props = getChangeInformation(node);
		return new TextDeletion(
			props,
			...createChildComponentsFromNodes<TextDeletionChild>(
				this.children,
				evaluateXPathToNodes(`./${QNS.w}r`, node),
			),
		);
	}
}
registerComponent(TextDeletion as unknown as ComponentDefinition);
