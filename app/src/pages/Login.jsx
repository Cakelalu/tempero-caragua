
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import loginImg from "../assets/loginImg.svg";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

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

            localStorage.setItem("token_login", dados.token);
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

    // Login com o Google
    const responseGoogle = (response) => {
        console.log(response)
    }

    return (
        <main className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-pallete-dark-green-2 lg:h-screen lg:grid-cols-[61.3%_38.7%]">

            {/* Painel de login */}
            <section className="flex min-h-screen w-full flex-col items-center px-6 py-7 lg:min-h-0 lg:h-full lg:px-0 lg:pt-7">

                {/* Logo */}
                <img
                    src="/logo.svg"
                    alt="Tempero Caraguá"
                    className="mb-5 h-auto w-64 shrink-0 object-contain sm:w-72"
                />

                {/* Título */}
                <h1 className="mb-4 text-center text-xl font-medium text-[#e8d9a5] sm:text-2xl">
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
                        className="mb-1.5 text-sm font-bold text-white sm:text-base"
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
                        className="h-11 w-full rounded-xl border border-[#c9c5b8] bg-transparent px-3 text-white outline-none transition-colors focus:border-[#c58b36] focus:ring-1 focus:ring-[#c58b36]"
                    />

                    {/* Senha */}
                    <div className="mb-1.5 mt-5 flex items-center justify-between gap-3">
                        <label
                            htmlFor="password"
                            className="text-sm font-bold text-white sm:text-base"
                        >
                            Senha
                        </label>

                        <NavLink
                            to="/recuperar-senha"
                            className="text-sm text-[#e8d9a5] underline underline-offset-2 hover:text-white sm:text-base"
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
                        className="h-11 w-full rounded-xl border border-[#c9c5b8] bg-transparent px-3 text-white outline-none transition-colors focus:border-[#c58b36] focus:ring-1 focus:ring-[#c58b36]"
                    />

                    {/* Botão entrar */}
                    <button
                        type="submit"
                        className="mt-4 h-10 w-32 self-center rounded-xl bg-pallete-orange font-medium text-white underline underline-offset-2 transition-colors duration-150 hover:bg-pallete-dark-orange"
                    >
                        Entrar
                    </button>
                </form>

                {/* Separador */}
                <p className="my-6 font-bold text-white">
                    OU
                </p>

                {/* Login com o google */}
                <GoogleOAuthProvider clientId='485672026278-i1ful5koolkis00ru8k7bheh0kshhc4b.apps.googleusercontent.com'>
                    <GoogleLogin
                        buttonText='Continuar com o Google'
                        onSuccess={credentialResponse => {
                            console.log('Login efetuado com sucesso:', credentialResponse);
                        }}
                        onError={() => {
                            console.log('Erro no Login');
                        }}
                    />
                </GoogleOAuthProvider>

                {/* Cadastro */}
                <div className="mt-9 text-center">
                    <p className="text-lg font-medium text-white sm:text-xl">
                        Ainda não criou sua conta?
                    </p>

                    <NavLink
                        to="/cadastro"
                        className="text-[#e8d9a5] underline underline-offset-2 hover:text-white"
                    >
                        Criar conta
                    </NavLink>
                </div>
            </section>

            {/* Imagem lateral */}
            <aside className="hidden h-full min-h-0 w-full overflow-hidden lg:block">
                <img
                    src={loginImg}
                    alt="Profissional da gastronomia em uma cozinha"
                    className="h-full w-full object-cover object-center"
                />
            </aside>
        </main>
    );
}
