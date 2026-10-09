import { useThemeMode } from "flowbite-react";
import { HiMoon, HiSun } from "react-icons/hi";

export default function ThemeSwitch() {
    const { computedMode, toggleMode } = useThemeMode();

    const isDark = computedMode === "dark";

    return (
        <button
            type="button"
            onClick={toggleMode}
            aria-label="Alternar tema"
            className="
                relative
                h-6 w-17.5
                rounded-2xl
                bg-[#77775f]
                transition-colors
                focus:outline-none
            "
        >
            {/* Sol */}
            <HiSun
                className={`
                    absolute
                    left-1.5
                    top-1/2
                    -translate-y-1/2
                    z-10
                    h-3 w-3
                    ${isDark ? "text-[#eeece0]" : "text-[#77775f]"}
                `}
            />

            {/* Lua */}
            <HiMoon
                className={`
                    absolute
                    right-1.5
                    top-1/2
                    -translate-y-1/2
                    z-10
                    h-3 w-3
                    ${isDark ? "text-[#77775f]" : "text-[#eeece0]"}
                `}
            />

            {/* Bolinha */}
            <span
                className={`
                    absolute
                    left-0.5
                    top-0.5
                    h-5 w-5
                    rounded-full
                    bg-[#eeece0]
                    shadow-sm
                    transition-transform
                    duration-300
                    ease-in-out
                    ${isDark ? "translate-x-11.5" : "translate-x-0"}
                `}
            />
        </button>
    );
}