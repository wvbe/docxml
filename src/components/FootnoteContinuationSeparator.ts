import { Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';

/**
 * A component that represents a footnote continuation separator.
 */
export class FootnoteContinuationSeparator extends Component<
	Record<string, never>
> {
	public override toNode(): Node {
		return create(`element ${QNS.w}continuationSeparator {}`, {});
	}

	static override fromNode(_: Node): FootnoteContinuationSeparator {
		return new FootnoteContinuationSeparator({});
	}
}

registerComponent(FootnoteContinuationSeparator);
