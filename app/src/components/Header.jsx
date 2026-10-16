import { NavLink, useNavigate } from "react-router-dom";
import Menu from "./DropdownMenu";
import Preferences from "./preferences/Preferences";
import { useState, useEffect } from "react";

export default function Header() {

    function navLinkClass({ isActive }) {
        return isActive ? "text-pallete-orange text-center" : "text-pallete-light-yellow text-center hover:scale-[1.15] transition-all"
    }

    const [menuOpen, setMenuOpen] = useState(false);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const atualizarUsuario = () => {
            try {
                setUser(JSON.parse(localStorage.getItem("user")));
            } catch {
                setUser(null);
            }
        };

        window.addEventListener("auth-change", atualizarUsuario);
        window.addEventListener("storage", atualizarUsuario);

        return () => {
            window.removeEventListener("auth-change", atualizarUsuario);
            window.removeEventListener("storage", atualizarUsuario);
        };
    }, []);

    return (
        <header className="bg-pallete-green py-1 px-4 lg:px-17 flex flex-col lg:flex-row justify-between items-center">
            <div className="w-full flex flex-row justify-between items-center lg:w-auto">
                <NavLink to="/">
                    <img
                        src="/logo.svg"
                        alt="Logo"
                        className="w-20 h-16 lg:w-28 lg:h-23"
                    />
                </NavLink>

                <button
                    className="lg:hidden text-pallete-light-yellow text-2xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menu"
                >
                    ☰
                </button>
            </div>

            <nav className={`${menuOpen ? "flex" : "hidden"} flex-col lg:flex lg:flex-row justify-evenly items-center gap-4 lg:gap-18 w-full lg:w-auto mt-4 lg:mt-0`}>
                <NavLink to="/especiais-de-caragua" className={navLinkClass}>
                    Especiais de<br />Caraguá
                </NavLink>
                <NavLink to="/festivais" className={navLinkClass}>
                    Festivais
                </NavLink>
                <NavLink to="/posts" className={navLinkClass}>
                    Postagens
                </NavLink>
                <NavLink to="/favoritos" className={navLinkClass}>
                    Favoritos
                </NavLink>
            </nav>

            <div className={`${menuOpen ? "flex" : "hidden"} lg:flex h-max flex-col lg:flex-row justify-evenly items-center gap-4 lg:gap-8 w-full lg:w-auto mt-4 lg:mt-0`}>
                <Preferences />
            </div>

            <div className={`${menuOpen ? "flex" : "hidden"} lg:flex h-max font-bold text-xl mt-4 lg:mt-0`}>
                {user ? (
                    <Menu />
                ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 text-pallete-light-yellow">
                        <NavLink to="/login">Entrar</NavLink>

                        <NavLink
                            to="/cadastro"
                            className="bg-pallete-light-yellow text-pallete-green px-4 py-2 rounded-lg"
                        >
                            Cadastrar
                        </NavLink>
                    </div>
                )}
            </div>
        </header>
    );
}