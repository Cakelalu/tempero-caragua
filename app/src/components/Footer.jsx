import { NavLink } from "react-router-dom";

export default function Footer() {
    return(
        <footer className="flex flex-col items-center">
            <div id="pt1" className="bg-pallete-green min-w-screen flex flex-row gap-20 justify-center py-1">
                <div className="h-auto">
                    <img src="/logo.svg" alt="Logo" className="w-28 h-23" />
                </div>
                <nav className="flex flex-col justify-end pl-3">
                    <NavLink to="/sobre-nos" className="text-pallete-light-orange font-bold">Sobre nós</NavLink>
                    <NavLink to="/sobre-nos">Desenvolvedores</NavLink>
                    <NavLink to="/sobre-nos">Contato</NavLink>
                    <NavLink to="/sobre-nos">Objetivo</NavLink>
                    <NavLink to="/sobre-nos">Colaboradores</NavLink>
                    <NavLink to="/sobre-nos">Avaliações</NavLink>
                </nav>
            </div>

            <div id="pt2" className="bg-pallete-dark-green-2 min-w-screen flex flex-col items-center">
                <p className="text-pallete-light-green py-2">Tempero Caraguá – direitos reservados – &copy; Copyright 2026</p>
            </div>
        </footer> 
    )
}