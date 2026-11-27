import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { CgProfile } from "react-icons/cg";

const API_BASE_URL = (
    import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500"
).replace(/\/$/, "");

export default function Menu({ user }: { user: any }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const isModerator = user?.tipo === 'MODERATOR';

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setConfirmLogout(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setConfirmLogout(false);

        try {
            // 1. Notifica o backend para revogar o token (blacklist) e limpar o cookie
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
        } catch (error) {
            console.error("Erro ao invalidar token no servidor:", error);
            // Mesmo se o backend falhar, prossegue com a limpeza local
        } finally {
            // 2. Remove APENAS os dados de perfil (não faz localStorage.clear())
            localStorage.removeItem("user");

            // 3. Notifica os componentes (Header, etc.) para atualizar o estado
            window.dispatchEvent(new Event("auth-change"));

            // 4. Redireciona para login
            navigate("/login");
        }
    };

    return (
        <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)}>
                <CgProfile size={40} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-sm bg-pallete-background p-2 text-pallete-dark-green shadow-md dark:bg-[var(--color-pallete-card-dark)] dark:text-[var(--color-text-primary-dark)] dark:border dark:border-[var(--color-pallete-gray-dark)]">
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]" to='/perfil'>Minha conta</NavLink>
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]" to='/editar-perfil'>Editar perfil</NavLink>

                    {isModerator && (
                        <NavLink className="block px-3 py-2 hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]" to='/moderador'>Área de Moderador</NavLink>
                    )}

                    {confirmLogout ? (
                        <div className="p-2 border-t border-gray-100 dark:border-[var(--color-pallete-gray-dark)]">
                            <p className="text-sm text-center mb-2 dark:text-[var(--color-text-primary-dark)]">
                                Tem certeza que deseja sair?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmLogout(false)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-[var(--color-text-muted-dark)] dark:hover:bg-[var(--color-pallete-gray-dark)] rounded-lg transition-colors"
                                >
                                    Não
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                >
                                    Sim, sair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmLogout(true)}
                            className="block w-full px-3 py-2 text-left hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]"
                        >
                            Sair
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
