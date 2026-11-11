const API_URL = (
    import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500"
).replace(/\/$/, "");

/**
 * Converte uma URL absoluta de imagem (ex: ImageKit) em uma URL que passa
 * pelo proxy da própria API, contornando bloqueios de DNS em redes restritas
 * (como redes de escolas).
 *
 * URLs relativas (imagens locais do projeto) são retornadas inalteradas.
 */
export function toProxyUrl(url: string | undefined | null): string {
    if (!url) return url ?? "";

    // Imagens locais/relativas: não precisa de proxy
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
        return url;
    }

    // Apenas URLs absolutas (http/https) são enviadas ao proxy
    if (/^https?:\/\//i.test(url)) {
        return `${API_URL}/imagens/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
}
