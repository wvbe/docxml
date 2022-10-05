type Twisted<C> = Array<C | Promise<C> | Twisted<C> | Promise<Twisted<C>>>;

export async function flattenPromiseArray<C>(arr: Twisted<C>) {
	const flattenedAndResolved = await arr.reduce<Promise<C>>(async function flatten(
		flatPromise,
		childPromise,
	): Promise<C> {
		const child = await childPromise;
		const flat = await flatPromise;
		return Array.isArray(child)
			? [...flat, ...(await child.reduce(flatten, Promise.resolve([])))]
			: [...flat, child];
	},
	Promise.resolve([]));

	return flattenedAndResolved;
}
