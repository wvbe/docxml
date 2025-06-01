import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { DocumentXml } from '../files/DocumentXml.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { type Id, int } from '../utilities/id.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Comment}.
 */
export type CommentChild = never;

/**
 * A type describing the props accepted by {@link Comment}.
 */
export type CommentProps = {
	id: Id;
};

/**
 * The start of a range associated with a comment.
 */
export class Comment extends Component<CommentProps, CommentChild> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(ancestry: ComponentAncestor[]): Node {
		const doc = ancestry.find(
			(ancestor): ancestor is DocumentXml =>
				ancestor instanceof DocumentXml
		);
		if (!doc || !doc.comments.has(this.props.id.int)) {
			throw new Error(`Comment "${this.props.id.int}" does not exist`);
		}
		return create(
			`
				element ${QNS.w}r {
					element ${QNS.w}rPr {
						element ${QNS.w}rStyle {
							attribute ${QNS.w}val { "CommentReference" }
						}
					},
					element ${QNS.w}commentReference {
						attribute ${QNS.w}id { $id }
					}
				}
			`,
			{
				id: this.props.id.int,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:commentRangeStart';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): Comment {
		const { id } = evaluateXPathToMap<{ id: number }>(
			`
					map {
						"id": ./@${QNS.w}id/number()
					}
				`,
			node
		);
		return new Comment({ id: int(id) });
	}
}

registerComponent(Comment);
