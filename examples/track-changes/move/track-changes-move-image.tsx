/** @jsx  Docx.jsx */
import Docx, {
	cm,
	Image,
	Move,
	MoveRangeEnd,
	MoveRangeStart,
	Paragraph,
	Section,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

await Docx.fromJsx(
	<Section>
		{/* Image MoveTo */}
		<Paragraph
			pilcrow={{
				move: { id: 10, type: 'to', author: author, date: date },
			}}
		>
			<MoveRangeStart
				id={11}
				type="to"
				name="move_1"
				author={author}
				date={date}
			></MoveRangeStart>
			<Move id={12} type="to" author={author} date={date}>
				<Text>
					<Image
						data={Deno.readFile('assets/oldPhoto.jpg')}
						width={cm(6)}
						height={cm(8)}
						title="Title"
						alt="Description"
					/>
				</Text>
			</Move>
			<MoveRangeEnd id={11} type="to"></MoveRangeEnd>
		</Paragraph>
		<Paragraph>
			<Text isBold isCaps>
				Old picture
			</Text>
		</Paragraph>
		{/* Image MoveFrom */}
		<Paragraph
			pilcrow={{
				move: { id: 7, type: 'from', author: author, date: date },
			}}
		>
			<MoveRangeStart
				id={8}
				type="from"
				name="move_1"
				author={author}
				date={date}
			></MoveRangeStart>
			<Move id={9} type="from" author={author} date={date}>
				<Text>
					<Image
						data={Deno.readFile('assets/oldPhoto.jpg')}
						width={cm(6)}
						height={cm(8)}
						title="Title"
						alt="Description"
					/>
				</Text>
			</Move>
			<MoveRangeEnd id={8} type="from"></MoveRangeEnd>
		</Paragraph>
	</Section>
).toFile('track-changes-move-image.docx');
