import { type Bookmark } from '../classes/Bookmarks.ts';
import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link BookmarkRangeStart}.
 */
export type BookmarkRangeStartChild = never;

/**
 * A type describing the props accepted by {@link BookmarkRangeStart}.
 */
export type BookmarkRangeStartProps =
	| {
			bookmark: Bookmark;
			id?: never;
			name?: never;
	  }
	// Deprecate this way:
	| {
			bookmark?: never;
			id: number;
			name: string;
	  };

/**
 * The start of a range associated with a comment.
 */
export class BookmarkRangeStart extends Component<
	BookmarkRangeStartProps,
	BookmarkRangeStartChild
> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`element ${QNS.w}bookmarkStart {
				attribute ${QNS.w}id { $id },
				attribute ${QNS.w}name { $name }
			}`,
			this.props.bookmark || {
				id: this.props.id,
				name: this.props.name,
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:bookmarkStart';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): BookmarkRangeStart {
		return new BookmarkRangeStart(
			evaluateXPathToMap<BookmarkRangeStartProps>(
				`map {
					"id": ./@${QNS.w}id/number(),
					"name": ./@${QNS.w}name/string()
				}`,
				node,
			),
		);
	}
}

registerComponent(BookmarkRangeStart);
