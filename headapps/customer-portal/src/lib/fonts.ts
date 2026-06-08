import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    {
      path: "../assets/fonts/HelveticaNeueLTStd-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/HelveticaNeueLTStd-Md.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/HelveticaNeueLTStd-Bd.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});
