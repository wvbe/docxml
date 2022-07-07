import docx from 'https://esm.sh/docx@7.4.0';

import type { DefaultStyle, Template } from '../types.ts';
import { Style } from './style.ts';

export class EmptyTemplate implements Template {
	init() {
		return Promise.resolve({
			styles: this.customStyles,
		});
	}

	style(id: string): Style {
		return new Style(id);
	}

	protected customStyles: {
		default: Partial<Record<DefaultStyle, docx.IBaseParagraphStyleOptions>>;
		paragraphStyles: docx.IParagraphStyleOptions[];
	} = {
		default: {},
		paragraphStyles: [],
	};

	public overwrite(id: DefaultStyle, definition: docx.IBaseParagraphStyleOptions): this {
		this.customStyles.default[id] = definition;
		return this;
	}

	public define(definition: Omit<docx.IParagraphStyleOptions, 'id'>): Style;

	public define(id: string, definition: Omit<docx.IParagraphStyleOptions, 'id'>): Style;

	public define(
		_id: string | Omit<docx.IParagraphStyleOptions, 'id'>,
		definition?: Omit<docx.IParagraphStyleOptions, 'id'>,
	): Style {
		let id: string;
		if (typeof _id === 'object') {
			definition = _id;
			id = self.crypto.randomUUID();
		} else {
			id = _id;
		}
		this.customStyles.paragraphStyles.push({
			id,
			...definition,
		});
		return new Style(id);
	}
}
