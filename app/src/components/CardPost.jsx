import { toProxyUrl } from "../utils/imageProxy";

/**
 * Card de postagem com estilo Instagram em mobile.
 * - Mobile (< 640px): card estreito, imagem quadrada, layout compacto (estilo Instagram)
 * - Desktop: mantém o design original com banner largo e avatar sobreposto
 *
 * Props:
 * - bannerImage: string (url da imagem de capa / banner do post)
 * - avatarImage: string (url da foto de perfil do autor)
 * - date: string da data de criação
 * - title: string (título da postagem)
 * - author: string (nome do autor)
 * - href: string (caminho para redirecionar ao post)
 */
export default function CardPost({
    bannerImage,
    avatarImage,
    date = "",
    title = "Título da postagem",
    author = "Autor desconhecido",
    href = "#",
}) {
    // Formata a data para exibição em português (pt-BR)
    let formattedDate = date;
    if (date) {
        try {
            const d = new Date(date);
            if (!Number.isNaN(d.getTime())) {
                formattedDate = new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                }).format(d).replace(",", " às");
            }
        } catch {
            formattedDate = date;
        }
    }

    return (
        <a
            href={href}
            className="block rounded-xl overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-1 bg-white border border-gray-100"
        >
            {/* Wrapper do banner: quadrado em mobile, retangular em desktop */}
            <div className="relative h-48 sm:h-64 w-full bg-gray-200">
                {/* Imagem de fundo (desktop) */}
                {bannerImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${toProxyUrl(bannerImage)})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg sm:text-xl">banner</span>
                    </div>
                )}

                {/* Imagem estilo Instagram em mobile (quadrada, ocupa a largura total do card) */}
                {bannerImage && (
                    <img
                        src={toProxyUrl(bannerImage)}
                        alt={title}
                        className="hidden sm:block w-full h-full object-cover"
                    />
                )}

                {/* Avatar sobreposto (apenas em tablet e desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-32px] hidden sm:flex items-center">
                    {avatarImage ? (
                        <img
                            src={toProxyUrl(avatarImage)}
                            alt={`Foto de perfil de ${author}`}
                            className="w-16 h-16 rounded-full object-cover border-[4px] border-white bg-white shadow-sm"
                            onError={(e) => {
                                e.target.src = "/temperos.svg";
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
                            <span className="text-gray-400">?</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Corpo do card */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-6 pt-2 sm:pt-10 text-left sm:text-center">
                <h3
                    className="mb-1 sm:mb-1.5 font-bold text-gray-900 line-clamp-2 text-sm sm:text-base leading-tight"
                    style={{ WebkitLineClamp: 2 }}
                >
                    {title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">por {author}</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{formattedDate}</p>
            </div>
        </a>
    );
}
