import type { NextConfig } from "next";

const pagesBasePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH;

const config: NextConfig = pagesBasePath === undefined ? {} : {
  output: "export",
  basePath: pagesBasePath,
  trailingSlash: true,
};

export default config;
