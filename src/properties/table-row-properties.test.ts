import { describe } from 'std/testing/bdd';

import { pt } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	type TableRowProperties,
	tableRowPropertiesFromNode,
	tableRowPropertiesToNode,
} from './table-row-properties.ts';

const test = createXmlRoundRobinTest<TableRowProperties>(
	tableRowPropertiesFromNode,
	tableRowPropertiesToNode
);

describe('Table row formatting', () => {
	test(
		`<w:trPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:tblCellSpacing w:w="60" w:type="dxa" />
			<w:tblHeader />
			<w:cantSplit />
		</w:trPr>`,
		{
			isUnsplittable: true,
			isHeaderRow: true,
			cellSpacing: pt(3),
		}
	);
});
