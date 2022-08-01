import { Relationships, RelationshipType } from '../bundle/Relationships.ts';
import { BinaryFile } from '../classes/BinaryFile.ts';
import {
	AnyXmlComponentAncestor,
	XmlComponent,
	XmlComponentClassDefinition,
} from '../classes/XmlComponent.ts';
import { registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { createUniqueNumericIdentifier } from '../util/identifiers.ts';
import { NamespaceUri, QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';

export type ImageChild = never;

type EnglishMetricUnit = number;

export type ImageProps = {
	data: Promise<Uint8Array>;
	title?: null | string;
	alt?: null | string;
	width: EnglishMetricUnit;
	height: EnglishMetricUnit;
};

/**
 * http://www.datypic.com/sc/ooxml/e-w_br-1.html
 */
export class Image extends XmlComponent<ImageProps, ImageChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	private relationshipId: string | null = null;
	public ensureRelationship(relationships: Relationships) {
		this.relationshipId = relationships.add(
			RelationshipType.image,
			BinaryFile.fromData(this.props.data, 'word/media/kees.jpeg'),
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toNode(_ancestry: AnyXmlComponentAncestor[]): Node {
		if (!this.relationshipId) {
			throw new Error('Cannot serialize an image outside the context of an OfficeDocument');
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
				relationshipId: this.relationshipId,
				width: this.props.width,
				height: this.props.height,
				name: this.props.title || '',
				desc: this.props.alt || '',
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:graphic';
	}

	static fromNode(node: Node): Image {
		return new Image(
			evaluateXPathToMap(
				`
					map {
						"type": ./@${QNS.w}type/string(),
						"clear": ./@${QNS.w}clear/string()
					}
				`,
				node,
			) as ImageProps,
		);
	}
}

registerComponent(Image as unknown as XmlComponentClassDefinition);
