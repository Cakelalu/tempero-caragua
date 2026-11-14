import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toProxyUrl } from "../utils/imageProxy";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setPost(data.post || data);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando postagem...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 text-center">
        <h1 className="text-lg font-medium text-red-600">{error || "Postagem não encontrada."}</h1>
        <p className="mt-2 text-sm text-gray-500">
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

  const formatarData = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* 1. Imagem do post - primeiro elemento */}
        {imagens.length > 0 ? (
          <div className="relative w-full aspect-video bg-white rounded-xl overflow-hidden mb-6 shadow-sm flex items-center justify-center">
            <img
              src={toProxyUrl(imagens[0])}
              alt={post.titulo}
              className="max-h-full max-w-full object-contain"
            />
            {imagens.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {imagens.length} fotos
              </div>
            )}
          </div>
        ) : null}

        {/* 2. Autor do post */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={imagemPerfilAutor ? toProxyUrl(imagemPerfilAutor) : "/temperos.svg"}
            alt={autor}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{nomeAutor}</p>
            <p className="text-xs text-gray-500">@{autor} • {formatarData(post.dataPostagem)}</p>
          </div>
        </div>

        {/* 3. Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">{post.titulo}</h1>

        {/* 4. Conteúdo principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="prose prose-lg text-gray-700 max-w-none">
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
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Mais imagens
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {imagens.slice(1).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100"
                >
                  <img
                    src={toProxyUrl(img)}
                    alt={`Imagem ${index + 2}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Legendas */}
        {legendas.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Legendas
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {legendas.map((legenda, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-gray-400">{index + 1}.</span>
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
                className="px-3 py-1 rounded-full text-xs border border-pallete-green text-pallete-green bg-white hover:bg-pallete-green hover:text-white transition-colors"
              >
                #{tag.tagNome}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
