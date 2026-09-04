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

    return(
        <header className="bg-pallete-green py-1 px-17 flex flex-row justify-between items-center">
            <NavLink to='/'><img src="/logo.svg" alt="Logo" className="w-28 h-23" /></NavLink>
            <nav className="flex flex-row justify-evenly items-center gap-18">
                <NavLink to='/especiais-de-caragua' className="text-pallete-light-yellow text-center">Especiais de<br />Caraguá</NavLink>
                <NavLink to='/festivais' className="text-pallete-light-yellow">Festivais</NavLink>
                <NavLink to='/posts' className="text-pallete-light-yellow">Postagens</NavLink>
                <NavLink to='/favoritos' className="text-pallete-light-yellow">Favoritos</NavLink>
            </nav>
            <div className="h-max flex flex-row justify-evenly items-center gap-8">
                <Preferences />
                <div className="controls">

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
            <div className="h-max font-bold text-xl">
                <Menu />
            </div>
        </header>
    )
}