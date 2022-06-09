import { Document } from 'https://esm.sh/slimdom@3.0.1';

import { Jsonml } from './types.ts';

type AttributeOf<JsonmlType extends Jsonml<unknown>> = JsonmlType extends [
	string,
	{ [attr: string]: infer P },
	...Jsonml<unknown>[],
]
	? P
	: never;

type AttributeSerializerOf<JsonmlType extends Jsonml<unknown>> = (
	name: string,
	value: AttributeOf<JsonmlType>,
) => string;

function convertJsonmlNode<JsonmlType extends Jsonml<unknown>>(
	ownerDocument: Document,
	node: JsonmlType,
	serializeAttribute: AttributeSerializerOf<JsonmlType>,
) {
	if (Array.isArray(node)) {
		const [name, ...contents] = node;
		const el = ownerDocument.createElement(name);
		contents.forEach((content) => {
			if (Array.isArray(content) || typeof content === 'string') {
				el.appendChild(convertJsonmlNode(ownerDocument, content as JsonmlType, serializeAttribute));
			} else {
				// Must be an object of attributes
				Object.keys(content).forEach((name) => {
					const value = content[name] as AttributeOf<JsonmlType>;
					if (value === undefined) {
						return;
					}
					el.setAttribute(name, serializeAttribute(name, value));
				});
			}
		});
		return el;
	}
	if (typeof node === 'string') {
		const el = ownerDocument.createTextNode(node);
		return el;
	}
	throw new Error('Unknown JSONML node type');
}

export function convertToDocument<JsonmlType extends Jsonml<unknown>>(
	jsonml: JsonmlType,
	serializeAttribute: AttributeSerializerOf<JsonmlType> = (_name, value) => String(value),
) {
	return convertJsonmlNode(new Document(), jsonml, serializeAttribute);
}
