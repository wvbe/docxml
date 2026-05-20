import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { FootnoteSeparator } from '../src/FootnoteSeparator.ts';

describe('FootnoteSeparator', () => {
	it('matches the expected node', () => {
		const node = create(`<w:separator xmlns:w="${NamespaceUri.w}" />`);

		expect(FootnoteSeparator.matchesNode(node)).toBe(true);
		expect(
			FootnoteSeparator.matchesNode(
				create(`<w:t xmlns:w="${NamespaceUri.w}" />`)
			)
		).toBe(false);
	});

	it('creates and serializes correctly', () => {
		const separator = FootnoteSeparator.fromNode(
			create(`<w:separator xmlns:w="${NamespaceUri.w}" />`)
		);

		expect(separator.props).toEqual({});
		expect(serialize(separator.toNode())).toBe(
			`<separator xmlns="${NamespaceUri.w}"/>`
		);
	});
});
