import { red } from 'https://deno.land/std@0.140.0/fmt/colors.ts';

let EXIT_CODE = 0;

export function setExitCode(code: number) {
	EXIT_CODE = code;
}

export function exit() {
	Deno.exit(EXIT_CODE);
}

export async function assert(name: string, cb: () => unknown | Promise<unknown>) {
	let success;
	try {
		const outcome = await cb();
		if (outcome !== true) {
			console.group(`❌ ${name}`);
			setExitCode(1);
			success = false;
		} else {
			console.log(`✅ ${name}`);
			success = true;
		}
	} catch (error: unknown) {
		const e = error as Error;
		console.group(`❌ ${name}`);
		console.log(red(e.stack || e.message));
		console.groupEnd();
		setExitCode(1);
		success = false;
	}
	console.log();
	return success;
}
