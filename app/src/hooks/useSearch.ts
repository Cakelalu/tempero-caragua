import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";

const API_BASE_URL = (
  import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500"
).replace(/\/$/, "");

function getAuthHeaders() {
  const token = localStorage.getItem("token_login") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface SearchResponse<T> {
  items: T[];
  total: number;
  limit: number;
  page: number;
  hasMore: boolean;
}

/** Campos realmente consumidos pelas listagens de posts (Cards, grades, etc.) */
export interface PostListItem {
  id: string;
  slug: string;
  titulo: string;
  imagens: string | null;
  dataPostagem: string;
  user: {
    nomeUsuario: string;
    imagemPerfil: string | null;
  } | null;
}

export interface SelectedPostsResponse {
  items: PostListItem[];
  total: number;
  limit: number;
  page: number;
  hasMore: boolean;
}

export function useSearchPosts(
  query: string,
  page: number = 1,
  sort?: string | null,
  following: boolean | null = null
) {
  const debouncedQuery = useDebounce(query, 400);

  return useQuery<SearchResponse<any>, Error, SelectedPostsResponse>({
    queryKey: [
      "posts",
      "search",
      debouncedQuery,
      page,
      sort,
      following,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append("query", debouncedQuery);
      if (page > 1) params.append("page", String(page));
      if (sort) params.append("sort", sort);
      if (following) params.append("following", "true");

      const response = await fetch(
        `${API_BASE_URL}/posts?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Não foi possível carregar as postagens.");

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.posts || [];
      const total =
        data.total || data.pagination?.total || items.length;
      const limit =
        data.limit || data.pagination?.limit || 12;

      return {
        items,
        total,
        limit,
        page,
        hasMore: total > page * limit,
      };
    },
    // Busca mesmo com query vazia na primeira carga (page === 1)
    enabled: debouncedQuery.length > 0 || page === 1,
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const items = Array.isArray(data) ? data : data.posts || [];
      const total =
        data.total || data.pagination?.total || items.length;
      const limit =
        data.limit || data.pagination?.limit || 12;

      return {
        items: items.map((post) => ({
          id: post.id,
          slug: post.slug,
          titulo: post.titulo,
          imagens: post.imagens,
          dataPostagem: post.dataPostagem,
          user: post.user
            ? {
                nomeUsuario: post.user.nomeUsuario,
                imagemPerfil: post.user.imagemPerfil,
              }
            : null,
        })),
        total,
        limit,
        page,
        hasMore: total > page * limit,
      };
    },
  });
}

export function usePostsFeed() {
  return useQuery<{
    recentes: any[];
    populares: any[];
    seguindo: any[];
  }>({
    queryKey: ["posts", "feed"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/posts/feed`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Não foi possível carregar o feed.");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchUsers(query: string, page: number = 1) {
  const debouncedQuery = useDebounce(query, 400);

  return useQuery<SearchResponse<any>>({
    queryKey: ["users", "search", debouncedQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append("q", debouncedQuery);
      if (page > 1) params.append("page", String(page));

      const response = await fetch(
        `${API_BASE_URL}/user/search?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Não foi possível buscar usuários.");

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.users || [];
      const total =
        data.total || data.pagination?.total || items.length;
      const limit =
        data.limit || data.pagination?.limit || 20;

      return {
        items,
        total,
        limit,
        page,
        hasMore: total > page * limit,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
