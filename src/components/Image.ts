import { Archive } from '../classes/Archive.ts';
import { BinaryFile } from '../classes/BinaryFile.ts';
import {
	type ComponentAncestor,
	type ComponentDefinition,
	Component,
	ComponentContext,
} from '../classes/Component.ts';
import { FileMime, RelationshipType } from '../enums.ts';
import { RelationshipsXml } from '../files/RelationshipsXml.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { extensionListUris } from '../utilities/drawingml-extensions.ts';
import { createRandomId, createUniqueNumericIdentifier } from '../utilities/identifiers.ts';
import { type Length, emu } from '../utilities/length.ts';
import { getMimeTypeForUint8Array } from '../utilities/mime-types.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
} from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Image}.
 */
export type ImageChild = never;

export type DataExtensions = {
	svg?: string | Promise<string>;
};

/**
 * A type describing the props accepted by {@link Image}.
 */
export type ImageProps = {
	data: Uint8Array | Promise<Uint8Array>;
	dataExtensions?: DataExtensions;
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
	#relationshipIdSvg: string | null = null;

	#location = `word/media/${createRandomId('img')}`;
	get location() {
		return this.#location;
	}
	#locationSvg = `word/media/${createRandomId('svg')}`;
	get locationSvg() {
		return this.#locationSvg;
	}

	/**
	 * An event hook with which this component can ensure that the correct relationship type is
	 * recorded to the relationship XML.
	 */
	public async ensureRelationship(relationships: RelationshipsXml) {
		const mime = await this.getMimeType();

		this.#relationshipId = relationships.add(
			RelationshipType.image,
			BinaryFile.fromData(this.props.data, this.#location, mime),
		);

		const { dataExtensions } = this.props;
		if (dataExtensions) {
			const { svg } = dataExtensions;
			if (svg) {
				this.#relationshipIdSvg = relationships.add(
					RelationshipType.image,
					BinaryFile.fromData(new TextEncoder().encode(await svg), this.#locationSvg, FileMime.svg),
				);
			}
		}
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public toNode(_ancestry: ComponentAncestor[]): Node {
		if (!this.#relationshipId) {
			throw new Error('Cannot serialize an image outside the context of an Document');
		}

		let extensionList: Node | undefined;

		if (this.#relationshipIdSvg) {
			extensionList = create(
				`
					element ${QNS.a}extLst {
						element ${QNS.a}ext {
							attribute uri { $extLstUseLocalDpi },
							element ${QNS.a14}useLocalDpi {
								attribute val { "0" }
							}
						},
						element ${QNS.a}ext {
							attribute uri { $extLstSvg },
							element ${QNS.asvg}svgBlip {
								attribute ${QNS.r}embed { $relationshipId }
							}
						}
					}
				`,
				{
					relationshipId: this.#relationshipIdSvg,
					extLstUseLocalDpi: extensionListUris.useLocalDpi,
					extLstSvg: extensionListUris.svg,
				},
			);
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
												attribute cstate { "print" },
												${extensionList ? '$extensionList' : '()'}
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
				extensionList,
			},
		);
	}

	/**
	 * @returns MIME tpye of main image data (not blip extensions).
	 */
	public async getMimeType(): Promise<FileMime> {
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

		const blipNode = evaluateXPathToFirstNode(`${QNS.pic}blipFill/${QNS.a}blip`, picNode);
		if (blipNode === null) {
			throw new Error('Failed to load image. No blip found inside a blipFill.');
		}
		const { main, svg } = extractData(archive, relationships, blipNode);

		const dataExtensions: DataExtensions = {};
		if (svg) {
			dataExtensions.svg = svg.data;
		}

		const image = new Image({
			data: main.data,
			dataExtensions,
			title,
			width,
			height,
		});
		image.#location = main.location;
		if (svg) {
			image.#locationSvg = svg.location;
		}
		return image;
	}
}

registerComponent(Image as unknown as ComponentDefinition);

type BlipLocationAndData = {
	data: Promise<Uint8Array>;
	location: string;
};

type BlipSvgLocationAndData = {
	data: Promise<string>;
	location: string;
};

type BlipAllLocationsAndData = {
	main: BlipLocationAndData;
	svg?: BlipSvgLocationAndData;
};

function extractData(
	archive: Archive,
	relationships: RelationshipsXml,
	blipNode: Node,
): BlipAllLocationsAndData {
	const blipEmbedRel = evaluateXPathToString(`@${QNS.r}embed/string()`, blipNode);
	const location = relationships.getTarget(blipEmbedRel);
	const data = archive.readBinary(location);

	const allLocationsAndData: BlipAllLocationsAndData = {
		main: {
			data,
			location,
		},
	};

	const blipextLst = evaluateXPathToNodes(`./extLst/*`, blipNode);
	blipextLst.forEach((node) => {
		if (node.nodeType !== 1) {
			return;
		}
		const element = node as Element;
		const extensionUri = element.getAttribute('uri');

		if (extensionUri === extensionListUris.svg) {
			const extensionRel = element.children[0].getAttributeNS(NamespaceUri.r, 'embed');
			if (extensionRel === null) {
				throw new Error(
					'Failed to load image SVG extension. SVG extension URI found in extLst but it does not follow the known format.',
				);
			}
			const location = relationships.getTarget(extensionRel);
			const data = archive.readText(location);

			allLocationsAndData.svg = {
				location,
				data,
			};

			return;
		}

		// Implement other similar blip extensions here
		// if (extensionUri === "some other rui") { }
	});

	return allLocationsAndData;
}
