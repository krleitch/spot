import { PrismaClient } from '@prisma/client';
declare function initPrismaClient(): void;
declare function disconnectPrismaClient(): void;
declare function getPrismaClient(): PrismaClient;
declare const _default: {
    initPrismaClient: typeof initPrismaClient;
    disconnectPrismaClient: typeof disconnectPrismaClient;
    getPrismaClient: typeof getPrismaClient;
};
export default _default;
