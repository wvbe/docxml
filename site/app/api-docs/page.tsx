import data  from './data.json' with { type: "json" };

export default function ApiDocs() {
	const classes = data.filter(
		(symbol) => symbol.kind === 'class' && symbol.classDef?.extends !== 'Component',
	);
	const components = data.filter(
		(symbol) => symbol.kind === 'class' && symbol.classDef?.extends === 'Component',
	);
	const typeAliases = data.filter(
		(symbol) => symbol.kind === 'typeAlias'
	);
	const enums = data.filter(
		(symbol) => symbol.kind === 'enum'
	);
	const functions = data.filter(
		(symbol) => symbol.kind === 'function'
	);
	return (
		<article>
			<h1>API documentation</h1>
			<p>The docxml module exports the following symbols:</p>

			<section>
				<h1>Default export</h1>
			</section>
			<section>
				<h1>Named exports</h1>
				<section>
					<h1>Classes</h1>
					<ol>
						{classes.map((symbol) => (
							<li key={symbol.name}> {symbol.name}</li>
						))}
					</ol>
				</section>
				<section>
					<h1>Components</h1>
					<ol>
						{components.map((symbol) => (
							<li key={symbol.name}> {symbol.name}</li>
						))}
					</ol>
				</section>
				<section>
					<h1>Functions</h1>
					<ol>
						{functions.map((symbol) => (
							<li key={symbol.name}> {symbol.name}</li>
						))}
					</ol>
				</section>
				<section>
					<h1>Types</h1>
					<ol>
						{typeAliases.map((symbol) => (
							<li key={symbol.name}> {symbol.name}</li>
						))}
					</ol>
				</section>
				<section>
					<h1>Enumerations</h1>
					<ol>
						{enums.map((symbol) => (
							<li key={symbol.name}> {symbol.name}</li>
						))}
					</ol>
				</section>
			</section>
		</article>
	);
}
