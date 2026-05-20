import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A type describing the components accepted as children of {@link FootnoteContinuationSeparator}.
 */
export type FootnoteContinuationSeparatorChild = never;

/**
 * A type describing the props accepted by {@link FootnoteContinuationSeparator}.
 */
export type FootnoteContinuationSeparatorProps = Record<string, never>;

/**
 * A component that represents a footnote continuation separator.
 */
export class FootnoteContinuationSeparator extends Component<
	FootnoteContinuationSeparatorProps,
	FootnoteContinuationSeparatorChild
> {
	public override toNode(): Node {
		return create(`element ${QNS.w}continuationSeparator {}`, {});
	}

	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:continuationSeparator';
	}

	static override fromNode(_: Node): FootnoteContinuationSeparator {
		return new FootnoteContinuationSeparator({});
	}
}

registerComponent(FootnoteContinuationSeparator);
