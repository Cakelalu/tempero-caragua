import { useEffect, useState, useCallback, useRef } from "react";
import { FiFilter } from "react-icons/fi";
import CardPost from "../components/CardPost";
import UserSearchCard from "../components/UserSearchCard";
import FilterPanel from "../components/FilterPanel";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

const SECTIONS = [
  { key: "recentes", label: "Recentes", sort: null, following: null },
  { key: "destaques", label: "Destaques", sort: "popular", following: null },
  { key: "seguidores", label: "Seguidores", sort: null, following: true },
];

export default function Posts() {
  // ---------- Estados gerais ----------
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("posts"); // "posts" | "users"
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Estados por seção ----------
  const [postsRecentes, setPostsRecentes] = useState([]);
  const [postsRecentesPage, setPostsRecentesPage] = useState(1);
  const [postsRecentesHasMore, setPostsRecentesHasMore] = useState(true);
  const [postsRecentesLoading, setPostsRecentesLoading] = useState(false);

  const [postsDestaques, setPostsDestaques] = useState([]);
  const [postsDestaquesPage, setPostsDestaquesPage] = useState(1);
  const [postsDestaquesHasMore, setPostsDestaquesHasMore] = useState(true);
  const [postsDestaquesLoading, setPostsDestaquesLoading] = useState(false);

  const [postsSeguidores, setPostsSeguidores] = useState([]);
  const [postsSeguidoresPage, setPostsSeguidoresPage] = useState(1);
  const [postsSeguidoresHasMore, setPostsSeguidoresHasMore] = useState(true);
  const [postsSeguidoresLoading, setPostsSeguidoresLoading] = useState(false);

  const [postsError, setPostsError] = useState("");

  // ---------- Resultados de Usuários ----------
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasMore, setUsersHasMore] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  // ---------- Refs para infinite scroll ----------
  const recentesRef = useRef(null);
  const destaquesRef = useRef(null);
  const seguidoresRef = useRef(null);
  const usersRef = useRef(null);

  // ---------- Funções de busca ----------

  const fetchSection = useCallback(async (
    sectionKey,
    setDataFn,
    setPageFn,
    setHasMoreFn,
    setLoadingFn,
    page,
    append = false
  ) => {
    setLoadingFn(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (page > 1) params.append("page", String(page));

      const section = SECTIONS.find(s => s.key === sectionKey);
      if (section?.sort) params.append("sort", section.sort);
      if (section?.following) params.append("following", "true");

      const token = localStorage.getItem("token_login") || "";
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Não foi carregar as postagens.");

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.posts || [];

      if (append) {
        setDataFn((prev) => [...prev, ...items]);
      } else {
        setDataFn(items);
      }

      const total = data.total || data.pagination?.total || items.length;
      const limit = data.limit || data.pagination?.limit || 12;
      setHasMoreFn(total > page * limit);
    } catch (error) {
      setPostsError(error.message || "Erro ao carregar postagens.");
    } finally {
      setLoadingFn(false);
    }
  }, [searchQuery, API_BASE_URL]);

  const fetchUsers = useCallback(async (page, append = false) => {
    if (usersLoading) return;
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (page > 1) params.append("page", String(page));

      const token = localStorage.getItem("token_login") || "";
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/user/search?${params.toString()}`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Não foi possível buscar usuários.");

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.users || [];

      if (append) {
        setUsers((prev) => [...prev, ...items]);
      } else {
        setUsers(items);
      }

      const total = data.total || data.pagination?.total || items.length;
      const limit = data.limit || data.pagination?.limit || 20;
      setUsersHasMore(total > page * limit);
    } catch (error) {
      setUsersError(error.message || "Erro ao buscar usuários.");
    } finally {
      setUsersLoading(false);
    }
  }, [searchQuery, API_BASE_URL]);

  // ---------- Inicialização ----------
  useEffect(() => {
    setPostsRecentesPage(1);
    setPostsRecentes([]);
    setPostsRecentesHasMore(true);
    fetchSection("recentes", setPostsRecentes, setPostsRecentesPage, setPostsRecentesHasMore, setPostsRecentesLoading, 1);

    setPostsDestaquesPage(1);
    setPostsDestaques([]);
    setPostsDestaquesHasMore(true);
    fetchSection("destaques", setPostsDestaques, setPostsDestaquesPage, setPostsDestaquesHasMore, setPostsDestaquesLoading, 1);

    setPostsSeguidoresPage(1);
    setPostsSeguidores([]);
    setPostsSeguidoresHasMore(true);
    fetchSection("seguidores", setPostsSeguidores, setPostsSeguidoresPage, setPostsSeguidoresHasMore, setPostsSeguidoresLoading, 1);
  }, [searchQuery, fetchSection]);

  useEffect(() => {
    setUsersPage(1);
    setUsers([]);
    setUsersHasMore(true);
    fetchUsers(1);
  }, [searchQuery, fetchUsers]);

  // ---------- Infinite scroll ----------
  const observerOptions = { threshold: 0.1 };

  useEffect(() => {
    const obs1 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && postsRecentesHasMore && !postsRecentesLoading) {
        setPostsRecentesPage((p) => p + 1);
      }
    }, observerOptions);
    const obs2 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && postsDestaquesHasMore && !postsDestaquesLoading) {
        setPostsDestaquesPage((p) => p + 1);
      }
    }, observerOptions);
    const obs3 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && postsSeguidoresHasMore && !postsSeguidoresLoading) {
        setPostsSeguidoresPage((p) => p + 1);
      }
    }, observerOptions);
    const obs4 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && usersHasMore && !usersLoading) {
        setUsersPage((p) => p + 1);
      }
    }, observerOptions);

    if (recentesRef.current) obs1.observe(recentesRef.current);
    if (destaquesRef.current) obs2.observe(destaquesRef.current);
    if (seguidoresRef.current) obs3.observe(seguidoresRef.current);
    if (usersRef.current) obs4.observe(usersRef.current);

    return () => {
      obs1.disconnect();
      obs2.disconnect();
      obs3.disconnect();
      obs4.disconnect();
    };
  }, [postsRecentesHasMore, postsRecentesLoading, postsDestaquesHasMore, postsDestaquesLoading, postsSeguidoresHasMore, postsSeguidoresLoading, usersHasMore, usersLoading]);

  useEffect(() => {
    if (postsRecentesPage > 1) fetchSection("recentes", setPostsRecentes, setPostsRecentesPage, setPostsRecentesHasMore, setPostsRecentesLoading, postsRecentesPage, true);
  }, [postsRecentesPage, fetchSection]);

  useEffect(() => {
    if (postsDestaquesPage > 1) fetchSection("destaques", setPostsDestaques, setPostsDestaquesPage, setPostsDestaquesHasMore, setPostsDestaquesLoading, postsDestaquesPage, true);
  }, [postsDestaquesPage, fetchSection]);

  useEffect(() => {
    if (postsSeguidoresPage > 1) fetchSection("seguidores", setPostsSeguidores, setPostsSeguidoresPage, setPostsSeguidoresHasMore, setPostsSeguidoresLoading, postsSeguidoresPage, true);
  }, [postsSeguidoresPage, fetchSection]);

  useEffect(() => {
    if (usersPage > 1) fetchUsers(usersPage, true);
  }, [usersPage, fetchUsers]);

  // ---------- Handlers ----------

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeFilterTab === "posts") {
      // Recarregar todas as seções de posts
      setPostsRecentesPage(1);
      setPostsRecentes([]);
      setPostsRecentesHasMore(true);
      fetchSection("recentes", setPostsRecentes, setPostsRecentesPage, setPostsRecentesHasMore, setPostsRecentesLoading, 1);

      setPostsDestaquesPage(1);
      setPostsDestaques([]);
      setPostsDestaquesHasMore(true);
      fetchSection("destaques", setPostsDestaques, setPostsDestaquesPage, setPostsDestaquesHasMore, setPostsDestaquesLoading, 1);

      setPostsSeguidoresPage(1);
      setPostsSeguidores([]);
      setPostsSeguidoresHasMore(true);
      fetchSection("seguidores", setPostsSeguidores, setPostsSeguidoresPage, setPostsSeguidoresHasMore, setPostsSeguidoresLoading, 1);
    } else {
      setUsersPage(1);
      setUsers([]);
      setUsersHasMore(true);
      fetchUsers(1);
    }
    setFilterOpen(false);
  };

  const handleSelectTag = async (tag) => {
    setSearchQuery(tag);
    setFilterOpen(false);
    // Recarregar todas as seções com a tag selecionada
    setPostsRecentesPage(1);
    setPostsRecentes([]);
    setPostsRecentesHasMore(true);
    fetchSection("recentes", setPostsRecentes, setPostsRecentesPage, setPostsRecentesHasMore, setPostsRecentesLoading, 1);

    setPostsDestaquesPage(1);
    setPostsDestaques([]);
    setPostsDestaquesHasMore(true);
    fetchSection("destaques", setPostsDestaques, setPostsDestaquesPage, setPostsDestaquesHasMore, setPostsDestaquesLoading, 1);

    setPostsSeguidoresPage(1);
    setPostsSeguidores([]);
    setPostsSeguidoresHasMore(true);
    fetchSection("seguidores", setPostsSeguidores, setPostsSeguidoresPage, setPostsSeguidoresHasMore, setPostsSeguidoresLoading, 1);
  };

  // Escuta evento de seleção de tag vindo do FilterPanel
  useEffect(() => {
    const handler = (e) => {
      handleSelectTag(e.detail);
    };
    window.addEventListener("select-tag", handler);
    return () => window.removeEventListener("select-tag", handler);
  }, []);

  const openPost = (post) => {
    window.location.href = `/posts/${post.slug || post.id}`;
  };

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

      // Atualiza o estado local para refletir que agora está seguindo
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isFollowing: true } : u
        )
      );
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

      // Atualiza o estado local para refletir que deixou de seguir
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isFollowing: false } : u
        )
      );
    } catch (error) {
      console.error("Erro ao deixar de seguir usuário:", error);
    }
  };

  // ---------- Renderização de uma seção ----------
  const renderSection = (section, data, loading, hasMore, errorMsg, ref) => {
    const isEmpty = data.length === 0 && !loading;
    return (
      <section key={section.key} className="mb-12">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight">
          {section.label}
        </h2>
        {errorMsg ? (
          <p className="text-center text-red-500 text-sm py-8">{errorMsg}</p>
        ) : isEmpty ? (
          <p className="text-center text-gray-500 text-sm py-12">
            Nenhuma postagem encontrada.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((post) => {
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
            {hasMore && !loading && <div ref={ref} className="h-20" />}
            {loading && <p className="text-center text-gray-400 text-sm py-4">Carregando mais postagens...</p>}
          </>
        )}
      </section>
    );
  };

  // ---------- Renderização ----------
  const isUsersTab = activeFilterTab === "users";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de pesquisa sticky no topo */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
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
                onSubmit={handleSearchSubmit}
                className="w-full pl-10 pr-20 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-pallete-green focus:outline-none text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="submit"
                  className="bg-pallete-green text-white px-2 py-2 rounded-lg text-sm hover:bg-pallete-green transition-colors focus:ring-0 focus:outline-none active:bg-pallete-green"
                  aria-label="Buscar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="w-8 h-8 rounded-lg bg-pallete-green text-white flex items-center justify-center hover:bg-pallete-green transition-colors focus:ring-0 focus:outline-none active:bg-pallete-green"
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
            ) : users.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-12">Nenhum usuário encontrado.</p>
            ) : (
              <>
                {users.map((user) => (
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
                {usersHasMore && !usersLoading && <div ref={usersRef} className="h-20" />}
                {usersLoading && <p className="text-center text-gray-400 text-sm py-4">Buscando mais usuários...</p>}
              </>
            )}
          </div>
        ) : (
          <>
            {renderSection(
              SECTIONS[0],
              postsRecentes,
              postsRecentesLoading,
              postsRecentesHasMore,
              postsError,
              recentesRef
            )}
            {renderSection(
              SECTIONS[1],
              postsDestaques,
              postsDestaquesLoading,
              postsDestaquesHasMore,
              postsError,
              destaquesRef
            )}
            {renderSection(
              SECTIONS[2],
              postsSeguidores,
              postsSeguidoresLoading,
              postsSeguidoresHasMore,
              postsError,
              seguidoresRef
            )}
          </>
        )}
      </main>
    </div>
  );
}
