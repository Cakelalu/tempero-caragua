const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
import CardPost from "./CardPost";

// function getCoverUrl(cover) {
//     if (!cover) return undefined;
//     if (/^https?:\/\//i.test(cover)) return cover;

//     const coverPath = cover.replace(/^\/?images\/covers\/?/, "");
//     return `${API_BASE_URL}/images/covers/${coverPath}`;
// }

export default function FeaturedPosts({ posts = [] }) {
    const featuredPosts = posts.slice(0, 6);

    return (
        <section className="w-full px-4 py-8" aria-labelledby="featured-posts-title">
            <h1
                id="featured-posts-title"
                className="theme-heading mb-6 text-center text-3xl font-bold"
            >
                Postagens em destaque
            </h1>

            {featuredPosts.length === 0 ? (
                <p className="theme-text text-center">
                    Nenhuma postagem disponível.
                </p>
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                author={post.user?.nomeUsuario || 'Autor desconhecido'}
                                href={`/posts/${post.slug || post.id}`}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
}
