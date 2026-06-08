/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "sm:w-2/5",
    "sm:w-3/5",
    "sm:pl-6",
    "px-12",
    "order-last",
    "sm:order-0",
    "sm:float-right",
    "sm:pl-8 ",
    "w-full",
    "text-[4rem]",
    "md:-ml-8",
    "md:pl-8",
    "pb-[66.6667%]",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
