import type { ComponentAncestor } from '../classes/Component.ts';
import { Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Break}.
 */
export type BreakChild = never;

/**
 * A type describing the props accepted by {@link Break}.
 */
export type BreakProps = {
	type?: 'page' | 'column' | 'textWrapping' | null;
	clear?: 'left' | 'right' | 'all' | 'none' | null;
};

/**
 * A component that represents a line break, page break or section break in a DOCX document. Place
 * this in one of the `<Text>`, `<TextAddition>` or `<TextDeletion>` components.
 */
export class Break extends Component<BreakProps, BreakChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}br {
					if (exists($type)) then attribute ${QNS.w}type { $type } else (),
					if (exists($clear)) then attribute ${QNS.w}clear { $clear } else ()
				}
			`,
			{
				type: this.props.type || null,
				clear: this.props.clear || null,
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:br';
	}

	static fromNode(node: Node): Break {
		return new Break(
			evaluateXPathToMap(
				`
					map {
						"type": ./@${QNS.w}type/string(),
						"clear": ./@${QNS.w}clear/string()
					}
				`,
				node,
			),
		);
	}
}

registerComponent(Break);
