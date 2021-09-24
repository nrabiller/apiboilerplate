module.exports = {
    collectCoverageFrom: [
      './__test__/unit/controllers/*.spec.ts',
      './__test__/unit/models/*.spec.ts',
      './__test__/unit/service/*.spec.ts',
      './__test__/unit/*.ts'
    ],
    testEnvironment: 'node',
    transform: {
      '.+\\.ts$': 'ts-jest'
    },
    setupFilesAfterEnv: ['./__test__/unit/setup.ts']
}
