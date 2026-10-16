import avatarPadrao from "./Temperos.svg"; // ajuste o caminho conforme a estrutura do seu projeto

/**
 * Card de postagem para o blog de receitas caiçaras.
 *
 * Props:
 * - bannerImage: string (url da imagem de capa da postagem). Se não for
 *   informada, o card exibe o placeholder "banner" na cor sólida.
 * - avatarImage: string (url da foto do autor). Se não for informada,
 *   usa o ícone de avatar padrão.
 * - date: string já formatada, ex: "21/11/2026 às 10:30"
 * - title: string (título da postagem)
 * - author: string (nome do autor)
 * - href: string (link da postagem, opcional)
 */
function Card({
    bannerImage,
    avatarImage,
    date = "DD/MM/AAAA às HH:MM",
    title = "<Título da postagem em negrito com a fonte de cor preta e tamanho 12>",
    author = "<nome do autor>",
    href = "#",
}) {
    return (
        <a
            href={href}
            className="theme-surface block w-55 rounded-2xl shadow-md overflow-hidden
                 transition-transform duration-150 ease-out
                 hover:-translate-y-0.5 hover:shadow-lg"
        >
            {/* Banner */}
            <div
                className="h-27.5 flex items-center justify-center bg-cover bg-center bg-pallete-green"
                style={
                    bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined
                }
            >
                {!bannerImage && (
                    <span className="text-white text-2xl font-bold">banner</span>
                )}
            </div>

            {/* Avatar sobreposto entre o banner e o corpo do card */}
            <div className="flex justify-center -mt-7">
                <img
                    src={avatarImage || avatarPadrao}
                    alt={`Foto de ${author}`}
                    className="theme-border w-14 h-14 rounded-full object-cover border-[3px] bg-gray-200"
                />
            </div>

            {/* Corpo do card */}
            <div className="px-3.5 pb-4 pt-1 text-center">
                <p className="theme-text-muted mt-1 mb-2 text-xs">{date}</p>
                <h3 className="theme-heading mb-1.5 text-[12pt] font-bold underline leading-tight">
                    {title}
                </h3>
                <p className="theme-text-muted text-[0.8rem]">por {author}</p>
            </div>
        </a>
    );
}

export default Card