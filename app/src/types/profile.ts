// src/types/profile.ts

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface UserProfile {
  id: string;
  nome: string;
  nomeUsuario: string;
  biografia: string | null;
  imagemPerfil: string | null;
  imagemBanner: string | null;
  numeroTel: string | null;
  email: string;
  stats: ProfileStats;
}

export interface PostGridItem {
  id: string;
  slug: string;
  titulo: string;
  imagens: string | null; // Chega como String do banco (JSON stringificado)
  dataPostagem: string;   // Datas vindas da API chegam como texto (string ISO)
}

export interface PaginationInfo {
  currentPage: number;
  limit: number;
  hasMore: boolean;
}

// GET /u
export interface ProfileResponse {
  profile: UserProfile;
  posts: PostGridItem[];
  pagination: PaginationInfo;
}

// GET /u/posts
export interface ProfilePostsResponse {
  posts: PostGridItem[];
  pagination: PaginationInfo;
}
