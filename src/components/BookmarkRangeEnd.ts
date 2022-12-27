import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link BookmarkRangeEnd}.
 */
export type BookmarkRangeEndChild = never;

/**
 * A type describing the props accepted by {@link BookmarkRangeEnd}.
 */
export type BookmarkRangeEndProps = {
	id: number;
};

/**
 * The end of a range associated with a comment.
 */
export class BookmarkRangeEnd extends Component<BookmarkRangeEndProps, BookmarkRangeEndChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`element ${QNS.w}bookmarkEnd {
				attribute ${QNS.w}id { $id }
			}`,
			{
				id: this.props.id,
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:bookmarkEnd';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): BookmarkRangeEnd {
		return new BookmarkRangeEnd(
			evaluateXPathToMap(
				`map {
					"id": ./@${QNS.w}id/number()
				}`,
				node,
			) as BookmarkRangeEndProps,
		);
	}
}

registerComponent(BookmarkRangeEnd);
