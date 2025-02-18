module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': ['@swc/jest']
    },
    setupFilesAfterEnv: ['./test/setup.ts']
  };