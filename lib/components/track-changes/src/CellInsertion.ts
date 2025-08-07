import { Component } from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/** Props = the standard change-tracking triplet { id, author, date } */
export type CellInsertionProps = ChangeInformation;

/** <cellIns> – table-cell insertion (no children allowed) */
export class CellInsertion extends Component<CellInsertionProps, never> {
	public static override readonly children: string[] = [];
	public static override readonly mixed = false;

	/* SERIALISE */
	public override toNode(): Node {
		return create(
			`
      let $attrs := [
        attribute ${QNS.w}id { $id },
        if ($author) then attribute ${QNS.w}author { $author } else (),
        if ($date) then attribute ${QNS.w}date { $date } else ()
      ]
      return element ${QNS.w}cellIns { $attrs }
      `,
			{
				...this.props,
				date: this.props.date?.toISOString() ?? null,
				author: this.props.author ?? null,
			}
		);
	}

	/* PARSE */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:cellIns';
	}
	static override fromNode(node: Node): CellInsertion {
		return new CellInsertion(getChangeInformation(node));
	}
}
registerComponent(CellInsertion);
