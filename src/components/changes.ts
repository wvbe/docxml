import { XmlComponent } from '../classes/XmlComponent.ts';
import { create, QNS } from '../util/dom.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { castNodesToComponents } from './index.ts';
import { Text } from './Text.ts';

export type TextChangeChild = Text;

export type TextChangeProps = {
	id: number;
	author: string;
	date: Date;
};

function fromNode(node: Node) {
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
	public static children = [Text];
	public static mixed = false;

	public toNode(): Node {
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
				children: this.children.map((child) => child.toNode(true)),
			},
		);
	}

	static fromNode(node: Node): TextDeletion {
		const { children, ...props } = fromNode(node);
		return new TextDeletion(props, ...castNodesToComponents<TextChangeChild>(children));
	}
}

export class TextAddition extends XmlComponent<TextChangeProps, TextChangeChild> {
	public static children = [Text];
	public static mixed = false;

	public toNode(): Node {
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
				children: this.children.map((child) => child.toNode()),
			},
		);
	}

	static fromNode(node: Node): TextAddition {
		const { children, ...props } = fromNode(node);
		return new TextAddition(props, ...castNodesToComponents<TextChangeChild>(children));
	}
}
