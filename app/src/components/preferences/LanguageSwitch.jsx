import { useTranslation } from "react-i18next";

export default function LanguageSwitch() {
  const { i18n } = useTranslation();

  const isEnglish = i18n.language === "en";

  const toggleLanguage = () => {
    const newLanguage = isEnglish ? "pt" : "en";
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Alternar idioma"
      className="
        relative
        h-6 w-12
        rounded-2xl
        bg-[#77775f]
        transition-colors
        focus:outline-none
        dark:bg-[var(--color-pallete-gray-dark)]
      "
    >
      {/* PT (esquerda) */}
      <span
        className={`
          absolute
          left-1.5
          top-1/2
          -translate-y-1/2
          z-10
          text-[10px]
          font-semibold
          transition-colors
          duration-200
          ${isEnglish ? "text-[#eeece0] opacity-50" : "text-[#77775f] opacity-100"}
        `}
      >
        PT
      </span>

      {/* EN (direita) */}
      <span
        className={`
          absolute
          right-1.5
          top-1/2
          -translate-y-1/2
          z-10
          text-[10px]
          font-semibold
          transition-colors
          duration-200
          ${isEnglish ? "text-[#77775f] opacity-100" : "text-[#eeece0] opacity-50"}
        `}
      >
        EN
      </span>

      {/* Bolinha deslizante */}
      <span
        className={`
          absolute
          ${isEnglish ? "right-0.5" : "left-0.5"}
          top-0.5
          h-5 w-5
          rounded-full
          bg-[#eeece0]
          shadow-sm
          transition-transform
          duration-300
          ease-in-out
        `}
      />
    </button>
  );
}
