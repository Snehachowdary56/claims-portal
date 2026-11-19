module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapper: { "\\.(css|scss)$": "identity-obj-proxy" },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/e2e/"],
};
