import type { AnyComponent, Component, ComponentDefinition } from '../classes/Component.ts';

const componentByName = new Map<string, ComponentDefinition>();

/**
 * Register a component in such a way that it can be found by its name later.
 *
 * This helps avoid circular dependencies in components that can be a descendant of themselves.
 * For example, Table --> Row --> Cell --> Table
 */
export function registerComponent(
	component: // deno-lint-ignore no-explicit-any
	| ComponentDefinition<Component<{ [key: string]: any }, any>>
		// deno-lint-ignore no-explicit-any
		| ComponentDefinition<Component<{ [key: string]: any }, never>>,
) {
	componentByName.set(component.name, component);
}

export function createChildComponentsFromNodes<T extends AnyComponent | string>(
	names: string[],
	nodes: Node[],
): T[] {
	const children = names
		.map((name) => componentByName.get(name))
		.filter((child): child is ComponentDefinition<Exclude<T, string>> => !!child);
	return nodes
		.map(
			(node) =>
				(node.nodeType === 3
					? node.nodeValue
					: children.find((Child) => Child.matchesNode(node))?.fromNode(node)) as T | undefined,
		)
		.filter((child): child is T => !!child);
}
