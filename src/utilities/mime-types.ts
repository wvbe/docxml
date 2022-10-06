/**
 * @file
 * Guesstimating the MIME type of binary file attachments, mostly images.
 *
 * Adapted from code kindly provided by @pbek:
 * https://github.com/Stuk/jszip/issues/626#issuecomment-639272737
 */

import { ContentType } from '../enums.ts';

function getMimeTypeFromHexSignature(signature: string): ContentType {
	switch (signature) {
		case 'FFD8FFDB':
		case 'FFD8FFE0':
		case 'FFD8FFE1':
			return ContentType.jpeg;
		case '89504E47':
			return ContentType.png;
		case '47494638':
			return ContentType.gif;
		// case '25504446':
		// 	return 'application/pdf';
		// case '504B0304':
		// 	return 'application/zip';
		default:
			console.log(signature);
			throw new Error('Unsupported file type, signature not recognized.');
	}
}

/**
 * Guess the mime type associated with a byte stream by looking at the first few signature bytes.
 *
 * Throws when the mime type is not recognized, or when it is not JPEG/GIF/PNG.
 */
export function getMimeTypeForUint8Array(uint: Uint8Array) {
	const bytes: string[] = [];
	uint.slice(0, 4).forEach((byte) => {
		bytes.push(byte.toString(16));
	});
	const hex = bytes.join('').toUpperCase();
	return getMimeTypeFromHexSignature(hex);
}
