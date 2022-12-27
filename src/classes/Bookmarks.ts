export class Bookmarks {
	#bookmarks = new Map<number, string | null>();

	/**
	 * Get the first numeric identifier that is not already taken.
	 */
	#getNextAvailableIdentifier() {
		let i = 0;
		while (this.#bookmarks.has(i)) {
			i++;
		}
		return i;
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
	 *
	 * @remarks
	 * Not using a GUID because this causes Word to not make the link clickable. A much shorter
	 * identifier works as expected.
	 */
	public create() {
		const id = this.#getNextAvailableIdentifier();
		const name = `__docxml_bookmark_${id}`;
		this.registerIdentifier(id);
		console.error('Created', id, name);
		return { id, name };
	}
}
