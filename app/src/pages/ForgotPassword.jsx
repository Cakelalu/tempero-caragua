import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const API_URL = (import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4500').replace(/\/$/, '')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const resposta = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.error || 'Erro ao solicitar redefinição de senha.')
            }

            setMessage('Se este e-mail estiver cadastrado, você receberá instruções de redefinição.')
        } catch (err) {
            setError(err.message || 'Não foi possível conectar ao servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--color-pallete-surface-dark)] px-4">
            <div className="max-w-md w-full bg-white dark:bg-[var(--color-pallete-card-dark)] p-8 rounded-xl shadow-sm">
                <NavLink to="/login" className="mb-6 inline-block text-pallete-green font-semibold">
                    ← Voltar ao login
                </NavLink>

                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-[var(--color-text-primary-dark)]">
                    Esqueci minha senha
                </h1>
                <p className="mb-6 text-gray-600 dark:text-[var(--color-text-muted-dark)]">
                    Informe seu e-mail cadastrado para receber instruções de redefinição.
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary-dark)]"
                        >
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-[var(--color-pallete-gray-dark)] bg-transparent px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-pallete-green focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-pallete-orange text-white font-semibold hover:bg-pallete-dark-orange disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Enviando...' : 'Enviar instruções'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-[var(--color-text-muted-dark)]">
                    Lembrou da senha?{' '}
                    <NavLink to="/login" className="text-pallete-green font-medium hover:underline">
                        Faça login
                    </NavLink>
                </p>
            </div>
        </div>
    )
}
