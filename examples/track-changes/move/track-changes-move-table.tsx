/** @jsx  Docx.jsx */
import Docx, {
	Cell,
	Move,
	MoveFromRangeEnd,
	MoveFromRangeStart,
	MoveToRangeEnd,
	MoveToRangeStart,
	Paragraph,
	Row,
	Section,
	Table,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

await Docx.fromJsx(
	<Section>
		{/* Table MoveTo */}
		<Table>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 15,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<MoveToRangeStart
							id={16}
							name="move_2"
							author={author}
							date={date}
						/>
						<Move id={17} type="to" author={author} date={date}>
							<Text> Author</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 45,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={46} type="to" author={author} date={date}>
							<Text>Federico García Lorca</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 47,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={48} type="to" author={author} date={date}>
							<Text>Genre</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 49,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={50} type="to" author={author} date={date}>
							<Text>Tragedy</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 51,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={52} type="to" author={author} date={date}>
							<Text>Message</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 53,
								type: 'to',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={54} type="to" author={author} date={date}>
							<Text>
								Critique of social and familial repression,
								especially against women
							</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
		</Table>
		<MoveToRangeEnd id={16} />
		<Paragraph>
			<Text isBold isCaps>
				Summary Table
			</Text>
		</Paragraph>
		{/* Table MoveFrom */}
		<Table>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 12,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<MoveFromRangeStart
							id={13}
							name="move_2"
							author={author}
							date={date}
						/>
						<Move id={14} type="from" author={author} date={date}>
							<Text> Author</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 35,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={36} type="from" author={author} date={date}>
							<Text>Federico García Lorca</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 37,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={38} type="from" author={author} date={date}>
							<Text>Genre</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 39,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={40} type="from" author={author} date={date}>
							<Text>Tragedy</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 41,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={42} type="from" author={author} date={date}>
							<Text>Message</Text>
						</Move>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							move: {
								id: 43,
								type: 'from',
								author: author,
								date: date,
							},
						}}
					>
						<Move id={44} type="from" author={author} date={date}>
							<Text>
								Critique of social and familial repression,
								especially against women
							</Text>
						</Move>
					</Paragraph>
				</Cell>
			</Row>
		</Table>
		<MoveFromRangeEnd id={13} />
	</Section>
).toFile('track-changes-move-table.docx');
