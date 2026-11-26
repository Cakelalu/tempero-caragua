import { OAuth2Client } from 'google-auth-library'
import https from 'https'

/**
 * Agente HTTP com keep-alive para reutilizar conexões com o Google.
 * Reduz a latência da verificação de ID Tokens em requisições subsequentes.
 */
const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 10,
    timeout: 10_000,
})

export const googleOAuthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID as string,
    undefined,
    httpsAgent
)
