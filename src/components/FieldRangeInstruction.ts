import { type ComponentAncestor, Component, ComponentContext } from '../classes/Component.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToBoolean, evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link FieldRangeInstruction}.
 */
export type FieldRangeInstructionChild = string;

/**
 * A type describing the props accepted by {@link FieldRangeInstruction}.
 */
export type FieldRangeInstructionProps = { [key: string]: never };

/**
 * An instruction in a complex field.
 */
export class FieldRangeInstruction extends Component<
	FieldRangeInstructionProps,
	FieldRangeInstructionChild
> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = true;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}instrText {
					$children
				}
			`,
			{
				children: await this.childrenToNode(ancestry),
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean('self::w:instrText', node);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node, context: ComponentContext): FieldRangeInstruction {
		const { children } = evaluateXPathToMap<{ rpr: Node; children: Node[] }>(
			`
				map {
					"children": array{
						./text()
					}
				}
			`,
			node,
		);
		return new FieldRangeInstruction(
			{},
			...createChildComponentsFromNodes<FieldRangeInstructionChild>(
				this.children,
				children,
				context,
			),
		);
	}
}

registerComponent(FieldRangeInstruction);
