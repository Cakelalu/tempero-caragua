import { prisma } from '../libs/prisma'

/**
 * Remove registros antigos da tabela PasswordReset.
 *
 * Critérios de exclusão:
 *  - Tokens expirados (expiresAt já passou)
 *  - Tokens já utilizados (used = true)
 *
 * Executa a cada 1 hora por padrão.
 */

const INTERVAL_MS = 60 * 60 * 1000 // 1 hora

export const startPasswordResetCleanupJob = () => {
    const run = async () => {
        try {
            const now = new Date()

            const result = await prisma.passwordReset.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: now } },
                        { used: true },
                    ],
                },
            })

            if (result.count > 0) {
                console.log(
                    `[PasswordReset Cleanup] ${result.count} registro(s) removido(s).`
                )
            }
        } catch (err) {
            console.error(
                '[PasswordReset Cleanup] Erro ao limpar registros antigos:',
                err
            )
        }
    }

    // Executa imediatamente ao iniciar
    run().catch(console.error)

    // E depois em intervalos regulares
    const intervalId = setInterval(run, INTERVAL_MS)

    // Permite encerrar limpo se o processo for finalizado
    if (typeof process !== 'undefined' && process.on) {
        process.on('SIGTERM', () => clearInterval(intervalId))
        process.on('SIGINT', () => clearInterval(intervalId))
    }

    return intervalId
}
