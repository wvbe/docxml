/** @jsx API.jsx */

import API, { Paragraph, Section, Text } from '../mod.ts';

const api = API.fromNothing();

const numbering = api.document.numbering.add({
	type: 'hybridMultilevel',
	levels: [{ alignment: 'left', format: 'decimalZero', start: 1, text: '%1' }],
});
const numbering2 = api.document.numbering.add(0);
api.document.set(
	<Section>
		{Array.from(new Array(5)).map((_, index) => (
			<Paragraph listItem={{ numbering }}>
				<Text>List item {String(index + 1)}</Text>
			</Paragraph>
		))}
		<Paragraph>New list:</Paragraph>
		{Array.from(new Array(5)).map((_, index) => (
			<Paragraph listItem={{ numbering: numbering2 }}>
				<Text>List item {String(index + 1)}</Text>
			</Paragraph>
		))}
	</Section>,
);

api.toFile('lists.docx');
