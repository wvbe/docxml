/** @jsx  Docx.jsx */
import type { ParagraphProperties } from '../../lib/properties/src/paragraph-properties.ts';
import type { ChangeInformation } from '../../lib/utilities/src/changes.ts';
import { pt } from '../../lib/utilities/src/length.ts';
import Docx, { Paragraph, Section, Text } from '../../mod.ts';
// An example of modifying paragraph properties so they will
// appear as tracked changes in MS Word.

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

// Create a new paragraph that includes some text.
const firstParagraph = new Paragraph(
	{},
	new Text(
		{},
		`In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.`
	)
);

// This paragraph will include a tracked change to its properties. We do this by adding a
// "change" property to our paragraph.
//
// The content of the "change" property will be registered as the old property by MS Word.
// In this case, the original version of our paragraph had NO styling, and the new
// version has a black border above and below.
const secondParagraph = new Paragraph(
	{
		borders: {
			top: {
				color: 'black',
				width: pt(1),
				type: 'single',
				spacing: 1,
			},
			bottom: {
				color: 'black',
				width: pt(1),
				type: 'single',
				spacing: 1,
			},
		},
		change: {
			id: 0,
			date: new Date(),
			author: 'F. Scott Fitzgerald',
		},
	},
	new Text(
		{ isItalic: true },
		`“Whenever you feel like criticizing anyone,” he told me, “just remember that all the people in this world haven't had the advantages that you've had.”`
	)
);

// In this case, our Paragraph's change property indicates a center alignment. This means Word will treat
// it as the original condition. The paragraph has a left alignment, so Word  will interpret
// the formatting as going from center aligned to left aligned.
const thirdParagraph = new Paragraph(
	{
		alignment: 'left',
		change: {
			author: 'Gabe',
			id: 2,
			date: new Date(),
			alignment: 'center',
		},
	},
	new Text(
		{},
		`He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.`
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section(
	{},
	firstParagraph,
	secondParagraph,
	thirdParagraph
);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-paragraph-properties.docx');

// We can also do the same with JSX. 
// First, we'll need to create an object with our change properties. 
const myChange: Omit<ParagraphProperties, 'change'> & ChangeInformation = {
	id: 3,
	author: 'Jane Austen',
	date: new Date(),
	alignment: 'center',
};

// Then create our markup. 
await Docx.fromJsx(
	<Section>
		<Paragraph alignment="center">
			<Text>Chapter I</Text>
		</Paragraph>
		<Paragraph alignment="left" change={myChange}>
			<Text>
				Emma Woodhouse, handsome, clever, and rich, with a comfortable
				home and happy disposition, seemed to unite some of the best
				blessings of existence; and had lived nearly twenty-one years in
				the world with very little to distress or vex her.
			</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				She was the youngest of the two daughters of a most
				affectionate, indulgent father; and had, in consequence of her
				sister’s marriage, been mistress of his house from a very early
				period. Her mother had died too long ago for her to have more
				than an indistinct remembrance of her caresses; and her place
				had been supplied by an excellent woman as governess, who had
				fallen little short of a mother in affection.
			</Text>
		</Paragraph>
	</Section>
).toFile('track-changes-paragraph-properties-jsx.docx');
