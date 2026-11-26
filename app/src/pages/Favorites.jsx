import { useEffect, useState } from "react";
import { toProxyUrl } from "../utils/imageProxy";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const carregarFavoritos = async (pagina = 1, acumular = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/user/favoritos?page=${pagina}&limit=12`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("auth-expired"));
          return;
        }
        throw new Error("Não foi carregar os favoritos.");
      }

      const data = await response.json();

      if (acumular) {
        setFavorites((prev) => [...prev, ...data.favorites]);
      } else {
        setFavorites(data.favorites);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pagina);
    } catch (err) {
      setError(err.message || "Erro ao carregar favoritos.");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (postSlug, favorited) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/post/${postSlug}/favoritar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Não foi possível atualizar o favorito.");

      const result = await response.json();

      // Atualiza a lista local
      setFavorites((prev) => {
        if (result.favorited) {
          // Se foi adicionado, já está na lista (não faz nada aqui)
          return prev;
        }
        // Se foi removido, filtra
        return prev.filter((f) => f.postSlug !== postSlug);
      });
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
      alert(err.message || "Erro ao atualizar favorito.");
    }
  };

  const obterImagemCapa = (post) => {
    if (!post?.imagens) return null;
    try {
      const parsed = typeof post.imagens === "string" ? JSON.parse(post.imagens) : post.imagens;
      return Array.isArray(parsed) && parsed.length > 0 ? toProxyUrl(parsed[0]) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    carregarFavoritos(1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)]">
        <p className="text-gray-500 dark:text-[var(--color-text-muted-dark)]">Carregando favoritos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] py-12 px-4 text-center">
        <h1 className="text-lg font-medium text-red-600">{error}</h1>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] py-12 px-4 text-center">
        <h1 className="text-lg font-medium text-gray-900 dark:text-[var(--color-text-primary-dark)]">
          Nenhum post favoritado ainda
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[var(--color-text-muted-dark)]">
          Curte alguma receita? Ela aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)] mb-6">
          Meus Favoritos
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const post = fav.post;
            if (!post) return null;
            const imagens = obterImagemCapa(post);
            const autor = post.user?.nomeUsuario || "Autor desconhecido";
            const likes = post._count?.liked || 0;

            return (
              <a
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="block rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-colors dark:bg-[var(--color-pallete-card-dark)] dark:border-[var(--color-pallete-gray-dark)]"
              >
                <div className="relative h-48 w-full bg-gray-200 dark:bg-[var(--color-pallete-gray-dark)]">
                  {imagens ? (
                    <img
                      src={imagens}
                      alt={post.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-[var(--color-text-muted-dark)] text-xs">
                      Sem imagem
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    ❤️ {likes}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)] line-clamp-2 mb-2 text-sm sm:text-base">
                    {post.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[var(--color-text-muted-dark)] mb-3">
                    por {autor}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavoriteToggle(post.slug, true);
                    }}
                    className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remover dos favoritos
                  </button>
                </div>
              </a>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => carregarFavoritos(page + 1, true)}
              className="rounded-full bg-orange-500 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
            >
              Carregar mais favoritos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
