import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';

type IImageOptions = Exclude<ConstructorParameters<typeof docx.ImageRun>[0], string>;

export type ImageProps = Omit<IImageOptions, 'data'> & { path: string };

export type ImageNode = AstNode<'Image', ImageProps, docx.ImageRun>;
export type ImageComponent = DocxComponent<ImageNode>;

/**
 * The <Image> component represents a graphic image. The `path` prop should be an a path to an image
 * on disk that can be resolved from the current working directory.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/images
 */
export const Image: ImageComponent = ({ ...props }) => {
	// no-op
};

Image.type = 'Image';

Image.children = [];

Image.toDocx = async (props) => {
	const data = await Deno.readFile(props.path);
	return new docx.ImageRun({ ...props, data });
};

Image.toJsonml = () => ['img'];
