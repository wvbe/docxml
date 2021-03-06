import { XmlComponent } from '../classes/XmlComponent.ts';
import { create, QNS } from '../util/dom.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';

export type BreakChild = never;

export type BreakProps = {
	type?: 'page' | 'column' | 'textWrapping' | null;
	clear?: 'left' | 'right' | 'all' | 'none' | null;
};

/**
 * http://www.datypic.com/sc/ooxml/e-w_br-1.html
 */
export class Break extends XmlComponent<BreakProps, BreakChild> {
	public static children = [];
	public static mixed = false;

	public toNode(): Node {
		return create(
			`
				element ${QNS.w}br {
					if (exists($type)) then attribute ${QNS.w}type { $type } else (),
					if (exists($clear)) then attribute ${QNS.w}clear { $clear } else ()
				}
			`,
			{
				type: this.props.type || null,
				clear: this.props.clear || null,
			},
		);
	}

	static fromNode(node: Node): Break {
		return new Break(
			evaluateXPathToMap(
				`
					map {
						"type": ./@${QNS.w}type/string(),
						"clear": ./@${QNS.w}clear/string()
					}
				`,
				node,
			),
		);
	}
}
