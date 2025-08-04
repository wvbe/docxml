import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Paragraph } from '../../document/src/Paragraph.ts';
import { Text } from '../../document/src/Text.ts';
import { Move } from '../src/Move.ts';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

describe('Move content in track changes...', () => {
	const date = new Date();

	const emptyContext: ComponentContext = {
		archive: new Archive(),
		relationships: null,
	};

	const moveToNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);

	const moveToNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:date="${date.toISOString()}">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);
	const moveToNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:author="Gabe">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);

	const moveFromNode = create(
		`<w:moveFrom xmlns:w="${
			NamespaceUri.w
		}" w:id="1" w:author="Angel" w:date="${date.toISOString()}">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveFromNodeWithoutAuthor = create(
		`<w:moveFrom xmlns:w="${
			NamespaceUri.w
		}" w:id="1" w:date="${date.toISOString()}">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveFromNodeWithoutDate = create(
		`<w:moveFrom xmlns:w="${NamespaceUri.w}" w:id="1" w:author="Angel">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveToAsPropNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:author="Luis" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveToAsPropNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveToAsPropNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:author="Luis" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveFromAsPropNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:author="Ines" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);
	const moveFromAsPropNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);
	const moveFromAsPropNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:author="Ines" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);

	// Testing a move inside a paragraph.
	const moveToObject = new Paragraph(
		{ style: null },
		new Move(
			{
				id: 0,
				date: date,
				author: 'Gabe',
				type: 'to',
			},
			new Text({}, 'This is a paragraph')
		)
	);

	const moveToObjectWithoutDate = new Paragraph(
		{ style: null },
		new Move(
			{
				id: 0,
				author: 'Gabe',
				type: 'to',
			},
			new Text({}, 'This is a paragraph')
		)
	);

	const moveToObjectWithoutAuthor = new Paragraph(
		{ style: null },
		new Move(
			{
				id: 0,
				date: date,
				type: 'to',
			},
			new Text({}, 'This is a paragraph')
		)
	);

	// Testing a move as a stand-alone object
	const moveFromObject = new Move(
		{
			id: 1,
			date: date,
			author: 'Angel',
			type: 'from',
		},
		new Text({}, 'This is a moveFrom node.')
	);

	const moveFromObjectWithoutAuthor = new Move(
		{
			id: 1,
			date: date,
			type: 'from',
		},
		new Text({}, 'This is a moveFrom node.')
	);
	const moveFromObjectWithoutDate = new Move(
		{
			id: 1,
			author: 'Angel',
			type: 'from',
		},
		new Text({}, 'This is a moveFrom node.')
	);

	const moveToAsPropObject = new Paragraph(
		{
			pilcrow: {
				move: {
					author: 'Luis',
					date: date,
					type: 'to',
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveToAsPropObjectWithoutAuthor = new Paragraph(
		{
			pilcrow: {
				move: {
					date: date,
					type: 'to',
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveToAsPropObjectWithoutDate = new Paragraph(
		{
			pilcrow: {
				move: {
					author: 'Luis',
					type: 'to',
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveFromAsPropObject = new Paragraph(
		{
			pilcrow: {
				move: {
					id: 2,
					author: 'Ines',
					date: date,
					type: 'from',
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	const moveFromAsPropObjectWithoutAuthor = new Paragraph(
		{
			pilcrow: {
				move: {
					id: 2,
					date: date,
					type: 'from',
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	const moveFromAsPropObjectWithoutDate = new Paragraph(
		{
			pilcrow: {
				move: {
					id: 2,
					author: 'Ines',
					type: 'from',
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	// MoveTo as an object
	const newMoveTo = Paragraph.fromNode(moveToNode, emptyContext);
	const newMoveToWithoutAuthor = Paragraph.fromNode(
		moveToNodeWithoutAuthor,
		emptyContext
	);
	const newMoveToWithoutDate = Paragraph.fromNode(
		moveToNodeWithoutDate,
		emptyContext
	);

	// MoveFrom as an object
	const newMoveFrom = Move.fromNode(moveFromNode, emptyContext);
	const newMoveFromWithoutAuthor = Move.fromNode(
		moveFromNodeWithoutAuthor,
		emptyContext
	);
	const newMoveFromWithoutDate = Move.fromNode(
		moveFromNodeWithoutDate,
		emptyContext
	);

	// MoveTo as property
	const newMoveToAsProp = Paragraph.fromNode(moveToAsPropNode, emptyContext);
	const newMoveToAsPropWithoutAuthor = Paragraph.fromNode(
		moveToAsPropNodeWithoutAuthor,
		emptyContext
	);
	const newMoveToAsPropWithoutDate = Paragraph.fromNode(
		moveToAsPropNodeWithoutDate,
		emptyContext
	);

	// MoveFrom as property
	const newMoveFromAsProp = Paragraph.fromNode(
		moveFromAsPropNode,
		emptyContext
	);
	const newMoveFromAsPropWithoutAuthor = Paragraph.fromNode(
		moveFromAsPropNodeWithoutAuthor,
		emptyContext
	);
	const newMoveFromAsPropWithoutDate = Paragraph.fromNode(
		moveFromAsPropNodeWithoutDate,
		emptyContext
	);

	it('turns node into expected Move objects', () => {
		expect(newMoveTo).toEqual(moveToObject);
		expect(newMoveToWithoutAuthor).toEqual(moveToObjectWithoutAuthor);
		expect(newMoveToWithoutDate).toEqual(moveToObjectWithoutDate);

		expect(newMoveFrom).toEqual(moveFromObject);
		expect(newMoveFromWithoutAuthor).toEqual(moveFromObjectWithoutAuthor);
		expect(newMoveFromWithoutDate).toEqual(moveFromObjectWithoutDate);

		expect(newMoveToAsProp.props.pilcrow?.move).toEqual(
			moveToAsPropObject.props.pilcrow?.move
		);
		expect(newMoveToAsPropWithoutAuthor.props.pilcrow?.move).toEqual(
			moveToAsPropObjectWithoutAuthor.props.pilcrow?.move
		);
		expect(newMoveToAsPropWithoutDate.props.pilcrow?.move).toEqual(
			moveToAsPropObjectWithoutDate.props.pilcrow?.move
		);

		expect(newMoveFromAsProp.props.pilcrow?.move).toEqual(
			moveFromAsPropObject.props.pilcrow?.move
		);
		expect(newMoveFromAsPropWithoutAuthor.props.pilcrow?.move).toEqual(
			moveFromAsPropObjectWithoutAuthor.props.pilcrow?.move
		);
		expect(newMoveFromAsPropWithoutDate.props.pilcrow?.move).toEqual(
			moveFromAsPropObjectWithoutDate.props.pilcrow?.move
		);
	});

	it('serializes and deserialized correctly', async () => {
		expect(serialize(await moveToObject.toNode([]))).toEqual(
			serialize(
				create(
					`<p xmlns="${NamespaceUri.w}">
						<pPr/>
						<moveTo xmlns:ns1="${NamespaceUri.w}" 
							ns1:id="0" ns1:date="${date.toISOString()}" ns1:author="Gabe">
						<r>
							<t xml:space="preserve">This is a paragraph</t>
						</r>
					</moveTo>
					</p>`
				)
			)
		);
	});

	it('turns object of a moveFrom into the a <moveFrom> node', async () => {
		expect(serialize(await moveFromObject.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:date="${date.toISOString()}" ns1:author="Angel" >
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);

		expect(serialize(await moveFromObjectWithoutAuthor.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:date="${date.toISOString()}">
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);

		expect(serialize(await moveFromObjectWithoutDate.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:author="Angel">
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);
	});
});
