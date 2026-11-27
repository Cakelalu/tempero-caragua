const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
import CardPost from "./CardPost";
import { useTranslation } from "react-i18next";

// function getCoverUrl(cover) {
//     if (!cover) return undefined;
//     if (/^https?:\/\//i.test(cover)) return cover;

//     const coverPath = cover.replace(/^\/?images\/covers\/?/, "");
//     return `${API_BASE_URL}/images/covers/${coverPath}`;
// }

export default function FeaturedPosts({ posts = [] }) {
    const { t } = useTranslation();
    const featuredPosts = posts.slice(0, 6);

    return (
        <section className="w-full px-4 py-8 dark:bg-[var(--color-pallete-surface-dark)]" aria-labelledby="featured-posts-title">
            <h1
                id="featured-posts-title"
                className="theme-heading mb-6 text-center text-3xl font-bold"
            >
                {t("featuredPosts.title", "Postagens em destaque")}
            </h1>

            {featuredPosts.length === 0 ? (
                <p className="theme-text text-center dark:text-[var(--color-text-muted-dark)]">
                    {t("featuredPosts.noPosts", "Nenhuma postagem disponível.")}
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch max-w-full">
                    {featuredPosts.map((post) => {
                        let imagens = [];
                        if (post.imagens) {
                            try {
                                imagens = typeof post.imagens === 'string'
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
                    })}
                </div>
            )}
        </section>
    );
}
