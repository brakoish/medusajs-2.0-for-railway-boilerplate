module.exports = {
  modulePathIgnorePatterns: ["<rootDir>/.medusa/"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/shipping*.test.ts"],
  transform: { "^.+\\.[tj]sx?$": ["@swc/jest", { jsc: { parser: { syntax: "typescript", tsx: true }, target: "es2020" }, module: { type: "commonjs" } }] },
  clearMocks: true,
}
