import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

 
theme: {
    extend: {
        colors: {
            maroon: { DEFAULT: '#7A1421', dark: '#5C0F19' },
            gold: '#C9973F',
            cream: '#FBF6F0',
        },
        fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
    },
},
    plugins: [forms],
};
