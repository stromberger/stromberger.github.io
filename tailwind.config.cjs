/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
		require('@tailwindcss/typography'),
		function ({ addComponents }) {
			addComponents({
			  '.container': {
				maxWidth: '100%',
				paddingLeft: '1rem',
				paddingRight: '1rem',
				'@screen sm': {
				  maxWidth: '640px',
				},
				'@screen md': {
				  maxWidth: '768px',
				},
				'@screen lg': {
				  maxWidth: '768px',
				},
				'@screen xl': {
				  maxWidth: '768px',
				},
			  }
			})
		  }
	],
}
