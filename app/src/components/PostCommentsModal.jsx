import { useState, useEffect, useCallback } from "react";
import { FiSend, FiUser, FiAlertCircle } from "react-icons/fi";

/**
 * PostCommentsModal
 * Modal de comentários de um post.
 *
 * Props:
 * - postSlug: string (slug do post)
 * - isOpen: boolean (se o modal está aberto)
 * - onClose: () => void (callback ao fechar)
 * - onCommentAdded: () => void (callback quando um comentário é adicionado)
 * - onCommentRemoved: () => void (callback quando um comentário é removido)
 *
 * Funcionalidades:
 * - Listar comentários do post (paginado)
 * - Adicionar novo comentário
 * - Excluir próprio comentário (soft delete)
 */
export default function PostCommentsModal({ postSlug, isOpen, onClose, onCommentAdded, onCommentRemoved }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");
  const token = localStorage.getItem("token_login") || "";

  // Decodifica JWT para obter dados do usuário logado
  const getUserLogged = useCallback(() => {
    try {
      if (!token) return null;
      const payload = token.split(".")[1];
      if (!payload) return null;
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }, [token]);

  const userLogged = getUserLogged();

  const carregarComentarios = useCallback(async (pagina = 1, acumular = false) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/post/${postSlug}/comentarios?page=${pagina}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("auth-expired"));
          return;
        }
        throw new Error("Não foi possível carregar os comentários.");
      }

      const data = await response.json();

      if (acumular) {
        setComentarios((prev) => [...prev, ...data.comentarios]);
      } else {
        setComentarios(data.comentarios);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pagina);
    } catch (err) {
      setError(err.message || "Erro ao carregar comentários.");
    } finally {
      setLoading(false);
    }
  }, [postSlug, token]);

  useEffect(() => {
    if (isOpen) {
      carregarComentarios(1);
    }
  }, [isOpen, carregarComentarios]);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();

    if (!novoComentario.trim()) return;
    if (!postSlug) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/post/${postSlug}/comentarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ conteudo: novoComentario.trim() }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("auth-expired"));
          return;
        }
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível enviar o comentário.");
      }

      const result = await response.json();

      // Adiciona o novo comentário no topo da lista
      setComentarios((prev) => [result.comentario, ...prev]);
      setNovoComentario("");
      onCommentAdded?.();
    } catch (err) {
      setError(err.message || "Erro ao enviar comentário.");
    } finally {
      setSending(false);
    }
  };

  const abrirConfirmarExclusao = (id) => {
    setConfirmDeleteId(id);
  };

  const cancelarExclusao = () => {
    setConfirmDeleteId(null);
  };

  const confirmarExclusao = async () => {
    if (!confirmDeleteId) return;

    setDeletingCommentId(confirmDeleteId);
    try {
      const response = await fetch(`${API_BASE_URL}/user/comentarios/${confirmDeleteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível excluir o comentário.");
      }

      setComentarios((prev) => prev.filter((c) => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      onCommentRemoved?.();
    } catch (err) {
      setError(err.message || "Erro ao excluir comentário.");
      setConfirmDeleteId(null);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const podeExcluir = (comentario) => {
    if (!userLogged) return false;
    return comentario.autor?.id === userLogged.id;
  };

  const formatarData = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col dark:bg-[var(--color-pallete-card-dark)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[var(--color-pallete-gray-dark)]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">
              Comentários
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-[var(--color-text-muted-dark)] dark:hover:text-[var(--color-text-primary-dark)] dark:hover:bg-[var(--color-pallete-gray-dark)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {loading && comentarios.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-[var(--color-text-muted-dark)]">
                <p>Carregando comentários...</p>
              </div>
            )}

            {comentarios.length === 0 && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-[var(--color-text-muted-dark)]">
                <FiUser size={32} className="mb-2 opacity-50" />
                <p>Nenhum comentário ainda</p>
                <p className="text-xs mt-1 opacity-70">Seja o primeiro a comentar esta receita.</p>
              </div>
            )}

            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-[var(--color-pallete-gray-dark)] flex items-center justify-center">
                  <FiUser size={14} className="text-gray-500 dark:text-[var(--color-text-muted-dark)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary-dark)]">
                      {comentario.autor?.nomeUsuario || "Usuário"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-[var(--color-text-muted-dark)]">
                      {formatarData(comentario.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-[var(--color-text-muted-dark)] leading-relaxed">
                    {comentario.conteudo}
                  </p>
                  {podeExcluir(comentario) && (
                    <button
                      type="button"
                      onClick={() => abrirConfirmarExclusao(comentario.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => carregarComentarios(page + 1, true)}
                className="w-full py-2 text-sm font-medium text-pallete-green hover:bg-pallete-green/10 dark:text-[var(--color-pallete-green-dark)] dark:hover:bg-[var(--color-pallete-green-dark)]/20 rounded-lg transition-colors"
              >
                Carregar mais comentários
              </button>
            )}
          </div>

          {/* Rodapé - Input de novo comentário */}
          <div className="border-t border-gray-100 dark:border-[var(--color-pallete-gray-dark)] p-4 bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)]">
            <form onSubmit={handleEnviarComentario} className="flex gap-3">
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Escreva seu comentário..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 dark:border-[var(--color-pallete-gray-dark)] dark:bg-[var(--color-pallete-card-dark)] dark:text-[var(--color-text-primary-dark)] focus:ring-2 focus:ring-pallete-green focus:outline-none dark:focus:ring-[var(--color-pallete-green-dark)]"
                disabled={sending}
              ></textarea>
              <button
                type="submit"
                disabled={sending || !novoComentario.trim()}
                className="bg-pallete-green text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pallete-green/90 dark:bg-[var(--color-pallete-green-dark)] dark:hover:bg-pallete-green transition-colors"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={cancelarExclusao}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 dark:bg-[var(--color-pallete-card-dark)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <FiAlertCircle size={24} className="text-red-500 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)] mb-1">
                  Excluir comentário
                </h3>
                <p className="text-sm text-gray-600 dark:text-[var(--color-text-muted-dark)]">
                  Tem certeza que deseja excluir este comentário? Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarExclusao}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-[var(--color-text-muted-dark)] dark:hover:bg-[var(--color-pallete-gray-dark)] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={deletingCommentId === confirmDeleteId}
                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingCommentId === confirmDeleteId ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
