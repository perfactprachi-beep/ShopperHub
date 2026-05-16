/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B1A2F',
          dark: '#6B1223',
          light: '#F5E6E9',
        },
        accent: '#E8B04B',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.8125rem',  { lineHeight: '1.25rem' }],   // 13px
        sm:   ['0.9375rem',  { lineHeight: '1.4rem'  }],   // 15px
        base: ['1.0625rem',  { lineHeight: '1.6rem'  }],   // 17px
        lg:   ['1.1875rem',  { lineHeight: '1.75rem' }],   // 19px
        xl:   ['1.3125rem',  { lineHeight: '1.875rem'}],   // 21px
        '2xl':['1.5625rem',  { lineHeight: '2rem'    }],   // 25px
        '3xl':['1.9375rem',  { lineHeight: '2.25rem' }],   // 31px
        '4xl':['2.3125rem',  { lineHeight: '2.5rem'  }],   // 37px
      },
    },
  },
  plugins: [],
};
