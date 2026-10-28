import { NavLink, useNavigate } from "react-router-dom"
import { useState } from 'react'
import { Button, Checkbox, Label, TextInput } from "flowbite-react";

export default function Register() {

    const [Nome, setNome] = useState("")
    const [Username, setUsername] = useState("")
    const [Email, setEmail] = useState("")
    const [Senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        if (Senha !== confirmarSenha) {
            console.log('As senhas devem ser iguais')
            return
        }

        const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500"

        try {
            const resposta = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: Nome,
                    username: Username,
                    email: Email,
                    password: Senha
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.error === 'string'
                    ? dados.error
                    : dados.error
                    ? JSON.stringify(dados.error)
                    : dados.message || 'Erro ao criar usuário'
                )
            }

            localStorage.setItem("token_login", dados.token);
            localStorage.setItem("user", JSON.stringify(dados.user));
            window.dispatchEvent(new Event("auth-change"));

            navigate('/')

        } catch (error) {
            console.error('Erro no registro:', error)
        }
    }

    return (
        
        <div className="w-screen min-h-screen bg-pallete-dark-green-2 flex flex-col items-center justify-center p-6 box-border m-0">
            <section className="flex w-full max-w-md gap-5 flex-col items-center justify-center">
                <img src="/logo.svg" alt="Tempero Caraguá" />
                <h1 className='text-2xl text-white font-bold'>Crie sua conta!</h1>

                <form className="flex w-full flex-col gap-4" onSubmit={handleRegister}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="nome" className='text-white'>
                                Seu nome completo
                            </Label>
                        </div>
                        <TextInput id="nome" type="text" placeholder="" required value={Nome} onChange={(e) => setNome(e.target.value)} shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="username" className='text-white'>
                                Seu nome de usuário
                            </Label>
                        </div>
                        <TextInput id="username" type="text" placeholder="" required value={Username} onChange={(e) => setUsername(e.target.value)} shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email" className='text-white'>
                                Seu e-mail
                            </Label>
                        </div>
                        <TextInput id="email" type="email" placeholder="" value={Email} onChange={(e) => setEmail(e.target.value)} required shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password" className='text-white'>
                                Sua senha
                            </Label>
                        </div>
                        <TextInput id="password" type="password" required value={Senha} onChange={(e) => { setSenha(e.target.value) }} shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="repeat-password" className='text-white'>
                                Repita sua senha
                            </Label>
                        </div>
                        <TextInput id="repeat-password" type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} shadow />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="agree" required />
                        <Label htmlFor="agree" className="flex text-white">
                            Eu concordo com os&nbsp;
                            <NavLink to="/termos" className="text-white hover:underline dark:text-cyan-500">
                                termos e condições
                            </NavLink>
                        </Label>
                    </div>
                    <Button type="submit" className='bg-pallete-orange hover:bg-pallete-dark-orange transition-colors duration-150 text-white'>Registrar nova conta</Button>
                </form>

                <p className="text-center text-white">
                    Já possui uma conta?<br />
                    <NavLink to="/login" className='text-pallete-light-orange hover:underline'>Faça o login</NavLink>
                </p>
            </section>
        </div>
    )
}