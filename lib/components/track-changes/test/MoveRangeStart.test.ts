import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { MoveRangeStart } from '../../track-changes/src/MoveRangeStart.ts';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

describe('MoveToRangeStart and MoveFromRangeStart elements...', () => {
	const date = new Date();
	const moveToRangeStart = MoveRangeStart.fromNode(
		create(
			`<w:moveToRangeStart xmlns:w="${
				NamespaceUri.w
			}" w:id="0" w:date="${date.toISOString()}" w:author="Gabe" w:name="Move_to_1" />`
		)
	);

	const moveFromRangeStart = MoveRangeStart.fromNode(
		create(
			`<w:moveFromRangeStart xmlns:w="${
				NamespaceUri.w
			}" w:id="1" w:date="${date.toISOString()}" w:author="Angel" w:name="Move_from_1" />`
		)
	);
	it('Create MoveToRangeStart from node', () => {
		expect(moveToRangeStart.props.author).toBe('Gabe');
		expect(moveToRangeStart.props.date).toBe(date.toISOString());
		expect(moveToRangeStart.props.id).toBe(0);
		expect(moveToRangeStart.props.name).toBe('Move_to_1');
		expect(moveToRangeStart.props.type).toBe('to');
	});

	it('Create MoveFromRangeStart from node', () => {
		expect(moveFromRangeStart.props.type).toBe('from');
		expect(moveFromRangeStart.props.author).toBe('Angel');
	});

	it('Create MoveToRangeStart node from MoveRangeStart object', () => {
		const toRangeObject = new MoveRangeStart({
			id: 2,
			date: date,
			author: 'Gabe',
			type: 'to',
			name: 'To_Range_Object',
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveToRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${
						NamespaceUri.w
					}" ns1:id="2" ns1:date="${date.toISOString()}" ns1:author="Gabe" ns1:name="To_Range_Object" />`
				)
			)
		);
	});

	it('Create MoveFromRangeStart node from MoveRangeStart object', () => {
		const toRangeObject = new MoveRangeStart({
			id: 3,
			date: date,
			author: 'Angel',
			type: 'from',
			name: 'From_Range_Object',
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${
						NamespaceUri.w
					}" ns1:id="3" ns1:date="${date.toISOString()}" ns1:author="Angel" ns1:name="From_Range_Object" />`
				)
			)
		);
	});
});
