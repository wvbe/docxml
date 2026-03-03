/** @jsx  Docx.jsx */
import { Text } from '../lib/components/document/src/Text.ts';
import type { DocumentProtectionProps } from '../lib/files/src/SettingsXml.ts';
import { cm } from '../lib/utilities/src/length.ts';
import Docx, { Paragraph, Section } from '../mod.ts';

const docxFile = Docx.fromNothing();

const documentProtection: DocumentProtectionProps = {
	edit: 'readOnly',
	enforcement: true,
};

docxFile.document.settings.set('documentProtection', documentProtection);

docxFile.document.set(
	<Section pageWidth={cm(20)} pageHeight={cm(20)}>
		<Paragraph>
			<Text>This is some protected text</Text>
		</Paragraph>
	</Section>
);

await docxFile.toFile('protected-document.docx');
