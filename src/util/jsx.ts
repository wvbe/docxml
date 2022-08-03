import {
	XmlComponent,
	XmlComponentChild,
	XmlComponentClassDefinition,
	XmlComponentProps,
} from '../classes/XmlComponent.ts';
import { Text } from '../components/Text.ts';

type QueuedComponent<C extends XmlComponent> = {
	Component: XmlComponentClassDefinition<C>;
	props: XmlComponentProps<C>;
	children: XmlComponentChild<C>[];
};

// export function JSX<C extends XmlComponent>(
// 	Component: XmlComponentClassDefinition<C>,
// 	props: XmlComponentProps<C>,
// 	...children: XmlComponentChild<C>[]
// ): C {
// 	return new Component(props, ...children);
// }

export function JSX<C extends XmlComponent>(
	Component: XmlComponentClassDefinition<C>,
	props: XmlComponentProps<C>,
	...children: Array<XmlComponentChild<C> | Array<XmlComponentChild<C>>>
): Array<C | XmlComponentChild<C>> {
	return (
		children
			// Flatten the children, which may themselves have been wrapped in an array because they
			// contained invalid children:
			.reduce<XmlComponentChild<C>[]>(function flatten(flat, child): XmlComponentChild<C>[] {
				return Array.isArray(child) ? child.reduce(flatten, flat) : [...flat, child];
			}, [])
			// Add the node, if it is valid, or add the node split into pieces with the invalid children
			// vertically inserted between
			.reduce<Array<QueuedComponent<C> | XmlComponentChild<C>>>(
				(nodes, child) => {
					if (typeof child === 'string' && !Component.mixed) {
						child = new Text({}, child) as XmlComponentChild<C>;
					}
					const isValid =
						(Component.mixed && typeof child === 'string') ||
						Component.children.includes(child.constructor.name);
					if (!isValid) {
						if (child.constructor === Text && Component === Text) {
							Object.assign((child as Text).props, props);
						}
						nodes.push(child);
					} else {
						const lastQueuedItem = nodes[nodes.length - 1];
						if (typeof lastQueuedItem === 'string' || lastQueuedItem instanceof XmlComponent) {
							// Queue this item as a simple object, so that its children can be fucked with
							// in the next iteration.
							nodes.push({
								Component,
								props,
								children: [child],
							});
						} else {
							lastQueuedItem.children.push(child);
						}
					}
					return nodes;
				},
				[{ Component, props, children: [] }],
			)
			// Instantiate the "queued" items (props/children that haven't been instantiated yet so that
			// their children could be shuffled around).
			.map((node) => {
				if (typeof node === 'string') {
					return node;
				}
				if (node instanceof XmlComponent) {
					return node as XmlComponentChild<C>;
				}
				return new Component(node.props || {}, ...(node.children || []));
			})
			.filter((node) => !(node.constructor === Text && !(node as Text).children.length))
	);
}

// @TODO this should give code intelligence, and currently it doesn't:
//JSX(Text, { });
