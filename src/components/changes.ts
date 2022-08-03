import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { Text } from './Text.ts';

export type TextDeletionChild = Text | TextDeletion | TextAddition;

export type TextChangeProps = {
	id: number;
	author: string;
	date: Date;
};

function textChangeFromNode(node: Node) {
	const props = evaluateXPathToMap(
		`
			map {
				"children": array { ./${QNS.w}r },
				"id": ./@${QNS.w}id/number(),
				"author": ./@${QNS.w}author/string(),
				"date": ./@${QNS.w}date/string()
			}
		`,
		node,
	);

	return {
		...props,
		date: new Date(props.date),
	} as TextChangeProps & { children: Node[] };
}

export class TextDeletion extends Component<TextChangeProps, TextDeletionChild> {
	public static readonly children: string[] = [Text.name, this.name, 'TextAddition'];
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
				children: super.toNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:del';
	}
	static fromNode(node: Node): TextDeletion {
		const { children, ...props } = textChangeFromNode(node);
		return new TextDeletion(
			props,
			...createChildComponentsFromNodes<TextDeletionChild>(this.children, children),
		);
	}
}

export type TextAdditionChild = Text | TextAddition | TextDeletion;

export class TextAddition extends Component<TextChangeProps, TextAdditionChild> {
	public static readonly children: string[] = [Text.name, this.name, TextDeletion.name];
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
				children: super.toNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:ins';
	}
	static fromNode(node: Node): TextAddition {
		const { children, ...props } = textChangeFromNode(node);
		return new TextAddition(
			props,
			...createChildComponentsFromNodes<TextDeletionChild>(this.children, children),
		);
	}
}

registerComponent(TextAddition as unknown as ComponentDefinition);
registerComponent(TextDeletion as unknown as ComponentDefinition);
