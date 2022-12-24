import { posix as path } from 'https://deno.land/std@0.170.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { BinaryFile } from '../classes/BinaryFile.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { createRandomId } from '../utilities/identifiers.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray } from '../utilities/xquery.ts';
import { castRelationshipToClass } from './index.ts';

export enum RelationshipType {
	commentIds = 'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
	comments = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
	commentsExtended = 'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
	coreProperties = 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
	customProperties = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties',
	customXml = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml',
	endnotes = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes',
	extendedProperties = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
	fontTable = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
	footer = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
	footnotes = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',
	header = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
	image = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
	numbering = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
	officeDocument = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
	people = 'http://schemas.microsoft.com/office/2011/relationships/people',
	settings = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
	styles = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
	theme = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
	webSettings = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',

	/**
	 * @deprecated This is an external relationship, which are not implemneted yet
	 */
	attachedTemplate = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate',
}

export type RelationshipMeta = {
	id: string;
	type: RelationshipType;
	target: string;
	isExternal: boolean;
	isBinary: boolean;
};

export type File = XmlFile | BinaryFile;

export class Relationships extends XmlFile {
	public static contentType = FileMime.relationships;

	/**
	 * All relationship data
	 */
	#meta: Array<RelationshipMeta>;

	/**
	 * Class instances of all relationships that are not "external"
	 */
	#instances: Map<string, File>;

	public constructor(
		location: string,
		meta: RelationshipMeta[] = [],
		instances = new Map<string, File>(),
	) {
		super(location);
		this.#meta = meta;
		this.#instances = instances;
	}

	// public toJSON() {
	// 	return {
	// 		meta: this.#meta.slice(),
	// 		instances: Array.from(this.#instances.keys()).reduce<{ [id: string]: File }>(
	// 			(json, key) => ({
	// 				...json,
	// 				[key]: this.#instances.get(key) as File,
	// 			}),
	// 			{},
	// 		),
	// 	};
	// }

	/**
	 * Find a relationship instance (eg. a OfficeDocument) by its metadata. The metadata would tell you what type
	 * of relationship it is.
	 */
	public find<R extends File = File>(cb: (meta: RelationshipMeta) => boolean): R | null {
		const id = this.#meta.find(cb)?.id;
		if (!id) {
			return null;
		}
		return (this.#instances.get(id) as R) || null;
	}

	/**
	 * Create a new relationship and return the new identifier
	 */
	public add(type: RelationshipType, instance: File): string {
		const meta: RelationshipMeta = {
			id: createRandomId('relationship'),
			type,
			target: instance.location,
			isExternal: false,
			isBinary: type === RelationshipType.image,
		};
		this.#meta.push(meta);
		this.#instances.set(meta.id, instance);
		return meta.id;
	}

	public hasType(type: RelationshipType) {
		return this.#meta.some((meta) => meta.type === type);
	}

	public ensureRelationship<C extends File>(type: RelationshipType, createInstance: () => C): C {
		let doc = this.find<C>((meta) => meta.type === type);
		if (!doc) {
			doc = createInstance();
			this.add(type, doc);
		}
		if (!doc) {
			throw new Error(`Could not find or create a relationship of type "${type}"`);
		}
		return doc;
	}

	protected toNode(): Document {
		return create(
			`
				element ${QNS.relationshipsDocument}Relationships {
					for $relationship in array:flatten($relationships)
						return element ${QNS.relationshipsDocument}Relationship {
							attribute Id { $relationship('id') },
							attribute Type { $relationship('type') },
							attribute Target { $relationship('target') },
							if ($relationship('isExternal')) then attribute TargetMode {
								"External"
							} else ()
						}
				}
			`,
			{
				relationships: this.#meta.map((meta) => ({
					...meta,
					target: path.relative(path.dirname(path.dirname(this.location)), meta.target),
				})),
			},
			true,
		);
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): File[] {
		const related: File[] = [this];
		this.#instances.forEach((inst) => {
			if (inst.isEmpty()) {
				// Empty styles.xml? No thank you!
				return;
			}
			related.splice(0, 0, ...inst.getRelated());
		});
		return related;
	}

	public async addToArchive(archive: Archive): Promise<void> {
		await super.addToArchive(archive);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Relationships> {
		const meta = evaluateXPathToArray(
			`
				array{/*/Relationship/map{
					"id": string(@Id),
					"type": string(@Type),
					"target": string(@Target),
					"isExternal": boolean(@TargetMode = "External")
				}}
			`,
			await archive.readXml(location),
		).map((meta) => ({
			...meta,
			target: meta.isExternal ? meta.target : path.join(path.dirname(location), '..', meta.target),
			isBinary: meta.type === RelationshipType.image,
		})) as RelationshipMeta[];

		const instances = (
			await Promise.all(
				meta
					.filter((meta) => !meta.isExternal)
					.map(async (meta) => ({
						...meta,
						instance: meta.isBinary
							? await BinaryFile.fromArchive(archive, meta.target)
							: await castRelationshipToClass(archive, {
									type: meta.type,
									target: meta.target,
							  }),
					})),
			)
		).reduce((map, { id, instance }) => {
			map.set(id, instance);
			return map;
		}, new Map<string, File>());

		return new Relationships(location, meta, instances);
	}
}
