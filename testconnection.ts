const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (e) {
    console.error("Database connection failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
