/** @jsx Docx.jsx */
import Docx, { Comment, CommentRangeEnd, CommentRangeStart, Paragraph } from '../mod.ts';

const docx = Docx.fromNothing();

const comment = docx.document.comments.add(
	{
		author: 'Wybe',
		date: new Date(),
		initials: 'X',
	},
	<Paragraph>According to some</Paragraph>,
);

docx.document.set(
	<Paragraph>
		NSYNC is the <CommentRangeStart id={comment} />
		<Comment id={comment} />
		grea test
		<CommentRangeEnd id={comment} /> band in history.
	</Paragraph>,
);

await docx.toFile('comments.docx');
