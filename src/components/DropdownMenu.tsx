import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { CgProfile } from "react-icons/cg";

export default function Menu() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
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
                <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-sm bg-pallete-background p-2 text-pallete-dark-green shadow-md">
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green" to='/u//1'>Minha conta</NavLink>
                    <NavLink className="block px-3 py-2 hover:bg-pallete-light-green" to='/editar-perfil'>Editar perfil</NavLink>
                    <button className="block w-full px-3 py-2 text-left hover:bg-pallete-light-green">Sair</button>
                </div>
            )}

        </div>
    )
}