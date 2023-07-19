// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Break.ts';
import './FieldRangeEnd.ts';
import './FieldRangeInstruction.ts';
import './FieldRangeSeparator.ts';
import './FieldRangeStart.ts';
import './Image.ts';
import './NonBreakingHyphen.ts';
import './Symbol.ts';
import './Tab.ts';

import { type ComponentAncestor, Component } from '../classes/Component.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../properties/text-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Break } from './Break.ts';
import { type FieldRangeEnd } from './FieldRangeEnd.ts';
import { type FieldRangeInstruction } from './FieldRangeInstruction.ts';
import { type FieldRangeSeparator } from './FieldRangeSeparator.ts';
import { type FieldRangeStart } from './FieldRangeStart.ts';
import { type Image } from './Image.ts';
import { type NonBreakingHyphen } from './NonBreakingHyphen.ts';
import { type Symbol } from './Symbol.ts';
import { type Tab } from './Tab.ts';
import { TextDeletion } from './TextDeletion.ts';

/**
 * A type describing the components accepted as children of {@link Text}.
 */
export type TextChild =
	| string
	| Break
	| FieldRangeEnd
	| FieldRangeInstruction
	| FieldRangeSeparator
	| FieldRangeStart
	| Image
	| NonBreakingHyphen
	// eslint-disable-next-line @typescript-eslint/ban-types
	| Symbol
	| Tab;

/**
 * A type describing the props accepted by {@link Text}.
 */
export type TextProps = TextProperties;

/**
 * A component that represents text. All inline formatting options, such as bold/italic/underline,
 * are in fact different props or styles on the `<Text>` component.
 */
export class Text extends Component<TextProps, TextChild> {
	public static readonly children: string[] = [
		'Break',
		'FieldRangeEnd',
		'FieldRangeInstruction',
		'FieldRangeSeparator',
		'FieldRangeStart',
		'Image',
		'NonBreakingHyphen',
		'Symbol',
		'Tab',
	];
	public static readonly mixed: boolean = true;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const asTextDeletion = ancestry.some((ancestor) => ancestor instanceof TextDeletion);
		const anc = [this, ...ancestry];
		return create(
			`
				element ${QNS.w}r {
					$rpr,
					$children
				}
			`,
			{
				rpr: textPropertiesToNode(this.props),
				children: await Promise.all(
					this.children.map((child) => {
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
				),
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:r';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): Text {
		const { children, rpr } = evaluateXPathToMap<{ rpr: Node; children: Node[] }>(
			`
				map {
					"rpr": ./${QNS.w}rPr,
					"children": array{
						./(
							${QNS.w}br,
							${QNS.w}tab,
							${QNS.w}drawing,
							${QNS.w}t/text(),
							${QNS.w}delText/text(),
							${QNS.w}fldChar,
							${QNS.w}instrText
						)
					}
				}
			`,
			node,
		);
		return new Text(
			textPropertiesFromNode(rpr),
			...createChildComponentsFromNodes<TextChild>(this.children, children),
		);
	}
}

registerComponent(Text);
