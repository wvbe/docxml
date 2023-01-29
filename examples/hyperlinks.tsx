/** @jsx API.jsx */

import API, {
	BookmarkRangeEnd,
	BookmarkRangeStart,
	Hyperlink,
	Paragraph,
	Section,
} from '../mod.ts';

const api = API.fromNothing();

const bookmark = api.bookmarks.create();

api.document.set([
	<Section pageOrientation={'portrait'}>
		<Paragraph>
			<Hyperlink bookmark={bookmark}>This is a cross-reference to the next section</Hyperlink>
		</Paragraph>
	</Section>,
	<Section pageOrientation={'landscape'}>
		<BookmarkRangeStart bookmark={bookmark} />
		<Paragraph>
			<Hyperlink url="https://github.com/wvbe/docxml">
				This is a hyperlink to external target "github.com/wvbe/docxml"
			</Hyperlink>
		</Paragraph>
		<BookmarkRangeEnd bookmark={bookmark} />
	</Section>,
]);

api.toFile('hyperlinks.docx');
