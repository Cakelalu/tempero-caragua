import { useQuery } from "@tanstack/react-query";
import CardPost from "../components/CardPost";
import { useTranslation } from "react-i18next";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

async function fetchHomePosts() {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as postagens.");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("A resposta da API não contém uma lista de postagens.");
  }

  return data;
}

export default function Home() {
  const { t } = useTranslation();
  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ["home", "posts"],
    queryFn: fetchHomePosts,
    staleTime: 1000 * 60 * 3, // 3 minutos: dados frescos sem requisições redundantes
  });

  if (isError) {
    return (
      <main className="">
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          <h1>{t("home.welcome", "Bem-vindo ao Tempero Caraguá!")}</h1>
          <p className="text-red-500">{error.message || t("posts.noPostsFound", "Erro ao carregar as postagens.")}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="">
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          <h1>{t("home.welcome", "Bem-vindo ao Tempero Caraguá!")}</h1>
          <p>{t("common.loading", "Carregando postagens...")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <div className="bg-gray-50 min-h-0 dark:bg-[var(--color-pallete-surface-dark)]">
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-7xl mx-auto px-4 max-w-full">
          {posts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 dark:text-[var(--color-text-muted-dark)]">
              {t("home.noPosts", "Nenhuma postagem disponível.")}
            </p>
          ) : (
            posts.map((post) => {
              let imagens = [];
              if (post.imagens) {
                try {
                  imagens = typeof post.imagens === "string"
                    ? JSON.parse(post.imagens)
                    : post.imagens;
                } catch {
                  imagens = [];
                }
              }
              return (
                <CardPost
                  key={post.id || post.slug}
                  bannerImage={imagens?.[0] || null}
                  avatarImage={post.user?.imagemPerfil || null}
                  date={post.dataPostagem}
                  title={post.titulo}
                  author={post.user?.nomeUsuario || t("common.unknownAuthor", "Autor desconhecido")}
                  href={`/posts/${post.slug || post.id}`}
                />
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
