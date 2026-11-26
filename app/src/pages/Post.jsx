import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toProxyUrl } from "../utils/imageProxy";
import { withImageKitTransform } from "../utils/imageTransform";
import PostActions from "../components/PostActions";
import PostCommentsModal from "../components/PostCommentsModal";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      if (!id) {
        setError("Post não informado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/post/${id}`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Postagem não encontrada.");
          }
          throw new Error("Não foi possível carregar a postagem.");
        }

        const data = await response.json();
        const postData = data.post || data;
        setPost(postData);
        setLikesCount(postData._count?.liked || 0);
        setCommentsCount(postData._count?.comentario || 0);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Erro ao carregar a postagem.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPost();
    return () => controller.abort();
  }, [id]);

  const obterImagens = () => {
    if (!post?.imagens) return [];
    try {
      const parsed = typeof post.imagens === "string" ? JSON.parse(post.imagens) : post.imagens;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const obterLegendas = () => {
    if (!post?.legendas) return [];
    try {
      const parsed = typeof post.legendas === "string" ? JSON.parse(post.legendas) : post.legendas;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)]">
        <p className="text-gray-500 dark:text-[var(--color-text-muted-dark)]">Carregando postagem...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] py-12 px-4 text-center">
        <h1 className="text-lg font-medium text-red-600">{error || "Postagem não encontrada."}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[var(--color-text-muted-dark)]">
          Não foi possível exibir os detalhes desta postagem.
        </p>
      </div>
    );
  }

  const imagens = obterImagens();
  const legendas = obterLegendas();
  const autor = post.user?.nomeUsuario || "Autor desconhecido";
  const imagemPerfilAutor = post.user?.imagemPerfil;
  const nomeAutor = post.user?.nome || autor;

  // Obtém o ID do usuário logado a partir dos dados de perfil salvos no login/cadastro
  const getUserLoggedId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || null;
    } catch {
      return null;
    }
  };

  const userLoggedId = getUserLoggedId();
  const isOwner = post?.autorId === userLoggedId;

  const formatarData = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* 1. Imagem do post - primeiro elemento */}
        {imagens.length > 0 ? (
          <div className="relative w-full aspect-video bg-white rounded-xl overflow-hidden mb-6 shadow-sm flex items-center justify-center dark:bg-[var(--color-pallete-card-dark)]">
            <img
              src={toProxyUrl(withImageKitTransform(imagens[0], { width: 1200, quality: 80, format: "webp" }))}
              alt={post.titulo}
              className="max-h-full max-w-full object-contain"
              loading="eager"
            />
            {imagens.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {imagens.length} fotos
              </div>
            )}
          </div>
        ) : null}

        {/* 2. Autor do post */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={imagemPerfilAutor ? toProxyUrl(withImageKitTransform(imagemPerfilAutor, { width: 200, quality: 80, format: "webp" })) : "/temperos.svg"}
              alt={autor}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary-dark)] leading-tight">{nomeAutor}</p>
              <p className="text-xs text-gray-500 dark:text-[var(--color-text-muted-dark)]">@{autor} • {formatarData(post.dataPostagem)}</p>
            </div>
          </div>

          <PostActions
            likesCount={likesCount}
            favoritesCount={favoritesCount}
            commentsCount={commentsCount}
            isLiked={isLiked}
            isFavorited={isFavorited}
            isOwner={isOwner}
            postSlug={post?.slug || ""}
            onPostDeleted={() => navigate("/posts")}
            onLikeToggle={(liked, count) => {
              setIsLiked(liked);
              setLikesCount(count);
            }}
            onFavoriteToggle={(favorited) => {
              setIsFavorited(favorited);
              setFavoritesCount((prev) => (favorited ? prev + 1 : Math.max(0, prev - 1)));
            }}
            onCommentsToggle={() => setCommentsOpen(true)}
          />
        </div>

        {/* 3. Título */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)] mb-6 leading-tight">{post.titulo}</h1>

        {/* 4. Conteúdo principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 dark:bg-[var(--color-pallete-card-dark)] dark:border-[var(--color-pallete-gray-dark)]">
          <div className="prose prose-lg text-gray-700 dark:text-[var(--color-text-muted-dark)] max-w-none">
            {post.conteudo.split("\n\n").map((paragrafo, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragrafo}
              </p>
            ))}
          </div>
        </div>

        {/* 5. Imagens adicionais (galeria, se houver mais de 1) */}
        {imagens.length > 1 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary-dark)] uppercase tracking-wider mb-3">
              Mais imagens
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {imagens.slice(1).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 dark:border-[var(--color-pallete-gray-dark)] dark:bg-[var(--color-pallete-gray-dark)]"
                >
                  <img
                    src={toProxyUrl(withImageKitTransform(img, { width: 400, quality: 70, format: "webp" }))}
                    alt={`Imagem ${index + 2}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Legendas */}
        {legendas.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-[var(--color-pallete-card-dark)] dark:border-[var(--color-pallete-gray-dark)]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary-dark)] uppercase tracking-wider mb-3">
              Legendas
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-[var(--color-text-muted-dark)]">
              {legendas.map((legenda, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-gray-400 dark:text-[var(--color-text-muted-dark)]">{index + 1}.</span>
                  <span>{legenda}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Tags */}
        {post.tagged && post.tagged.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tagged.map((tag) => (
              <button
                key={tag.tagNome}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("select-tag", { detail: tag.tagNome })
                  );
                }}
                className="px-3 py-1 rounded-full text-xs border border-pallete-green text-pallete-green bg-white hover:bg-pallete-green hover:text-white transition-colors dark:border-[var(--color-pallete-green-dark)] dark:text-[var(--color-pallete-green-dark)] dark:bg-[var(--color-pallete-card-dark)] dark:hover:bg-[var(--color-pallete-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]"
              >
                #{tag.tagNome}
              </button>
            ))}
          </div>
        )}

        {/* Modal de Comentários */}
        <PostCommentsModal
          postSlug={post?.slug || ""}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onCommentAdded={() => {
            setCommentsCount((prev) => prev + 1);
          }}
          onCommentRemoved={() => {
            setCommentsCount((prev) => Math.max(0, prev - 1));
          }}
        />

      </div>
    </div>
  );
}
