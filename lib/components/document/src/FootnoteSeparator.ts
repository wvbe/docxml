import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A type describing the components accepted as children of {@link FootnoteSeparator}.
 */
export type FootnoteSeparatorChild = never;

/**
 * A type describing the props accepted by {@link FootnoteSeparator}.
 */
export type FootnoteSeparatorProps = Record<string, never>;

/**
 * A component that represents a footnote separator.
 */
export class FootnoteSeparator extends Component<
	FootnoteSeparatorProps,
	FootnoteSeparatorChild
> {
	public override toNode(): Node {
		return create(`element ${QNS.w}separator {}`, {});
	}

	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:separator';
	}

	static override fromNode(_: Node): FootnoteSeparator {
		return new FootnoteSeparator({});
	}
}

registerComponent(FootnoteSeparator);
