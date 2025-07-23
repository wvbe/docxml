import { describe } from 'std/testing/bdd';

import { Length, twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import {
	createObjectRoundRobinTest,
	createXmlRoundRobinTest,
} from '../utilities/tests.ts';
import {
	type SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from './section-properties.ts';

const test = createXmlRoundRobinTest<SectionProperties>(
	sectionPropertiesFromNode,
	sectionPropertiesToNode
);

const reverseTest = createObjectRoundRobinTest<SectionProperties>(
	sectionPropertiesToNode,
	sectionPropertiesFromNode
);

const date = new Date();

describe('Section formatting', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pgSz w:orient="portrait"/>
			<w:sectPrChange w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
				<w:sectPr>
					<w:pgSz w:orient="portrait" w:w="12240" w:h="15840" /> 
				</w:sectPr>
			</w:sectPrChange> 
		</w:sectPr>`,
		{
			pageOrientation: 'portrait',
			change: {
				id: 0,
				author: 'Gabe',
				date: date,
				pageWidth: twip(12240),
				pageHeight: twip(15840),
			},
		}
	);
});

describe('Section column formatting for equally sized columns', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="1" w:sep="0" w:space="720"/>
		</w:sectPr>`,
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: true,
				separator: false,
				columnSpace: twip(720),
				columnDefs: [],
			},
		}
	);
});

describe('Section column formatting for differently sized columns', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="0" w:sep="1" w:space="720" >
				<w:col w:w="1440" w:space="720"/>
				<w:col w:w="1440" w:space="720" />
				<w:col w:w="2880" />
			</w:cols>
		</w:sectPr>`,
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: false,
				separator: true,
				columnSpace: twip(720),
				columnDefs: [
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(2880) },
				],
			},
		}
	);
});

describe('Section column formatting for with missing properties', () => {
	reverseTest(
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: true,
			},
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="1" />
		</w:sectPr>`
	);

	reverseTest(
		{
			columns: {
				columnDefs: [
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(1440) },
				],
			},
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="2" w:equalWidth="0">
				<w:col w:w="1440" w:space="720" />
				<w:col w:w="1440"/>
			</w:cols>
		</w:sectPr>`
	);
});

describe('Section header/footer references', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:headerReference r:id="test1" w:type="default" />
			<w:headerReference r:id="test2" w:type="first" />
			<w:headerReference r:id="test3" w:type="even" />
		</w:sectPr>`,
		{
			headers: {
				first: 'test2',
				even: 'test3',
				odd: 'test1',
			},
			footers: {
				first: null,
				even: null,
				odd: null,
			},
		}
	);
});

describe('Section titlePg', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
		</w:sectPr>`,
		{
			isTitlePage: false,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg />
		</w:sectPr>`,
		{
			isTitlePage: true,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg w:val="1" />
		</w:sectPr>`,
		{
			isTitlePage: true,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg w:val="0" />
		</w:sectPr>`,
		{
			isTitlePage: false,
		}
	);
});
