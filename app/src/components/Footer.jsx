import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    function navLinkClass({ isActive }) {
        return isActive ? "text-pallete-dark-orange font-bold" : "text-pallete-light-orange hover:scale-[1.15] transition-all"
    }
    return(
        <footer className="flex flex-col items-center">
            <div id="pt1" className="hidden lg:flex bg-pallete-green min-w-screen flex-row gap-10 justify-center py-1 dark:bg-[var(--color-pallete-green-dark)]">
                <div id="logo" className="h-auto flex justify-center items-center cursor-pointer" onClick={() => {navigate('/')}}>
                    <img src="/logo.webp" alt={t("common.logo", "Logo")} className="h-16 w-auto object-contain lg:h-20"/>
                </div>
                <nav className="flex flex-col justify-end py-3">
                    <NavLink to="/sobre-nos" className={navLinkClass}>{t("footer.about", "Sobre nós")}</NavLink>
                    <NavLink to="/sobre-nos#desenvolvedores" className={navLinkClass}>{t("footer.developers", "Desenvolvedores")}</NavLink>
                    <NavLink to="/sobre-nos#contato" className={navLinkClass}>{t("footer.contact", "Contato")}</NavLink>
                    <NavLink to="/sobre-nos#objetivos" className={navLinkClass}>{t("footer.objective", "Objetivo")}</NavLink>
                    <NavLink to="/sobre-nos#colaboradores" className={navLinkClass}>{t("footer.collaborators", "Colaboradores")}</NavLink>
                    <NavLink to="/sobre-nos#avaliacoes" className={navLinkClass}>{t("footer.evaluations", "Avaliações")}</NavLink>
                </nav>
            </div>

            <div id="pt2" className="bg-pallete-dark-green-2 min-w-screen flex flex-col items-center dark:bg-[var(--color-pallete-dark-green-dark)]">
                <p className="text-pallete-light-green dark:text-[var(--color-pallete-light-green-dark)] py-2">{t("footer.copyright", "Tempero Caraguá – direitos reservados – &copy; Copyright 2026")}</p>
            </div>
        </footer> 
    )
}