const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.js"],
  testPathPattern: ["<rootDir>/__tests__/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
});
