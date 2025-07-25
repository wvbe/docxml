import { describe } from 'std/testing/bdd';

import { pt } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import {
	type TableRowProperties,
	tableRowPropertiesFromNode,
	tableRowPropertiesToNode,
} from '../src/table-row-properties.ts';

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
