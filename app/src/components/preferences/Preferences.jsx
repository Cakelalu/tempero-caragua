import LanguageSwitch from "./LanguageSwitch";
import ThemeSwitch from "./ThemeSwitch";

export default function Preferences() {
  return (
    <div className="flex items-center gap-6">
      <LanguageSwitch />
      <ThemeSwitch />
    </div>
  );
}
