import { Style, Template } from '../types.ts';

class EmptyStyle implements Style {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}
	get inlineCss() {
		return '';
	}
}

export class EmptyTemplate implements Template {
	init() {
		return Promise.resolve(undefined);
	}

	style(name: string): EmptyStyle {
		return new EmptyStyle(name);
	}
}
