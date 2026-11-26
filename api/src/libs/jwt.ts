import jwt from 'jsonwebtoken'

export const createJWT = (payload: any) => {
    const jti = crypto.randomUUID()
    return jwt.sign(
        { ...payload, jti },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '7d' }
    )
}

export const verifyJWT = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY as string)
    } catch (error) {
        return false
    }
}