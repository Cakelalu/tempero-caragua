import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { CgProfile } from "react-icons/cg";

export default function Menu() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.clear();
        window.dispatchEvent(new Event("auth-change"));

        navigate("/login");
    }

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            };
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])

    return (
        <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)}>
                <CgProfile size={40} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-sm bg-pallete-background p-2 text-pallete-dark-green shadow-md dark:bg-[var(--color-pallete-card-dark)] dark:text-[var(--color-text-primary-dark)] dark:border dark:border-[var(--color-pallete-gray-dark)]">
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]" to='/perfil'>Minha conta</NavLink>
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]" to='/editar-perfil'>Editar perfil</NavLink>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-left hover:bg-pallete-light-green dark:hover:bg-[var(--color-pallete-light-green-dark)] dark:hover:text-[var(--color-text-primary-dark)]"
                    >
                        Sair
                    </button>
                </div>
            )}

        </div>
    )
}