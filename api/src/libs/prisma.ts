import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
} else {
    // Em produção (servidor Express persistente), também mantém no globalThis
    // para evitar múltiplos pools de conexão ao MySQL/Aiven
    globalForPrisma.prisma = prisma
}