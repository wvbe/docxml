import { AnyXmlComponent, XmlComponent } from '../classes/XmlComponent.ts';
import { Rpr, RprI } from '../shared/rpr.ts';
import { createChildComponentsFromNodes, registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Break } from './Break.ts';
import { TextDeletion } from './changes.ts';

export type TextProps = RprI;

export type TextChild = string | Break;

/**
 * Text run
 *
 * http://officeopenxml.com/WPtext.php
 */
export class Text extends XmlComponent<TextProps, TextChild> {
	public static readonly children: string[] = [Break.name];
	public static readonly mixed: boolean = true;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
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
				rpr: Rpr.toNode(this.props),
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
			Rpr.fromNode(rpr),
			...createChildComponentsFromNodes<TextChild>(this.children, children),
		);
	}
}
registerComponent(Text);
