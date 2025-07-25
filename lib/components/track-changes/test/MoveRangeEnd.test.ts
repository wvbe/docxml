import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { MoveRangeEnd } from '../src/MoveRangeEnd.ts';

describe('MoveToRangeStart and MoveFromRangeStart elements...', () => {
	const moveToRangeEnd = MoveRangeEnd.fromNode(
		create(`<w:moveToRangeEnd xmlns:w="${NamespaceUri.w}" w:id="0" />`)
	);

	const moveFromRangeEnd = MoveRangeEnd.fromNode(
		create(`<w:moveFromRangeEnd xmlns:w="${NamespaceUri.w}" w:id="1" />`)
	);
	it('Create MoveToRangeEnd from node', () => {
		expect(moveToRangeEnd.props.id).toBe(0);
		expect(moveToRangeEnd.props.type).toBe('to');
	});

	it('Create MoveFromRangeEnd from node', () => {
		expect(moveFromRangeEnd.props.id).toBe(1);
		expect(moveFromRangeEnd.props.type).toBe('from');
	});

	it('Create MoveToRangeEnd node from MoveRangeEnd object', () => {
		const toRangeObject = new MoveRangeEnd({
			id: 2,
			type: 'to',
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveToRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="2" />`
				)
			)
		);

		const fromRangeObject = new MoveRangeEnd({
			id: 3,
			type: 'from',
		});
		expect(serialize(fromRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="3" />`
				)
			)
		);
	});
});
