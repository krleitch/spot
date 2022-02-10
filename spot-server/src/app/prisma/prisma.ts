import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

function initPrismaClient(): void {
  prisma = new PrismaClient();
}

function disconnectPrismaClient(): void {
  prisma.$disconnect()
}

function getPrismaClient(): PrismaClient {
  return prisma;
}

module.exports = {
  initPrismaClient,
  disconnectPrismaClient,
  getPrismaClient
}