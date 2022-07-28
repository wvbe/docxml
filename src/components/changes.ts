import {
	AnyXmlComponent,
	XmlComponent,
	XmlComponentClassDefinition,
} from '../classes/XmlComponent.ts';
import { createChildComponentsFromNodes, registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Text } from './Text.ts';

export type TextChangeChild = Text;

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

export class TextDeletion extends XmlComponent<TextChangeProps, TextChangeChild> {
	public static readonly children: string[] = [Text.name];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
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
			...createChildComponentsFromNodes<TextChangeChild>(this.children, children),
		);
	}
}

export class TextAddition extends XmlComponent<TextChangeProps, TextChangeChild> {
	public static readonly children: string[] = [Text.name];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
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
			...createChildComponentsFromNodes<TextChangeChild>(this.children, children),
		);
	}
}

registerComponent(TextAddition as unknown as XmlComponentClassDefinition);
registerComponent(TextDeletion as unknown as XmlComponentClassDefinition);
