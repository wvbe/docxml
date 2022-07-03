import Registry from 'https://deno.land/x/xml_renderer@5.0.0/mod.ts';
import { evaluateXPathToNodes } from 'https://esm.sh/fontoxpath@3.26.0';
import { Node as SlimdomNode } from 'https://esm.sh/slimdom@3.1.0';

import { RuleAstComponent, RuleProps, RuleReturnType, Template } from '../types.ts';

type RendererFactory<AstComponent = RuleAstComponent, Output = RuleReturnType> = (
	value: AstComponent | undefined,
	props: RuleProps<Output>,
) => Output;

export class Renderer extends Registry<RuleAstComponent> {
	renderDocx(node: Node, template: Template) {
		return (function recurse(
			registry: Renderer,
			factory: RendererFactory,
			node: Node,
		): ReturnType<RendererFactory> {
			return factory(registry.find(node), {
				node: node as unknown as SlimdomNode,
				template,
				traverse: (query = './node()') =>
					Promise.all(
						evaluateXPathToNodes(query, node).map((n) => recurse(registry, factory, n as Node)),
					),
			});
		})(this, (fn, props) => (fn ? fn(props) : null), node);
	}
}
