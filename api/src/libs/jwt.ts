import jwt from 'jsonwebtoken'

export const createJWT = (payload: any) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY as string
    )
}

export const verifyJWT = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY as string)
    } catch (error) {
        return false
    }
}