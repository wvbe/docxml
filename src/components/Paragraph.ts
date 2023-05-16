// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
//
// Add items to this list that would otherwise only be depended on as a type definition.
import './BookmarkRangeEnd.ts';
import './BookmarkRangeStart.ts';
import './Comment.ts';
import './CommentRangeEnd.ts';
import './CommentRangeStart.ts';
import './Field.ts';
import './Hyperlink.ts';
import './Text.ts';
import './TextAddition.ts';
import './TextDeletion.ts';

import { type Hyperlink } from '../../mod.ts';
import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { type ParagraphProperties } from '../properties/paragraph-properties.ts';
import {
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../properties/paragraph-properties.ts';
import { type SectionProperties } from '../properties/section-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import { type BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { type Comment } from './Comment.ts';
import { type CommentRangeEnd } from './CommentRangeEnd.ts';
import { type CommentRangeStart } from './CommentRangeStart.ts';
import { type Field } from './Field.ts';
import { type Text } from './Text.ts';
import { type TextAddition } from './TextAddition.ts';
import { type TextDeletion } from './TextDeletion.ts';

/**
 * A type describing the components accepted as children of {@link Paragraph}.
 */
export type ParagraphChild =
	| Text
	| TextAddition
	| TextDeletion
	| CommentRangeStart
	| CommentRangeEnd
	| Comment
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| Hyperlink
	| Field;

/**
 * A type describing the props accepted by {@link Paragraph}.
 *
 * The "style" option, which is part of both paragraph- and text properties, is always
 * set to the _paragraph_ style -- the _text_ style is ignored.
 */
export type ParagraphProps = ParagraphProperties;

/**
 * A component that represents a paragraph in your DOCX document, which is one of the most
 * widely used components and the most likely to contain a style rule or other.
 *
 * A paragraph is a block-level element and contains text and inlines, see also {@link Text}.
 */
export class Paragraph extends Component<ParagraphProps, ParagraphChild> {
	public static readonly children: string[] = [
		'BookmarkRangeEnd',
		'BookmarkRangeStart',
		'Comment',
		'CommentRangeEnd',
		'CommentRangeStart',
		'Hyperlink',
		'Text',
		'TextAddition',
		'TextDeletion',
		'Field',
	];
	public static readonly mixed: boolean = false;
	#sectionProperties: SectionProperties | null = null;

	/**
	 * Set properties to the section that this paragraph is supposed to represent. Not intended to be
	 * called manually. Only here because OOXML somehow decided that a section is defined in the last
	 * paragraph of it, rather than as an element of its own.
	 */
	public setSectionProperties(properties?: SectionProperties | null) {
		this.#sectionProperties = properties || null;
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}p {
					$pPr,
					for $child in $children
						return $child
				}
			`,
			{
				pPr: paragraphPropertiesToNode(this.props, this.#sectionProperties),
				children: await this.childrenToNode(ancestry),
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:p';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): Paragraph {
		const { children, ppr, ...props } = evaluateXPathToMap<{
			ppr: Node;
			children: Node[];
			style?: string;
		}>(
			`
				map {
					"ppr": ./${QNS.w}pPr,
					"style": ./${QNS.w}pPr/${QNS.w}pStyle/@${QNS.w}val/string(),
					"children": array{ ./(
						${QNS.w}r |
						${QNS.w}hyperlink |
						${QNS.w}fldSimple |
						${QNS.w}del |
						${QNS.w}ins |
						${QNS.w}commentRangeStart |
						${QNS.w}commentRangeEnd |
						${QNS.w}bookmarkStart |
						${QNS.w}bookmarkEnd
					) }
				}
			`,
			node,
		);

		return new Paragraph(
			{
				...paragraphPropertiesFromNode(ppr),
				...props,
			},
			...createChildComponentsFromNodes<ParagraphChild>(this.children, children),
		);
	}
}

registerComponent(Paragraph);
