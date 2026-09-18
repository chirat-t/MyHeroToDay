// Shared Prisma mock object. `new PrismaClient()` (mocked in each test file)
// always returns this same object, so tests can set return values on it
// directly without needing to reach into controller internals.
const prismaMock = {
  member: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  todo: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

module.exports = prismaMock;
