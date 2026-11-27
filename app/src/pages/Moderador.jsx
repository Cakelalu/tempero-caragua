import { NavLink } from "react-router-dom";

export default function Moderador() {
    return (
        <div className="bg-gray-50 min-h-screen dark:bg-[var(--color-pallete-surface-dark)] p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">
                    Área de Moderador
                </h1>

                <p className="mb-8 text-lg text-gray-600 dark:text-[var(--color-text-muted-dark)]">
                    Bem-vindo à área de moderação. Aqui você poderá gerenciar o conteúdo da plataforma.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-6 rounded-xl bg-white border border-gray-100 dark:border-[var(--color-pallete-gray-dark)] shadow-sm dark:bg-[var(--color-pallete-card-dark)]">
                        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-[var(--color-text-primary-dark)]">Posts pendentes</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">--</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white border border-gray-100 dark:border-[var(--color-pallete-gray-dark)] shadow-sm dark:bg-[var(--color-pallete-card-dark)]">
                        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-[var(--color-text-primary-dark)]">Comentários reportados</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">--</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white border border-gray-100 dark:border-[var(--color-pallete-gray-dark)] shadow-sm dark:bg-[var(--color-pallete-card-dark)]">
                        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-[var(--color-text-primary-dark)]">Usuários bloqueados</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">--</p>
                    </div>
                </div>

                <div className="mt-8 p-6 rounded-xl bg-white border border-gray-100 dark:border-[var(--color-pallete-gray-dark)] shadow-sm dark:bg-[var(--color-pallete-card-dark)]">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-[var(--color-text-primary-dark)]">Ações rápidas</h3>
                    <div className="flex gap-3 flex-wrap">
                        <NavLink
                            to="/posts"
                            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Ver todas as postagens
                        </NavLink>
                        <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-[var(--color-pallete-gray-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Gerenciar usuários
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
