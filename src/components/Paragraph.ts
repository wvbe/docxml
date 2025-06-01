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

import type { Hyperlink } from '../../mod.ts';
import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../classes/Component.ts';
import type { ParagraphProperties } from '../properties/paragraph-properties.ts';
import {
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../properties/paragraph-properties.ts';
import type { SectionProperties } from '../properties/section-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { hex, type Id } from '../utilities/id.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import type { Comment } from './Comment.ts';
import type { CommentRangeEnd } from './CommentRangeEnd.ts';
import type { CommentRangeStart } from './CommentRangeStart.ts';
import type { Field } from './Field.ts';
import type { Text } from './Text.ts';
import type { TextAddition } from './TextAddition.ts';
import type { TextDeletion } from './TextDeletion.ts';

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
	public static override readonly children: string[] = [
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
	public static override readonly mixed: boolean = false;
	#sectionProperties: SectionProperties | null = null;

	// For regular paragraphs this identifier is not required.
	// It is when comments have replies. These "links" (X comment is a reply of Y comment)
	// are handled via this identifier.
	#id: Id | null = null;

	/**
	 * Set properties to the section that this paragraph is supposed to represent. Not intended to be
	 * called manually. Only here because OOXML somehow decided that a section is defined in the last
	 * paragraph of it, rather than as an element of its own.
	 */
	public setSectionProperties(properties?: SectionProperties | null) {
		this.#sectionProperties = properties || null;
	}

	/**
	 * Set the identifier (@w:paraId attribute) of this paragraph.
	 * This identifier is used by comment replies.
	 */
	public set id(id: Id) {
		this.#id = id;
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		/**
		 * For some reason, MSWord requires the paraId attribute to have the w14 namespace, and at the
		 * same time requires the w15 namespace in the commentsExtended.xml file for the same attribute
		 * 🤡
		 */
		return create(
			`
				element ${QNS.w}p {
					if ($id) then attribute ${QNS.w14}paraId { $id } else (),
					$pPr,
					$children
				}
			`,
			{
				id: this.#id?.hex || null,
				pPr: paragraphPropertiesToNode(
					this.props,
					this.#sectionProperties
				),
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:p';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Paragraph {
		const { children, ppr, id, ...props } = evaluateXPathToMap<{
			ppr: Node;
			children: Node[];
			id?: string;
			style?: string;
		}>(
			`
				map {
					"id": @${QNS.w14}paraId/string(),
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
			node
		);

		const paragraph = new Paragraph(
			{
				...paragraphPropertiesFromNode(ppr),
				...props,
			},
			...createChildComponentsFromNodes<ParagraphChild>(
				this.children,
				children,
				context
			)
		);

		if (id) {
			paragraph.id = hex(id);
		}

		return paragraph;
	}
}

registerComponent(Paragraph);
