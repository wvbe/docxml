/** @jsx  Docx.jsx */
import Docx, {
	cm,
	Image,
	Move,
	MoveFromRangeEnd,
	MoveFromRangeStart,
	MoveToRangeEnd,
	MoveToRangeStart,
	Paragraph,
	Section,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

await Docx.fromJsx(
	<Section>
		{/* Image MoveTo */}
		<Paragraph>
			<MoveToRangeStart
				id={11}
				name="move_1"
				author={author}
				date={date}
			/>
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
			<MoveToRangeEnd id={11} />
		</Paragraph>
		<Paragraph>
			<Text isBold isCaps>
				Old picture
			</Text>
		</Paragraph>
		{/* Image MoveFrom */}
		<Paragraph>
			<MoveFromRangeStart
				id={8}
				name="move_1"
				author={author}
				date={date}
			/>
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
			<MoveFromRangeEnd id={8} />
		</Paragraph>
	</Section>
).toFile('track-changes-move-image.docx');
