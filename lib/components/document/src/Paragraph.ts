// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
//
// Add items to this list that would otherwise only be depended on as a type definition.
import '../../comments/src/Comment.ts';
import '../../comments/src/CommentRangeEnd.ts';
import '../../comments/src/CommentRangeStart.ts';
import '../../document/src/Text.ts';
import '../../track-changes/src/TextAddition.ts';
import '../../track-changes/src/TextDeletion.ts';
import './BookmarkRangeEnd.ts';
import './BookmarkRangeStart.ts';
import './Field.ts';
import './Hyperlink.ts';

import type { Hyperlink } from '../../../../mod.ts';
import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../../../properties/src/paragraph-properties.ts';
import type { SectionProperties } from '../../../properties/src/section-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { hex, type Id } from '../../../utilities/src/id.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { Comment } from '../../comments/src/Comment.ts';
import type { CommentRangeEnd } from '../../comments/src/CommentRangeEnd.ts';
import type { CommentRangeStart } from '../../comments/src/CommentRangeStart.ts';
import type { Text } from '../../document/src/Text.ts';
import type { Move } from '../../track-changes/src/Move.ts';
import type { TextAddition } from '../../track-changes/src/TextAddition.ts';
import type { TextDeletion } from '../../track-changes/src/TextDeletion.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import type { Field } from './Field.ts';
import type { FootnoteAnchor } from './FootnoteAnchor.ts';
import type { FootnoteReference } from './FootnoteReference.ts';

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
	| Field
	| FootnoteReference
	| Move
	| FootnoteAnchor;

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
		'FootnoteReference',
		'FootnoteAnchor',
		'Move',
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
				pPr: await paragraphPropertiesToNode(
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
						${QNS.w}bookmarkEnd | 
						${QNS.w}moveTo | 
						${QNS.w}moveFrom 
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
