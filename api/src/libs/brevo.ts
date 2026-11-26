import { BrevoClient } from '@getbrevo/brevo'

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY!,
})

export interface SendPasswordResetProps {
    toEmail: string
    toName: string
    resetUrl: string
}

export async function sendPasswordResetEmail({
    toEmail,
    toName,
    resetUrl,
}: SendPasswordResetProps) {
    const sender = {
        name: process.env.BREVO_SENDER_NAME ?? 'Tempero Caraguá',
        email: process.env.BREVO_SENDER_EMAIL ?? 'noreply@temperocaraqua.com.br',
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #2c5e2e; margin: 0; font-size: 24px;">Tempero Caraguá</h1>
                    <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Sabores da gastronomia caiçara</p>
                </div>

                <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Redefinição de senha</h2>

                <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
                    Olá, <strong>${toName}</strong>,<br><br>
                    Recebemos uma solicitação para redefinir a senha da sua conta no Tempero Caraguá.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #f59e0b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Redefinir Senha
                    </a>
                </div>

                <p style="color: #4b5563; font-size: 14px; margin-bottom: 8px;">
                    Este link é válido por apenas <strong>10 minutos</strong>.
                </p>
                <p style="color: #4b5563; font-size: 14px; margin-bottom: 24px;">
                    Se você não solicitou esta redefinição, ignore este e-mail. Sua senha não será alterada.
                </p>

                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">

                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    Tempero Caraguá - Preservando os saberes da gastronomia caiçara de Caraguatatuba<br>
                    Este é um e-mail automático, não responda a esta mensagem.
                </p>
            </div>
        </body>
        </html>
    `

    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            sender,
            to: [{ email: toEmail, name: toName }],
            subject: 'Redefinição de senha - Tempero Caraguá',
            htmlContent,
        })
        return { success: true, messageId: result.messageId }
    } catch (error: any) {
        console.error('[Brevo] Erro ao enviar e-mail:', error.response?.body || error.message)
        return { success: false, error: error.response?.body || error.message }
    }
}
