// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
//
// Add items to this list that would otherwise only be depended on as a type definition.

import { Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { cm, pt, type Length } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToBoolean, evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * A type describing the components accepted as children of {@link WatermarkText}.
 */
export type WatermarkTextChild = never;

/**
 * A type describing the props accepted by {@link WatermarkText}.
 *
 * The "style" option, which is part of both paragraph- and text properties, is always
 * set to the _paragraph_ style -- the _text_ style is ignored.
 */
export type WatermarkTextProps = {
	text: string;
	horizontalAlign?: 'left' | 'center' | 'right' | null;
	verticalAlign?: 'top' | 'center' | 'bottom' | null;
	minFontSize?: Length | null;
	boxWidth?: Length | null;
	boxHeight?: Length | null;

	/**
	 * The color of this text. Type as a hexidecimal code (`"ff0000"`) or a basic color name (`"red"`).
	 */
	color?: string | null;
};

/**
 *
 */
export class WatermarkText extends Component<WatermarkTextProps, WatermarkTextChild> {
	public static readonly children: string[] = [];
	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 *
	 *
	 *
	 *
	 */
	public toNode(): Node {
		return create(
			`
			element ${QNS.w}p {
				element ${QNS.w}r {
					element ${QNS.w}pict {
						element ${QNS.v}shape {
							attribute type { "#_x0000_t136" },
							attribute style { concat(
								"position:absolute;",
								"margin-left:0;",
								"margin-top:0;",
								"width:", $boxWidth, "pt;",
								"height:", $boxHeight, "pt;",
								"z-index:-251651072;",
								"mso-wrap-edited:f;",
								"mso-width-percent:0;",
								"mso-height-percent:0;",
								"mso-position-horizontal:", $horizontalAlign, ";",
								"mso-position-horizontal-relative:page;",
								"mso-position-vertical:", $verticalAlign, ";",
								"mso-position-vertical-relative:page;",
								"mso-width-percent:0;",
								"mso-height-percent:0"
							) },
							attribute ${QNS.o}allowincell { "f" },
							attribute fillcolor { concat("#", $color) },
							attribute stroked { "f" },
							element ${QNS.v}fill {
								attribute opacity { "52428f" }
							},
							element ${QNS.v}textpath {
								attribute style { concat(
									"font-family:&quot;Impact&quot;;",
									"font-size:", $minFontSize, "pt;",
									"font-weight:bold;",
									"font-style:italic"
								) },
								attribute string { $text }
							}
						}
					}
				}
			}
			`,
			{
				text: this.props.text,
				horizontalAlign: this.props.horizontalAlign || 'center',
				verticalAlign: this.props.verticalAlign || 'center',
				boxWidth: (this.props.boxWidth || cm(21.6)).pt,
				boxHeight: (this.props.boxHeight || cm(23.9)).pt,
				minFontSize: (this.props.minFontSize || pt(10)).pt,
				color: this.props.color || '000000',
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		// This will possibly have false positives on "real" Word content
		return evaluateXPathToBoolean('self::w:p[./w:r/w:pict]', node);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): WatermarkText {
		const props = evaluateXPathToMap<WatermarkTextProps>(
			`map {

			}`,
			node,
		);

		return new WatermarkText(props);
	}
}

registerComponent(WatermarkText);
