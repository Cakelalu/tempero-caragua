/**
 * Adiciona parâmetros de transformação do ImageKit a uma URL absoluta.
 *
 * Exemplos de uso:
 *   withImageKitTransform(url, { width: 800, quality: 70, format: "webp" })
 *
 * Se a URL for relativa ou não for do ImageKit, é retornada inalterada.
 * Os parâmetros são anexados ao query string existente, se houver.
 */
export function withImageKitTransform(
    url: string | undefined | null,
    {
        width,
        height,
        quality,
        format,
    }: {
        width?: number;
        height?: number;
        quality?: number;
        format?: "webp" | "jpg" | "png";
    } = {}
): string {
    if (!url) return url ?? "";

    // URLs relativas não passam pelo ImageKit
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
        return url;
    }

    // Apenas URLs absolutas (http/https) recebem transformação
    if (!/^https?:\/\//i.test(url)) {
        return url;
    }

    const transforms: string[] = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (quality) transforms.push(`q-${quality}`);
    if (format) transforms.push(`f-${format}`);

    if (transforms.length === 0) return url;

    const tr = `tr=${transforms.join(",")}`;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${tr}`;
}
