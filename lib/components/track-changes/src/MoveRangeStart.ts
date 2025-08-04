// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import '../../document/src/Text.ts';

import { Component } from '../../../classes/src/Component.ts';
import type { ChangeInformation } from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

export type MoveRangeStartProps = ChangeInformation & {
	name: string;
	type: 'from' | 'to';
};

export type MoveRangeStartChild = never;

/**
 * A type for indicating the start of a range of moved content.
 * In OOXML, these are self-closing tags.
 */
export class MoveRangeStart extends Component<
	MoveRangeStartProps,
	MoveRangeStartChild
> {
	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(): Node {
		return create(
			`	let $attrs := [
					attribute ${QNS.w}id { $id }, 
					if ($date) then attribute ${QNS.w}date { $date } else (),
					if ($author) then attribute ${QNS.w}author { $author } else (),
					attribute ${QNS.w}name { $name }
				]
				return (
					switch ($type)
					case 'to' return 
					element ${QNS.w}moveToRangeStart {
						$attrs
					}
					case 'from' return 
					element ${QNS.w}moveFromRangeStart {
						$attrs
					}
					default return ()
				)	
			`,
			{
				...this.props,
				author: this.props.author ? this.props.author : null,
				date: this.props.date ? this.props.date.toISOString() : null,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return (
			node.nodeName === 'w:moveFromRangeStart' ||
			node.nodeName === 'w:moveToRangeStart'
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): MoveRangeStart {
		const type = node.nodeName === 'w:moveFromRangeStart' ? 'from' : 'to';
		const { id, name, date, author } = evaluateXPathToMap<{
			id: number;
			name: string;
			date?: Date;
			author?: string;
		}>(
			`map { 
				"id": ./@${QNS.w}id/number(), 
				"name": ./@${QNS.w}name/string(),
				"date": ./@${QNS.w}date/string(),
				"author": ./@${QNS.w}author/string()
			}`,
			node
		);
		return new MoveRangeStart({
			type: type,
			id: id,
			name: name,
			date: date ? date : undefined,
			author: author ? author : undefined,
		});
	}
}

registerComponent(MoveRangeStart);
