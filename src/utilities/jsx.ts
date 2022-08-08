import {
	Component,
	ComponentChild,
	ComponentDefinition,
	ComponentFunction,
	ComponentProps,
	isComponentDefinition,
} from '../classes/Component.ts';
import { Text } from '../components/Text.ts';

type QueuedComponent<C extends Component> = {
	component: ComponentComponentFunction<C> | ComponentDefinition<C>;
	props: ComponentProps<C>;
	children: ComponentChild<C>[];
};

type ComponentComponentFunction<C extends Component> = ComponentFunction<
	ComponentProps<C>,
	ComponentChild<C>
>;

export function JSX<C extends Component>(
	component: ComponentComponentFunction<C> | ComponentDefinition<C>,
	props: ComponentProps<C>,
	...children: Array<ComponentChild<C> | Array<ComponentChild<C>>>
): Array<C | ComponentChild<C> | ReturnType<ComponentComponentFunction<C>>> {
	return (
		children
			// Flatten the children, which may themselves have been wrapped in an array because they
			// contained invalid children:
			.reduce<ComponentChild<C>[]>(function flatten(flat, child): ComponentChild<C>[] {
				return Array.isArray(child) ? child.reduce(flatten, flat) : [...flat, child];
			}, [])
			// Add the node, if it is valid, or add the node split into pieces with the invalid children
			// vertically inserted between
			.reduce<Array<QueuedComponent<C> | ComponentChild<C>>>(
				(nodes, child) => {
					if (typeof child === 'string' && isComponentDefinition(component) && !component.mixed) {
						child = new Text({}, child) as ComponentChild<C>;
					}
					const isValid =
						!isComponentDefinition(component) ||
						(component.mixed && typeof child === 'string') ||
						component.children.includes(child.constructor.name);
					if (!isValid) {
						if (child.constructor === Text && component === Text) {
							Object.assign((child as Text).props, props);
						}
						nodes.push(child);
					} else {
						const lastQueuedItem = nodes[nodes.length - 1];
						if (typeof lastQueuedItem === 'string' || lastQueuedItem instanceof Component) {
							// Queue this item as a simple object, so that its children can be fucked with
							// in the next iteration.
							nodes.push({
								component,
								props,
								children: [child],
							});
						} else {
							lastQueuedItem.children.push(child);
						}
					}
					return nodes;
				},
				[{ component, props, children: [] }],
			)
			// Instantiate the "queued" items (props/children that haven't been instantiated yet so that
			// their children could be shuffled around).
			.map((node) => {
				if (typeof node === 'string') {
					return node;
				}
				if (node instanceof Component) {
					return node as ComponentChild<C>;
				}
				if (isComponentDefinition(component)) {
					return new component(node.props || {}, ...(node.children || []));
				} else {
					const x = component({ ...props, children: node.children || [] });
					return x;
				}
			})
			// Flatten again, no telling what came out of a ComponentFunction
			.reduce<Array<ReturnType<ComponentComponentFunction<C>> | ComponentChild<C>>>(
				(flat, thing) => (Array.isArray(thing) ? [...flat, ...thing] : [...flat, thing]),
				[],
			)
			.filter((node) => !(node.constructor === Text && !(node as Text).children.length))
	);
}

// @TODO this should give code intelligence, and currently it doesn't:
//JSX(Text, { });
