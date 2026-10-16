import { NavLink, useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate()
    function navLinkClass({ isActive }) {
        return isActive ? "text-pallete-dark-orange font-bold" : "text-pallete-light-orange hover:scale-[1.15] transition-all"
    }
    return(
        <footer className="flex flex-col items-center">
            <div id="pt1" className="bg-pallete-green min-w-screen flex flex-row gap-10 justify-center py-1">
                <div id="logo" className="h-auto flex justify-center items-center cursor-pointer" onClick={() => {navigate('/')}}>
                    <img src="/logo.svg" alt="Logo" className="h-[70%] w-auto"/>
                </div>
                <nav className="flex flex-col justify-end py-3">
                    <NavLink to="/sobre-nos" className={navLinkClass}>Sobre nós</NavLink>
                    <NavLink to="/sobre-nos#desenvolvedores" className={navLinkClass}>Desenvolvedores</NavLink>
                    <NavLink to="/sobre-nos#contato" className={navLinkClass}>Contato</NavLink>
                    <NavLink to="/sobre-nos#objetivos" className={navLinkClass}>Objetivo</NavLink>
                    <NavLink to="/sobre-nos#colaboradores" className={navLinkClass}>Colaboradores</NavLink>
                    <NavLink to="/sobre-nos#avaliacoes" className={navLinkClass}>Avaliações</NavLink>
                </nav>
            </div>

            <div id="pt2" className="bg-pallete-dark-green-2 min-w-screen flex flex-col items-center">
                <p className="text-pallete-light-green py-2">Tempero Caraguá – direitos reservados – &copy; Copyright 2026</p>
            </div>
        </footer> 
    )
}