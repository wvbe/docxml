// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import type {
	BookmarkRangeEnd,
	BookmarkRangeStart,
	CommentRangeEnd,
	CommentRangeStart,
	MoveRangeEnd,
	MoveRangeStart,
	Text,
	TextAddition,
	TextDeletion,
} from '../../../../mod.ts';
import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import type { ChangeInformation } from '../../../utilities/src/changes.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import '../../document/src/Text.ts';

/**
 * A type specifying the children of {@link Move}.
 */
export type MoveChild =
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| CommentRangeStart
	| CommentRangeEnd
	| TextAddition
	| TextDeletion
	| Text
	| Move
	| MoveRangeStart
	| MoveRangeEnd;

/**
 * A type describing the props accepted by {@link Move}.
 */
export type MoveProps = ChangeInformation & { type: 'to' | 'from' };

/**
 * A component that represents a change-tracked text or paragraph that was moved.
 *
 * If a `Move` is present outside the text-properties, then paragraphs appear as a insertion in Word.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EE3IW.html#topic_ID0EE3IW
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EXMJW.html
 */
export class Move extends Component<MoveProps, MoveChild> {
	public static override readonly children: string[] = [
		'BookmarkRangeEnd',
		'BookmarkRangeStart',
		'CommentRangeStart',
		'CommentRangeEnd',
		'TextAddition',
		'TextDeletion',
		'Text',
		'Move',
		'MoveRangeStart',
		'MoveRangeEnd',
	];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				let $attrs := [
					attribute ${QNS.w}id { $id }, 
					attribute ${QNS.w}date { $date }, 
					attribute ${QNS.w}author { $author }
				]
				let $moveType := 
					switch ($type)
					case 'to' return element ${QNS.w}moveTo { $attrs, $children } 
					case 'from' return element ${QNS.w}moveFrom { $attrs, $children } 
					default return () 
				return $moveType
			`,
			{
				...this.props,
				date: new Date(this.props.date).toISOString(),
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:moveFrom' || node.nodeName === 'w:moveTo';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Move {
		const { children, changeProps } = evaluateXPathToMap<{
			children: Node[];
			changeProps: MoveProps;
		}>(
			`map { 
				"children": array{./(
					${QNS.w}r |
					${QNS.w}del |
					${QNS.w}ins |
					${QNS.w}commentRangeStart |
					${QNS.w}commentRangeEnd |
					${QNS.w}bookmarkStart |
					${QNS.w}bookmarkEnd | 
					${QNS.w}moveTo | 
					${QNS.w}moveFrom | 
					${QNS.w}moveToRangeStart | 
					${QNS.w}moveToRangeEnd | 
					${QNS.w}moveFromRangeStart | 
					${QNS.w}moveFromRangeEnd
				)}, 
				"changeProps": map { 
					"id": @${QNS.w}id/number(),
					"author": @${QNS.w}author/string(),
					"date": @${QNS.w}date/string(),
					"type": if ($nodeName eq 'moveTo') then 'to' else 'from'
				}
			}`,
			node,
			null,
			{ nodeName: (node as Element).localName }
		);
		return new Move(
			{
				...changeProps,
				date: new Date(changeProps.date),
			},
			...createChildComponentsFromNodes<MoveChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Move);
