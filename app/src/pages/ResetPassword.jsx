import { useState, useEffect } from 'react'
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const API_URL = (import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4500').replace(/\/$/, '')

    useEffect(() => {
        if (!token) {
            setError(t('resetPassword.tokenMissing', 'Token de redefinição não informado.'))
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError(t('resetPassword.passwordsDontMatch', 'As senhas não coincidem.'))
            setLoading(false)
            return
        }

        try {
            const resposta = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ token, password }),
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || t('resetPassword.errorReset', 'Erro ao redefinir senha.'))
            }

            setMessage(t('resetPassword.success', 'Senha redefinida com sucesso! Redirecionando para o login...'))
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.message || t('resetPassword.couldNotConnect', 'Não foi possível conectar ao servidor.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] px-4">
            <div className="max-w-md w-full bg-white dark:bg-[var(--color-pallete-card-dark)] p-8 rounded-xl shadow-sm">
                <NavLink to="/login" className="mb-6 inline-block text-pallete-green font-semibold">
                    ← {t("resetPassword.backToLogin", "Voltar ao login")}
                </NavLink>

                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">
                    {t("resetPassword.title", "Redefinir Senha")}
                </h1>
                <p className="mb-6 text-gray-600 dark:text-[var(--color-text-muted-dark)]">
                    {t("resetPassword.description", "Crie uma nova senha para acessar sua conta.")}
                </p>

                {message && (
                    <div className="mb-4 p-3 rounded bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {!token && (
                    <div className="mb-6 p-3 rounded bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 text-sm">
                        {t("resetPassword.invalidLink", "Link inválido ou expirado. Solicite uma nova redefinição.")}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary-dark)]"
                        >
                            {t("resetPassword.newPassword", "Nova senha")}
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-[var(--color-pallete-gray-dark)] bg-transparent px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-pallete-green focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary-dark)]"
                        >
                            {t("resetPassword.confirmNewPassword", "Confirmar nova senha")}
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-[var(--color-pallete-gray-dark)] bg-transparent px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-pallete-green focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full py-3 rounded-xl bg-pallete-orange text-white font-semibold hover:bg-pallete-dark-orange disabled:opacity-60 transition-colors"
                    >
                        {loading ? t("resetPassword.resetting", "Redefinindo...") : t("resetPassword.resetPassword", "Redefinir senha")}
                    </button>
                </form>
            </div>
        </div>
    )
}
