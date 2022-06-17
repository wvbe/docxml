import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Application } from './application.ts';

describe('Application', () => {
	it('public instance methods exist', () => {
		// The shallowest of tests, I know, and I'm sorry. Maybe I'll do better next time.
		const app = new Application();
		expect(typeof app.template).toBe('function');
		expect(typeof app.add).toBe('function');
		expect(typeof app.execute).toBe('function');
		expect(typeof app.JSX).toBe('function');
	});
	it('public static methods exist', () => {
		// The shallowest of tests, I know, and I'm sorry. Maybe I'll do better next time.
		expect(typeof Application.stringifyAst).toBe('function');
		expect(typeof Application.writeAstToDocx).toBe('function');
		expect(typeof Application.JSX).toBe('function');
	});
});

run();
