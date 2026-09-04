import { useState } from "react";
import ThemeSwitch from "./ThemeSwitch";
import LanguageSwitch from "./LanguageSwitch";

export default function Preferences() {
    const [language, setLanguage] = useState("pt");

    function handleLanguageChange(language) {
        setLanguage(language);

        console.log("Idioma selecionado:", language);
    }

    return (
        <div className="flex items-center gap-6">
            <LanguageSwitch
                language={language}
                onLanguageChange={handleLanguageChange}
            />

            <ThemeSwitch />
        </div>
    );
}