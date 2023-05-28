import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["node_modules", "build", "dist"],
  collectCoverage: false,
  passWithNoTests: true,
  testRegex: "/test/.*\\.spec\\.ts$",
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

export default jestConfig;
