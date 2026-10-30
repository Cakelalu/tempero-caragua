import { useState, useEffect } from 'react';

export default function Profile() {
  // 1. Estados para gerenciar os dados vindos do seu backend
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // 2. Configurações de Integração com a sua API
  // Ajuste o local onde você salva seu JWT (ex: localStorage, sessionStorage ou cookies)
  const token = localStorage.getItem('token_login') || ''; 
  const API_URL = `${import.meta.env.VITE_PUBLIC_API_URL}/user`; 

  // 3. Função para carregar os dados cadastrais + página 1 de posts (Primeira carga da página)
  const carregarPerfilCompleto = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/u/?page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envia para o seu middleware de 'auth' da API
        }
      });
      
      if (!response.ok) throw new Error('Não foi possível carregar o perfil.');
      
      const data = await response.json();
      
      setProfile(data.profile);
      setPosts(data.posts);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Erro na requisição inicial:', error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Função otimizada para carregar apenas as próximas páginas de posts (Limite de 5)
  const carregarMaisPosts = async () => {
    if (loadingPosts || !hasMore) return;
    
    try {
      setLoadingPosts(true);
      const proximaPagina = page + 1;
      
      const response = await fetch(`${API_URL}/u/posts/?page=${proximaPagina}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar mais postagens.');
      
      const data = await response.json();
      
      // Concatena de forma otimizada os 5 novos posts aos que já estavam na tela
      setPosts((postsAtuais) => [...postsAtuais, ...data.posts]);
      setPage(proximaPagina);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Erro ao paginar posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Dispara a busca assim que o componente é montado na tela
  useEffect(() => {
    carregarPerfilCompleto();
  }, []);

  // Trata o campo 'imagens' stringificado vindo do Prisma
  const obterLinkDaImagem = (imagensString) => {
    if (!imagensString) return 'https://placeholder.com';
    try {
      const parsed = JSON.parse(imagensString);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : 'https://placeholder.com';
    } catch {
      return 'https://placeholder.com';
    }
  };

  // 5. Estados de Carregamento e Telas de Erro de Interface
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-base font-medium text-gray-600">
        Carregando dados do perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 gap-2 px-4 text-center">
        <p className="text-base font-semibold text-red-500">Perfil não encontrado.</p>
        <p className="text-sm text-gray-500">Verifique sua conexão ou se seu login ainda está ativo.</p>
      </div>
    );
  }

  // 6. Renderização da Interface Visual com Tailwind CSS
  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-pallete-dark-gray">
      {/* Banner / Foto de Capa */}
      <div className="relative h-44 w-full bg-gray-200 md:h-60">
        {profile.imagemBanner ? (
          <img src={profile.imagemBanner} alt="Banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-400 to-amber-500" />
        )}

        {/* Foto de Perfil Redonda Sobreposta */}
        <div className="absolute -bottom-14 left-4 md:left-8">
          <img 
            src={profile.imagemPerfil || 'https://placeholder.com'} 
            alt={profile.nome} 
            className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-sm md:h-32 md:w-32"
          />
        </div>
      </div>

      {/* Grid Centralizado de Informações */}
      <div className="mx-auto max-w-5xl px-4 pt-16 md:px-8">
        {/* Bloco de Nome, Bio e Métricas */}
        <div className="flex flex-col justify-between gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-start">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{profile.nome}</h1>
            <p className="text-xs text-gray-400 md:text-sm">@{profile.nomeUsuario}</p>
            {profile.biografia && (
              <p className="mt-3 max-w-xl text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {profile.biografia}
              </p>
            )}
          </div>

          {/* Seção Lateral de Contadores */}
          <div className="flex items-center gap-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm self-center md:self-start">
            <div className="text-center">
              <span className="block text-lg font-bold text-gray-800">{profile.stats.postsCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Posts</span>
            </div>
            <div className="text-center border-x border-gray-100 px-6">
              <span className="block text-lg font-bold text-gray-800">{profile.stats.followersCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Seguidores</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-gray-800">{profile.stats.followingCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Seguindo</span>
            </div>
          </div>
        </div>

        {/* Bloco Inferior com as Imagens/Postagens */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">Minhas Publicações</h2>
          
          {posts.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              Nenhuma publicação encontrada neste perfil.
            </div>
          ) : (
            <>
              {/* Grid Responsivo das Publicações */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {posts.map((post) => (
                  <div key={post.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="h-44 w-full bg-gray-50">
                      <img 
                        src={obterLinkDaImagem(post.imagens)} 
                        alt={post.titulo} 
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      {/* Título de tamanho 12, preto e negrito como definido */}
                      <h3 className="font-bold text-black text-[12px] line-clamp-2 leading-snug">{post.titulo}</h3>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(post.dataPostagem).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Paginador Otimizado */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={carregarMaisPosts}
                    disabled={loadingPosts}
                    className="rounded-full bg-orange-500 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:bg-orange-300"
                  >
                    {loadingPosts ? 'Buscando...' : 'Carregar mais publicações'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
