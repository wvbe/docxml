import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { opt } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	TableConditionalProperties,
	tableConditionalPropertiesFromNode,
	tableConditionalPropertiesToNode,
} from './table-conditional-properties.ts';

const test = createXmlRoundRobinTest<TableConditionalProperties>(
	(x) => tableConditionalPropertiesFromNode(x as NonNullable<typeof x>),
	tableConditionalPropertiesToNode,
);

describe('Table formatting', () => {
	test(
		`<w:tblStylePr ${ALL_NAMESPACE_DECLARATIONS} w:type="wholeTable">
			<w:tcPr>
				<w:tcW w:w="1701" w:type="dxa" />
				<w:tcBorders>
					<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tcBorders>
			</w:tcPr>
		</w:tblStylePr>`,
		{
			type: 'wholeTable',
			cells: {
				colSpan: 1,
				rowSpan: 1,
				borders: {
					top: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					start: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					bottom: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					end: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					tl2br: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					tr2bl: null,
					insideH: null,
					insideV: null,
				},
			},
		},
	);
});

run();
