/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.ejs"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            fontSize: {
                'fluid-h1': 'clamp(1.5rem, 5vw, 3rem)',
                'fluid-h2': 'clamp(1.25rem, 3vw, 2.25rem)',
                'fluid-base': 'clamp(1rem, 1.5vw, 1.125rem)',
            },
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    600: '#2563eb',
                    900: '#1e3a8a',
                }
            }
        },
    },
    plugins: [],
}
