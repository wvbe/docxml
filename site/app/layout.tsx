import type { Metadata } from 'next';
import './globals.css';
import styles from './layout.module.css';

import Logo from '@/components/logo';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'docxml.js: technical documentation',
	description: 'docxml is a Node/Deno library for parsing/producing DOCX files more sensibly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<div className={styles.wrapper}>
					<header className={styles.header}>
						<Logo />
						<h1>docxml.js</h1>
					</header>
					{children}
				</div>
			</body>
		</html>
	);
}
