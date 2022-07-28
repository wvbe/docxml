import type {
	AnyXmlComponent,
	XmlComponent,
	XmlComponentClassDefinition,
} from '../classes/XmlComponent.ts';

const componentByName = new Map<string, XmlComponentClassDefinition>();

/**
 * Register a component in such a way that it can be found by its name later.
 *
 * This helps avoid circular dependencies in components that can be a descendant of themselves.
 * For example, Table --> Row --> Cell --> Table
 */
export function registerComponent(
	Component: // deno-lint-ignore no-explicit-any
	| XmlComponentClassDefinition<XmlComponent<{ [key: string]: any }, any>>
		// deno-lint-ignore no-explicit-any
		| XmlComponentClassDefinition<XmlComponent<{ [key: string]: any }, never>>,
) {
	componentByName.set(Component.name, Component);
}

export function createChildComponentsFromNodes<T extends AnyXmlComponent | string>(
	names: string[],
	nodes: Node[],
): T[] {
	const children = names
		.map((name) => componentByName.get(name))
		.filter((child): child is XmlComponentClassDefinition<Exclude<T, string>> => !!child);
	return nodes
		.map(
			(node) =>
				(node.nodeType === 3
					? node.nodeValue
					: children.find((Child) => Child.matchesNode(node))?.fromNode(node)) as T | undefined,
		)
		.filter((child): child is T => !!child);
}
