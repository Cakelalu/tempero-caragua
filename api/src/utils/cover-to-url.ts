export const coverToUrl = (coverName: string) => {
    return coverName ? `${process.env.BASE_URL}/images/covers/${coverName}` : ''
}