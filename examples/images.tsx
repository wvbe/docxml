/** @jsx Docx.jsx */
import Docx, { cm, Image, Paragraph, Text } from '../mod.ts';

await Docx.fromJsx(
	<Paragraph>
		<Text>
			<Image
				data={Deno.readFile('test/spacekees.jpeg')}
				width={cm(16)}
				height={cm(16)}
				title="Title"
				alt="Description"
			/>
		</Text>
	</Paragraph>,
).toFile('images.docx');
