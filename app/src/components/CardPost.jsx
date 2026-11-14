import { toProxyUrl } from "../utils/imageProxy";

/**
 * Card de postagem para o blog de receitas caiçaras.
 * Design baseado na referência sectionsGridDivision.png.
 *
 * Props:
 * - bannerImage: string (url da imagem de capa / banner do post)
 * - avatarImage: string (url da foto de perfil do autor)
 * - date: string da data de criação (ex: "2026-11-13T14:43:00" ou já formatada)
 * - title: string (título da postagem)
 * - author: string (nome do autor)
 * - href: string (caminho para redirecionar ao post, ex: "/posts/123")
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
            className="block rounded-3xl bg-pallete-gray shadow-sm
                 transition-transform duration-150 ease-out hover:-translate-y-1"
        >
            {/* Banner da postagem (topo arredondado, verde ou imagem) */}
            <div
                className="h-48 flex items-center justify-center bg-cover bg-center bg-pallete-green rounded-t-3xl overflow-hidden"
                style={
                    bannerImage ? { backgroundImage: `url(${toProxyUrl(bannerImage)})` } : undefined
                }
            >
                {!bannerImage && (
                    <span className="text-white text-3xl font-bold">banner</span>
                )}
            </div>

            {/* Foto de perfil do autor sobreposta entre o banner e o corpo */}
            <div className="flex justify-center -mt-8">
                <img
                    src={toProxyUrl(avatarImage)}
                    alt={`Foto de perfil de ${author}`}
                    className="w-16 h-16 rounded-full object-cover border-[4px] border-white bg-white"
                    onError={(e) => {
                        e.target.src = "/temperos.svg";
                    }}
                />
            </div>

            {/* Corpo do card */}
            <div className="px-5 pb-6 pt-3 text-center">
                <p className="text-gray-500 mt-1 mb-2 text-sm">{formattedDate}</p>
                <h3
                    className="mb-1.5 text-base font-bold underline leading-tight"
                    style={{ color: "#000", WebkitTextFillColor: "#000", backgroundImage: "none" }}
                >
                    {title}
                </h3>
                <p className="text-gray-500 text-sm">por {author}</p>
            </div>
        </a>
    );
}
