export default function LanguageSwitch ({
    language,
    onLanguageChange,
})

{
    return (
        <div
            className="
            flex
            h-6
            w-18
            items-center
            rounded-full
            bg-[#77775f]
            p-0.5
            "
        >
            {/* PT */}
            <button
                type="button"
                onClick={() => onLanguageChange("pt")}
                className={`
                    h-5
                    w-1/2
                    rounded-full
                    text-[10px]
                    font-semibold
                    transition-all
                    duration-200
                    ${language === "pt"
                            ? "bg-[#eeece0] text-[#77775f]"
                            : "text-[#eeece0]"
                    }
                `}
            >
                PT
            </button>

            {/* EN */}
            <button
                type="button"
                onClick={() => onLanguageChange("en")}
                className={`
                    h-5
                    w-1/2
                    rounded-full
                    text-[10px]
                    font-semibold
                    transition-all
                    duration-200
                    ${language === "en"
                            ? "bg-[#eeece0] text-[#77775f]"
                            : "text-[#eeece0]"
                    }
                `}
            >
                EN
            </button>
        </div>
    );
}
