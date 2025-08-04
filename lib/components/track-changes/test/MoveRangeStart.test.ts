import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { MoveRangeStart } from '../../track-changes/src/MoveRangeStart.ts';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

describe('MoveToRangeStart and MoveFromRangeStart elements...', () => {
	const date = new Date();

	it('Create MoveToRangeStart from node', () => {
		const moveToRangeStart = MoveRangeStart.fromNode(
			create(
				`<w:moveToRangeStart xmlns:w="${
					NamespaceUri.w
				}" w:id="0" w:date="${date.toISOString()}" w:author="Gabe" w:name="Move_to_1" />`
			)
		);
		expect(moveToRangeStart.props.author).toBe('Gabe');
		expect(moveToRangeStart.props.date).toBe(date.toISOString());
		expect(moveToRangeStart.props.id).toBe(0);
		expect(moveToRangeStart.props.name).toBe('Move_to_1');
		expect(moveToRangeStart.props.type).toBe('to');
	});

	it('Create MoveToRangeStart without author from node', () => {
		const moveToRangeStartWithoutAuthor = MoveRangeStart.fromNode(
			create(
				`<w:moveToRangeStart xmlns:w="${
					NamespaceUri.w
				}" w:id="1" w:date="${date.toISOString()}" w:name="Move_to_1" />`
			)
		);
		expect(moveToRangeStartWithoutAuthor.props.author).toBe(undefined);
		expect(moveToRangeStartWithoutAuthor.props.date).toBe(
			date.toISOString()
		);
		expect(moveToRangeStartWithoutAuthor.props.id).toBe(1);
		expect(moveToRangeStartWithoutAuthor.props.name).toBe('Move_to_1');
		expect(moveToRangeStartWithoutAuthor.props.type).toBe('to');
	});

	it('Create MoveToRangeStart without date from node', () => {
		const moveToRangeStartWithoutDate = MoveRangeStart.fromNode(
			create(
				`<w:moveToRangeStart xmlns:w="${NamespaceUri.w}" w:id="1" w:author="Angel" w:name="Move_to_1" />`
			)
		);
		expect(moveToRangeStartWithoutDate.props.author).toBe('Angel');
		expect(moveToRangeStartWithoutDate.props.date).toBe(undefined);
		expect(moveToRangeStartWithoutDate.props.id).toBe(1);
		expect(moveToRangeStartWithoutDate.props.name).toBe('Move_to_1');
		expect(moveToRangeStartWithoutDate.props.type).toBe('to');
	});

	it('Create MoveFromRangeStart from node', () => {
		const moveFromRangeStart = MoveRangeStart.fromNode(
			create(
				`<w:moveFromRangeStart xmlns:w="${
					NamespaceUri.w
				}" w:id="1" w:date="${date.toISOString()}" w:author="Angel" w:name="Move_from_1" />`
			)
		);
		expect(moveFromRangeStart.props.type).toBe('from');
		expect(moveFromRangeStart.props.author).toBe('Angel');
	});

	it('Create MoveFromRangeStart without author from node', () => {
		const moveFromRangeStartWithoutAuthor = MoveRangeStart.fromNode(
			create(
				`<w:moveFromRangeStart xmlns:w="${
					NamespaceUri.w
				}" w:id="1" w:date="${date.toISOString()}" w:name="Move_from_1" />`
			)
		);
		expect(moveFromRangeStartWithoutAuthor.props.author).toBe(undefined);
		expect(moveFromRangeStartWithoutAuthor.props.date).toBe(
			date.toISOString()
		);
		expect(moveFromRangeStartWithoutAuthor.props.id).toBe(1);
		expect(moveFromRangeStartWithoutAuthor.props.name).toBe('Move_from_1');
		expect(moveFromRangeStartWithoutAuthor.props.type).toBe('from');
	});

	it('Create MoveFromRangeStart without date from node', () => {
		const moveFromRangeStartWithoutDate = MoveRangeStart.fromNode(
			create(
				`<w:moveFromRangeStart xmlns:w="${NamespaceUri.w}" w:id="1" w:author="Angel" w:name="Move_from_1" />`
			)
		);
		expect(moveFromRangeStartWithoutDate.props.author).toBe('Angel');
		expect(moveFromRangeStartWithoutDate.props.date).toBe(undefined);
		expect(moveFromRangeStartWithoutDate.props.id).toBe(1);
		expect(moveFromRangeStartWithoutDate.props.name).toBe('Move_from_1');
		expect(moveFromRangeStartWithoutDate.props.type).toBe('from');
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

	it('Create MoveFromRangeStart node MoveRangeStart from object without author and date parameters', () => {
		const toRangeObject = new MoveRangeStart({
			id: 3,
			type: 'from',
			name: 'From_Range_Object',
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="3" ns1:name="From_Range_Object" />`
				)
			)
		);
	});

	it('Create MoveFromRangeStart node MoveRangeStart from object without author parameter', () => {
		const toRangeObject = new MoveRangeStart({
			id: 3,
			type: 'from',
			name: 'From_Range_Object',
			author: 'Angel',
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="3"  ns1:author="Angel" ns1:name="From_Range_Object" />`
				)
			)
		);
	});

	it('Create MoveFromRangeStart node MoveRangeStart from object without date parameter', () => {
		const toRangeObject = new MoveRangeStart({
			id: 3,
			type: 'from',
			name: 'From_Range_Object',
			date: date,
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${
						NamespaceUri.w
					}" ns1:id="3" ns1:date="${date.toISOString()}" ns1:name="From_Range_Object" />`
				)
			)
		);
	});

	it('Create MoveToRangeStart node MoveRangeStart from object without date parameter', () => {
		const toRangeObject = new MoveRangeStart({
			id: 3,
			type: 'to',
			name: 'To_Range_Object',
			date: date,
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveToRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${
						NamespaceUri.w
					}" ns1:id="3" ns1:date="${date.toISOString()}" ns1:name="To_Range_Object" />`
				)
			)
		);
	});
});
