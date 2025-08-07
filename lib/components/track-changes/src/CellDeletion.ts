import { Component } from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

export type CellDeletionProps = ChangeInformation;

/** <cellDel> – table-cell deletion (no children allowed) */
export class CellDeletion extends Component<CellDeletionProps, never> {
	public static override readonly children: string[] = [];
	public static override readonly mixed = false;

	public override toNode(): Node {
		return create(
			`
      let $attrs := [
        attribute ${QNS.w}id { $id },
        if ($author) then attribute ${QNS.w}author { $author } else (),
        if ($date) then attribute ${QNS.w}date { $date } else ()
      ]
      return element ${QNS.w}cellDel { $attrs }
      `,
			{
				...this.props,
				date: this.props.date?.toISOString() ?? null,
				author: this.props.author ?? null,
			}
		);
	}

	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:cellDel';
	}
	static override fromNode(node: Node): CellDeletion {
		return new CellDeletion(getChangeInformation(node));
	}
}
registerComponent(CellDeletion);
