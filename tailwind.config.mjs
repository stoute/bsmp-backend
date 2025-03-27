import defaultTheme from "tailwindcss/defaultTheme";

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "");
const rem = (px) => `${round(px / 16)}rem`;
const em = (px, base) => `${round(px / base)}em`;
const hexToRgb = (hex) => {
  hex = hex.replace("#", "");
  hex = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      backgroundImage: {
        subway: "url('/images/background_subway.jpg')",
        "subway-dark": "url('/images/background_subway-dark.jpg')",
      },
      fontFamily: {
        sans: ["Open Sans", ...defaultTheme.fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          // this is for prose class
          css: [
            {
              fontSize: rem(16),
              lineHeight: round(24 / 16),
              p: {
                marginTop: em(20, 16),
                marginBottom: em(20, 16),
              },
              '[class~="lead"]': {
                fontSize: em(20, 16),
                lineHeight: round(32 / 20),
                marginTop: em(24, 20),
                marginBottom: em(24, 20),
              },
              blockquote: {
                marginTop: em(32, 20),
                marginBottom: em(32, 20),
                paddingInlineStart: em(20, 20),
              },
              h1: {
                fontSize: em(24, 16),
                marginTop: em(24, 36),
                marginBottom: em(24, 36),
                lineHeight: round(40 / 36),
              },
              h2: {
                fontSize: em(20, 16),
                marginTop: em(20, 24),
                marginBottom: em(20, 24),
                lineHeight: round(28 / 24),
              },
              h3: {
                fontSize: em(18, 16),
                marginTop: em(18, 20),
                marginBottom: em(12, 20),
                lineHeight: round(24 / 20),
              },
              h4: {
                marginTop: em(16, 16),
                marginBottom: em(8, 16),
                lineHeight: round(20 / 16),
              },
              img: {
                marginTop: em(32, 16),
                marginBottom: em(32, 16),
              },
              picture: {
                marginTop: em(32, 16),
                marginBottom: em(32, 16),
              },
              "picture > img": {
                marginTop: "0",
                marginBottom: "0",
              },
              video: {
                marginTop: em(32, 16),
                marginBottom: em(32, 16),
              },
              kbd: {
                fontSize: em(14, 16),
                borderRadius: rem(5),
                paddingTop: em(3, 16),
                paddingInlineEnd: em(6, 16),
                paddingBottom: em(3, 16),
                paddingInlineStart: em(6, 16),
              },
              code: {
                fontSize: em(14, 16),
              },
              "h2 code": {
                fontSize: em(21, 24),
              },
              "h3 code": {
                fontSize: em(18, 20),
              },
              pre: {
                fontSize: em(14, 16),
                lineHeight: round(24 / 14),
                marginTop: em(24, 14),
                marginBottom: em(24, 14),
                borderRadius: rem(6),
                paddingTop: em(12, 14),
                paddingInlineEnd: em(16, 14),
                paddingBottom: em(12, 14),
                paddingInlineStart: em(16, 14),
              },
              ol: {
                marginTop: em(10, 16),
                marginBottom: em(10, 16),
                paddingInlineStart: em(13, 16),
              },
              ul: {
                marginTop: em(10, 16),
                marginBottom: em(10, 16),
                paddingInlineStart: em(18, 16),
              },
              li: {
                marginTop: em(4, 16),
                marginBottom: em(4, 16),
              },
              "ol > li": {
                paddingInlineStart: em(6, 16),
              },
              "ul > li": {
                paddingInlineStart: em(6, 16),
              },
              "> ul > li p": {
                marginTop: em(12, 16),
                marginBottom: em(12, 16),
              },
              "> ul > li > p:first-child": {
                marginTop: em(20, 16),
              },
              "> ul > li > p:last-child": {
                marginBottom: em(20, 16),
              },
              "> ol > li > p:first-child": {
                marginTop: em(20, 16),
              },
              "> ol > li > p:last-child": {
                marginBottom: em(20, 16),
              },
              "ul ul, ul ol, ol ul, ol ol": {
                marginTop: em(12, 16),
                marginBottom: em(12, 16),
              },
              dl: {
                marginTop: em(20, 16),
                marginBottom: em(20, 16),
              },
              dt: {
                marginTop: em(20, 16),
              },
              dd: {
                marginTop: em(8, 16),
                paddingInlineStart: em(26, 16),
              },
              hr: {
                marginTop: em(48, 16),
                marginBottom: em(48, 16),
              },
              "hr + *": {
                marginTop: "0",
              },
              "h2 + *": {
                marginTop: "0",
              },
              "h3 + *": {
                marginTop: "0",
              },
              "h4 + *": {
                marginTop: "0",
              },
              table: {
                fontSize: em(14, 16),
                lineHeight: round(24 / 14),
              },
              "thead th": {
                paddingInlineEnd: em(8, 14),
                paddingBottom: em(8, 14),
                paddingInlineStart: em(8, 14),
              },
              "thead th:first-child": {
                paddingInlineStart: "0",
              },
              "thead th:last-child": {
                paddingInlineEnd: "0",
              },
              "tbody td, tfoot td": {
                paddingTop: em(8, 14),
                paddingInlineEnd: em(8, 14),
                paddingBottom: em(8, 14),
                paddingInlineStart: em(8, 14),
              },
              "tbody td:first-child, tfoot td:first-child": {
                paddingInlineStart: "0",
              },
              "tbody td:last-child, tfoot td:last-child": {
                paddingInlineEnd: "0",
              },
              figure: {
                marginTop: em(32, 16),
                marginBottom: em(32, 16),
              },
              "figure > *": {
                marginTop: "0",
                marginBottom: "0",
              },
              figcaption: {
                fontSize: em(14, 16),
                lineHeight: round(20 / 14),
                marginTop: em(12, 14),
              },
            },
            {
              "> :first-child": {
                marginTop: "0",
              },
              "> :last-child": {
                marginBottom: "0",
              },
            },
          ],
        },
        sm: {
          // and this is for prose-sm.
          css: {},
        },
      },
      rotate: {
        45: "45deg",
        135: "135deg",
        225: "225deg",
        315: "315deg",
      },
      animation: {
        twinkle: "twinkle 2s ease-in-out forwards",
        meteor: "meteor 3s ease-in-out forwards",
      },
      keyframes: {
        twinkle: {
          "0%": {
            opacity: 0,
            transform: "rotate(0deg)",
          },
          "50%": {
            opacity: 1,
            transform: "rotate(180deg)",
          },
          "100%": {
            opacity: 0,
            transform: "rotate(360deg)",
          },
        },
        meteor: {
          "0%": {
            opacity: 0,
            transform: "translateY(200%)",
          },
          "50%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
            transform: "translateY(0)",
          },
        },
      },
    },
    backgroundColor: {
      background: {
        DEFAULT: "white",
        dark: "black",
      },
    },
    textColor: {
      foreground: "black",
    },
  },
  // prose class
  plugins: [require("@tailwindcss/typography")],
};
