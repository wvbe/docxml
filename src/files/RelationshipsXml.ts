import { posix as path } from 'https://deno.land/std@0.187.0/path/mod.ts';

import { ContentTypesXml } from '../../mod.ts';
import { Archive } from '../classes/Archive.ts';
import { BinaryFile } from '../classes/BinaryFile.ts';
import { XmlFile, XmlFileWithContentTypes } from '../classes/XmlFile.ts';
import { FileMime, RelationshipType } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { createRandomId } from '../utilities/identifiers.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray } from '../utilities/xquery.ts';
import { castRelationshipToClass } from './index.ts';

export type RelationshipMeta = {
	id: string;
	type: RelationshipType;
	target: string;
	isExternal: boolean;
	isBinary: boolean;
};

export type File = XmlFile | BinaryFile;

export class RelationshipsXml extends XmlFileWithContentTypes {
	public static contentType = FileMime.relationships;

	/**
	 * All relationship data
	 */
	public readonly meta: Array<RelationshipMeta>;

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
		this.meta = meta;
		this.#instances = instances;
	}

	// public toJSON() {
	// 	return {
	// 		meta: this.meta.slice(),
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
	 * @deprecated Use {@link RelationshipXml.findInstance} instead.
	 */
	public find<R extends File = File>(cb: (meta: RelationshipMeta) => boolean): R | null {
		return this.findInstance(cb);
	}
	/**
	 * Find a relationship instance (eg. a {@link DocumentXml}) by its metadata. The metadata would tell you what type
	 * of relationship it is.
	 *
	 * @note So far this function is only used for testing. It may be removed in the future, so if you
	 * have a valid use case for it please submit an issue on GitHub.
	 */
	public findInstance<R extends File = File>(cb: (meta: RelationshipMeta) => boolean): R | null {
		const id = this.meta.find(cb)?.id;
		if (!id) {
			return null;
		}
		return (this.#instances.get(id) as R) || null;
	}

	public filterInstances<R extends File = File>(cb: (meta: RelationshipMeta) => boolean): R[] {
		return this.meta.filter(cb).map((meta) => this.#instances.get(meta.id) as R);
	}

	/**
	 * Create a new relationship and return the new identifier
	 */
	public add(type: RelationshipType, target: File | string): string {
		const meta: RelationshipMeta = {
			id: createRandomId('relationship'),
			type,
			target: typeof target === 'string' ? target : target.location,
			isExternal: type === RelationshipType.hyperlink || type === RelationshipType.attachedTemplate,
			isBinary: type === RelationshipType.image,
		};
		this.meta.push(meta);
		if (typeof target !== 'string') {
			this.#instances.set(meta.id, target);
		}
		return meta.id;
	}

	public getTarget(id: string) {
		const meta = this.meta.find((meta) => meta.id === id);
		if (!meta) {
			throw new Error(`Unknown relationship ID "${id}"`);
		}
		return meta.target;
	}

	public hasType(type: RelationshipType) {
		return this.meta.some((meta) => meta.type === type);
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
				relationships: this.meta.map((meta) => ({
					...meta,
					target: meta.isExternal
						? meta.target
						: path.relative(path.dirname(path.dirname(this.location)), meta.target),
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
	public static async fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string,
	): Promise<RelationshipsXml> {
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
							? await BinaryFile.fromArchive(archive, contentTypes, meta.target)
							: await castRelationshipToClass(archive, contentTypes, {
									type: meta.type,
									target: meta.target,
							  }),
					})),
			)
		).reduce((map, { id, instance }) => {
			map.set(id, instance);
			return map;
		}, new Map<string, File>());

		return new RelationshipsXml(location, meta, instances);
	}
}
