const test = process.env.NODE_ENV === "test";
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: test ? { node: "current" } : "defaults" }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  // Jest runs code as CommonJS, which has no import.meta
  plugins: test ? ["babel-plugin-transform-import-meta"] : [],
};
