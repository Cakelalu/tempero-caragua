import React from "react";
import avatarPadrao from "../../public/Temperos.svg"; // ajuste o caminho conforme a estrutura do seu projeto

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
            className="block w-55 rounded-2xl bg-white shadow-md overflow-hidden
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
                    className="w-14 h-14 rounded-full object-cover border-[3px] border-white bg-gray-200"
                />
            </div>

            {/* Corpo do card */}
            <div className="px-3.5 pb-4 pt-1 text-center">
                <p className="mt-1 mb-2 text-xs text-gray-400">{date}</p>
                <h3 className="mb-1.5 text-[12pt] font-bold text-black underline leading-tight">
                    {title}
                </h3>
                <p className="text-[0.8rem] text-gray-500">por {author}</p>
            </div>
        </a>
    );
}

export default Card