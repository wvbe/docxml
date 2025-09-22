/** @jsx  Docx.jsx */
import Docx, {
	Cell,
	cm,
	Image,
	Move,
	MoveRangeEnd,
	MoveRangeStart,
	Paragraph,
	Row,
	Section,
	Table,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

const api = Docx.fromNothing();
const numbering = api.document.numbering.add({
	type: 'hybridMultilevel',
	levels: [
		{
			alignment: 'left',
			format: 'decimalZero',
			start: 1,
			affix: '%1',
		},
		{
			alignment: 'left',
			format: 'lowerRoman',
			start: 1,
			affix: '%1',
			paragraph: {
				indentation: {
					start: cm(1),
				},
				shading: {
					background: 'yellow',
				},
			},
		},
		{
			alignment: 'left',
			format: 'lowerLetter',
			start: 1,
			affix: '%1',
			paragraph: {
				indentation: {
					start: cm(2),
				},
			},
		},
	],
});

await Docx.fromJsx(
	<Section>
		{/* List MoveTo */}
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				move: { id: 26, type: 'to', author: author, date: date },
			}}
		>
			<MoveRangeStart
				id={27}
				type="to"
				name="move_3"
				author={author}
				date={date}
			></MoveRangeStart>
			<Move id={28} type="to" author={author} date={date}>
				<Text>
					The play is set in a house in Andalusia, shortly before the
					Spanish Civil War.
				</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				move: { id: 29, type: 'to', author: author, date: date },
			}}
		>
			<Move id={30} type="to" author={author} date={date}>
				<Text>
					Bernarda Alba imposes an eight-year mourning period after
					her husband’s death.
				</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 1 }}
			pilcrow={{
				move: { id: 31, type: 'to', author: author, date: date },
			}}
		>
			<Move id={32} type="to" author={author} date={date}>
				<Text>Uses mourning to control her daughters</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 2 }}
			pilcrow={{
				move: { id: 33, type: 'to', author: author, date: date },
			}}
		>
			<Move id={34} type="to" author={author} date={date}>
				<Text>No courtship or social contact allowed</Text>
			</Move>
		</Paragraph>
		<MoveRangeEnd id={27} type="to"></MoveRangeEnd>
		<Paragraph>
			<Text>Key Points List</Text>
		</Paragraph>
		{/* List MoveFrom */}
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				move: { id: 17, type: 'from', author: author, date: date },
			}}
		>
			<MoveRangeStart
				id={18}
				type="from"
				name="move_3"
				author={author}
				date={date}
			></MoveRangeStart>
			<Move id={19} type="from" author={author} date={date}>
				<Text>
					The play is set in a house in Andalusia, shortly before the
					Spanish Civil War.
				</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				move: { id: 20, type: 'from', author: author, date: date },
			}}
		>
			<Move id={21} type="from" author={author} date={date}>
				<Text>
					Bernarda Alba imposes an eight-year mourning period after
					her husband’s death.
				</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 1 }}
			pilcrow={{
				move: { id: 22, type: 'from', author: author, date: date },
			}}
		>
			<Move id={23} type="from" author={author} date={date}>
				<Text>Uses mourning to control her daughters</Text>
			</Move>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 2 }}
			pilcrow={{
				move: { id: 24, type: 'from', author: author, date: date },
			}}
		>
			<Move id={25} type="from" author={author} date={date}>
				<Text>No courtship or social contact allowed</Text>
			</Move>
		</Paragraph>
		<MoveRangeEnd id={18} type="from"></MoveRangeEnd>
	</Section>
).toFile('track-changes-move-list.docx');
