import CardPost from "./CardPost";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

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
                        // O campo 'imagens' vem como JSON string do banco; pega a primeira como banner
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
                        const bannerImage = imagens?.[0] || null;
                        const avatarImage = post.user?.imagemPerfil || null;
                        const author = post.user?.nomeUsuario || 'Autor desconhecido';

                        return (
                            <CardPost
                                key={post.id || post.slug}
                                bannerImage={bannerImage}
                                avatarImage={avatarImage}
                                date={post.dataPostagem}
                                title={post.titulo}
                                author={author}
                                href={`/posts/${post.slug || post.id}`}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
}
