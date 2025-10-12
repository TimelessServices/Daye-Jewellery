module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        colors: {
            white: 'var(--white)',
            black: 'var(--black)',
            dark: 'var(--dark)',
            light: 'var(--light)',
            red: 'var(--red)',
            green: 'var(--green)',
            blue: 'var(--blue)',
            purple: 'var(--purple)',
            orange: 'var(--orange)'
        },
        extend: {
            fontFamily: { 
                main: ['var(--font-main)', 'Helvetica', 'Arial', 'sans-serif'],
                title: ['var(--font-title)', 'serif']
            },
            boxShadow: {
                'inner-custom': 'inset 0 2px 2px 0 #E1E1E1',
                'inner-hover': 'inset 0 2px 1px 0 #1E1E1E'
            }
        }
    },
    plugins: []
};