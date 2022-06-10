import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode } from '../types.ts';

type IImageOptions = Exclude<ConstructorParameters<typeof docx.ImageRun>[0], string>;

export type ImageProps = Omit<IImageOptions, 'data'> & { path: string };

export type ImageNode = DocxNode<'Image', docx.ImageRun>;

/**
 * The <Image> component represents a graphic image. The `path` prop should be an a path to an image
 * on disk that can be resolved from the current working directory.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/images
 */
export const Image: DocxComponent<ImageProps, ImageNode> = async ({ path, ...props }) => {
	const data = await Deno.readFile(path);
	return {
		type: 'Image',
		children: [],
		docx: new docx.ImageRun({ ...props, data }),
		jsonml: ['img'],
	};
};
