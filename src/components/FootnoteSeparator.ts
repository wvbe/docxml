import { Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';

/**
 * A component that represents a footnote separator.
 */
export class FootnoteSeparator extends Component<Record<string, never>> {
	public override toNode(): Node {
		return create(`element ${QNS.w}separator {}`, {});
	}

	static override fromNode(_: Node): FootnoteSeparator {
		return new FootnoteSeparator({});
	}
}

registerComponent(FootnoteSeparator);
