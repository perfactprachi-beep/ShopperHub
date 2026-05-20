/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fadeUp': 'fadeUp 0.18s ease-out',
      },
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
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.75rem',   { lineHeight: '1.125rem' }],  // 12px
        sm:   ['0.875rem',  { lineHeight: '1.25rem'  }],  // 14px
        base: ['1rem',      { lineHeight: '1.5rem'   }],  // 16px
        lg:   ['1.125rem',  { lineHeight: '1.75rem'  }],  // 18px
        xl:   ['1.25rem',   { lineHeight: '1.75rem'  }],  // 20px
        '2xl':['1.5rem',    { lineHeight: '2rem'     }],  // 24px
        '3xl':['1.875rem',  { lineHeight: '2.25rem'  }],  // 30px
        '4xl':['2.25rem',   { lineHeight: '2.5rem'   }],  // 36px
      },
    },
  },
  plugins: [],
};
