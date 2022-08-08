/** @jsx API.JSX */

import API, { Document, Paragraph, Text, TextAddition, TextDeletion } from './mod.ts';

const api = new API();

const changes = [
	{ author: 'Alex', date: new Date('1900-01-01'), id: 1 },
	{ author: 'Billie', date: new Date('1901-01-01'), id: 2 },
	// { author: 'Carter', date: new Date('1902-01-01'), id: 3 },
	// { author: 'Denver', date: new Date('1903-01-01'), id: 4 },
];

api.document.set(
	<Document>
		<Paragraph>
			<Text></Text>
		</Paragraph>
		<Paragraph>
			<Text isBold>Test 1: </Text>
			<Text>
				This paragraph has{' '}
				<TextAddition {...changes[0]}>
					a text addition <TextDeletion {...changes[1]}>with a removal later</TextDeletion>
				</TextAddition>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 2: </Text>
			<Text>
				This paragraph has{' '}
				<TextAddition {...changes[1]}>
					a text addition <TextDeletion {...changes[0]}>with an earier removal</TextDeletion>
				</TextAddition>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 3: </Text>
			<Text>
				This paragraph has{' '}
				<TextDeletion {...changes[1]}>
					a text deletion <TextAddition {...changes[0]}>with an earlier insertion</TextAddition>
				</TextDeletion>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 4: </Text>
			<Text>
				This paragraph has{' '}
				<TextDeletion {...changes[0]}>
					a text deletion <TextAddition {...changes[1]}>with an insertion later</TextAddition>
				</TextDeletion>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 5: </Text>
			<Text>
				This paragraph has{' '}
				<TextDeletion {...changes[1]}>
					a text deletion <TextDeletion {...changes[0]}>with an earlier text deletion</TextDeletion>
				</TextDeletion>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 6: </Text>
			<Text>
				This paragraph has{' '}
				<TextDeletion {...changes[0]}>
					a text deletion <TextDeletion {...changes[1]}>with a text deletion later</TextDeletion>
				</TextDeletion>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 7: </Text>
			<Text>
				This paragraph has{' '}
				<TextAddition {...changes[1]}>
					a text addition <TextAddition {...changes[0]}>with an earlier text addition</TextAddition>
				</TextAddition>
				.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold>Test 8: </Text>
			<Text>
				This paragraph has{' '}
				<TextAddition {...changes[0]}>
					a text addition <TextAddition {...changes[1]}>with a text addition later</TextAddition>
				</TextAddition>
				.
			</Text>
		</Paragraph>
	</Document>,
);

api.docx.toArchive().toFile('ctt.docx');
