module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["<rootDir>/unit/**/*.[jt]s?(x)"],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        }
    },
};
