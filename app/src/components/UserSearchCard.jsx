import { toProxyUrl } from "../utils/imageProxy";
import { withImageKitTransform } from "../utils/imageTransform";
import { useTranslation } from "react-i18next";

export default function UserSearchCard({ user, onFollow, onUnfollow, isFollowing = false }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 dark:border-[var(--color-pallete-gray-dark)] hover:bg-gray-50 dark:hover:bg-[var(--color-pallete-card-dark)] cursor-pointer"
      onClick={() => {
        window.location.href = `/perfil/${user.id}`;
      }}
    >
      <img
        src={user.imagemPerfil ? toProxyUrl(withImageKitTransform(user.imagemPerfil, { width: 200, quality: 80, format: "webp" })) : "/temperos.svg"}
        alt={user.nomeUsuario}
        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[var(--color-pallete-gray-dark)]"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-primary-dark)] truncate">{user.nomeUsuario}</p>
        {user.nome && (
          <p className="text-xs text-gray-500 dark:text-[var(--color-text-muted-dark)] truncate">{user.nome}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isFollowing) {
            onUnfollow(user);
          } else {
            onFollow(user);
          }
        }}
        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
          isFollowing
            ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-[var(--color-pallete-gray-dark)] dark:text-[var(--color-text-muted-dark)] dark:border-[var(--color-pallete-gray-dark)] dark:hover:bg-[var(--color-pallete-gray-dark)]/50"
            : "bg-black text-white border-white hover:bg-gray-800 dark:bg-[var(--color-text-primary-dark)] dark:text-[var(--color-text-secondary-dark)] dark:border-[var(--color-text-secondary-dark)] dark:hover:bg-[var(--color-text-muted-dark)]"
        }`}
      >
        {isFollowing ? t("userSearchCard.following", "Seguindo") : t("userSearchCard.follow", "Seguir")}
      </button>
    </div>
  );
}
