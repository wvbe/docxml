import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import { Archive } from '../../classes/src/Archive.ts';
import { parse, serialize } from '../../utilities/src/dom.ts';
import {
	ThemeXml,
	type ColorScheme,
	type FontScheme,
	type LatinFont,
} from '../src/ThemeXml.ts';

describe('ThemeXml', () => {
	describe('fromArchive', () => {
		it('throws when the archive is unreadable', () => {
			const fakeArchive = new Archive();
			expect(
				ThemeXml.fromArchive(fakeArchive, undefined)
			).rejects.toThrow();
		});
	});

	describe('constructor defaults', () => {
		it('initializes with empty name', () => {
			const theme = new ThemeXml('word/theme/theme1.xml');
			expect(theme.name).toBe('');
		});

		it('initializes colorScheme as null', () => {
			const theme = new ThemeXml('word/theme/theme1.xml');
			expect(theme.colorScheme).toBeNull();
		});

		it('initializes fontScheme with Times New Roman fallback', () => {
			const theme = new ThemeXml('word/theme/theme1.xml');
			expect(theme.fontScheme.majorFont.latinFont.typeface).toBe(
				'Times New Roman'
			);
			expect(theme.fontScheme.minorFont.latinFont.typeface).toBe(
				'Times New Roman'
			);
			expect(theme.fontScheme.majorFont.otherFonts).toEqual([]);
			expect(theme.fontScheme.minorFont.otherFonts).toEqual([]);
		});
	});

	describe('accessors', () => {
		it('get/set name', () => {
			const theme = new ThemeXml('loc');
			theme.name = 'Custom Theme';
			expect(theme.name).toBe('Custom Theme');
		});

		it('get/set colorScheme', () => {
			const theme = new ThemeXml('loc');
			const scheme: ColorScheme = {
				name: 'Test',
				dark1: { type: 'srgbClr', value: '000000' },
				light1: { type: 'srgbClr', value: 'FFFFFF' },
				dark2: { type: 'srgbClr', value: '111111' },
				light2: { type: 'srgbClr', value: 'EEEEEE' },
				accent1: { type: 'srgbClr', value: 'AA0000' },
				accent2: { type: 'srgbClr', value: '00AA00' },
				accent3: { type: 'srgbClr', value: '0000AA' },
				accent4: { type: 'srgbClr', value: 'AAAA00' },
				accent5: { type: 'srgbClr', value: '00AAAA' },
				accent6: { type: 'srgbClr', value: 'AA00AA' },
				hyperlink: { type: 'srgbClr', value: '0000FF' },
				followedHyperlink: { type: 'srgbClr', value: '800080' },
			};
			theme.colorScheme = scheme;
			expect(theme.colorScheme).toBe(scheme);
			theme.colorScheme = null;
			expect(theme.colorScheme).toBeNull();
		});

		it('get/set fontScheme', () => {
			const theme = new ThemeXml('loc');
			const newScheme: FontScheme = {
				name: 'MyFonts',
				majorFont: {
					latinFont: { typeface: 'Arial' },
					otherFonts: [],
				},
				minorFont: {
					latinFont: { typeface: 'Verdana' },
					otherFonts: [],
				},
			};
			theme.fontScheme = newScheme;
			expect(theme.fontScheme).toBe(newScheme);
		});

		it('get/set majorFonts', () => {
			const theme = new ThemeXml('loc');
			const major = {
				latinFont: { typeface: 'Georgia', panose: '0200' } as LatinFont,
				otherFonts: [{ script: 'Jpan', typeface: 'MS Gothic' }],
			};
			theme.majorFont = major;
			expect(theme.majorFont).toBe(major);
			expect(theme.fontScheme.majorFont).toBe(major);
		});

		it('get/set minorFonts', () => {
			const theme = new ThemeXml('loc');
			const minor = {
				latinFont: { typeface: 'Tahoma' } as LatinFont,
				otherFonts: [{ script: 'Arab', typeface: 'Arial' }],
			};
			theme.minorFont = minor;
			expect(theme.minorFont).toBe(minor);
			expect(theme.fontScheme.minorFont).toBe(minor);
		});
	});

	describe('fromDom / toNode — font scheme only', () => {
		const fontOnlyXml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:fontScheme><a:majorFont><a:latin typeface="Calibri Light" panose="020F0302020204030204"/><a:font script="Jpan" typeface="Light"/><a:font script="Hang" typeface="this"/></a:majorFont><a:minorFont><a:latin typeface="Calibri" panose="020F0502020204030204"/><a:font script="Jpan" typeface="this"/><a:font script="Hang" typeface="this"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;

		it('parses font scheme from XML', async () => {
			const dom = parse(fontOnlyXml);
			const theme = await ThemeXml.fromDom(dom, 'loc');
			expect(theme.fontScheme.name).toBe('');
			expect(theme.fontScheme.majorFont.latinFont.typeface).toBe(
				'Calibri Light'
			);
			expect(theme.fontScheme.majorFont.latinFont.panose).toBe(
				'020F0302020204030204'
			);
			expect(theme.fontScheme.majorFont.otherFonts).toEqual([
				{ script: 'Jpan', typeface: 'Light' },
				{ script: 'Hang', typeface: 'this' },
			]);
			expect(theme.fontScheme.minorFont.latinFont.typeface).toBe(
				'Calibri'
			);
			expect(theme.fontScheme.minorFont.otherFonts).toHaveLength(2);
		});

		it('round-trips font-only theme XML', async () => {
			const dom = parse(fontOnlyXml);
			const theme = await ThemeXml.fromDom(dom, 'loc');
			expect(serialize(theme.toNode())).toBe(fontOnlyXml);
		});
	});

	describe('fromDom / toNode — theme name', () => {
		it('parses theme name attribute', async () => {
			const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Cambria"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;
			const theme = await ThemeXml.fromDom(parse(xml), 'loc');
			expect(theme.name).toBe('Office Theme');
			expect(theme.fontScheme.name).toBe('Office');
		});

		it('serializes theme name attribute', async () => {
			const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Cambria"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;
			const theme = await ThemeXml.fromDom(parse(xml), 'loc');
			const output = serialize(theme.toNode());
			expect(output).toContain('name="Office Theme"');
			expect(output).toContain('name="Office"');
		});

		it('omits name attribute when empty', () => {
			const theme = new ThemeXml('loc');
			const output = serialize(theme.toNode());
			expect(output).not.toContain('name="Office');
			expect(output).toContain('<a:theme ');
		});
	});

	describe('fromDom / toNode — color scheme', () => {
		const colorSchemeXml = `
			<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
				<a:themeElements>
					<a:clrScheme name="Office">
						<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
						<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
						<a:dk2><a:srgbClr val="1F497D"/></a:dk2>
						<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
						<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>
						<a:accent2><a:srgbClr val="C0504D"/></a:accent2>
						<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>
						<a:accent4><a:srgbClr val="8064A2"/></a:accent4>
						<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>
						<a:accent6><a:srgbClr val="F79646"/></a:accent6>
						<a:hlink><a:srgbClr val="0000FF"/></a:hlink>
						<a:folHlink><a:srgbClr val="800080"/></a:folHlink>
					</a:clrScheme>
					<a:fontScheme>
						<a:majorFont><a:latin typeface="Calibri"/></a:majorFont>
						<a:minorFont><a:latin typeface="Cambria"/></a:minorFont>
					</a:fontScheme>
				</a:themeElements>
			</a:theme>`;
		const colorSchemeNormalized = colorSchemeXml
			.replace(/>\s+</g, '><')
			.trim();

		it('parses system colors (sysClr) with lastClr', async () => {
			const theme = await ThemeXml.fromDom(parse(colorSchemeXml), 'loc');
			expect(theme.colorScheme).not.toBeNull();
			expect(theme.colorScheme!.name).toBe('Office');
			expect(theme.colorScheme!.dark1).toEqual({
				type: 'sysClr',
				value: 'windowText',
				lastClr: '000000',
			});
			expect(theme.colorScheme!.light1).toEqual({
				type: 'sysClr',
				value: 'window',
				lastClr: 'FFFFFF',
			});
		});

		it('parses sRGB colors (srgbClr)', async () => {
			const theme = await ThemeXml.fromDom(parse(colorSchemeXml), 'loc');
			expect(theme.colorScheme!.dark2).toEqual({
				type: 'srgbClr',
				value: '1F497D',
				lastClr: '',
			});
			expect(theme.colorScheme!.accent1).toEqual({
				type: 'srgbClr',
				value: '4F81BD',
				lastClr: '',
			});
		});

		it('parses all 12 color slots', async () => {
			const theme = await ThemeXml.fromDom(parse(colorSchemeXml), 'loc');
			const cs = theme.colorScheme!;
			expect(cs.dark1.value).toBe('windowText');
			expect(cs.light1.value).toBe('window');
			expect(cs.dark2.value).toBe('1F497D');
			expect(cs.light2.value).toBe('EEECE1');
			expect(cs.accent1.value).toBe('4F81BD');
			expect(cs.accent2.value).toBe('C0504D');
			expect(cs.accent3.value).toBe('9BBB59');
			expect(cs.accent4.value).toBe('8064A2');
			expect(cs.accent5.value).toBe('4BACC6');
			expect(cs.accent6.value).toBe('F79646');
			expect(cs.hyperlink.value).toBe('0000FF');
			expect(cs.followedHyperlink.value).toBe('800080');
		});

		it('round-trips color scheme XML', async () => {
			const theme = await ThemeXml.fromDom(parse(colorSchemeXml), 'loc');
			const output = serialize(theme.toNode());
			expect(output).toBe(colorSchemeNormalized);
		});

		it('colorScheme is null when XML has no clrScheme', async () => {
			const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:fontScheme><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Cambria"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;
			const theme = await ThemeXml.fromDom(parse(xml), 'loc');
			expect(theme.colorScheme).toBeNull();
		});

		it('does not emit clrScheme when colorScheme is null', () => {
			const theme = new ThemeXml('loc');
			const output = serialize(theme.toNode());
			expect(output).not.toContain('clrScheme');
		});
	});

	describe('fromDom / toNode — panose handling', () => {
		it('handles fonts without panose attribute', async () => {
			const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:fontScheme><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Cambria"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;
			const theme = await ThemeXml.fromDom(parse(xml), 'loc');
			// fontoxpath returns null for a missing attribute
			expect(theme.fontScheme.majorFont.latinFont.panose).toBeNull();
			// Round-trip should NOT produce a panose attribute
			const output = serialize(theme.toNode());
			expect(output).not.toContain('panose');
		});

		it('preserves panose when present', async () => {
			const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:fontScheme><a:majorFont><a:latin typeface="Calibri" panose="020F0302020204030204"/></a:majorFont><a:minorFont><a:latin typeface="Cambria" panose="020F0502020204030204"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>`;
			const theme = await ThemeXml.fromDom(parse(xml), 'loc');
			expect(theme.fontScheme.majorFont.latinFont.panose).toBe(
				'020F0302020204030204'
			);
			const output = serialize(theme.toNode());
			expect(output).toContain('panose="020F0302020204030204"');
			expect(output).toContain('panose="020F0502020204030204"');
		});
	});

	describe('fromDom / toNode — full theme round-trip', () => {
		const fullThemeXml = `
			<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
				<a:themeElements>
					<a:clrScheme name="Office">
						<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
						<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
						<a:dk2><a:srgbClr val="1F497D"/></a:dk2>
						<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
						<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>
						<a:accent2><a:srgbClr val="C0504D"/></a:accent2>
						<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>
						<a:accent4><a:srgbClr val="8064A2"/></a:accent4>
						<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>
						<a:accent6><a:srgbClr val="F79646"/></a:accent6>
						<a:hlink><a:srgbClr val="0000FF"/></a:hlink>
						<a:folHlink><a:srgbClr val="800080"/></a:folHlink>
					</a:clrScheme>
					<a:fontScheme name="Office">
						<a:majorFont>
							<a:latin typeface="Calibri" panose="020F0302020204030204"/>
							<a:font script="Jpan" typeface="MS Gothic"/>
							<a:font script="Hang" typeface="맑은 고딕"/>
						</a:majorFont>
						<a:minorFont>
							<a:latin typeface="Cambria" panose="020F0502020204030204"/>
							<a:font script="Jpan" typeface="MS 明朝"/>
							<a:font script="Arab" typeface="Arial"/>
						</a:minorFont>
					</a:fontScheme>
				</a:themeElements>
			</a:theme>`;
		const fullThemeNormalized = fullThemeXml.replace(/>\s+</g, '><').trim();

		it('round-trips a full theme with all schemes', async () => {
			const theme = await ThemeXml.fromDom(parse(fullThemeXml), 'loc');
			expect(theme.name).toBe('Office Theme');
			expect(theme.colorScheme).not.toBeNull();
			expect(theme.fontScheme.name).toBe('Office');
			expect(theme.fontScheme.majorFont.otherFonts).toHaveLength(2);
			expect(theme.fontScheme.minorFont.otherFonts).toHaveLength(2);
			const output = serialize(theme.toNode());
			expect(output).toBe(fullThemeNormalized);
		});
	});

	describe('programmatic construction and serialization', () => {
		it('builds a theme from scratch and serializes it', () => {
			const theme = new ThemeXml('word/theme/theme1.xml');
			theme.name = 'My Theme';
			theme.fontScheme = {
				name: 'Custom',
				majorFont: {
					latinFont: { typeface: 'Helvetica' },
					otherFonts: [{ script: 'Arab', typeface: 'Arial' }],
				},
				minorFont: {
					latinFont: { typeface: 'Georgia' },
					otherFonts: [],
				},
			};
			const output = serialize(theme.toNode());
			expect(output).toContain('name="My Theme"');
			expect(output).toContain('name="Custom"');
			expect(output).toContain('typeface="Helvetica"');
			expect(output).toContain('script="Arab"');
			expect(output).toContain('typeface="Georgia"');
			expect(output).not.toContain('clrScheme');
		});

		it('builds a theme with color scheme from scratch', () => {
			const theme = new ThemeXml('word/theme/theme1.xml');
			theme.colorScheme = {
				name: 'Vivid',
				dark1: { type: 'srgbClr', value: '000000' },
				light1: { type: 'srgbClr', value: 'FFFFFF' },
				dark2: { type: 'srgbClr', value: '222222' },
				light2: { type: 'srgbClr', value: 'DDDDDD' },
				accent1: { type: 'srgbClr', value: 'FF0000' },
				accent2: { type: 'srgbClr', value: '00FF00' },
				accent3: { type: 'srgbClr', value: '0000FF' },
				accent4: { type: 'srgbClr', value: 'FFFF00' },
				accent5: { type: 'srgbClr', value: '00FFFF' },
				accent6: { type: 'srgbClr', value: 'FF00FF' },
				hyperlink: { type: 'srgbClr', value: '0066CC' },
				followedHyperlink: { type: 'srgbClr', value: '663399' },
			};
			const output = serialize(theme.toNode());
			expect(output).toContain('clrScheme name="Vivid"');
			expect(output).toContain(
				'<a:dk1><a:srgbClr val="000000"/></a:dk1>'
			);
			expect(output).toContain(
				'<a:accent1><a:srgbClr val="FF0000"/></a:accent1>'
			);
			expect(output).toContain(
				'<a:hlink><a:srgbClr val="0066CC"/></a:hlink>'
			);
			expect(output).toContain(
				'<a:folHlink><a:srgbClr val="663399"/></a:folHlink>'
			);
		});

		it('serializes sysClr with lastClr attribute', () => {
			const theme = new ThemeXml('loc');
			theme.colorScheme = {
				name: 'Sys',
				dark1: {
					type: 'sysClr',
					value: 'windowText',
					lastClr: '000000',
				},
				light1: { type: 'sysClr', value: 'window', lastClr: 'FFFFFF' },
				dark2: { type: 'srgbClr', value: '111111' },
				light2: { type: 'srgbClr', value: 'EEEEEE' },
				accent1: { type: 'srgbClr', value: 'AA0000' },
				accent2: { type: 'srgbClr', value: '00AA00' },
				accent3: { type: 'srgbClr', value: '0000AA' },
				accent4: { type: 'srgbClr', value: 'AAAA00' },
				accent5: { type: 'srgbClr', value: '00AAAA' },
				accent6: { type: 'srgbClr', value: 'AA00AA' },
				hyperlink: { type: 'srgbClr', value: '0000FF' },
				followedHyperlink: { type: 'srgbClr', value: '800080' },
			};
			const output = serialize(theme.toNode());
			expect(output).toContain(
				'<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>'
			);
			expect(output).toContain(
				'<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>'
			);
		});
	});

	describe('resolveFont', () => {
		function createThemeWithFonts(
			overrides: Partial<{
				majorLatinTypeface: string;
				minorLatinTypeface: string;
				majorOtherFonts: { script: string; typeface: string }[];
				minorOtherFonts: { script: string; typeface: string }[];
			}> = {}
		): ThemeXml {
			const theme = new ThemeXml('loc');
			theme.fontScheme = {
				name: '',
				majorFont: {
					latinFont: {
						typeface:
							overrides.majorLatinTypeface ?? 'Calibri Light',
						panose: '020F0302020204030204',
					},
					otherFonts: overrides.majorOtherFonts ?? [],
				},
				minorFont: {
					latinFont: {
						typeface: overrides.minorLatinTypeface ?? 'Calibri',
						panose: '020F0502020204030204',
					},
					otherFonts: overrides.minorOtherFonts ?? [],
				},
			};
			return theme;
		}

		it('resolves "minorHAnsi" to the minor latin font', () => {
			const theme = createThemeWithFonts({
				minorLatinTypeface: 'Calibri',
			});
			expect(theme.resolveFont('minorHAnsi')).toBe('Calibri');
		});

		it('resolves "majorHAnsi" to the major latin font', () => {
			const theme = createThemeWithFonts({
				majorLatinTypeface: 'Calibri Light',
			});
			expect(theme.resolveFont('majorHAnsi')).toBe('Calibri Light');
		});

		it('resolves "minorAscii" to the minor latin font', () => {
			const theme = createThemeWithFonts({ minorLatinTypeface: 'Arial' });
			expect(theme.resolveFont('minorAscii')).toBe('Arial');
		});

		it('resolves "majorAscii" to the major latin font', () => {
			const theme = createThemeWithFonts({
				majorLatinTypeface: 'Times New Roman',
			});
			expect(theme.resolveFont('majorAscii')).toBe('Times New Roman');
		});

		it('resolves "minorEastAsia" to the matching script font', () => {
			const theme = createThemeWithFonts({
				minorOtherFonts: [
					{ script: 'Jpan', typeface: 'MS Mincho' },
					{ script: 'Arab', typeface: 'Arabic Font' },
				],
			});
			expect(theme.resolveFont('minorEastAsia')).toBe('MS Mincho');
		});

		it('resolves "majorEastAsia" to the matching script font', () => {
			const theme = createThemeWithFonts({
				majorOtherFonts: [{ script: 'Hans', typeface: 'SimSun' }],
			});
			expect(theme.resolveFont('majorEastAsia')).toBe('SimSun');
		});

		it('resolves "minorBidi" to the matching bidi script font', () => {
			const theme = createThemeWithFonts({
				minorOtherFonts: [{ script: 'Arab', typeface: 'Arial Arabic' }],
			});
			expect(theme.resolveFont('minorBidi')).toBe('Arial Arabic');
		});

		it('resolves "majorBidi" to the matching bidi script font', () => {
			const theme = createThemeWithFonts({
				majorOtherFonts: [{ script: 'Hebr', typeface: 'David' }],
			});
			expect(theme.resolveFont('majorBidi')).toBe('David');
		});

		it('returns undefined for "minorEastAsia" when no matching script exists', () => {
			const theme = createThemeWithFonts({ minorOtherFonts: [] });
			expect(theme.resolveFont('minorEastAsia')).toBeUndefined();
		});

		it('returns undefined for "minorBidi" when no matching script exists', () => {
			const theme = createThemeWithFonts({ minorOtherFonts: [] });
			expect(theme.resolveFont('minorBidi')).toBeUndefined();
		});

		it('falls back to latin font for unknown script suffix', () => {
			const theme = createThemeWithFonts({
				minorLatinTypeface: 'FallbackFont',
			});
			expect(theme.resolveFont('minorSomethingElse' as never)).toBe(
				'FallbackFont'
			);
		});
	});

	describe('resolveColor', () => {
		function createThemeWithColors(
			colorScheme?: Record<string, unknown>
		): ThemeXml {
			const theme = new ThemeXml('loc');
			if (colorScheme) {
				theme.colorScheme = colorScheme as unknown as ColorScheme;
			}
			return theme;
		}

		const srgbColor = (hex: string) => ({
			type: 'srgbClr' as const,
			value: hex,
		});

		const sysColor = (value: string, lastClr: string) => ({
			type: 'sysClr' as const,
			value,
			lastClr,
		});

		it('resolves "accent1" to the sRGB hex color', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				accent1: srgbColor('4472C4'),
			});
			expect(theme.resolveColor('accent1')).toBe('#4472C4');
		});

		it('resolves "background1" alias to "light1"', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				light1: srgbColor('FFFFFF'),
			});
			expect(theme.resolveColor('background1')).toBe('#FFFFFF');
		});

		it('resolves "text1" alias to "dark1"', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				dark1: srgbColor('000000'),
			});
			expect(theme.resolveColor('text1')).toBe('#000000');
		});

		it('resolves "background2" alias to "light2"', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				light2: srgbColor('E7E6E6'),
			});
			expect(theme.resolveColor('background2')).toBe('#E7E6E6');
		});

		it('resolves "text2" alias to "dark2"', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				dark2: srgbColor('44546A'),
			});
			expect(theme.resolveColor('text2')).toBe('#44546A');
		});

		it('resolves system colors using lastClr', () => {
			const theme = createThemeWithColors({
				name: 'Office',
				dark1: sysColor('windowText', '000000'),
			});
			expect(theme.resolveColor('dark1')).toBe('#000000');
		});

		it('returns undefined for "none" slot', () => {
			const theme = createThemeWithColors({ name: 'Office' });
			expect(theme.resolveColor('none')).toBeUndefined();
		});

		it('returns undefined when colorScheme is missing', () => {
			const theme = new ThemeXml('loc');
			expect(theme.resolveColor('accent1')).toBeUndefined();
		});

		it('returns undefined for an unknown slot name', () => {
			const theme = createThemeWithColors({ name: 'Office' });
			expect(theme.resolveColor('nonexistent' as never)).toBeUndefined();
		});

		it('returns undefined when the slot value is the "name" string property', () => {
			const theme = createThemeWithColors({ name: 'Office' });
			// "name" is a string, not a color object, so it should be skipped.
			expect(theme.resolveColor('name' as never)).toBeUndefined();
		});
	});
});
