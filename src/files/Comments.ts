import { Archive } from '../classes/Archive.ts';
import { NumberMap } from '../classes/NumberMap.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Paragraph } from '../components/Paragraph.ts';
import { FileMime } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray } from '../utilities/xquery.ts';

type Comment = {
	id: number;
	author: string;
	initials: string;
	date: Date;
	contents: Paragraph[] | Promise<Paragraph[]>;
};

export class Comments extends XmlFile {
	public static contentType = FileMime.comments;

	private readonly comments = new NumberMap<Comment>();

	public isEmpty() {
		return !this.comments.size;
	}

	protected async toNode(): Promise<Document> {
		return create(
			`
				<w:comments ${ALL_NAMESPACE_DECLARATIONS}>
					{
						for $comment in array:flatten($comments)
							return element ${QNS.w}comment {
								attribute ${QNS.w}id { $comment('id') },
								attribute ${QNS.w}author { $comment('author') },
								attribute ${QNS.w}initials { $comment('initials') },
								attribute ${QNS.w}date { $comment('date') },
								$comment('contents')
							}
					}
				</w:comments>
			`,
			{
				comments: await Promise.all(
					this.comments.array().map(async (comment) => ({
						...comment,
						date: comment.date.toISOString(),
						contents: await Promise.all(
							(await comment.contents).map((paragraph) => paragraph.toNode([])),
						),
					})),
				),
			},
			true,
		);
	}

	/**
	 * @deprecated Will be deprecated as a public API in the next breaking release.
	 */
	public get(id: Comment['id']): Comment | undefined {
		return this.comments.get(id);
	}

	/**
	 * @deprecated Will be deprecated as a public API in the next breaking release.
	 */
	public set(
		id: Comment['id'],
		meta: Omit<Comment, 'id' | 'contents'>,
		contents: Comment['contents'],
	): void {
		const existing = this.get(id);
		if (existing) {
			Object.assign(existing, { ...meta, contents });
		} else {
			this.comments.set(id, {
				id,
				...meta,
				contents,
			});
		}
	}

	/**
	 * Add a comment to the DOCX file and return its new identifier. You should reference this
	 * identifier from the document using the {@link Comment}, {@link CommentRangeStart} and
	 * {@link CommentRangeEnd} components.
	 */
	public add(meta: Omit<Comment, 'id' | 'contents'>, contents: Comment['contents']) {
		const id = this.comments.getNextAvailableKey();
		this.comments.set(id, {
			id,
			...meta,
			contents,
		});
		return id;
	}

	/**
	 * Check whether or not a comment with the given identifier already exists.
	 *
	 * @deprecated Will be deprecated as a public API in the next breaking release.
	 */
	public has(id: number) {
		return this.comments.has(id);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Comments> {
		const dom = await archive.readXml(location);

		const instance = new Comments(location);

		evaluateXPathToArray(
			`
				array { /*/${QNS.w}comment/map {
					"id": @${QNS.w}id/number(),
					"author": @${QNS.w}author/string(),
					"initials": ./${QNS.w}initials/@${QNS.w}val/string(),
					"date": ./${QNS.w}date/string(),
					"contents": array { ./${QNS.w}p }
				}}
			`,
			dom,
		).forEach(({ contents, date, ...rest }) =>
			instance.add(
				{
					...rest,
					date: new Date(date),
				},
				contents.map((node: Node) => Paragraph.fromNode(node)),
			),
		);

		return instance;
	}
}
