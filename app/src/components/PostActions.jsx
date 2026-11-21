import { FiThumbsUp, FiStar, FiMessageCircle, FiMoreHorizontal, FiTrash2, FiFlag } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

/**
 * PostActions
 * Componente de interação de postagem.
 *
 * Props:
 * - likesCount: number (quantidade de curtidas)
 * - favoritesCount: number (quantidade de favoritos)
 * - commentsCount: number (quantidade de comentários)
 * - isLiked: boolean (estado visual de curtida ativa)
 * - isFavorited: boolean (estado visual de favorito ativo)
 * - isOwner: boolean (se o usuário logado é o autor do post)
 * - postSlug: string (slug do post, necessário para exclusão, favoritar e curtir)
 * - onPostDeleted: () => void (callback disparado após exclusão bem-sucedida)
 * - onFavoriteToggle: (favorited: boolean) => void (callback após favoritar/desfavoritar)
 * - onLikeToggle: (liked: boolean, likesCount: number) => void (callback após curtir/descurtir)
 * - onCommentsToggle: () => void (callback para abrir/fechar modal de comentários)
 * - className: string (classes Tailwind adicionais)
 *
 * Nota: exclusão de post, favoritar, curtir e comentar possuem lógica de API.
 */
export default function PostActions({
    likesCount = 0,
    favoritesCount = 0,
    commentsCount = 0,
    isLiked = false,
    isFavorited = false,
    isOwner = false,
    postSlug = "",
    onPostDeleted,
    onFavoriteToggle,
    onLikeToggle,
    onCommentsToggle,
    className = "",
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef(null);

    const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const closeMenu = () => setMenuOpen(false);

    // Fecha o menu ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleDelete = async () => {
        if (!postSlug) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem("token_login") || "";

            const response = await fetch(`${API_BASE_URL}/user/post/${postSlug}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Não foi possível excluir a postagem.");
            }

            setConfirmDelete(false);
            closeMenu();
            onPostDeleted?.();
        } catch (error) {
            console.error("Erro ao excluir postagem:", error);
            alert(error.message || "Erro ao excluir a postagem.");
        } finally {
            setDeleting(false);
        }
    };

    const handleLike = async () => {
        if (!postSlug) return;

        try {
            const token = localStorage.getItem("token_login") || "";

            const response = await fetch(`${API_BASE_URL}/user/post/${postSlug}/curtir`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Não foi possível curtir a postagem.");
            }

            const result = await response.json();
            onLikeToggle?.(result.liked ?? !isLiked, result.likesCount ?? likesCount);
        } catch (error) {
            console.error("Erro ao curtir postagem:", error);
            alert(error.message || "Erro ao curtir a postagem.");
        }
    };

    const handleFavorite = async () => {
        if (!postSlug) return;

        try {
            const token = localStorage.getItem("token_login") || "";

            const response = await fetch(`${API_BASE_URL}/user/post/${postSlug}/favoritar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Não foi possível atualizar os favoritos.");
            }

            const result = await response.json();
            onFavoriteToggle?.(result.favorited ?? !isFavorited);
        } catch (error) {
            console.error("Erro ao favoritar postagem:", error);
            alert(error.message || "Erro ao atualizar os favoritos.");
        }
    };

    return (
        <div
            className={`flex items-center gap-4 ${className}`}
        >
            {/* Botão Curtir */}
            <button
                type="button"
                onClick={handleLike}
                aria-label={isLiked ? "Descurtir" : "Curtir"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isLiked
                        ? "text-white bg-white/10 hover:bg-white/20 dark:text-white dark:bg-white/10"
                        : "text-gray-600 hover:text-pallete-green hover:bg-gray-50 dark:text-white dark:hover:text-pallete-green dark:hover:bg-[var(--color-pallete-gray-dark)]"
                }`}
            >
                <FiThumbsUp size={16} className={isLiked ? "text-white" : "text-gray-400 dark:text-white"} />
                <span className={isLiked ? "text-white font-medium" : "text-gray-600 dark:text-white"}>{likesCount}</span>
            </button>

            {/* Botão Favoritar */}
            <button
                type="button"
                onClick={handleFavorite}
                aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isFavorited
                        ? "text-white bg-white/10 hover:bg-white/20 dark:text-white dark:bg-white/10"
                        : "text-gray-600 hover:text-pallete-green hover:bg-gray-50 dark:text-white dark:hover:text-pallete-green dark:hover:bg-[var(--color-pallete-gray-dark)]"
                }`}
            >
                <FiStar size={16} className={isFavorited ? "text-white fill-white" : "text-gray-400 dark:text-white"} />
                <span className={isFavorited ? "text-white font-medium" : "text-gray-600 dark:text-white"}>{favoritesCount}</span>
            </button>

            {/* Botão Comentários */}
            <button
                type="button"
                onClick={onCommentsToggle}
                aria-label="Comentários"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    "text-gray-600 hover:text-pallete-green hover:bg-gray-50 dark:text-white dark:hover:text-pallete-green dark:hover:bg-[var(--color-pallete-gray-dark)]"
                }`}
            >
                <FiMessageCircle size={16} className="text-gray-400 dark:text-white" />
                <span className="text-gray-600 dark:text-white">{commentsCount}</span>
            </button>

            {/* Divisor visual */}
            <div className="h-4 w-px bg-gray-200 dark:bg-[var(--color-pallete-gray-dark)] mx-2" />

            {/* Botão Mais opções */}
            <div ref={menuRef} className="relative">
                <button
                    type="button"
                    onClick={toggleMenu}
                    aria-label="Mais opções"
                    aria-expanded={menuOpen}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-[var(--color-pallete-gray-dark)] transition-colors"
                >
                    <FiMoreHorizontal size={18} />
                </button>

                {/* Menu dropdown condicional */}
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 dark:bg-[var(--color-pallete-card-dark)] dark:border-[var(--color-pallete-gray-dark)] z-10">
                        {isOwner ? (
                            <>
                                {confirmDelete ? (
                                    <div className="p-4 bg-white dark:bg-[var(--color-pallete-card-dark)] border-b border-gray-100 dark:border-[var(--color-pallete-gray-dark)]">
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">Tem certeza que deseja excluir esta postagem?</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDelete(false)}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-[var(--color-text-muted-dark)] dark:hover:bg-[var(--color-pallete-gray-dark)] rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deleting ? "Excluindo..." : "Excluir"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmDelete(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                    >
                                        <FiTrash2 size={16} className="text-red-500" />
                                        Excluir post
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={closeMenu}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:text-white dark:hover:bg-[var(--color-pallete-gray-dark)] transition-colors flex items-center gap-2"
                                disabled
                            >
                                <FiFlag size={16} className="text-gray-400 dark:text-white" />
                                Denunciar post
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
