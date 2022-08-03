import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import {
	SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from '../properties/section-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { Paragraph } from './Paragraph.ts';
import type { Table } from './Table.ts';

export type SectionChild = Paragraph | Table;

export type SectionProps = SectionProperties;

export class Section extends Component<SectionProps, SectionChild> {
	public static readonly children: string[] = ['Paragraph', 'Table'];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]) {
		const parent = ancestry[0];
		if (!parent) {
			throw new Error(`Cannot serialize a section without parent context.`);
		}
		const isLastSection = parent.children[parent.children.length - 1] === this;

		if (isLastSection) {
			return [...this.childrenToNode(ancestry), sectionPropertiesToNode(this.props)];
		}

		const lastChild = this.children[this.children.length - 1];
		if (lastChild instanceof Paragraph) {
			lastChild.setSectionProperties(this.props);
		} else {
			const paragraph = new Paragraph({});
			paragraph.setSectionProperties(this.props);
			this.children.push(paragraph);
		}
		return this.childrenToNode(ancestry);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:sectPr';
	}

	static fromNode(node: Node): Section {
		const { children } = evaluateXPathToMap(
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
		) as { children: Node[] };

		return new Section(
			sectionPropertiesFromNode(node),
			...createChildComponentsFromNodes<SectionChild>(this.children, children),
		);
	}
}

registerComponent(Section as unknown as ComponentDefinition);
