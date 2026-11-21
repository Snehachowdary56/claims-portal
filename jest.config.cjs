module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: { "\\.(css|scss)$": "identity-obj-proxy" },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/e2e/"],
};
