// Values Webpack's DefinePlugin puts into the demo build (see webpack.config.js).
declare const __DEMO__: boolean | undefined;
declare const __DEMO_POLICIES_XML__: string;
declare const __DEMO_CLAIMS__: import("./types.ts").Claim[];

declare module "*.css";
declare module "*.scss";
