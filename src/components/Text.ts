import { Component, ComponentAncestor } from '../classes/Component.ts';
import {
	TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../properties/text-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { Break } from './Break.ts';
import { TextDeletion } from './changes.ts';
import { Image } from './Image.ts';

export type TextProps = TextProperties;

export type TextChild = string | Break | Image;

/**
 * Text run
 *
 * http://officeopenxml.com/WPtext.php
 */
export class Text extends Component<TextProps, TextChild> {
	public static readonly children: string[] = ['Break', 'Image'];
	public static readonly mixed: boolean = true;

	public toNode(ancestry: ComponentAncestor[]): Node {
		const asTextDeletion = ancestry.some((ancestor) => ancestor instanceof TextDeletion);
		const anc = [this, ...ancestry];
		return create(
			`
				element ${QNS.w}r {
					$rpr,
					for $child in $children
						return $child
				}
			`,
			{
				rpr: textPropertiesToNode(this.props),
				children: this.children.map((child) => {
					if (typeof child === 'string') {
						return create(
							`element ${QNS.w}${asTextDeletion ? 'delText' : 't'} {
								attribute xml:space { "preserve" },
								$text
							}`,
							{
								text: child,
							},
						);
					}
					return child.toNode(anc);
				}),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:r';
	}

	static fromNode(node: Node): Text {
		const { children, rpr } = evaluateXPathToMap(
			`
				map {
					"rpr": ./${QNS.w}rPr,
					"children": array{
						./(
							${QNS.w}br,
							${QNS.w}t/text(),
							${QNS.w}delText/text()
						)
					}
				}
			`,
			node,
		) as { rpr: Node; children: Node[] };
		return new Text(
			textPropertiesFromNode(rpr),
			...createChildComponentsFromNodes<TextChild>(this.children, children),
		);
	}
}
registerComponent(Text);
