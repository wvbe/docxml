import { Options } from '../types.ts';

export function getOptionsFromArgv(argv: string[]) {
	const options: Options = {
		cwd: Deno.cwd(),
		stdin: Deno.stdin,
		stdout: Deno.stdout,
		source: null,
		destination: null,
		debug: false,
	};
	while (argv.length) {
		const arg = argv.shift();
		switch (arg) {
			case '-s':
			case '--source': {
				const source = argv.shift();
				if (!source) {
					throw new Error(
						'DXE021: The --source option should be followed by the location of an XML file',
					);
				}
				options.source = source;
				continue;
			}
			case '-d':
			case '--destination': {
				const destination = argv.shift();
				if (!destination) {
					throw new Error(
						'DXE022: The --destination option should be followed by the location to which a DOCX file will be written',
					);
				}
				options.destination = destination;
				continue;
			}
			case '-D':
			case '--debug': {
				options.debug = true;
				continue;
			}
			default: {
				throw new Error(`DXE020: Unrecognized CLI option "${arg}"`);
			}
		}
	}
	return options;
}

export async function getPipedStdin(stdin: Deno.Reader & { rid: number }) {
	let text = '';
	if (Deno.isatty(stdin.rid)) {
		return text;
		// throw new Error('The program expected STDIN, but is a TTY.');
	}
	let bytesRead: number | null = 0;
	const decoder = new TextDecoder();
	const buffer = new Uint8Array(1024);
	do {
		bytesRead = await stdin.read(buffer);
		if (!bytesRead) {
			return text;
		}
		text += decoder.decode(buffer.subarray(0, bytesRead));
	} while (bytesRead);

	// This should never happen
	throw new Error(`DXE029: getPipedStdin unexpectedly finished without returning.`);
}
