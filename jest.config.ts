import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testRegex: "(src|scripts)/.*\\.test\\.(ts|tsx)$",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/app/**",
    "!src/components/landing-bachillerato/**",
    "!src/components/landing-cen/**",
  ],
  coverageThreshold: {
    global: {},
    "./src/lib/": {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
    "./src/components/": {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};

export default createJestConfig(config);
