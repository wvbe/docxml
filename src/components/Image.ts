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
	svg?: Promise<string>;
};

/**
 * A type describing the props accepted by {@link Image}.
 */
export type ImageProps = {
	data: Promise<Uint8Array>;
	mime?: FileMime;
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

	#embedMeta: {
		location: string;
		mime: Promise<FileMime> | null;
		relationshipId: string | null;

		extensions: {
			svg?: {
				location: string;
				relationshipId: string | null;
			};
		};
	};
	get embedMeta() {
		const embedMeta = this.#embedMeta;
		const props = this.props;

		return {
			get location() {
				return embedMeta.location;
			},
			get mime() {
				if (embedMeta.mime === null) {
					embedMeta.mime = new Promise((resolve) => {
						props.data.then((data) => {
							resolve(getMimeTypeForUint8Array(data));
						});
					});
				}
				return embedMeta.mime;
			},
			get relationshipId() {
				return embedMeta.relationshipId;
			},

			get extensions() {
				return {
					get svg() {
						const { svg } = embedMeta.extensions;
						if (!svg) {
							return undefined;
						}
						return {
							get location() {
								return svg.location;
							},
							get relationshipId() {
								return svg.relationshipId;
							},
						};
					},
				};
			},
		};
	}

	constructor(props: ImageProps, ...children: ImageChild[]) {
		super(props, ...children);

		this.#embedMeta = {
			location: `word/media/${createRandomId('img')}`,
			mime: null,
			relationshipId: null,
			extensions: {},
		};

		if (props.dataExtensions) {
			const { svg } = props.dataExtensions;
			if (svg !== undefined) {
				this.#embedMeta.extensions.svg = {
					location: `word/media/${createRandomId('svg')}`,
					relationshipId: null,
				};
			}
		}
	}

	/**
	 * An event hook with which this component can ensure that the correct relationship type is
	 * recorded to the relationship XML.
	 */
	public async ensureRelationship(relationships: RelationshipsXml) {
		const { location, mime, extensions } = this.embedMeta;

		this.#embedMeta.relationshipId = relationships.add(
			RelationshipType.image,
			BinaryFile.fromData(this.props.data, location, await mime),
		);

		const { svg } = extensions;
		if (this.#embedMeta.extensions.svg && svg && this.props.dataExtensions?.svg) {
			this.#embedMeta.extensions.svg.relationshipId = relationships.add(
				RelationshipType.image,
				BinaryFile.fromData(
					new TextEncoder().encode(await this.props.dataExtensions.svg),
					svg.location,
					FileMime.svg,
				),
			);
		}
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public toNode(_ancestry: ComponentAncestor[]): Node {
		if (!this.#embedMeta.relationshipId) {
			throw new Error('Cannot serialize an image outside the context of an Document');
		}

		let extensionList: Node | undefined;
		const { svg } = this.embedMeta.extensions;
		if (svg) {
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
					relationshipId: svg.relationshipId,
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
				relationshipId: this.#embedMeta.relationshipId,
				width: Math.round(this.props.width.emu),
				height: Math.round(this.props.height.emu),
				name: this.props.title || '',
				desc: this.props.alt || '',
				extensionList,
			},
		);
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
		image.#embedMeta.location = main.location;
		if (svg) {
			const { svg: svgEmbed } = image.#embedMeta.extensions;
			if (!svgEmbed) {
				// At the time of writing this error should never happen.
				// If you encountered it, it probably means that the Image constructor
				// changed and is no longer defining #embed.svg when dataExtensions.svg
				// is passed or this method changed and no longer passes
				// dataExtensions.svg to the Image costuctor.
				throw new Error(
					'Failed setting image #embed.svg.location during Image deserialization. No SVG properties are available',
				);
			}
			svgEmbed.location = svg.location;
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
