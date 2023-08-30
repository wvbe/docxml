import { BinaryFile } from '../classes/BinaryFile.ts';
import {
	type ComponentAncestor,
	type ComponentDefinition,
	Component,
	ComponentContext,
} from '../classes/Component.ts';
import { RelationshipType } from '../enums.ts';
import { RelationshipsXml } from '../files/RelationshipsXml.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { createRandomId, createUniqueNumericIdentifier } from '../utilities/identifiers.ts';
import { type Length, emu } from '../utilities/length.ts';
import { getMimeTypeForUint8Array } from '../utilities/mime-types.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNumber,
	evaluateXPathToString,
} from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Image}.
 */
export type ImageChild = never;

/**
 * A type describing the props accepted by {@link Image}.
 */
export type ImageProps = {
	data: Uint8Array | Promise<Uint8Array>;
	title?: null | string;
	alt?: null | string;
	width: Length;
	height: Length;
};

/**
 * A component that represents an image in your DOCX document. You can create a new image by
 * passing any promise to an `Uint8Array` into the `data` prop, eg. get it from your file system
 * or from a web request.
 */
export class Image extends Component<ImageProps, ImageChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	#relationshipId: string | null = null;

	/**
	 * An event hook with which this component can ensure that the correct relationship type is
	 * recorded to the relationship XML.
	 */
	public ensureRelationship(relationships: RelationshipsXml) {
		this.#relationshipId = relationships.add(
			RelationshipType.image,
			BinaryFile.fromData(this.props.data, `word/media/${createRandomId('img')}`),
		);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public toNode(_ancestry: ComponentAncestor[]): Node {
		if (!this.#relationshipId) {
			throw new Error('Cannot serialize an image outside the context of an Document');
		}
		return create(
			`
				element ${QNS.w}drawing {
					element ${QNS.wp}inline {
						element ${QNS.wp}extent {
							attribute cx { $width },
							attribute cy { $height }
						},
						element ${QNS.wp}docPr {
							attribute id { $identifier },
							attribute name { $name },
							attribute descr { $desc }
						},
						element ${QNS.wp}cNvGraphicFramePr {
							element ${QNS.a}graphicFrameLocks {
								attribute noChangeAspect { "1" }
							}
						},

						(: nb: _Must_ be prefixed with "a" or MS Word will refuse to open :)
						element ${QNS.a}graphic {
							element ${QNS.a}graphicData {
									attribute uri { "${NamespaceUri.pic}"},
									element ${QNS.pic}pic {
										element ${QNS.pic}nvPicPr {
											element ${QNS.pic}cNvPr {
												attribute id { $identifier },
												attribute name { $name },
												attribute descr { $desc }
											},
											element ${QNS.pic}cNvPicPr {}
										},
										element ${QNS.pic}blipFill {
											element ${QNS.a}blip {
												attribute ${QNS.r}embed { $relationshipId },
												attribute cstate { "print" }
											},
											element ${QNS.a}stretch {
												element ${QNS.a}fillRect {}
											}
										},
										element ${QNS.pic}spPr {
											element ${QNS.a}xfrm {
												element ${QNS.a}off {
													attribute x { "0" },
													attribute y { "0" }
												},
												element ${QNS.a}ext {
													attribute cx { $width },
													attribute cy { $height }
												}
											},
											element ${QNS.a}prstGeom {
												attribute prst { "rect" },
												element ${QNS.a}avLst {}
											}
										}
									}

							}
						}
					}
				}
			`,
			{
				identifier: createUniqueNumericIdentifier(),
				relationshipId: this.#relationshipId,
				width: Math.round(this.props.width.emu),
				height: Math.round(this.props.height.emu),
				name: this.props.title || '',
				desc: this.props.alt || '',
			},
		);
	}

	public async getMimeType() {
		return getMimeTypeForUint8Array(await this.props.data);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:drawing';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node, { archive, relationships }: ComponentContext): Image {
		// Important nodes
		const inlineNode = evaluateXPathToFirstNode(`./${QNS.wp}inline`, node);
		const picNode = evaluateXPathToFirstNode(
			`./${QNS.a}graphic/${QNS.a}graphicData/${QNS.pic}pic`,
			inlineNode,
		);

		const title = evaluateXPathToString(`./${QNS.wp}docPr/@name/string()`, inlineNode);

		const width = emu(evaluateXPathToNumber(`./${QNS.wp}extent/@cx/number()`, inlineNode));
		const height = emu(evaluateXPathToNumber(`./${QNS.wp}extent/@cy/number()`, inlineNode));

		if (relationships === null) {
			// Our simplified images are always expected to reference a relationship ID
			throw new Error(
				'Failed to load image. The image is referencing a relationship ID but RelationhipsXml is null in the context.',
			);
		}

		const blipEmbedRel = evaluateXPathToString(
			`${QNS.pic}blipFill/${QNS.a}blip/@${QNS.r}embed/string()`,
			picNode,
		);
		const location = relationships.getTarget(blipEmbedRel);
		const data = archive.readBinary(location);

		return new Image({
			data,
			title,
			width,
			height,
		});
	}
}

registerComponent(Image as unknown as ComponentDefinition);
