import { NavLink, useNavigate } from "react-router-dom"
import loginImg from "../assets/loginImg.svg"
import { useState } from 'react'

export default function Login() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()

        const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4500'

        try {
            const resposta = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: senha
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.message || dados.error || "E-mail ou senha incorretos."
                );
            }

            localStorage.setItem("token_login", dados.token);
            localStorage.setItem("user", JSON.stringify(dados.user));

            window.dispatchEvent(new Event("auth-change"));

            navigate("/");

        } catch (erro) {
            console.error('Erro no login:', erro);
            alert(erro.message || 'Não foi possível conectar ao servidor.');
        }
    }

    return (
        <>
            <section className="grid grid-cols-[70%_30%] h-screen w-screen overflow-hidden">
                <div className="bg-pallete-dark-green-2 w-full flex flex-col items-center justify-start pt-8">
                    <img
                        src="/logo.svg"
                        alt="Logo"
                        className="w-55 h-55"
                    />

                    <p className="font-bold text-white">
                        Acesse sua conta
                    </p>

                    <form
                        action=""
                        className="flex flex-col gap-2 align-center justify-center w-2/4"
                        onSubmit={handleLogin}
                    >
                        <label
                            htmlFor="email"
                            className="font-bold text-white"
                        >
                            E-mail
                        </label>

                        <input
                            type="text"
                            placeholder=""
                            value={email}
                            className="border border-white rounded p-2 font-bold text-black"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label
                            htmlFor="password"
                            className="font-bold text-white"
                        >
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder=""
                            value={senha}
                            className="border border-white rounded p-2 font-bold text-black"
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="bg-pallete-orange text-white rounded p-2 w-45 hover:underline mt-2 font-bold self-center hover:bg-pallete-dark-orange transition-colors duration-150"
                        >
                            Entrar
                        </button>
                    </form>

                    <p className="font-bold">
                        Ou
                    </p>

                    <p className="font-bold mt-3">
                        Ainda não possui uma conta?
                    </p>

                    <NavLink
                        to="/cadastro"
                        className="text-pallete-orange"
                    >
                        Cadastrar-se
                    </NavLink>
                </div>

                <div className="bg-white flex items-center justify-center">
                    <img
                        src={loginImg}
                        alt="Imagem de login"
                        className="w-full h-full object-cover"
                    />
                </div>
            </section>
        </>
    )
}