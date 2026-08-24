import { NavLink } from "react-router";

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
            <img src="/logo.svg" alt="Logo" className="w-28 h-23" />
            <nav className="flex flex-row justify-evenly items-center gap-18">
                <NavLink to='/' className="text-pallete-light-yellow text-center">Especiais de<br />Caraguá</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Festivais</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Postagens</NavLink>
                <NavLink to='/contact' className="text-pallete-light-yellow">Favoritos</NavLink>
            </nav>
            <div className="h-max flex flex-row justify-evenly items-center gap-8">
                <div className="h-max flex flex-row justify-evenly items-center gap-0">
                    <div className="bg-pallete-gray rounded-xl px-4 py-1 z-10">
                        <p className="text-sm">PT</p>
                        </div>
                    <div className="bg-pallete-gray rounded-xl px-4 py-1 relative right-4 z-0 opacity-60">
                        <p className="text-sm">EN</p>
                        </div>
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