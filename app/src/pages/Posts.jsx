import { useState, useRef, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import CardPost from "../components/CardPost";
import UserSearchCard from "../components/UserSearchCard";
import FilterPanel from "../components/FilterPanel";
import { usePostsFeed, useSearchPosts, useSearchUsers } from "../hooks/useSearch";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

const SECTIONS = [
  { key: "recentes", label: "Recentes" },
  { key: "destaques", label: "Destaques" },
  { key: "seguindo", label: "Seguindo" },
];

export default function Posts() {
  // ---------- Estados de UI ---------- 
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("posts"); // "posts" | "users"
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Estados de paginação ---------- 
  const [usersPage, setUsersPage] = useState(1);
  const [searchPostsPage, setSearchPostsPage] = useState(1);

  // ---------- Refs para infinite scroll ---------- 
  const recentesRef = useRef(null);
  const destaquesRef = useRef(null);
  const seguidoresRef = useRef(null);
  const usersRef = useRef(null);

  // ---------- Hook React Query: feed agregado (1 requisição para 3 seções) ---------- 
  // Desabilitado enquanto há busca ativa para evitar requisição desnecessária
  const postsFeed = usePostsFeed(!searchQuery);

  const {
    data: feedData,
    isFetching: feedFetching,
    error: feedError,
  } = postsFeed;

  const postsRecentesData = feedData?.recentes ?? [];
  const postsDestaquesData = feedData?.populares ?? [];
  const postsSeguidoresData = feedData?.seguindo ?? [];

  const postsRecentesError = feedError;
  const postsDestaquesError = feedError;
  const postsSeguidoresError = feedError;

  const postsRecentesFetching = feedFetching;
  const postsDestaquesFetching = feedFetching;
  const postsSeguidoresFetching = feedFetching;

  const users = useSearchUsers(searchQuery, usersPage);

  const {
    data: usersData,
    isFetching: usersFetching,
    error: usersError,
  } = users;

  // ---------- Hook: busca de posts por pesquisa ---------- 
  const postsSearch = useSearchPosts(searchQuery, searchPostsPage);

  const {
    data: searchPostsData,
    isFetching: searchPostsFetching,
    error: searchPostsError,
  } = postsSearch;

  // ---------- Resetar página de pesquisa quando a query mudar ---------- 
  useEffect(() => {
    setSearchPostsPage(1);
  }, [searchQuery]);

  // ---------- Infinite scroll (apenas para usuários) ---------- 
  const observerOptions = { threshold: 0.1 };

  useEffect(() => {
    const obs4 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && usersData?.hasMore && !usersFetching) {
        setUsersPage((p) => p + 1);
      }
    }, observerOptions);

    if (usersRef.current) obs4.observe(usersRef.current);

    return () => {
      obs4.disconnect();
    };
  }, [usersData?.hasMore, usersFetching]);

  // ---------- Handlers ---------- 

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilterOpen(false);
    setUsersPage(1);
  };

  const handleSelectTag = (tag) => {
    setSearchQuery(tag);
    setFilterOpen(false);
  };

  // Escuta evento de seleção de tag vindo do FilterPanel
  useEffect(() => {
    const handler = (e) => {
      handleSelectTag(e.detail);
    };
    window.addEventListener("select-tag", handler);
    return () => window.removeEventListener("select-tag", handler);
  }, []);

  const handleFollowUser = async (user) => {
    try {
      const token = localStorage.getItem("token_login") || "";
      const response = await fetch(`${API_BASE_URL}/user/u/${user.id}/seguir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Não foi possível seguir o usuário.");
    } catch (error) {
      console.error("Erro ao seguir usuário:", error);
    }
  };

  const handleUnfollowUser = async (user) => {
    try {
      const token = localStorage.getItem("token_login") || "";
      const response = await fetch(`${API_BASE_URL}/user/u/${user.id}/deixar-seguir`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Não foi possível deixar de seguir o usuário.");

      // idem acima
    } catch (error) {
      console.error("Erro ao deixar de seguir usuário:", error);
    }
  };

  // ---------- Renderização de uma seção de posts ---------- 
  const renderSection = (section, items, loading, errorMsg, ref) => {
    const isEmpty = items.length === 0 && !loading;
    return (
      <section key={section.key} className="mb-12">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight">
          {section.label}
        </h2>
        {errorMsg ? (
          <p className="text-center text-red-500 text-sm py-8">{errorMsg}</p>
        ) : isEmpty ? (
          <p className="text-center text-gray-500 dark:text-[var(--color-text-muted-dark)] text-sm py-12">
            Nenhuma postagem encontrada.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full">
              {items.map((post) => {
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
                    author={post.user?.nomeUsuario || "Autor desconhecido"}
                    href={`/posts/${post.slug || post.id}`}
                  />
                );
              })}
            </div>
            {loading && <p className="text-center text-gray-400 dark:text-[var(--color-text-muted-dark)] text-sm py-4">Carregando postagens...</p>}
          </>
        )}
      </section>
    );
  };

  // ---------- Renderização ---------- 
  const isUsersTab = activeFilterTab === "users";
  const usersItems = usersData?.items || [];

  return (
    <div className="bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)]">
      {/* Barra de pesquisa sticky no topo */} 
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[var(--color-pallete-card-dark)]/90 backdrop-blur-md border-b border-gray-100 dark:border-[var(--color-pallete-gray-dark)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder={
                  activeFilterTab === "users"
                    ? "Procurar usuários..."
                    : "Qual receita você está procurando hoje?"
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-20 py-3 rounded-xl border border-gray-200 text-gray-900 dark:text-[var(--color-text-primary-dark)] dark:border-[var(--color-pallete-gray-dark)] dark:bg-[var(--color-pallete-card-dark)] focus:ring-2 focus:ring-pallete-green focus:outline-none text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="submit"
                  className="bg-pallete-green text-white px-2 py-2 rounded-lg text-sm hover:bg-pallete-green transition-colors focus:ring-0 focus:outline-none active:bg-pallete-green dark:bg-[var(--color-pallete-green-dark)] dark:hover:bg-pallete-green"
                  aria-label="Buscar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="w-8 h-8 rounded-lg bg-pallete-green text-white flex items-center justify-center hover:bg-pallete-green transition-colors focus:ring-0 focus:outline-none active:bg-pallete-green dark:bg-[var(--color-pallete-green-dark)] dark:hover:bg-pallete-green"
                  aria-label="Abrir filtros"
                >
                  <FiFilter size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Painel de filtros */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onTabChange={setActiveFilterTab}
        activeTab={activeFilterTab}
      />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isUsersTab ? (
          <div className="space-y-0">
            {usersError ? (
              <p className="text-center text-red-500 text-sm py-8">{usersError}</p>
            ) : usersItems.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-[var(--color-text-muted-dark)] text-sm py-12">Nenhum usuário encontrado.</p>
            ) : (
              <>
                {usersItems.map((user) => (
                  <UserSearchCard
                    key={user.id}
                    user={{
                      id: user.id,
                      nomeUsuario: user.nomeUsuario,
                      nome: user.nome,
                      imagemPerfil: user.imagemPerfil,
                    }}
                    isFollowing={user.isFollowing || false}
                    onFollow={handleFollowUser}
                    onUnfollow={handleUnfollowUser}
                  />
                ))}
                {usersData?.hasMore && !usersFetching && <div ref={usersRef} className="h-20" />}
                {usersFetching && <p className="text-center text-gray-400 dark:text-[var(--color-text-muted-dark)] text-sm py-4">Buscando mais usuários...</p>}
              </>
            )}
          </div>
        ) : searchQuery ? (
          <section key="search-results" className="mb-12">
            <h2 className="mb-6 text-center text-3xl font-bold tracking-tight">
              Resultados para "{searchQuery}"
            </h2>
            {searchPostsError ? (
              <p className="text-center text-red-500 text-sm py-8">{searchPostsError.message}</p>
            ) : searchPostsData?.items?.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-[var(--color-text-muted-dark)] text-sm py-12">
                Nenhuma postagem encontrada para "{searchQuery}".
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full">
                  {searchPostsData?.items?.map((post) => {
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
                        author={post.user?.nomeUsuario || "Autor desconhecido"}
                        href={`/posts/${post.slug || post.id}`}
                      />
                    );
                  })}
                </div>
                {searchPostsFetching && <p className="text-center text-gray-400 dark:text-[var(--color-text-muted-dark)] text-sm py-4">Buscando postagens...</p>}
              </>
            )}
          </section>
        ) : (
          <>
            {renderSection(
              SECTIONS[0],
              postsRecentesData,
              postsRecentesFetching,
              postsRecentesError?.message,
              recentesRef
            )}
            {renderSection(
              SECTIONS[1],
              postsDestaquesData,
              postsDestaquesFetching,
              postsDestaquesError?.message,
              destaquesRef
            )}
            {renderSection(
              SECTIONS[2],
              postsSeguidoresData,
              postsSeguidoresFetching,
              postsSeguidoresError?.message,
              seguidoresRef
            )}
          </>
        )}
      </main>
    </div>
  );
}
