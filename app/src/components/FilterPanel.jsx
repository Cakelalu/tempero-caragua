export default function FilterPanel({ open, onClose, onTabChange, activeTab }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Painel */}
      <div className="relative w-full lg:w-1/3 bg-white shadow-2xl flex flex-col max-h-full">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Fechar filtros"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => onTabChange("posts")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "posts"
                  ? "bg-pallete-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => onTabChange("users")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-pallete-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Usuários
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === "posts" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Buscar por tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Camarão", "Peixe", "Mexilhão", "Lula", "Polvo", "Carne", "Frango", "Massas", "Sopas", "Ensopados", "Bolos", "Tortas", "Sucos", "Doces", "Assados", "Salgados"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => window.dispatchEvent(new CustomEvent("select-tag", { detail: tag }))}
                    className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-600 bg-white hover:bg-pallete-green hover:text-white hover:border-pallete-green transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Buscar usuários
              </h3>
              <p className="text-xs text-gray-400">
                Use a barra de pesquisa no topo para buscar por nome de usuário.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-pallete-green text-white text-sm font-semibold hover:bg-pallete-muted-yellow transition-colors"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
