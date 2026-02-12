import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Docx } from '../../Docx.ts';
import { Paragraph } from '../../components/document/src/Paragraph.ts';
import { Section } from '../../components/document/src/Section.ts';
import { Text } from '../../components/document/src/Text.ts';
import { serialize } from '../../utilities/src/dom.ts';
import { pt } from '../../utilities/src/length.ts';
import { StylesXml } from '../src/StylesXml.ts';

describe('Styles', () => {
	it('Serializes paragraph styles correctly', async () => {
		const stylesXml = new StylesXml('test');
		stylesXml.add({
			type: 'paragraph',
			basedOn: 'derp',
			id: 'nerf',
			isDefault: true,
			name: 'Derp',
			paragraph: {
				alignment: 'center',
			},
		});
		expect(serialize(await stylesXml.$$$toNode())).toBe(
			`<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:latentStyles w:defLockedState="0" w:defUIPriority="99" w:defSemiHidden="0" w:defUnhideWhenUsed="0" w:defQFormat="0" w:count="1"/>
				<w:style w:type="paragraph" w:styleId="nerf" w:default="1">
					<w:name w:val="Derp"/>
					<w:basedOn w:val="derp"/>
					<w:pPr>
						<w:jc w:val="center"/>
					</w:pPr>
					<w:tblPr/>
				</w:style>
			</w:styles>`.replace(/\n|\t/g, '')
		);
	});

	it('Serializes table styles and table conditional styles correctly', async () => {
		const stylesXml = new StylesXml('test');
		stylesXml.add({
			type: 'table',
			id: 'test',
			table: {
				borders: {
					top: { color: '000000' },
				},
				conditions: {
					lastCol: {
						cell: {
							borders: {
								top: { color: '000000' },
							},
						},
					},
				},
			},
		});
		const node = await stylesXml.$$$toNode();
		expect(serialize(node)).toBe(
			`<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:latentStyles w:defLockedState="0" w:defUIPriority="99" w:defSemiHidden="0" w:defUnhideWhenUsed="0" w:defQFormat="0" w:count="1"/>
				<w:style w:type="table" w:styleId="test">
					<w:tblPr>
						<w:tblBorders>
							<w:top w:color="000000"/>
						</w:tblBorders>
					</w:tblPr>
					<w:tblStylePr w:type="lastCol">
						<w:tcPr>
							<w:tcBorders>
								<w:top w:color="000000"/>
							</w:tcBorders>
						</w:tcPr>
					</w:tblStylePr>
				</w:style>
			</w:styles>`.replace(/\n|\t/g, '')
		);

		const reparsed = StylesXml.fromDom(node, 'derp').get('test');
		expect(
			reparsed?.table?.conditions?.lastCol?.cell?.borders?.top
		).toEqual({
			type: null,
			width: null,
			spacing: null,
			color: '000000',
		});
	});

	it('can read a document with no theme', async () => {
		const docx = Docx.fromNothing();
		const style = docx.document.styles.add({
			id: 'Text',
			name: 'Text',
			type: 'paragraph',
			text: {
				fontSize: pt(9),
			},
		});
		docx.document.set([
			new Section({}, new Paragraph({ style }, new Text({}, 'foo'))),
		]);
		const archive = await docx.toArchive();

		// word/theme/theme1.xml is the default location for the first theme that is included in a document.
		let theme: string | null;
		try {
			theme = await archive.readText('word/theme/theme1.xml');
		} catch (_) {
			theme = null;
		}
		// It shouldn't be there.
		expect(theme).toBeFalsy();

		// styles.xml is the default location for the first theme that is included in a document.
		// This call shouldn't crash if there's no theme.
		const styles = await StylesXml.fromArchive(archive, 'styles.xml');
		expect(styles).toBeTruthy();

		// Same here, shouldn't crash when loading the whole doc.
		const fromArchive = Docx.fromArchive(archive);
		expect(fromArchive).toBeTruthy();
	});
});
