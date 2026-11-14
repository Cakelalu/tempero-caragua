import { toProxyUrl } from "../utils/imageProxy";

export default function UserSearchCard({ user, onFollow, onUnfollow, isFollowing = false }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
      onClick={() => {
        window.location.href = `/perfil/${user.id}`;
      }}
    >
      <img
        src={user.imagemPerfil ? toProxyUrl(user.imagemPerfil) : "/temperos.svg"}
        alt={user.nomeUsuario}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{user.nomeUsuario}</p>
        {user.nome && (
          <p className="text-xs text-gray-500 truncate">{user.nome}</p>
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
            ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            : "bg-black text-white border-white hover:bg-gray-800"
        }`}
      >
        {isFollowing ? "Seguindo" : "Seguir"}
      </button>
    </div>
  );
}
