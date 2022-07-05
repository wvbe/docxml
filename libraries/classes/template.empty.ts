import docx from 'https://esm.sh/docx@7.3.0';

import type { Template } from '../types.ts';
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

	protected customStyles: { paragraphStyles: docx.IParagraphStyleOptions[] } = {
		paragraphStyles: [],
	};

	public defineParagraphStyle(definition: Omit<docx.IParagraphStyleOptions, 'id'>): Style;
	public defineParagraphStyle(
		id: string,
		definition: Omit<docx.IParagraphStyleOptions, 'id'>,
	): Style;
	public defineParagraphStyle(
		_id: string | Omit<docx.IParagraphStyleOptions, 'id'>,
		definition?: Omit<docx.IParagraphStyleOptions, 'id'>,
	): Style {
		let id: string;
		if (typeof _id === 'object') {
			definition = _id;
			id = 'random-style-' + Math.ceil(Math.random() * 9999);
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
