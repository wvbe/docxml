import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { FootnoteContinuationSeparator } from '../src/FootnoteContinuationSeparator.ts';

describe('FootnoteContinuationSeparator', () => {
	it('matches the expected node', () => {
		const node = create(
			`<w:continuationSeparator xmlns:w="${NamespaceUri.w}" />`
		);

		expect(FootnoteContinuationSeparator.matchesNode(node)).toBe(true);
		expect(
			FootnoteContinuationSeparator.matchesNode(
				create(`<w:t xmlns:w="${NamespaceUri.w}" />`)
			)
		).toBe(false);
	});

	it('creates and serializes correctly', () => {
		const separator = FootnoteContinuationSeparator.fromNode(
			create(`<w:continuationSeparator xmlns:w="${NamespaceUri.w}" />`)
		);

		expect(separator.props).toEqual({});
		expect(serialize(separator.toNode())).toBe(
			`<continuationSeparator xmlns="${NamespaceUri.w}"/>`
		);
	});
});
