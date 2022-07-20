import { registerXQueryModule } from 'https://esm.sh/fontoxpath@3.26.1';

registerXQueryModule(`
	module namespace ooxml = "https://wybe.pizza/ns/ooxml";

	declare %public function ooxml:is-on-off-enabled($val) as xs:boolean {
		$val = ("on", "true", "1")
	};
`);
