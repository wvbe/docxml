import { createRandomId } from '../utilities/identifiers.ts';

export class Bookmarks {
	#bookmarks = new Map<number, string | null>();

	#getNextAvailableIdentifier() {
		for (let i = 1; i < this.#bookmarks.size; i++) {
			if (!this.#bookmarks.has(i)) {
				return i;
			}
		}
		return this.#bookmarks.size + 1;
	}

	/**
	 * Marks a unique identifier as taken.
	 *
	 * @todo When loading an existing document, bookmarks are not registered from it yet.
	 */
	public registerIdentifier(id: number, name?: string) {
		if (this.#bookmarks.has(id)) {
			throw new Error(`Bookmark with identifier "${id}" already exists.`);
		}
		this.#bookmarks.set(id, name || null);
	}

	/**
	 * Create a unique ID and name for a new bookmark.
	 */
	public create() {
		const id = this.#getNextAvailableIdentifier();
		const name = createRandomId('bookmark');
		this.registerIdentifier(id);
		return { id, name };
	}
}
