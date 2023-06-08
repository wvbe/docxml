import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { RelationshipType } from '../enums.ts';
import { SettingsXml } from './SettingsXml.ts';

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
			(meta) => meta.type === RelationshipType.attachedTemplate,
		);
		expect(meta).toBeTruthy();
		expect(settings.relationships.getTarget(meta?.id as string)).toBe('foobar');
	});
});

run();
