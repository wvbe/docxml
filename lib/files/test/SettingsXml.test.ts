import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import Docx from '@fontoxml/docxml';

import { RelationshipType } from '../../enums.ts';
import { serialize } from '../../utilities/src/dom.ts';
import { pt } from '../../utilities/src/length.ts';
import {
	type DocumentProtectionProps,
	SettingsXml,
} from '../src/SettingsXml.ts';

describe('SettingsXml', () => {
	it('evenAndOddHeaders', () => {
		const settings = new SettingsXml('test');
		expect(settings.get('evenAndOddHeaders')).toBe(false);
		settings.set('evenAndOddHeaders', true);
		expect(settings.get('evenAndOddHeaders')).toBe(true);
	});
	it('isTrackChangesEnabled', () => {
		const settings = new SettingsXml('test');
		expect(settings.get('isTrackChangesEnabled')).toBe(false);
		settings.set('isTrackChangesEnabled', true);
		expect(settings.get('isTrackChangesEnabled')).toBe(true);
	});
	it('attachedTemplate', () => {
		const settings = new SettingsXml('test');
		expect(settings.get('attachedTemplate')).toBe(null);
		settings.set('attachedTemplate', 'foobar');
		expect(settings.get('attachedTemplate')).toBe('foobar');
		const meta = settings.relationships.meta.find(
			(meta) => meta.type === RelationshipType.attachedTemplate
		);
		expect(meta).toBeTruthy();
		expect(settings.relationships.getTarget(meta?.id as string)).toBe(
			'foobar'
		);
	});
	it('defaultTabStop', () => {
		const settings = new SettingsXml('test');
		expect(settings.get('defaultTabStop')).toBe(null);
		settings.set('defaultTabStop', pt(50));
		expect(settings.get('defaultTabStop')).toEqual(pt(50));
	});
	it('footnoteProperties', () => {
		const settings = new SettingsXml('test');
		expect(settings.get('footnoteProperties')).toBe(null);
		settings.set('footnoteProperties', {
			restart: 'continuous',
			numberingFormat: 'lowerRoman',
			position: 'beneathText',
		});
		expect(settings.get('footnoteProperties')).toEqual({
			restart: 'continuous',
			numberingFormat: 'lowerRoman',
			position: 'beneathText',
		});
	});
	it('documentProtection with edit property', async () => {
		const settings = new SettingsXml('test');
		expect(settings.get('documentProtection')).toBe(null);
		settings.set('documentProtection', {
			edit: 'readOnly',
			enforcement: true,
		});
		expect(settings.get('documentProtection')).toEqual({
			edit: 'readOnly',
			enforcement: true,
		});

		expect(serialize(await settings.$$$toNode())).toEqual(
			`<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:documentProtection w:edit="readOnly" w:enforcement="true"/></w:settings>`
		);

		const docx = Docx.fromNothing();
		const customSettings: DocumentProtectionProps = {
			edit: 'trackedChanges',
			enforcement: false,
		};
		docx.document.settings.set('documentProtection', customSettings);
		const docxFromArchive = await Docx.fromArchive(await docx.toArchive());
		expect(
			docxFromArchive.document.settings.get('documentProtection')
		).toEqual(customSettings);
	});
	it('documentProtection without edit', async () => {
		const settings = new SettingsXml('test');
		expect(settings.get('documentProtection')).toBe(null);
		settings.set('documentProtection', {
			enforcement: true,
		});
		expect(settings.get('documentProtection')).toEqual({
			enforcement: true,
		});

		expect(serialize(await settings.$$$toNode())).toEqual(
			`<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:documentProtection w:enforcement="true"/></w:settings>`
		);

		const docx = Docx.fromNothing();
		const customSettings: DocumentProtectionProps = {
			enforcement: false,
		};
		docx.document.settings.set('documentProtection', customSettings);
		const docxFromArchive = await Docx.fromArchive(await docx.toArchive());
		expect(
			docxFromArchive.document.settings.get('documentProtection')
		).toEqual(customSettings);
	});

	describe('compatibilityMode', () => {
		it('compatibilityMode default is null', async () => {
			const settings = new SettingsXml('test');
			expect(settings.get('compatibilityMode')).toBe(null);
			expect(serialize(await settings.$$$toNode())).toEqual(
				`<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`
			);
		});
		it('compatibilityMode set and get', async () => {
			const settings = new SettingsXml('test');
			settings.set('compatibilityMode', 15);
			expect(settings.get('compatibilityMode')).toBe(15);
			expect(serialize(await settings.$$$toNode())).toEqual(
				`<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`
			);
		});
		it('compatibilityMode roundtrips through archive', async () => {
			const docx = Docx.fromNothing();
			docx.document.settings.set('compatibilityMode', 15);
			const docxFromArchive = await Docx.fromArchive(
				await docx.toArchive()
			);
			expect(
				docxFromArchive.document.settings.get('compatibilityMode')
			).toBe(15);
		});
		it('compatibilityMode null roundtrips through archive', async () => {
			const docx = Docx.fromNothing();
			const docxFromArchive = await Docx.fromArchive(
				await docx.toArchive()
			);
			expect(
				docxFromArchive.document.settings.get('compatibilityMode')
			).toBe(null);
		});
	});
});
