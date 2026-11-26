import { NavLink, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { GoogleLoginButton } from "../components/GoogleLoginButton"

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const API_URL =
            import.meta.env.VITE_PUBLIC_API_URL ||
            "http://localhost:4500";

        try {
            const resposta = await fetch(`${API_URL}/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password: senha,
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.message ||
                    dados.error ||
                    "E-mail ou senha incorretos."
                );
            }

            localStorage.setItem("user", JSON.stringify(dados.user));

            window.dispatchEvent(new Event("auth-change"));

            navigate("/");
        } catch (erro) {
            console.error("Erro no login:", erro);

            alert(
                erro.message ||
                "Não foi possível conectar ao servidor."
            );
        }
    };

    const KEY_GOOGLE = import.meta.env.VITE_PUBLIC_KEY_GOOGLE;

    const handleGoogleLogin = useCallback(async (credentialResponse) => {
        setGoogleLoading(true);
        try {
            const API_URL =
                import.meta.env.VITE_PUBLIC_API_URL ||
                "http://localhost:4500";

            const resposta = await fetch(`${API_URL}/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            const dados = await resposta.json();
            if (!resposta.ok) {
                throw new Error(
                    dados.error ||
                    dados.message ||
                    "Não foi possível entrar com o Google."
                );
            }

            localStorage.setItem("user", JSON.stringify(dados.user));
            window.dispatchEvent(new Event("auth-change"));
            navigate("/");
        } catch (erro) {
            console.error("Erro no login com Google:", erro);
            alert(erro.message || "Não foi possível conectar ao servidor.");
        } finally {
            setGoogleLoading(false);
        }
    }, [navigate]);

    return (
        <main className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-pallete-dark-green-2 lg:h-screen lg:grid-cols-[61.3%_38.7%] dark:bg-[var(--color-pallete-dark-green-dark)]">

            {/* Painel de login */}
            <section className="flex min-h-screen w-full flex-col items-center px-6 py-7 lg:min-h-0 lg:h-full lg:px-0 lg:pt-7">

                {/* Logo */}
                <img
                    src="/logo.webp"
                    alt="Tempero Caraguá"
                    className="mb-5 h-auto w-64 shrink-0 object-contain sm:w-72"
                />

                {/* Título */}
                <h1 className="mb-4 text-center text-xl font-medium text-[#e8d9a5] sm:text-2xl dark:text-[var(--color-text-primary-dark)]">
                    Acesse sua conta
                </h1>

                {/* Formulário */}
                <form
                    onSubmit={handleLogin}
                    className="flex w-full max-w-[518px] flex-col lg:w-[70%] lg:max-w-none"
                >
                    {/* E-mail */}
                    <label
                        htmlFor="email"
                        className="mb-1.5 text-sm font-bold text-white sm:text-base dark:text-[var(--color-text-primary-dark)]"
                    >
                        E-mail
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 w-full rounded-xl border border-[#c9c5b8] bg-transparent px-3 text-white outline-none transition-colors focus:border-[#c58b36] focus:ring-1 focus:ring-[#c58b36] dark:text-[var(--color-text-primary-dark)] dark:border-[var(--color-pallete-gray-dark)] dark:focus:border-pallete-orange dark:focus:ring-pallete-orange"
                    />

                    {/* Senha */}
                    <div className="mb-1.5 mt-5 flex items-center justify-between gap-3">
                        <label
                            htmlFor="password"
                            className="text-sm font-bold text-white sm:text-base dark:text-[var(--color-text-primary-dark)]"
                        >
                            Senha
                        </label>

                        <NavLink
                            to="/esqueci-minha-senha"
                            className="text-sm text-[#e8d9a5] underline underline-offset-2 hover:text-white sm:text-base dark:text-[var(--color-pallete-light-orange-dark)] dark:hover:text-[var(--color-text-primary-dark)]"
                        >
                            Esqueci minha senha
                        </NavLink>
                    </div>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="h-11 w-full rounded-xl border border-[#c9c5b8] bg-transparent px-3 text-white outline-none transition-colors focus:border-[#c58b36] focus:ring-1 focus:ring-[#c58b36] dark:text-[var(--color-text-primary-dark)] dark:border-[var(--color-pallete-gray-dark)] dark:focus:border-pallete-orange dark:focus:ring-pallete-orange"
                    />

                    {/* Botão entrar */}
                    <button
                        type="submit"
                        className="mt-4 h-10 w-32 self-center rounded-xl bg-pallete-orange font-medium text-white underline underline-offset-2 transition-colors duration-150 hover:bg-pallete-dark-orange dark:bg-[var(--color-pallete-orange-dark)] dark:hover:bg-pallete-dark-orange"
                    >
                        Entrar
                    </button>
                </form>

                {/* Separador */}
                <p className="my-6 font-bold text-white dark:text-[var(--color-text-primary-dark)]">
                    OU
                </p>

                {/* Login com o google */}
                <GoogleLoginButton
                    clientId={KEY_GOOGLE}
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                        alert('Erro ao fazer login com o Google. Tente novamente.');
                    }}
                    disabled={googleLoading}
                />

                {/* Cadastro */}
                <div className="mt-9 text-center">
                    <p className="text-lg font-medium text-white sm:text-xl dark:text-[var(--color-text-primary-dark)]">
                        Ainda não criou sua conta?
                    </p>

                    <NavLink
                        to="/cadastro"
                        className="text-[#e8d9a5] underline underline-offset-2 hover:text-white dark:text-[var(--color-pallete-light-orange-dark)] dark:hover:text-[var(--color-text-primary-dark)]"
                    >
                        Criar conta
                    </NavLink>
                </div>
            </section>

            {/* Imagem lateral */}
            <aside className="hidden h-full min-h-0 w-full overflow-hidden lg:block">
                <img
                    src='/loginImg.webp'
                    alt="Profissional da gastronomia em uma cozinha"
                    className="h-full w-full object-cover object-center"
                />
            </aside>
        </main>
    );
}
