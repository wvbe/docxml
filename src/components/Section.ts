// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Paragraph.ts';
import './Table.ts';

import {
	type ComponentAncestor,
	type ComponentDefinition,
	AnyComponent,
	Component,
	ComponentNodes,
	isComponentDefinition,
} from '../classes/Component.ts';
import {
	SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from '../properties/section-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import { type BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { Paragraph } from './Paragraph.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Section}.
 */
export type SectionChild = Paragraph | Table | BookmarkRangeStart | BookmarkRangeEnd;

export const sectionChildComponentNames = [
	'Table',
	'Paragraph',
	'BookmarkRangeStart',
	'BookmarkRangeEnd',
];

/**
 * A type describing the props accepted by {@link Section}.
 */
export type SectionProps = SectionProperties;

/**
 * A component that represents a DOCX section, which could have its own page sizing options and so
 * on.
 *
 * In normal OOXML this information belongs at either the end of the document, or inside the
 * formatting options of the last paragraph belonging to that section. This component will smooth
 * that over in such a way that you can simply put `<Paragraph>` (etc.) inside `<Section>`.
 */
export class Section extends Component<SectionProps, SectionChild> {
	public static readonly children: string[] = sectionChildComponentNames;
	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<ComponentNodes> {
		const parent = ancestry[0];
		if (!parent) {
			throw new Error(`Cannot serialize a section without parent context.`);
		}
		const siblings = isComponentDefinition(parent)
			? (parent as AnyComponent).children
			: await parent.children;
		const isLastSection = siblings[siblings.length - 1] === this;

		if (isLastSection) {
			return [...(await this.childrenToNode(ancestry)), sectionPropertiesToNode(this.props)];
		}

		const lastChild = this.children[this.children.length - 1];
		if (lastChild instanceof Paragraph) {
			lastChild.setSectionProperties(this.props);
		} else {
			const paragraph = new Paragraph({});
			paragraph.setSectionProperties(this.props);
			this.children.push(paragraph);
		}
		const nodes = await this.childrenToNode(ancestry);
		return nodes;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:sectPr';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): Section {
		const { children } = evaluateXPathToMap<{ children: Node[] }>(
			`
				map {
					"children": array{
						if (parent::${QNS.w}body) then (
							./preceding-sibling::${QNS.w}*[
								not(./${QNS.w}pPr/${QNS.w}sectPr) and
								not(following-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr])
							]
						) else (
							let $nth := count(../../preceding-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr])
							return (
								../../preceding-sibling::${QNS.w}*[
									count(preceding-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr]) = $nth
								],
								../..
							)
						)
					}
				}
			`,
			node,
		);

		return new Section(
			sectionPropertiesFromNode(node),
			...createChildComponentsFromNodes<SectionChild>(this.children, children),
		);
	}
}

registerComponent(Section as unknown as ComponentDefinition);
