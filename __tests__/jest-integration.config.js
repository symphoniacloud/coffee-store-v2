module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["<rootDir>/integration/**/*.[jt]s?(x)"],
    setupFilesAfterEnv: ["<rootDir>/jest-integration.setup.js"],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        }
    },
};
