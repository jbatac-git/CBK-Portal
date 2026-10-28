import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx}',
    ],

    theme: {
        extend: {
            colors: {
                // Brand: CBK maroon. DEFAULT/dark kept for older class names.
                maroon: {
                    50: '#FBF3F4',
                    100: '#F5E2E4',
                    200: '#EAC3C8',
                    300: '#D8939C',
                    400: '#B9505E',
                    500: '#992634',
                    600: '#8A1B29',
                    700: '#7A1421',
                    800: '#5C0F19',
                    900: '#3E0A11',
                    950: '#24060A',
                    DEFAULT: '#7A1421',
                    dark: '#5C0F19',
                },
                gold: {
                    50: '#FBF6EC',
                    100: '#F4E7CA',
                    200: '#E9CF97',
                    300: '#DDB76A',
                    400: '#D3A653',
                    500: '#C9973F',
                    600: '#A97A2D',
                    700: '#835E23',
                    DEFAULT: '#C9973F',
                },
                cream: '#FBF6F0',
                // Warm neutrals for surfaces and hairlines.
                paper: '#FAF8F5',
                ink: '#1C1714',
                line: '#E8E2DA',
            },
            fontFamily: {
                sans: ['"Instrument Sans"', ...defaultTheme.fontFamily.sans],
                display: ['Fraunces', ...defaultTheme.fontFamily.serif],
                mono: ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
            },
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1rem' }],
            },
            boxShadow: {
                hairline: '0 1px 0 0 rgba(28, 23, 20, 0.04)',
                raised: '0 1px 2px rgba(28, 23, 20, 0.06), 0 8px 24px -12px rgba(28, 23, 20, 0.18)',
                overlay: '0 24px 64px -24px rgba(28, 23, 20, 0.45)',
                // The right-hand side panel casts its shadow to the left, over the page.
                panel: '0 0 48px -12px rgba(28, 23, 20, 0.35)',
            },
            // One motion set for every layer (house style §7): appear smoothly, leave quicker and plain.
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
                exit: 'cubic-bezier(0.4, 0, 1, 1)',
            },
            keyframes: {
                'toast-in': {
                    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
                    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'rise-in': {
                    from: { opacity: '0', transform: 'translateY(6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'toast-in': 'toast-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                'fade-in': 'fade-in 160ms ease-out',
                'rise-in': 'rise-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
            },
        },
    },

    plugins: [forms],
};
