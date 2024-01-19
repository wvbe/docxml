import { FC } from 'react';

const pathStyle = {
	stroke: 'white',
	strokeDashoffset: '1px',
	paintOrder: 'stroke',
	strokeWidth: '10px',
};
const Logo: FC = () => (
	<svg viewBox="169.667 265.3513 186.298 74.1293" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M 217.517 336.654 L 169.667 306.654 L 169.667 298.104 L 217.667 267.954 L 224.267 278.454 L 185.417 302.304 L 228.267 330.004 L 217.517 336.654 Z"
			style={pathStyle}
			transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 1.4210854715202004e-14)"
		/>
		<path
			d="M 308.115 336.915 L 301.365 326.265 L 340.215 302.565 L 297.365 275.715 L 307.965 268.215 L 355.965 298.365 L 355.965 306.915 L 308.115 336.915 Z"
			style={pathStyle}
			transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 1.4210854715202004e-14)"
		/>
		<path
			d="M 63.664 248.74 L 181.57 245.74 L 187.57 257.8 L 69.664 259.8 L 63.664 248.74 Z"
			style={pathStyle}
			transform="matrix(0.866025, -0.5, 0.5, 0.866025, 27.367566, 146.319303)"
		/>
	</svg>
);

export default Logo;
