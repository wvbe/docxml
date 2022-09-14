import {
	registerCustomXPathFunction,
	registerXQueryModule,
} from 'https://esm.sh/fontoxpath@3.26.1';

import { convert } from './length.ts';
import { QNS } from './namespaces.ts';

registerCustomXPathFunction(
	{ namespaceURI: 'https://wybe.pizza/ns/ooxml', localName: 'universal-size' },
	['xs:float', 'xs:string'],
	'map(*)',
	(_facade, value, unit) => convert(value, unit),
);

registerXQueryModule(`
	module namespace ooxml = "https://wybe.pizza/ns/ooxml";

	declare %public function ooxml:cell-column($cell) as xs:double {
		sum(
			$cell/preceding-sibling::${QNS.w}tc/(
				if (./${QNS.w}tcPr/${QNS.w}gridSpan)
					then number(./${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val)
					else 1
			)
		)
	};

	declare %public function ooxml:is-on-off-enabled($val) as xs:boolean {
		$val = ("on", "true", "1")
	};

	(: @TODO Test this function :)
	declare %public function ooxml:table-border($val) as map(*) {
		$val/map {
			"type": ./@${QNS.w}val/string(),
			"spacing": ./@${QNS.w}space/number(),
			"width": ./@${QNS.w}sz/number(),
			"color": ./@${QNS.w}color/string()
		}
	};

	(: @TODO Test this function :)
	declare %public function ooxml:create-table-border($name as xs:QName, $obj as map(*)?) {
		if (exists($obj)) then element {$name} {
			if ($obj('type')) then attribute ${QNS.w}val { $obj('type') } else (),
			if ($obj('width')) then attribute ${QNS.w}sz { $obj('width') } else (),
			if ($obj('spacing')) then attribute ${QNS.w}space { $obj('spacing') } else (),
			if ($obj('color')) then attribute ${QNS.w}color { $obj('color') } else ()
		} else ()
	};
`);
