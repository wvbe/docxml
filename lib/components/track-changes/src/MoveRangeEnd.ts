// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import '../../document/src/Text.ts';

import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

export type MoveRangeEndChild = never;

export type MoveRangeEndProps = {
	id: number;
	type: 'from' | 'to';
};

/**
 * A type for indicating the end of a range of moved content.
 * In OOXML, these are self-closing tags.
 */
export class MoveRangeEnd extends Component<
	MoveRangeEndProps,
	MoveRangeEndChild
> {
	public static override readonly children: string[] = [];
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(): Node {
		return create(
			`
				switch ($type)
				case 'to' return 
				element ${QNS.w}moveToRangeEnd {
					attribute ${QNS.w}id { $id }
				}
				case 'from' return 
				element ${QNS.w}moveFromRangeEnd { 
					attribute ${QNS.w}id { $id }
				}
				default return ()
			`,
			{
				type: this.props.type,
				id: this.props.id,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return (
			node.nodeName === 'w:moveFromRangeEnd' ||
			node.nodeName === 'w:moveToRangeEnd'
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): MoveRangeEnd {
		const type = node.nodeName === 'w:moveFromRangeEnd' ? 'from' : 'to';
		const { id } = evaluateXPathToMap<{
			id: number;
		}>(
			`map { 
				"id": ./@${QNS.w}id/number()
			}`,
			node
		);
		return new MoveRangeEnd({
			type: type,
			id: id,
		});
	}
}

registerComponent(MoveRangeEnd);
