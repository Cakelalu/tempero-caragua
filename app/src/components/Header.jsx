import { NavLink } from "react-router-dom";
import Menu from "./DropdownMenu";
import { DarkThemeToggle } from "flowbite-react";
import { useThemeMode } from "flowbite-react";
import Preferences from "./preferences/Preferences";
import { useState } from "react";

function navLinkClass(isActive) {
    return isActive ? "" : "bg-pallete-light-yellow"
}

function activeLanguage() {
    isActive = false
    return "text-sm opacity-60"
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return(
        <header className="bg-pallete-green py-1 px-4 lg:px-17 flex flex-col lg:flex-row justify-between items-center">
            <div className="w-full flex flex-row justify-between items-center lg:w-auto">
                <NavLink to='/'><img src="/logo.svg" alt="Logo" className="w-20 h-16 lg:w-28 lg:h-23" /></NavLink>

                <button
                    className="lg:hidden text-pallete-light-yellow text-2xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menu"
                >
                    ☰
                </button>
            </div>

            <nav className={`${menuOpen ? "flex" : "hidden"} flex-col lg:flex lg:flex-row justify-evenly items-center gap-4 lg:gap-18 w-full lg:w-auto mt-4 lg:mt-0`}>
                <NavLink to='/especiais-de-caragua' className="text-pallete-light-yellow text-center">Especiais de<br />Caraguá</NavLink>
                <NavLink to='/festivais' className="text-pallete-light-yellow">Festivais</NavLink>
                <NavLink to='/posts' className="text-pallete-light-yellow">Postagens</NavLink>
                <NavLink to='/favoritos' className="text-pallete-light-yellow">Favoritos</NavLink>
            </nav>

            <div className={`${menuOpen ? "flex" : "hidden"} lg:flex h-max flex-col lg:flex-row justify-evenly items-center gap-4 lg:gap-8 w-full lg:w-auto mt-4 lg:mt-0`}>
                <Preferences />
                <div className="controls flex flex-row gap-4">
                    <label className="language-switch">
                        <input type="checkbox" />
                        <span className="language-slider">
                            <span className="pt">PT</span>
                            <span className="en">EN</span>
                        </span>
                    </label>
                    <label className="theme-switch">
                        <input type="checkbox" />
                        <span className="theme-slider">
                            <span className="sun">☀</span>
                            <span className="moon">☾</span>
                        </span>
                    </label>
                </div>
                <div className="h-max justify-evenly items-center gap-2 text-pallete-light-yellow flex flex-row">
                    <DarkThemeToggle className="text-white hover:bg-transparent dark:hover:bg-transparent border-0 focus:border-0 focus:ring-0 focus:outline-none ring-0 shadow-none" />
                </div>
            </div>

            <div className={`${menuOpen ? "flex" : "hidden"} lg:flex h-max font-bold text-xl mt-4 lg:mt-0`}>
                <Menu />
            </div>
        </header>
    )
}