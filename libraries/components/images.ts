import docx from 'https://esm.sh/docx@7.4.0';

import { AstComponent, AstNode } from '../types.ts';

export type ImageNode = AstNode<
	// Label:
	'Image',
	// Props:
	Omit<Exclude<ConstructorParameters<typeof docx.ImageRun>[0], string>, 'data'> & { path: string },
	// Yield:
	docx.ImageRun
>;

/**
 * The <Image> component represents a graphic image. The `path` prop should be an a path to an image
 * on disk that can be resolved from the current working directory.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/images
 */
export const Image: AstComponent<ImageNode> = () => {
	// no-op
};

Image.type = 'Image';

Image.children = [];

Image.toDocx = async (props) => {
	const data = await Deno.readFile(props.path);
	return new docx.ImageRun({ ...props, data });
};
