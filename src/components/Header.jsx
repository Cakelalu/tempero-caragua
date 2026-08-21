import { NavLink } from "react-router";

function navLinkClass(isActive) {
    return isActive ? "" : "bg-pallete-light-yellow"
}

export default function Header() {
    return(
        <header className="bg-pallete-green py-6 px-17 flex flex-row justify-between items-center">
            <div className="h-max font-bold text-2xl">Logo aqui</div>
            <nav className="flex flex-row justify-evenly items-center gap-18">
                <NavLink to='/' className="text-pallete-light-yellow text-center">Especiais de<br />Caraguá</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Festivais</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Postagens</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Favoritos</NavLink>
            </nav>
            <div className="h-max flex flex-row justify-evenly items-center gap-8">
                <div className="h-max flex flex-row justify-evenly items-center gap-2">
                    <p className="text-sm">PT</p>
                    <p className="text-sm">EN</p>
                </div>
                <div className="h-max flex flex-row justify-evenly items-center gap-2">
                    <p className="text-sm">sol</p>
                    <p className="text-sm">lua</p>
                </div>
            </div>
            <div className="h-max font-bold text-xl">Perfil</div>
        </header>
    )
}